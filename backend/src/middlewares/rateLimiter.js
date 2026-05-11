'use strict';

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many requests. Please try again later.' } },
});

const uploadRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  message: { success: false, error: { message: 'Upload rate limit exceeded. Max 10/minute.' } },
});

module.exports = { rateLimiter, uploadRateLimiter };
