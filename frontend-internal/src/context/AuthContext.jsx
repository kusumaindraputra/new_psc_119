import { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { toast } from 'react-toastify'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        logout()
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login:', { email, timestamp: new Date().toISOString() })
      const response = await authAPI.login(email, password)
      
      console.log('📥 Login response:', response)
      
      if (response.success && response.data) {
        const { token, user: userData } = response.data
        
        console.log('✅ Login successful:', { 
          userName: userData.name, 
          userRole: userData.role,
          hasToken: !!token 
        })
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        
        toast.success(`Selamat datang, ${userData.name}!`)
        navigate('/dashboard')
        
        return { success: true }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('❌ Login error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      })
      
      const message = error.response?.data?.message || 'Login gagal. Periksa email dan password Anda.'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
    toast.info('Anda telah keluar dari sistem')
  }

  const hasRole = (roles) => {
    if (!user || !roles) return false
    if (Array.isArray(roles)) {
      return roles.includes(user.role)
    }
    return user.role === roles
  }

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
