'use strict';

const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/db');

const col = () => getCollection('contacts');

/**
 * Bulk upsert contacts using bulkWrite (ordered: false → continues on dup).
 */
const bulkUpsertContacts = async (contacts) => {
  if (!contacts.length) return { inserted: 0, updated: 0 };

  const now = new Date();
  const operations = contacts.map((c) => ({
    updateOne: {
      filter: { email: c.email },
      update: {
        $setOnInsert: { createdAt: now },
        $set: {
          name: c.name,
          phone: c.phone || null,
          metadata: c.metadata || {},
          tags: c.tags || [],
          updatedAt: now,
        },
      },
      upsert: true,
    },
  }));

  const result = await col().bulkWrite(operations, { ordered: false });
  return { inserted: result.upsertedCount, updated: result.modifiedCount };
};

/**
 * Skip/limit paginated contacts with optional search + tag filter.
 */
const findContacts = async ({ page = 1, limit = 50, skip = 0, search, tags, sortBy = 'createdAt', sortDir = 'desc' }) => {
  const filter = {};

  if (tags && tags.length) {
    filter.tags = { $in: tags };
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const sortOrder = sortDir === 'desc' ? -1 : 1;
  const sort = { [sortBy]: sortOrder };

  const [items, total] = await Promise.all([
    col().find(filter).sort(sort).skip(skip).limit(limit).toArray(),
    col().countDocuments(filter),
  ]);

  return { items, total };
};

/**
 * Find contacts for audience targeting (campaign).
 * Returns minimal projection — _id, email, name, phone.
 */
const findContactsByAudienceFilter = async (filters = {}) => {
  const query = {};

  if (filters.tags && filters.tags.length) {
    query.tags = { $in: filters.tags };
  }
  if (filters.createdAfter) {
    query.createdAt = { ...query.createdAt, $gte: new Date(filters.createdAfter) };
  }
  if (filters.createdBefore) {
    query.createdAt = { ...query.createdAt, $lte: new Date(filters.createdBefore) };
  }
  if (filters.emailDomain) {
    query.email = { $regex: `@${filters.emailDomain}$`, $options: 'i' };
  }

  return col()
    .find(query, { projection: { _id: 1, email: 1, name: 1, phone: 1 } })
    .toArray();
};

const countContacts = async (filter = {}) => col().countDocuments(filter);

const findContactById = async (id) =>
  col().findOne({ _id: new ObjectId(id) });

const deleteContact = async (id) =>
  col().deleteOne({ _id: new ObjectId(id) });

module.exports = {
  bulkUpsertContacts,
  findContacts,
  findContactsByAudienceFilter,
  countContacts,
  findContactById,
  deleteContact,
};
