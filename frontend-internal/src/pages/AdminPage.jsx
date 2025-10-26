import { useState } from 'react'
import Layout from '../components/Layout'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('categories')

  const tabs = [
    { id: 'categories', label: '📂 Kategori' },
    { id: 'units', label: '🏥 Unit' },
    { id: 'vehicles', label: '🚗 Kendaraan' },
    { id: 'users', label: '👥 Pengguna' }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Master Data</h1>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="card">
          {activeTab === 'categories' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📂</div>
              <p className="text-gray-600 mb-2">Master Kategori</p>
              <p className="text-sm text-gray-500">CRUD kategori laporan akan ditambahkan di sini</p>
            </div>
          )}

          {activeTab === 'units' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏥</div>
              <p className="text-gray-600 mb-2">Master Unit</p>
              <p className="text-sm text-gray-500">CRUD unit PSC 119 akan ditambahkan di sini</p>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🚗</div>
              <p className="text-gray-600 mb-2">Master Kendaraan</p>
              <p className="text-sm text-gray-500">CRUD kendaraan operasional akan ditambahkan di sini</p>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-gray-600 mb-2">Manajemen Pengguna</p>
              <p className="text-sm text-gray-500">CRUD pengguna sistem akan ditambahkan di sini</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
