'use strict';

require('dotenv').config();
const http = require('http');
const env = require('./config/env');
const { connect: connectDB } = require('./config/db');
const { setupIndexes } = require('./db/indexes');
const { createApp } = require('./app');
const { initSocket } = require('./socket/socket.gateway');
const { startSubscriber } = require('./pubsub/subscriber');

const start = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();
    await setupIndexes();

    // 2. Create Express app
    const app = createApp();

    // 3. Create HTTP server
    const httpServer = http.createServer(app);

    // 4. Init Socket.IO (attaches to httpServer)
    initSocket(httpServer);

    // 5. Start Redis Pub/Sub subscriber
    startSubscriber();

    // 6. Start listening
    httpServer.listen(env.PORT, () => {
      console.log(`[Server] API running on http://localhost:${env.PORT}`);
      console.log(`[Server] Environment: ${env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n[Server] ${signal} received. Shutting down gracefully…`);
      httpServer.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
};

start();
