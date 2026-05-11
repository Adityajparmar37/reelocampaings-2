'use strict';

const { MongoClient } = require('mongodb');
const env = require('./env');

let client = null;
let db = null;

const connect = async () => {
  if (db) return db;
  client = new MongoClient(env.MONGO_URI, {
    maxPoolSize: 50,
    minPoolSize: 5,
    connectTimeoutMS: 10_000,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    retryWrites: true,
  });
  await client.connect();
  db = client.db(env.MONGO_DB_NAME);
  console.log(`[MongoDB] Connected → ${env.MONGO_DB_NAME}`);
  return db;
};

const getDb = () => {
  if (!db) throw new Error('[MongoDB] Not initialised. Call connect() first.');
  return db;
};

const getCollection = (name) => getDb().collection(name);

const close = async () => {
  if (client) { await client.close(); client = null; db = null; }
};

module.exports = { connect, getDb, getCollection, close };
