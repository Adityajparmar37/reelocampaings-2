'use strict';

const { Router } = require('express');

const contactsRoutes = require('./contacts.routes');
const campaignsRoutes = require('./campaigns.routes');
const uploadsRoutes = require('./uploads.routes');
const analyticsRoutes = require('./analytics.routes');

const router = Router();

router.use('/contacts', contactsRoutes);
router.use('/campaigns', campaignsRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
