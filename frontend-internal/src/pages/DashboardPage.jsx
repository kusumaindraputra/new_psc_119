import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dashboardAPI } from '../services/api'
import { assignmentAPI } from '../services/api'
import Layout from '../components/Layout'
import { toast } from 'react-toastify'

export default function DashboardPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myAssignmentsCount, setMyAssignmentsCount] = useState(0)

  useEffect(() => {
    loadMetrics()
    if (user?.role === 'field_officer') {
      // Load my assignments count for field officer
      assignmentAPI.getMyAssignments()
        .then(res => setMyAssignmentsCount((res?.data || []).filter(a => a.status !== 'completed').length))
        .catch(() => {})
    }
  }, [])

  const loadMetrics = async () => {
    try {
      const response = await dashboardAPI.getMetrics()
      const data = response.data

      // Derive simple counters for cards
      const statusMap = Object.fromEntries((data.reportsByStatus || []).map(r => [r.status, r.count]))
      const totalReports = (data.reportsByStatus || []).reduce((sum, r) => sum + (r.count || 0), 0)

      setMetrics({
        totalReports,
        pendingReports: statusMap.pending || 0,
        verifiedReports: statusMap.verified || 0,
        inProgressReports: statusMap.in_progress || 0,
        assignedReports: statusMap.assigned || 0,
        completedReports: statusMap.closed || 0,
        responseTime: data.responseTime,
        sla: data.sla,
        activeFieldOfficers: data.activeFieldOfficers,
        raw: data
      })
    } catch (error) {
      console.error('Error loading metrics:', error)
      toast.error('Gagal memuat data dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Selamat datang, {user?.name}!
          </p>
        </div>

        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Laporan</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.totalReports || 0}</p>
                </div>
                <div className="text-4xl">📋</div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Menunggu Verifikasi</p>
                  <p className="text-3xl font-bold text-yellow-600">{metrics.pendingReports || 0}</p>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Dalam Proses</p>
                  <p className="text-3xl font-bold text-orange-600">{metrics.inProgressReports || 0}</p>
                </div>
                <div className="text-4xl">🚑</div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Selesai</p>
                  <p className="text-3xl font-bold text-green-600">{metrics.completedReports || 0}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'field_officer' && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tugas Saya</h2>
            <p className="text-gray-600 mb-4">Anda memiliki {myAssignmentsCount} tugas aktif</p>
            <a href="/my-assignments" className="btn btn-primary">
              Lihat Tugas
            </a>
          </div>
        )}

        {(user?.role === 'dispatcher' || user?.role === 'admin') && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Laporan Terbaru</h2>
            <p className="text-gray-600 mb-4">{metrics?.pendingReports || 0} laporan menunggu verifikasi</p>
            <a href="/reports" className="btn btn-primary">
              Lihat Laporan
            </a>
          </div>
        )}

        {metrics?.responseTime && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Rata Verifikasi (menit)</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.responseTime.avgVerificationMinutes}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Rata Selesai (jam)</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.responseTime.avgClosureHours}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">SLA 24 jam</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.sla?.slaPercentage || 0}%</p>
              <p className="text-xs text-gray-500">Dalam SLA: {metrics.sla?.withinSLA || 0} • Total Selesai: {metrics.sla?.totalClosed || 0}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
