import './api'
export const uploadsApi = {
  list:   (params) => api.get('/uploads', { params }),
  get:    (id)     => api.get(`/uploads/${id}`),
  upload: (file)   => { const fd = new FormData(); fd.append('file', file); return api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } }) },
}


