'use strict';

const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/db');

const col = () => getCollection('campaignMessages');
const campaignsCol = () => getCollection('campaigns');

/**
 * Find queued messages for a given list of contactIds in a campaign.
 * Used by worker to fetch the records it needs to process.
 */
const findMessagesByIds = async (messageIds) => {
  const objectIds = messageIds.map((id) => new ObjectId(id));
  return col()
    .find({ contactId: { $in: objectIds } }, { projection: { _id: 1, email: 1, name: 1 } })
    .toArray();
};

/**
 * Find queued messages for a campaign batch (by campaignId + status).
 * Worker receives contactIds from the job payload.
 */
const findQueuedMessagesByContactIds = async (campaignId, contactIds) => {
  const cId = new ObjectId(campaignId);
  const contactObjectIds = contactIds.map((id) => new ObjectId(id));
  return col()
    .find(
      { campaignId: cId, contactId: { $in: contactObjectIds }, status: { $in: ['queued', 'processing'] } },
      { projection: { _id: 1, email: 1, name: 1, contactId: 1, retryCount: 1 } }
    )
    .toArray();
};

/**
 * Bulk update message statuses — single bulkWrite, no per-document round trips.
 * Called once per batch after processing completes.
 */
const bulkUpdateStatuses = async (updates) => {
  if (!updates.length) return;
  
  const now = new Date();
  const ops = updates.map(({ id, status, error, retryCount = 0 }) => {
    const update = {
      status,
      error: error || null,
      processedAt: now,
    };

    // Track retry count for reporting
    if (status === 'failed' || status === 'permanently_failed') {
      update.retryCount = retryCount;
    }

    return {
      updateOne: {
        filter: { _id: new ObjectId(id) },
        update: { $set: update },
      },
    };
  });

  await col().bulkWrite(ops, { ordered: false });
};

/**
 * Atomic counter increment on campaign document.
 * $inc prevents race conditions across concurrent workers.
 */
const incrementCampaignCounters = async (campaignId, { sent, failed }) => {
  await campaignsCol().updateOne(
    { _id: new ObjectId(campaignId) },
    {
      $inc: {
        sentCount: sent,
        failedCount: failed,
        pendingCount: -(sent + failed),
      },
      $set: { updatedAt: new Date() },
    }
  );
};

/**
 * Mark campaign as completed if all messages are processed.
 */
const finalizeCampaignIfDone = async (campaignId) => {
  const campaign = await campaignsCol().findOne({ _id: new ObjectId(campaignId) });
  if (!campaign) return;

  if (campaign.pendingCount <= 0) {
    const finalStatus = campaign.failedCount === campaign.totalRecipients ? 'failed' : 'completed';
    await campaignsCol().updateOne(
      { _id: new ObjectId(campaignId) },
      { $set: { status: finalStatus, updatedAt: new Date() } }
    );
    return finalStatus;
  }
  return null;
};

module.exports = {
  findQueuedMessagesByContactIds,
  bulkUpdateStatuses,
  incrementCampaignCounters,
  finalizeCampaignIfDone,
};
