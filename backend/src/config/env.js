'use strict';

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://admin:campaign_pass@localhost:27017/campaign_db?authSource=admin',
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'campaign_db',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  QUEUE_NAME: process.env.QUEUE_NAME || 'campaign_queue',
  BATCH_SIZE: parseInt(process.env.BATCH_SIZE || '500', 10),
  PUBSUB_CHANNEL_PREFIX: process.env.PUBSUB_CHANNEL_PREFIX || 'campaign',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

module.exports = env;
