import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor for auth token (not needed for public app, but good to have)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const reportAPI = {
  // Create new report (multipart/form-data)
  createReport: async (formData) => {
    const response = await api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Track reports by phone
  trackByPhone: async (phone) => {
    const response = await api.get(`/reports/track/${phone}`)
    return response.data
  },

  // Get report by ID (public tracking)
  getReportById: async (reportId) => {
    const response = await api.get(`/reports/${reportId}`)
    return response.data
  }
}

export const categoryAPI = {
  // Get all categories
  getAll: async () => {
    const response = await api.get('/admin/categories')
    return response.data
  }
}

export default api
