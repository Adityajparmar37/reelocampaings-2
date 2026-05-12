// Socket event names
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Campaign events
  CAMPAIGN_STARTED: 'campaign.started',
  CAMPAIGN_BATCH_PROCESSED: 'campaign.batch.processed',
  CAMPAIGN_COMPLETED: 'campaign.completed',
  CAMPAIGN_FAILED: 'campaign.failed',
  CAMPAIGN_UPDATE: 'campaign:update',
  
  // Upload events
  UPLOAD_STARTED: 'upload.started',
  UPLOAD_PROGRESS: 'upload.progress',
  UPLOAD_COMPLETED: 'upload.completed',
  UPLOAD_FAILED: 'upload.failed',
  
  // Subscription events
  SUBSCRIBE_CAMPAIGN: 'subscribe:campaign',
  UNSUBSCRIBE_CAMPAIGN: 'unsubscribe:campaign',
}

// Socket configuration
export const SOCKET_CONFIG = {
  reconnection: true,
  reconnectionAttempts: 5,
}

// Upload progress timeouts (ms)
export const UPLOAD_TIMEOUTS = {
  RELOAD_CONTACTS: 1000,
  CLEAR_COMPLETED_PROGRESS: 6000,
  CLEAR_FAILED_PROGRESS: 10000,
}
