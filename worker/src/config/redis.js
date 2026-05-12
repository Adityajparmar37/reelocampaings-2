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

console.log('[Worker/Redis] Connecting to:', env.REDIS_URL ? 'Upstash/Cloud Redis' : 'localhost:6379');

const bullMQConnection = new Redis(env.REDIS_URL, redisOptions);

const redisPublisher = new Redis(env.REDIS_URL, redisOptions);

redisPublisher.on('connect', () => {
  console.log('[Worker/Redis] Publisher connected');
});

redisPublisher.on('error', (e) => {
  console.error('[Worker/Redis] Publisher error:', e.message);
});

module.exports = {
  bullMQConnection,
  redisPublisher,
};