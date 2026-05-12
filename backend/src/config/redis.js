'use strict';

const Redis = require('ioredis');
const env = require('./env');

// Debug: Log the actual environment variable
console.log('[Redis] DEBUG - Raw REDIS_URL from env:', process.env.REDIS_URL ? 'SET' : 'NOT SET');
console.log('[Redis] DEBUG - Parsed REDIS_URL:', env.REDIS_URL);

if (!env.REDIS_URL || env.REDIS_URL === 'redis://localhost:6379') {
  console.warn('[Redis] ⚠️  WARNING: Using default localhost Redis. Set REDIS_URL environment variable for production!');
}

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

console.log('[Redis] Connecting to:', redisHost);
console.log('[Redis] TLS enabled:', isCloudRedis);

const redisClient = new Redis(redisUrl, redisOptions);
const redisSubscriber = new Redis(redisUrl, redisOptions);
const redisPublisher = new Redis(redisUrl, redisOptions);

redisClient.on('connect', () => {
  console.log('[Redis] ✓ Client connected successfully');
});

redisClient.on('ready', () => {
  console.log('[Redis] ✓ Client ready');
});

redisClient.on('error', (e) => {
  console.error('[Redis] ✗ Client error:', e.message);
  if (e.code === 'ECONNREFUSED') {
    console.error('[Redis] ✗ Connection refused. Check REDIS_URL environment variable.');
    console.error('[Redis] Current URL:', redisUrl);
  }
});

redisSubscriber.on('connect', () => {
  console.log('[Redis] ✓ Subscriber connected');
});

redisSubscriber.on('error', (e) => {
  console.error('[Redis] ✗ Subscriber error:', e.message);
});

redisPublisher.on('connect', () => {
  console.log('[Redis] ✓ Publisher connected');
});

redisPublisher.on('error', (e) => {
  console.error('[Redis] ✗ Publisher error:', e.message);
});

// BullMQ needs a dedicated connection
const bullMQConnection = new Redis(redisUrl, redisOptions);

bullMQConnection.on('connect', () => {
  console.log('[Redis] ✓ BullMQ connection established');
});

bullMQConnection.on('error', (e) => {
  console.error('[Redis] ✗ BullMQ error:', e.message);
});

module.exports = {
  redisClient,
  redisSubscriber,
  redisPublisher,
  bullMQConnection,
};