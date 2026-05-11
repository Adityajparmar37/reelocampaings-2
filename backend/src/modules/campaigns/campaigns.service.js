'use strict';

const campaignsRepo = require('./campaigns.repository');
const messagesRepo = require('../messages/messages.repository');
const contactsRepo = require('../contacts/contacts.repository');
const { enqueueCampaignBatch } = require('../../queues/campaign.queue');
const { chunkArray } = require('../../utils/chunkArray');
const { parsePagination, paginationMeta } = require('../../utils/pagination');
const env = require('../../config/env');

const BATCH_SIZE = env.BATCH_SIZE || 500;

const listCampaigns = async (query) => {
  const { page, limit, skip } = parsePagination(query, 20);
  const { items, total } = await campaignsRepo.findCampaigns({ page, limit, skip, status: query.status });
  return { items, meta: paginationMeta({ page, limit, total }) };
};

const getCampaign = async (id) => {
  const campaign = await campaignsRepo.findCampaignById(id);
  if (!campaign) throw Object.assign(new Error('Campaign not found'), { status: 404 });
  return campaign;
};

const createCampaign = async (data) => campaignsRepo.createCampaign(data);

const updateCampaign = async (id, data) => {
  const existing = await getCampaign(id);
  if (['running', 'completed'].includes(existing.status)) {
    throw Object.assign(new Error('Cannot edit a running or completed campaign'), { status: 409 });
  }
  return campaignsRepo.updateCampaign(id, data);
};

const deleteCampaign = async (id) => {
  const existing = await getCampaign(id);
  if (existing.status === 'running') {
    throw Object.assign(new Error('Cannot delete a running campaign'), { status: 409 });
  }
  await campaignsRepo.deleteCampaign(id);
};

/**
 * Launch flow:
 *  1. Resolve audience → contacts array
 *  2. Bulk-create queued message placeholders
 *  3. Set campaign → running with counters
 *  4. Chunk contacts → enqueue BullMQ jobs in parallel
 */
const launchCampaign = async (id) => {
  const campaign = await getCampaign(id);
  if (campaign.status === 'running')   throw Object.assign(new Error('Already running'), { status: 409 });
  if (campaign.status === 'completed') throw Object.assign(new Error('Already completed'), { status: 409 });

  const contacts = await contactsRepo.findContactsByAudienceFilter(campaign.audienceFilters);
  if (!contacts.length) throw Object.assign(new Error('No contacts match the audience filters'), { status: 400 });

  await messagesRepo.bulkCreateMessages(id, contacts);
  await campaignsRepo.setCampaignStatus(id, 'running', {
    totalRecipients: contacts.length,
    pendingCount: contacts.length,
    sentCount: 0,
    failedCount: 0,
  });

  const batches = chunkArray(contacts, BATCH_SIZE);
  await Promise.all(
    batches.map((batch, idx) =>
      enqueueCampaignBatch(id, idx, batch.map((c) => c._id.toString()), { messageTemplate: campaign.messageTemplate })
    )
  );

  return { campaignId: id, totalRecipients: contacts.length, totalBatches: batches.length };
};

const getCampaignMessages = async (id, query) => {
  const { page, limit, skip } = parsePagination(query);
  const { items, total } = await messagesRepo.findMessagesByCampaign(id, { page, limit, skip, status: query.status });
  return { items, meta: paginationMeta({ page, limit, total }) };
};

module.exports = { listCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign, launchCampaign, getCampaignMessages };
