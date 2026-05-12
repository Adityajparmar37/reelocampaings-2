'use strict';

const Redis = require('ioredis');
const env = require('./env');

// Shared Redis options
const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// BullMQ connection
const bullMQConnection = new Redis(env.REDIS_URL, redisOptions);

// Publisher for Pub/Sub events
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