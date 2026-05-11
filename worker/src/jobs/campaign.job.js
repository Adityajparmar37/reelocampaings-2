'use strict';

const { Worker } = require('bullmq');
const { bullMQConnection } = require('../config/redis');
const { processBatch } = require('./batch.processor');
const { publishEvent } = require('../pubsub/publisher');
const env = require('../config/env');

/**
 * BullMQ Worker — subscribes to the campaign queue.
 *
 * Concurrency: processes N jobs simultaneously.
 * Each job is a batch of 500–1000 contacts.
 * At concurrency=5, throughput = 5 batches × 500 = 2,500 messages in parallel.
 *
 * Horizontal scaling: run multiple worker processes (docker replicas).
 * BullMQ guarantees each job is processed exactly once (RPOPLPUSH atomic).
 */
const campaignWorker = new Worker(
  env.QUEUE_NAME,
  async (job) => {
    const { campaignId, batchIndex, messageIds, messageTemplate } = job.data;

    console.log(`[Worker] Job ${job.id} started — campaign: ${campaignId}, batch: ${batchIndex}`);

    // Publish started event on first batch
    if (batchIndex === 0) {
      await publishEvent('campaign.started', { campaignId, jobId: job.id });
    }

    await processBatch({ campaignId, batchIndex, messageIds, messageTemplate });
  },
  {
    connection: bullMQConnection,
    concurrency: env.WORKER_CONCURRENCY,
    limiter: {
      max: 100,        // max 100 jobs per
      duration: 1000,  // per second (rate limiting)
    },
  }
);

campaignWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

campaignWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);

  // If max attempts exhausted, publish failure event
  if (job && job.attemptsMade >= job.opts.attempts) {
    publishEvent('campaign.failed', {
      campaignId: job.data.campaignId,
      batchIndex: job.data.batchIndex,
      error: err.message,
      status: 'failed',
    }).catch(console.error);
  }
});

campaignWorker.on('error', (err) => {
  console.error('[Worker] Worker error:', err.message);
});

console.log(`[Worker] BullMQ worker started (concurrency: ${env.WORKER_CONCURRENCY})`);

module.exports = { campaignWorker };
