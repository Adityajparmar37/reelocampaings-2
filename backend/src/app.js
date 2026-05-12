'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const { httpLogger } = require('./middlewares/logger');
const { rateLimiter } = require('./middlewares/rateLimiter');
const { errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes/index');
require('../../worker/src/worker.js')

const createApp = () => {
  const app = express();

  // Security
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging
  app.use(httpLogger);

  // Rate limiting (global)
  app.use(rateLimiter);

  // Health check — unauthenticated
  app.get('/health', (req, res) =>
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() })
  );

  // API routes
  app.use('/api/v1', routes);

  // 404 handler
  app.use((req, res) =>
    res.status(404).json({ success: false, error: { message: 'Route not found' } })
  );

  // Centralized error handler (must be last)
  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
