'use strict';

const { Router } = require('express');
const controller = require('./analytics.controller');

const router = Router();

router.get('/global', controller.getGlobalStats);
router.get('/queue', controller.getQueueStats);
router.get('/activity', controller.getRecentActivity);
router.get('/campaigns/:id', controller.getCampaignAnalytics);

module.exports = router;
