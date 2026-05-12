'use strict';

const { redisSubscriber } = require('../config/redis');
const { sendToCampaign, sendToAll } = require('../socket/socket.gateway');
const env = require('../config/env');

const PREFIX = env.PUBSUB_CHANNEL_PREFIX;

// Start Redis Pub/Sub subscriber
// Worker → Redis Pub/Sub → Subscriber → Socket.IO → Frontend
const startSubscriber = () => {
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

      // Send to specific campaign room
      sendToCampaign(payload.campaignId, eventType, payload);

      // Also send to all clients for dashboard updates
      if (['campaign.completed', 'campaign.failed'].includes(eventType)) {
        sendToAll('campaign:update', payload);
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
