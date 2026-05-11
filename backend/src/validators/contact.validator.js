'use strict';

const { z } = require('zod');

const createContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  metadata: z.record(z.string(), z.any()).optional().default({}),
  tags: z.array(z.string().max(50)).optional().default([]),
});

const contactQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  search: z.string().max(100).optional(),
  tags: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name', 'email']).optional().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
});

module.exports = { createContactSchema, contactQuerySchema };
