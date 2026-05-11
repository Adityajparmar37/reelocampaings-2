'use strict';

const { getCollection } = require('../config/db');
const { ObjectId } = require('mongodb');

const col = () => getCollection('uploads');

const createUpload = async (doc) => {
  const now = new Date();
  const upload = {
    filename: doc.filename,
    originalName: doc.originalName,
    totalRows: 0,
    processedRows: 0,
    insertedRows: 0,
    updatedRows: 0,
    failedRows: 0,
    errors: [],
    status: 'processing',
    createdAt: now,
    updatedAt: now,
  };
  const result = await col().insertOne(upload);
  return { ...upload, _id: result.insertedId };
};

const updateUploadProgress = async (id, patch) => {
  await col().updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...patch, updatedAt: new Date() } }
  );
};

const findUploadById = async (id) => col().findOne({ _id: new ObjectId(id) });

const listUploads = async ({ page = 1, limit = 20, skip = 0 }) => {
  const [items, total] = await Promise.all([
    col().find().sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    col().countDocuments(),
  ]);
  return { items, total };
};

module.exports = { createUpload, updateUploadProgress, findUploadById, listUploads };
