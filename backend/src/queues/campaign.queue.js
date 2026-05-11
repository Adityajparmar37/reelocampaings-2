'use strict';

const { Queue } = require('bullmq');
const { bullMQConnection } = require('../config/redis');
const env = require('../config/env');

/**
 * Campaign Queue — BullMQ producer.
 * Jobs are consumed by the separate Worker service.
 *
 * Job retry: 3 attempts with exponential backoff.
 * DLQ: failed jobs kept (removeOnFail: {count: 1000}) for inspection.
 */
const campaignQueue = new Queue(env.QUEUE_NAME, {
  connection: bullMQConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 1000 },
  },
});

/**
 * Enqueue a single campaign batch job.
 *
 * @param {string} campaignId
 * @param {number} batchIndex
 * @param {string[]} messageIds  — contact _id strings (NOT message doc ids)
 * @param {{ messageTemplate: string }} campaignData
 */
const enqueueCampaignBatch = async (campaignId, batchIndex, messageIds, campaignData) => {
  const jobName = `campaign:${campaignId}:batch:${batchIndex}`;
  await campaignQueue.add(jobName, {
    campaignId,
    batchIndex,
    messageIds,
    messageTemplate: campaignData.messageTemplate,
  });
};

const getQueueStats = async () => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    campaignQueue.getWaitingCount(),
    campaignQueue.getActiveCount(),
    campaignQueue.getCompletedCount(),
    campaignQueue.getFailedCount(),
    campaignQueue.getDelayedCount(),
  ]);
  return { waiting, active, completed, failed, delayed };
};

module.exports = { campaignQueue, enqueueCampaignBatch, getQueueStats };
