import api from './api'
export const analyticsApi = {
  global:   ()       => api.get('/analytics/global'),
  campaign: (id)     => api.get(`/analytics/campaigns/${id}`),
  queue:    ()       => api.get('/analytics/queue'),
  activity: (limit)  => api.get('/analytics/activity', { params: { limit } }),
}
