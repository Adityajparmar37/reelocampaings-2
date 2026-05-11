'use strict';

const { Server } = require('socket.io');
const env = require('../config/env');

let io = null;

/**
 * Initialises Socket.IO server attached to the HTTP server.
 * Returns the gateway interface used by the Pub/Sub subscriber.
 */
const initSocketGateway = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 20000,
    pingInterval: 10000,
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Client subscribes to a specific campaign room
    socket.on('subscribe:campaign', (campaignId) => {
      const room = `campaign:${campaignId}`;
      socket.join(room);
      console.log(`[Socket] ${socket.id} joined room ${room}`);
      socket.emit('subscribed', { campaignId, room });
    });

    socket.on('unsubscribe:campaign', (campaignId) => {
      const room = `campaign:${campaignId}`;
      socket.leave(room);
      console.log(`[Socket] ${socket.id} left room ${room}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} — ${reason}`);
    });

    socket.on('error', (err) => {
      console.error(`[Socket] Error on ${socket.id}:`, err.message);
    });
  });

  console.log('[Socket] Gateway initialised');
  return gateway;
};

/**
 * Gateway interface — used by pubsub/subscriber.js to route events.
 */
const gateway = {
  /**
   * Emit to all clients subscribed to a campaign room.
   */
  emitToCampaignRoom: (campaignId, event, data) => {
    if (!io) return;
    io.to(`campaign:${campaignId}`).emit(event, data);
  },

  /**
   * Emit to all connected clients (global dashboard updates).
   */
  emitToAll: (event, data) => {
    if (!io) return;
    io.emit(event, data);
  },

  getIO: () => io,
};

module.exports = { initSocketGateway, gateway };
