'use strict';

const analyticsRepo = require('./analytics.repository');
const { asyncWrapper } = require('../../middlewares/asyncWrapper');
const { getQueueStats: getQueueMetrics } = require('../../queues/campaign.queue');

const getGlobalStats = asyncWrapper(async (req, res) => {
  const stats = await analyticsRepo.getGlobalStats();
  res.json({ success: true, data: stats });
});

const getCampaignAnalytics = asyncWrapper(async (req, res) => {
  const data = await analyticsRepo.getCampaignAnalytics(req.params.id);
  res.json({ success: true, data });
});

const getRecentActivity = asyncWrapper(async (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
  const data = await analyticsRepo.getRecentActivity(limit);
  res.json({ success: true, data });
});

const getQueueStats = asyncWrapper(async (req, res) => {
  const metrics = await getQueueMetrics();
  res.json({ success: true, data: metrics });
});

module.exports = { getGlobalStats, getCampaignAnalytics, getRecentActivity, getQueueStats };
