'use strict';

const service = require('./campaigns.service');
const { asyncWrapper } = require('../../middlewares/asyncWrapper');

const listCampaigns    = asyncWrapper(async (req, res) => res.json({ success: true, data: await service.listCampaigns(req.query) }));
const getCampaign      = asyncWrapper(async (req, res) => res.json({ success: true, data: await service.getCampaign(req.params.id) }));
const createCampaign   = asyncWrapper(async (req, res) => res.status(201).json({ success: true, data: await service.createCampaign(req.body) }));
const updateCampaign   = asyncWrapper(async (req, res) => res.json({ success: true, data: await service.updateCampaign(req.params.id, req.body) }));
const deleteCampaign   = asyncWrapper(async (req, res) => { await service.deleteCampaign(req.params.id); res.json({ success: true, data: { message: 'Deleted' } }); });
const launchCampaign   = asyncWrapper(async (req, res) => res.status(202).json({ success: true, data: await service.launchCampaign(req.params.id) }));
const getCampaignMessages = asyncWrapper(async (req, res) => res.json({ success: true, data: await service.getCampaignMessages(req.params.id, req.query) }));

module.exports = { listCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign, launchCampaign, getCampaignMessages };
