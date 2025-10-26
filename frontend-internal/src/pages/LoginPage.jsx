import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import DebugInfo from '../components/DebugInfo'

export default function LoginPage() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await login(formData.email, formData.password)
    setLoading(false)
  }

  const quickLogins = [
    { email: 'admin@psc119.id', password: 'admin123', role: 'Administrator' },
    { email: 'dispatcher@psc119.id', password: 'dispatcher123', role: 'Dispatcher' },
    { email: 'field1@psc119.id', password: 'field123', role: 'Petugas Lapangan' },
    { email: 'manager@psc119.id', password: 'manager123', role: 'Manajer' }
  ]

  const handleQuickLogin = (email, password) => {
    setFormData({ email, password })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🚑</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              PSC 119 Internal
            </h1>
            <p className="text-gray-600">
              Sistem Internal untuk Petugas
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="nama@psc119.id"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? '⏳ Masuk...' : '🔐 Masuk'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">
              Quick Login (Development Only):
            </p>
            <div className="space-y-2">
              {quickLogins.map((account, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickLogin(account.email, account.password)}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="font-medium text-gray-900">{account.role}</div>
                  <div className="text-xs text-gray-500">{account.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          © 2025 PSC 119. All rights reserved.
        </p>
      </div>

      <DebugInfo />
    </div>
  )
}
