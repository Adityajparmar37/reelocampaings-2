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

const redisUrl = env.REDIS_URL;
const isCloudRedis = redisUrl.startsWith('rediss://');
const redisHost = isCloudRedis ? 'Cloud Redis (TLS)' : redisUrl;

console.log('[Worker/Redis] Connecting to:', redisHost);
console.log('[Worker/Redis] TLS enabled:', isCloudRedis);

const bullMQConnection = new Redis(redisUrl, redisOptions);
const redisPublisher = new Redis(redisUrl, redisOptions);

bullMQConnection.on('connect', () => {
  console.log('[Worker/Redis] ✓ BullMQ connection established');
});

bullMQConnection.on('ready', () => {
  console.log('[Worker/Redis] ✓ BullMQ connection ready');
});

bullMQConnection.on('error', (e) => {
  console.error('[Worker/Redis] ✗ BullMQ error:', e.message);
  if (e.code === 'ECONNREFUSED') {
    console.error('[Worker/Redis] ✗ Connection refused. Check REDIS_URL environment variable.');
    console.error('[Worker/Redis] Current URL:', redisUrl);
  }
});

redisPublisher.on('connect', () => {
  console.log('[Worker/Redis] ✓ Publisher connected');
});

redisPublisher.on('error', (e) => {
  console.error('[Worker/Redis] ✗ Publisher error:', e.message);
});

module.exports = {
  bullMQConnection,
  redisPublisher,
};