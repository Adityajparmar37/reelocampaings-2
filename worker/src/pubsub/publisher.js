'use strict';

const { redisPublisher } = require('../config/redis');
const env = require('../config/env');

const PREFIX = env.PUBSUB_CHANNEL_PREFIX;

/**
 * Worker publishes events to Redis Pub/Sub.
 * API server's subscriber picks these up and routes to Socket.IO clients.
 *
 * Events:
 *   campaign.started        — campaign processing began
 *   campaign.progress       — batch completed, counters updated
 *   campaign.batch.processed — individual batch done
 *   campaign.completed      — all batches done, 100% processed
 *   campaign.failed         — unrecoverable error
 *   message.batch.processed — batch-level message stats
 */
const publishEvent = async (eventType, payload) => {
  const message = JSON.stringify({ eventType, payload, timestamp: Date.now() });
  await redisPublisher.publish(`${PREFIX}:events`, message);
};

module.exports = { publishEvent };
