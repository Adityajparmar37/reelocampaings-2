'use strict';

const { ObjectId } = require('mongodb');
const { getCollection } = require('../../config/db');

const col = () => getCollection('campaigns');

const createCampaign = async (data) => {
  const now = new Date();
  const doc = {
    name: data.name,
    messageTemplate: data.messageTemplate,
    audienceFilters: data.audienceFilters || {},
    status: 'draft',
    totalRecipients: 0,
    sentCount: 0,
    failedCount: 0,
    pendingCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  const result = await col().insertOne(doc);
  return { ...doc, _id: result.insertedId };
};

const findCampaigns = async ({ page = 1, limit = 20, skip = 0, status }) => {
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  const [items, total] = await Promise.all([
    col().find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    col().countDocuments(filter),
  ]);
  return { items, total };
};

const findCampaignById = async (id) =>
  col().findOne({ _id: new ObjectId(id) });

const updateCampaign = async (id, patch) =>
  col().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...patch, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );

const setCampaignStatus = async (id, status, extra = {}) =>
  col().updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, ...extra, updatedAt: new Date() } }
  );

/**
 * Atomically increment sent/failed counters and decrement pendingCount.
 * Safe to call from multiple concurrent workers simultaneously.
 */
const incrementCampaignCounters = async (id, { sent = 0, failed = 0 }) =>
  col().updateOne(
    { _id: new ObjectId(id) },
    {
      $inc: { sentCount: sent, failedCount: failed, pendingCount: -(sent + failed) },
      $set: { updatedAt: new Date() },
    }
  );

const deleteCampaign = async (id) =>
  col().deleteOne({ _id: new ObjectId(id) });

module.exports = {
  createCampaign,
  findCampaigns,
  findCampaignById,
  updateCampaign,
  setCampaignStatus,
  incrementCampaignCounters,
  deleteCampaign,
};
