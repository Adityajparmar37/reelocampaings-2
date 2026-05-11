'use strict';

const { redisPublisher } = require('../config/redis');
const env = require('../config/env');

const PREFIX = env.PUBSUB_CHANNEL_PREFIX;

/**
 * Publishes a campaign event to Redis Pub/Sub.
 * Workers also use their own publisher — same channel schema.
 *
 * Channel pattern: campaign.<campaignId>.<eventType>
 * Broadcast channel: campaign.events (for socket gateway to listen to all)
 */
const publishCampaignEvent = async (eventType, payload) => {
  const message = JSON.stringify({ eventType, payload, timestamp: Date.now() });
  // Emit on campaign-specific channel
  await redisPublisher.publish(`${PREFIX}:${payload.campaignId}:${eventType}`, message);
  // Emit on broadcast channel for gateway
  await redisPublisher.publish(`${PREFIX}:events`, message);
};

module.exports = { publishCampaignEvent };
