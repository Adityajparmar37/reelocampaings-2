'use strict';

require('dotenv').config();
const { connect: connectDB } = require('./config/db');
require('./jobs/campaign.job'); // Registers BullMQ campaign worker
require('./jobs/retry.processor'); // Registers BullMQ retry worker

const start = async () => {
  try {
    await connectDB();
    console.log('[Worker] Service started and ready to process jobs.');
    console.log('[Worker] - Campaign worker: processing campaign batches');
    console.log('[Worker] - Retry worker: processing failed message retries');

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n[Worker] ${signal} received. Draining queues…`);
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[Worker] Fatal error on startup:', err);
    process.exit(1);
  }
};

start();
