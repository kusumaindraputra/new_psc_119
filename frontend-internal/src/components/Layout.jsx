import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleLabels = {
  admin: 'Administrator',
  dispatcher: 'Dispatcher',
  field_officer: 'Petugas Lapangan',
  managerial: 'Manajer'
}

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  dispatcher: 'bg-blue-100 text-blue-800',
  field_officer: 'bg-green-100 text-green-800',
  managerial: 'bg-purple-100 text-purple-800'
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const navLinks = [
    { path: '/dashboard', label: '📊 Dashboard', roles: ['admin', 'dispatcher', 'field_officer', 'managerial'] },
    { path: '/reports', label: '📋 Laporan', roles: ['admin', 'dispatcher', 'field_officer', 'managerial'] },
    { path: '/assignments', label: '✍️ Penugasan', roles: ['admin', 'dispatcher'] },
    { path: '/my-assignments', label: '📦 Tugas Saya', roles: ['field_officer'] },
    { path: '/admin', label: '⚙️ Admin', roles: ['admin', 'managerial'] },
  ]

  const visibleLinks = navLinks.filter(link => 
    link.roles.includes(user?.role)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary-600">🚑 PSC 119</h1>
              <span className="text-sm text-gray-500">Internal System</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <span className={`badge ${roleColors[user?.role]}`}>
                {roleLabels[user?.role]}
              </span>
              <button
                onClick={logout}
                className="btn btn-secondary"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {visibleLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive(link.path)
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
