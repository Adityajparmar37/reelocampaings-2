'use strict';

const { getDb } = require('../config/db');

const setupIndexes = async () => {
  const db = getDb();
  console.log('[DB] Setting up indexes…');

  // contacts
  await db.collection('contacts').createIndexes([
    { key: { email: 1 }, name: 'idx_email_unique', unique: true, sparse: true },
    { key: { phone: 1 }, name: 'idx_phone', sparse: true },
    { key: { createdAt: -1 }, name: 'idx_createdAt_desc' },
    { key: { tags: 1 }, name: 'idx_tags' },
    { key: { tags: 1, createdAt: -1 }, name: 'idx_tags_createdAt' },
    { key: { name: 'text', email: 'text' }, name: 'idx_text_search' },
  ]);

  // campaigns
  await db.collection('campaigns').createIndexes([
    { key: { status: 1 }, name: 'idx_campaign_status' },
    { key: { createdAt: -1 }, name: 'idx_campaign_createdAt' },
    { key: { status: 1, createdAt: -1 }, name: 'idx_campaign_status_createdAt' },
  ]);

  // campaignMessages
  await db.collection('campaignMessages').createIndexes([
    { key: { campaignId: 1 }, name: 'idx_msg_campaignId' },
    { key: { campaignId: 1, status: 1 }, name: 'idx_msg_campaignId_status' },
    { key: { campaignId: 1, status: 1, createdAt: 1 }, name: 'idx_msg_retry' },
    { key: { contactId: 1 }, name: 'idx_msg_contactId' },
    // Retry count for reporting
    { key: { retryCount: 1 }, name: 'idx_msg_retryCount', sparse: true },
  ]);

  // uploads
  await db.collection('uploads').createIndexes([
    { key: { status: 1 }, name: 'idx_upload_status' },
    { key: { createdAt: -1 }, name: 'idx_upload_createdAt' },
  ]);

  console.log('[DB] ✓ All indexes ready');
};

module.exports = { setupIndexes };
