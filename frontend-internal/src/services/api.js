import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
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

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  }
}

export const reportAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/reports', { params: filters })
    return response.data
  },
  
  getById: async (id) => {
    const response = await api.get(`/reports/${id}`)
    return response.data
  },
  
  updateStatus: async (id, status, notes) => {
    const response = await api.put(`/reports/${id}/status`, { status, notes })
    return response.data
  }
}

export const assignmentAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/assignments', { params: filters })
    return response.data
  },
  
  getMyAssignments: async () => {
    const response = await api.get('/assignments/my')
    return response.data
  },
  
  create: async (data) => {
    const response = await api.post('/assignments', data)
    return response.data
  },
  
  updateStatus: async (id, status, notes) => {
    const response = await api.put(`/assignments/${id}/status`, { status, notes })
    return response.data
  }
}

export const dashboardAPI = {
  getMetrics: async () => {
    const response = await api.get('/dashboard/metrics')
    return response.data
  }
}

export const adminAPI = {
  // Categories
  getCategories: async () => {
    const response = await api.get('/admin/categories')
    return response.data
  },
  
  createCategory: async (data) => {
    const response = await api.post('/admin/categories', data)
    return response.data
  },
  
  updateCategory: async (id, data) => {
    const response = await api.put(`/admin/categories/${id}`, data)
    return response.data
  },
  
  deleteCategory: async (id) => {
    const response = await api.delete(`/admin/categories/${id}`)
    return response.data
  },
  
  // Units
  getUnits: async () => {
    const response = await api.get('/admin/units')
    return response.data
  },
  
  createUnit: async (data) => {
    const response = await api.post('/admin/units', data)
    return response.data
  },
  
  updateUnit: async (id, data) => {
    const response = await api.put(`/admin/units/${id}`, data)
    return response.data
  },
  
  deleteUnit: async (id) => {
    const response = await api.delete(`/admin/units/${id}`)
    return response.data
  },
  
  // Vehicles
  getVehicles: async () => {
    const response = await api.get('/admin/vehicles')
    return response.data
  },
  
  createVehicle: async (data) => {
    const response = await api.post('/admin/vehicles', data)
    return response.data
  },
  
  updateVehicle: async (id, data) => {
    const response = await api.put(`/admin/vehicles/${id}`, data)
    return response.data
  },
  
  deleteVehicle: async (id) => {
    const response = await api.delete(`/admin/vehicles/${id}`)
    return response.data
  }
}

export const usersAPI = {
  getFieldOfficers: async () => {
    const response = await api.get('/auth/users/field-officers')
    return response.data
  }
}

export default api
