// Queue metrics configuration
export const QUEUE_METRICS = [
  { key: 'waiting', label: 'Waiting', cls: 'text-amber-400', dot: 'bg-amber-400' },
  { key: 'active', label: 'Active', cls: 'text-blue-400', dot: 'bg-blue-400' },
  { key: 'completed', label: 'Completed', cls: 'text-emerald-400', dot: 'bg-emerald-400' },
  { key: 'failed', label: 'Failed', cls: 'text-red-400', dot: 'bg-red-400' },
  { key: 'delayed', label: 'Delayed', cls: 'text-purple-400', dot: 'bg-purple-400' },
]

// Chart colors
export const CHART_COLORS = {
  sent: '#10b981',
  failed: '#ef4444',
  pending: '#4b5563',
}

// Auto-refresh intervals (ms)
export const REFRESH_INTERVALS = {
  ANALYTICS_PAGE: 10_000, // 10 seconds
  DASHBOARD_PAGE: 15_000, // 15 seconds
  CAMPAIGN_DETAIL_RUNNING: 5_000, // 5 seconds
}

// Recent activity limits
export const RECENT_ACTIVITY_LIMITS = {
  ANALYTICS_PAGE: 10,
  DASHBOARD_PAGE: 8,
}

// Campaign name truncation length
export const CAMPAIGN_NAME_MAX_LENGTH = 14
