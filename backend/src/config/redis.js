'use strict';

const Redis = require('ioredis');
const env = require('./env');

const opts = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => Math.min(times * 100, 3000),
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
};

const redisClient     = new Redis(opts);
const redisSubscriber = new Redis(opts);
const redisPublisher  = new Redis(opts);

redisClient.on('connect',     () => console.log('[Redis] Client connected'));
redisClient.on('error',       (e) => console.error('[Redis] Client error:', e.message));
redisSubscriber.on('connect', () => console.log('[Redis] Subscriber connected'));
redisPublisher.on('connect',  () => console.log('[Redis] Publisher connected'));

module.exports = { redisClient, redisSubscriber, redisPublisher };
