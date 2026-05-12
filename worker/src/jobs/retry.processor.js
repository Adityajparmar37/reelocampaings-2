'use strict';

const { Worker } = require('bullmq');
const { bullMQConnection } = require('../config/redis');
const messagesRepo = require('../repositories/messages.repository');
const { publishEvent } = require('../pubsub/publisher');

const SEND_DELAY_MS = 2000;
const FAILURE_RATE_MIN = 0.05;
const FAILURE_RATE_MAX = 0.15;

/**
 * Simulates sending a message (same as batch processor).
 */
const simulateSend = async (message) => {
  await new Promise((r) => setTimeout(r, SEND_DELAY_MS + Math.random() * 1500));
  const failureRate = FAILURE_RATE_MIN + Math.random() * (FAILURE_RATE_MAX - FAILURE_RATE_MIN);
  const failed = Math.random() < failureRate;

  if (failed) {
    return { success: false, error: `Retry failed: SMTP timeout for ${message.email}` };
  }
  return { success: true, error: null };
};

/**
 * Retry Worker — processes individual message retries from the retry queue.
 * BullMQ automatically handles delays and exponential backoff.
 */
const retryWorker = new Worker(
  'message-retry',
  async (job) => {
    const { messageId, campaignId, email, name, messageTemplate, retryCount } = job.data;

    console.log(`[Retry Worker] Processing message ${messageId} (attempt ${retryCount + 1})`);

    // Attempt to send
    const { success, error } = await simulateSend({ email, name });

    if (success) {
      // Success! Update message status
      await messagesRepo.bulkUpdateStatuses([
        { id: messageId, status: 'sent', error: null, retryCount: retryCount + 1 },
      ]);

      // Update campaign counters (move from failed to sent)
      await messagesRepo.incrementCampaignCounters(campaignId, {
        sent: 1,
        failed: -1,
      });

      // Publish success event
      await publishEvent('message.retry.success', {
        campaignId,
        messageId,
        retryAttempt: retryCount + 1,
      });

      console.log(`[Retry Worker] ✓ Message ${messageId} sent successfully on retry ${retryCount + 1}`);
    } else {
      // Still failed - BullMQ will retry automatically if attempts remain
      console.log(`[Retry Worker] ✗ Message ${messageId} failed on retry ${retryCount + 1}: ${error}`);
      
      // If this was the last attempt, mark as permanently failed
      if (job.attemptsMade >= job.opts.attempts) {
        await messagesRepo.bulkUpdateStatuses([
          { id: messageId, status: 'permanently_failed', error, retryCount: retryCount + 1 },
        ]);
        
        console.log(`[Retry Worker] Message ${messageId} permanently failed after ${job.attemptsMade} attempts`);
      }
      
      throw new Error(error); // Throw to trigger BullMQ retry
    }
  },
  {
    connection: bullMQConnection,
    concurrency: 10, // Process 10 retries concurrently
  }
);

retryWorker.on('completed', (job) => {
  console.log(`[Retry Worker] Job ${job.id} completed`);
});

retryWorker.on('failed', (job, err) => {
  console.error(`[Retry Worker] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);
});

retryWorker.on('error', (err) => {
  console.error('[Retry Worker] Worker error:', err.message);
});

console.log('[Retry Worker] Started - processing message retries');

module.exports = { retryWorker };

