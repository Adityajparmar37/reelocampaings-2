import api from './api'
export const campaignsApi = {
  list:    (params) => api.get('/campaigns', { params }),
  get:     (id)     => api.get(`/campaigns/${id}`),
  create:  (data)   => api.post('/campaigns', data),
  update:  (id, d)  => api.put(`/campaigns/${id}`, d),
  remove:  (id)     => api.delete(`/campaigns/${id}`),
  launch:  (id)     => api.post(`/campaigns/${id}/launch`),
  messages:(id, p)  => api.get(`/campaigns/${id}/messages`, { params: p }),
}
