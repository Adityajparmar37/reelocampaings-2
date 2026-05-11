'use strict';

const { redisSubscriber } = require('../config/redis');
const env = require('../config/env');

const PREFIX = env.PUBSUB_CHANNEL_PREFIX;

/**
 * Starts Redis Pub/Sub subscriber.
 * Subscribes to the broadcast channel and routes events to the socket gateway.
 *
 * Architecture:
 *   Worker → Redis Pub/Sub → Subscriber (here) → Socket.IO Gateway → Frontend
 */
const startSubscriber = (socketGateway) => {
  redisSubscriber.subscribe(`${PREFIX}:events`, (err) => {
    if (err) {
      console.error('[PubSub] Subscription error:', err.message);
      return;
    }
    console.log(`[PubSub] Subscribed to channel: ${PREFIX}:events`);
  });

  redisSubscriber.on('message', (channel, message) => {
    try {
      const event = JSON.parse(message);
      const { eventType, payload } = event;

      // Forward to socket gateway — emits to campaign-specific room
      socketGateway.emitToCampaignRoom(payload.campaignId, eventType, payload);

      // Also broadcast to all connected clients for global dashboard updates
      if (['campaign.completed', 'campaign.failed'].includes(eventType)) {
        socketGateway.emitToAll('campaign:update', payload);
      }
    } catch (err) {
      console.error('[PubSub] Message parse error:', err.message);
    }
  });

  redisSubscriber.on('error', (err) => {
    console.error('[PubSub] Subscriber error:', err.message);
  });
};

module.exports = { startSubscriber };
