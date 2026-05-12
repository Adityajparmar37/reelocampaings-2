'use strict';

const Redis = require('ioredis');
const env = require('./env');

const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  // Enable TLS for rediss:// URLs (Upstash, Railway, etc.)
  tls: env.REDIS_URL?.startsWith('rediss://') ? {
    rejectUnauthorized: false
  } : undefined,
};

console.log('[Redis] Connecting to:', env.REDIS_URL ? 'Upstash/Cloud Redis' : 'localhost:6379');

const redisClient = new Redis(env.REDIS_URL, redisOptions);

const redisSubscriber = new Redis(env.REDIS_URL, redisOptions);

const redisPublisher = new Redis(env.REDIS_URL, redisOptions);

redisClient.on('connect', () => {
  console.log('[Redis] Client connected');
});

redisClient.on('error', (e) => {
  console.error('[Redis] Client error:', e.message);
});

redisSubscriber.on('connect', () => {
  console.log('[Redis] Subscriber connected');
});

redisSubscriber.on('error', (e) => {
  console.error('[Redis] Subscriber error:', e.message);
});

redisPublisher.on('connect', () => {
  console.log('[Redis] Publisher connected');
});

redisPublisher.on('error', (e) => {
  console.error('[Redis] Publisher error:', e.message);
});

module.exports = {
  redisClient,
  redisSubscriber,
  redisPublisher,
};