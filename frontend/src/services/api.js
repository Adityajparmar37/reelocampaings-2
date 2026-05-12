import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1'

console.log('[API] Base URL:', baseURL)

const api = axios.create({ 
  baseURL, 
  timeout: 30000, 
  headers: { 'Content-Type': 'application/json' } 
})

api.interceptors.response.use(
  (res) => res.data.data, 
  (err) => {
    console.error('[API] Request failed:', err.message)
    return Promise.reject(err)
  }
)

export default api
