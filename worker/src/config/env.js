'use strict';

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://admin:campaign_pass@localhost:27017/campaign_db?authSource=admin',
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'campaign_db',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  QUEUE_NAME: process.env.QUEUE_NAME || 'campaign_queue',
  WORKER_CONCURRENCY: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
  PUBSUB_CHANNEL_PREFIX: process.env.PUBSUB_CHANNEL_PREFIX || 'campaign',
};

module.exports = env;
