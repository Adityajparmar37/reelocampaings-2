'use strict';

const { Router } = require('express');

const contactsRoutes = require('../modules/contacts/contacts.routes');
const campaignsRoutes = require('../modules/campaigns/campaigns.routes');
const uploadsRoutes = require('../modules/uploads/uploads.routes');
const analyticsRoutes = require('../modules/analytics/analytics.routes');

const router = Router();

router.use('/contacts', contactsRoutes);
router.use('/campaigns', campaignsRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
