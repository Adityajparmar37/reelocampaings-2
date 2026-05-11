'use strict';

const { z } = require('zod');

const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  messageTemplate: z.string().min(1).max(5000),
  audienceFilters: z.object({
    tags: z.array(z.string()).optional(),
    createdAfter:  z.string().datetime().optional(),
    createdBefore: z.string().datetime().optional(),
    emailDomain:   z.string().optional(),
  }).optional().default({}),
});

const updateCampaignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  messageTemplate: z.string().min(1).max(5000).optional(),
  audienceFilters: z.object({
    tags: z.array(z.string()).optional(),
    createdAfter:  z.string().datetime().optional(),
    createdBefore: z.string().datetime().optional(),
    emailDomain:   z.string().optional(),
  }).optional(),
});

const campaignQuerySchema = z.object({
  page:   z.coerce.number().int().min(1).optional().default(1),
  limit:  z.coerce.number().int().min(1).max(200).optional().default(20),
  status: z.enum(['queued','running','completed','failed','draft','all']).optional().default('all'),
});

module.exports = { createCampaignSchema, updateCampaignSchema, campaignQuerySchema };
