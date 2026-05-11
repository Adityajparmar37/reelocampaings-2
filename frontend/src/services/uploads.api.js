import axios from 'axios'
const api = axios.create({ baseURL: '/api/v1', timeout: 60000 })
api.interceptors.response.use((res) => res.data.data, (err) => Promise.reject(err))
export const uploadsApi = {
  list:   (params) => api.get('/uploads', { params }),
  get:    (id)     => api.get(`/uploads/${id}`),
  upload: (file)   => { const fd = new FormData(); fd.append('file', file); return api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } }) },
}
