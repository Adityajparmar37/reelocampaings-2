'use strict';

const messagesRepo = require('../repositories/messages.repository');
const { publishEvent } = require('../pubsub/publisher');

const FAILURE_RATE_MIN = 0.05;
const FAILURE_RATE_MAX = 0.15;
const SEND_DELAY_MS = 2000; // simulate per-message send time

/**
 * Simulates sending a message to a contact.
 * Returns { success, error }
 */
const simulateSend = async (message) => {
  // Artificial processing delay
  await new Promise((r) => setTimeout(r, SEND_DELAY_MS + Math.random() * 1500));

  // Random 5–15% failure
  const failureRate = FAILURE_RATE_MIN + Math.random() * (FAILURE_RATE_MAX - FAILURE_RATE_MIN);
  const failed = Math.random() < failureRate;

  if (failed) {
    return { success: false, error: `Delivery failed: SMTP timeout for ${message.email}` };
  }
  return { success: true, error: null };
};

/**
 * Core batch processor:
 * 1. Fetch message records for this batch's contactIds
 * 2. Simulate sending each message
 * 3. Collect results
 * 4. bulkWrite status updates (single DB round trip)
 * 5. $inc campaign counters (atomic)
 * 6. Publish Pub/Sub events
 * 7. Check if campaign is fully processed
 */
const processBatch = async ({ campaignId, batchIndex, messageIds, messageTemplate }) => {
  console.log(`[Worker] Processing batch ${batchIndex} for campaign ${campaignId} (${messageIds.length} messages)`);

  // Fetch message records from DB
  const messages = await messagesRepo.findQueuedMessagesByContactIds(campaignId, messageIds);

  if (!messages.length) {
    console.warn(`[Worker] Batch ${batchIndex}: No queued messages found, skipping.`);
    return;
  }

  // Publish batch started event
  await publishEvent('campaign.progress', {
    campaignId,
    batchIndex,
    batchSize: messages.length,
    status: 'processing',
  });

  // Process all messages in the batch (parallel within batch)
  const results = await Promise.all(
    messages.map(async (msg) => {
      const { success, error } = await simulateSend(msg);
      return {
        id: msg._id.toString(),
        status: success ? 'sent' : 'failed',
        error,
      };
    })
  );

  // Count outcomes
  const sentCount = results.filter((r) => r.status === 'sent').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;

  // 1. bulkWrite all status updates — single DB operation
  await messagesRepo.bulkUpdateStatuses(results);

  // 2. Atomic $inc on campaign counters
  await messagesRepo.incrementCampaignCounters(campaignId, {
    sent: sentCount,
    failed: failedCount,
  });

  // 3. Publish batch completion event
  await publishEvent('campaign.batch.processed', {
    campaignId,
    batchIndex,
    sent: sentCount,
    failed: failedCount,
    total: messages.length,
  });

  // 4. Publish message-level event
  await publishEvent('message.batch.processed', {
    campaignId,
    batchIndex,
    results: results.map((r) => ({ id: r.id, status: r.status })),
  });

  // 5. Check if campaign is fully done
  const finalStatus = await messagesRepo.finalizeCampaignIfDone(campaignId);

  if (finalStatus === 'completed') {
    await publishEvent('campaign.completed', { campaignId, status: 'completed' });
    console.log(`[Worker] Campaign ${campaignId} COMPLETED`);
  } else if (finalStatus === 'failed') {
    await publishEvent('campaign.failed', { campaignId, status: 'failed' });
    console.log(`[Worker] Campaign ${campaignId} FAILED`);
  }

  console.log(`[Worker] Batch ${batchIndex} done — sent: ${sentCount}, failed: ${failedCount}`);
};

module.exports = { processBatch };
