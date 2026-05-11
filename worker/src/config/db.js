'use strict';

const { MongoClient } = require('mongodb');
const env = require('./env');

let client = null;
let db = null;

const connect = async () => {
  if (db) return db;
  client = new MongoClient(env.MONGO_URI, {
    maxPoolSize: 20,
    minPoolSize: 2,
    connectTimeoutMS: 10_000,
    serverSelectionTimeoutMS: 10_000,
  });
  await client.connect();
  db = client.db(env.MONGO_DB_NAME);
  console.log(`[Worker/MongoDB] Connected → ${env.MONGO_DB_NAME}`);
  return db;
};

const getCollection = (name) => {
  if (!db) throw new Error('[Worker/MongoDB] Not connected');
  return db.collection(name);
};

const close = async () => {
  if (client) { await client.close(); client = null; db = null; }
};

module.exports = { connect, getCollection, close };
