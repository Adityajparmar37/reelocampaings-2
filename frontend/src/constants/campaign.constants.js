// Campaign status badge classes
export const CAMPAIGN_STATUS_CLASSES = {
  running: 'badge-blue',
  completed: 'badge-green',
  failed: 'badge-red',
  draft: 'badge-gray',
  queued: 'badge-yellow',
}

// Campaign status colors for charts
export const CAMPAIGN_STATUS_COLORS = {
  completed: '#10b981',
  running: '#3b82f6',
  failed: '#ef4444',
  draft: '#6b7280',
  queued: '#f59e0b',
}

// Campaign filter options
export const CAMPAIGN_FILTERS = ['all', 'draft', 'running', 'completed', 'failed']

// Default campaign form values
export const DEFAULT_CAMPAIGN_FORM = {
  name: '',
  messageTemplate: '',
  audienceFilters: { tags: '' },
}

// Campaign table columns
export const CAMPAIGN_TABLE_COLUMNS = [
  'Name',
  'Status',
  'Recipients',
  'Sent',
  'Failed',
  'Actions',
]

// Pagination settings
export const CAMPAIGNS_PER_PAGE = 20
