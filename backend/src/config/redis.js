'use strict';

const Redis = require('ioredis');
const env = require('./env');

const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

console.log(env.REDIS_URL,'env.REDIS_URL')

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