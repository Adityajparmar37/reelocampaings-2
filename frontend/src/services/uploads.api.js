import axios from 'axios'
const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1'
const api = axios.create({ baseURL, timeout: 60000 })
api.interceptors.response.use((res) => res.data.data, (err) => Promise.reject(err))
export const uploadsApi = {
  list:   (params) => api.get('/uploads', { params }),
  get:    (id)     => api.get(`/uploads/${id}`),
  upload: (file)   => { const fd = new FormData(); fd.append('file', file); return api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } }) },
}


