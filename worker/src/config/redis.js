'use strict';

const Redis = require('ioredis');
const env = require('./env');

const opts = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  retryStrategy: (t) => Math.min(t * 100, 3000),
  maxRetriesPerRequest: 3,
};

// BullMQ requires its own connection object (not shared)
const bullMQConnection = { host: env.REDIS_HOST, port: env.REDIS_PORT, password: env.REDIS_PASSWORD || undefined };

// Publisher for Pub/Sub events
const redisPublisher = new Redis(opts);
redisPublisher.on('connect', () => console.log('[Worker/Redis] Publisher connected'));
redisPublisher.on('error', (e) => console.error('[Worker/Redis] Publisher error:', e.message));

module.exports = { bullMQConnection, redisPublisher };
