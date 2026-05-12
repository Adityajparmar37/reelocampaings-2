'use strict';

const { Queue } = require('bullmq');
const { bullMQConnection } = require('../config/redis');

/**
 * Retry Queue — for failed individual messages.
 * Uses BullMQ's built-in delayed jobs for exponential backoff.
 */
const retryQueue = new Queue('message-retry', {
  connection: bullMQConnection,
  defaultJobOptions: {
    attempts: 3, // 3 retry attempts
    backoff: {
      type: 'exponential',
      delay: 60000, // Start with 1 minute, then 2min, 4min
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
});

/**
 * Enqueue a failed message for retry.
 * 
 * @param {Object} message - The failed message
 * @param {string} message.messageId - Message document ID
 * @param {string} message.campaignId - Campaign ID
 * @param {string} message.email - Contact email
 * @param {string} message.name - Contact name
 * @param {string} message.messageTemplate - Message content
 * @param {number} message.retryCount - Current retry count
 */
const enqueueMessageRetry = async (message) => {
  const jobName = `retry:${message.campaignId}:${message.messageId}`;
  
  await retryQueue.add(jobName, {
    messageId: message.messageId,
    campaignId: message.campaignId,
    email: message.email,
    name: message.name,
    messageTemplate: message.messageTemplate,
    retryCount: message.retryCount || 0,
  }, {
    jobId: `${message.messageId}-${message.retryCount || 0}`, // Unique job ID per retry
  });
};

/**
 * Get retry queue statistics.
 */
const getRetryQueueStats = async () => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    retryQueue.getWaitingCount(),
    retryQueue.getActiveCount(),
    retryQueue.getCompletedCount(),
    retryQueue.getFailedCount(),
    retryQueue.getDelayedCount(),
  ]);
  return { waiting, active, completed, failed, delayed };
};

module.exports = { retryQueue, enqueueMessageRetry, getRetryQueueStats };
