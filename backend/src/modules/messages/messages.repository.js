'use strict';

const { ObjectId } = require('mongodb');
const { getCollection } = require('../../config/db');

const col = () => getCollection('campaignMessages');

const bulkCreateMessages = async (campaignId, contacts) => {
  if (!contacts.length) return { inserted: 0 };
  const now = new Date();
  const docs = contacts.map((c) => ({
    campaignId: new ObjectId(campaignId),
    contactId: c._id,
    email: c.email,
    name: c.name,
    status: 'queued',
    error: null,
    processedAt: null,
    createdAt: now,
  }));
  const result = await col().insertMany(docs, { ordered: false });
  return { inserted: result.insertedCount };
};

const bulkUpdateMessageStatuses = async (updates) => {
  if (!updates.length) return;
  const ops = updates.map(({ id, status, error }) => ({
    updateOne: {
      filter: { _id: new ObjectId(id) },
      update: { $set: { status, error: error || null, processedAt: new Date() } },
    },
  }));
  await col().bulkWrite(ops, { ordered: false });
};

const findMessagesByCampaign = async (campaignId, { skip = 0, limit = 50, status }) => {
  const filter = { campaignId: new ObjectId(campaignId) };
  if (status) filter.status = status;
  const [items, total] = await Promise.all([
    col().find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    col().countDocuments(filter),
  ]);
  return { items, total };
};

module.exports = { bulkCreateMessages, bulkUpdateMessageStatuses, findMessagesByCampaign };
