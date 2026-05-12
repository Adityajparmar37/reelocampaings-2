'use strict';

const { Server } = require('socket.io');
const env = require('../config/env');

let io = null;

// Initialize Socket.IO server
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join campaign room
    socket.on('subscribe:campaign', (campaignId) => {
      socket.join(`campaign:${campaignId}`);
      console.log(`[Socket] Subscribed to campaign: ${campaignId}`);
    });

    // Leave campaign room
    socket.on('unsubscribe:campaign', (campaignId) => {
      socket.leave(`campaign:${campaignId}`);
      console.log(`[Socket] Unsubscribed from campaign: ${campaignId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[Socket] Server initialized');
};

// Send message to specific campaign room
const sendToCampaign = (campaignId, event, data) => {
  if (io) {
    io.to(`campaign:${campaignId}`).emit(event, data);
  }
};

// Send message to all connected clients
const sendToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = { initSocket, sendToCampaign, sendToAll };
