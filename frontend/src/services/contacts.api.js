import api from './api'
export const contactsApi = {
  list:  (params) => api.get('/contacts', { params }),
  get:   (id)     => api.get(`/contacts/${id}`),
  stats: ()       => api.get('/contacts/stats'),
}
