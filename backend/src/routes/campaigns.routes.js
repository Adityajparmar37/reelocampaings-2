'use strict';

const { Router } = require('express');
const controller = require('../controllers/campaigns.controller');
const { validate } = require('../middlewares/validate');
const { createCampaignSchema, updateCampaignSchema, campaignQuerySchema } = require('../validators/campaign.validator');

const router = Router();

router.get('/',                validate(campaignQuerySchema, 'query'), controller.listCampaigns);
router.post('/',               validate(createCampaignSchema),         controller.createCampaign);
router.get('/:id',                                                      controller.getCampaign);
router.put('/:id',             validate(updateCampaignSchema),          controller.updateCampaign);
router.delete('/:id',                                                   controller.deleteCampaign);
router.post('/:id/launch',                                              controller.launchCampaign);
router.get('/:id/messages',                                             controller.getCampaignMessages);

module.exports = router;
