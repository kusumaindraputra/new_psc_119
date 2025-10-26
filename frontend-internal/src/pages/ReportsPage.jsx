import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { reportAPI } from '../services/api'
import { toast } from 'react-toastify'
import Layout from '../components/Layout'
import { getReportStatusText } from '../utils/statusLabels'

const statusBadge = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-blue-100 text-blue-800',
    assigned: 'bg-purple-100 text-purple-800',
    in_progress: 'bg-orange-100 text-orange-800',
    closed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }
  const label = getReportStatusText(status)
  return <span className={`badge ${map[status] || 'bg-gray-100 text-gray-800'}`}>{label}</span>
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [filters, setFilters] = useState({ status: 'pending', q: '' })

  useEffect(() => {
    loadReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status])

  useEffect(() => {
    const onNew = () => loadReports()
    const onUpdate = () => loadReports()
    window.addEventListener('psc119:new_report', onNew)
    window.addEventListener('psc119:report_update', onUpdate)
    return () => {
      window.removeEventListener('psc119:new_report', onNew)
      window.removeEventListener('psc119:report_update', onUpdate)
    }
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      // Map UI 'completed' to API 'closed'
      const apiStatus = filters.status === 'completed' ? 'closed' : filters.status
      const res = await reportAPI.getAll({ status: apiStatus, q: filters.q })
      // Normalize response shape
      const payload = res?.data ?? res
      const rows = Array.isArray(payload)
        ? payload
        : (payload?.data ?? payload?.rows ?? [])
      setReports(Array.isArray(rows) ? rows : [])
    } catch (err) {
      console.error('Error loading reports', err)
      toast.error('Gagal memuat laporan')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (reportId) => {
    try {
      await reportAPI.updateStatus(reportId, 'verified', 'Diverifikasi')
      toast.success('Laporan diverifikasi')
      loadReports()
    } catch (err) {
      console.error('Verify failed', err)
      toast.error('Verifikasi gagal')
    }
  }

  const handleReject = async (reportId) => {
    try {
      await reportAPI.updateStatus(reportId, 'rejected', 'Ditolak')
      toast.success('Laporan ditolak')
      loadReports()
    } catch (err) {
      console.error('Reject failed', err)
      toast.error('Penolakan gagal')
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Laporan</h1>
        </div>

        <div className="card">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex gap-2">
              {[
                { key: 'pending', label: 'Menunggu' },
                { key: 'verified', label: 'Terverifikasi' },
                { key: 'assigned', label: 'Ditugaskan' },
                { key: 'in_progress', label: 'Diproses' },
                { key: 'completed', label: 'Selesai' }, // maps to API 'closed'
                { key: 'rejected', label: 'Ditolak' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`px-3 py-2 rounded border text-sm ${filters.status === key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}
                  onClick={() => setFilters(f => ({ ...f, status: key }))}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={filters.q}
                onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
                placeholder="Cari nama/alamat/telepon"
                className="input"
              />
              <button className="btn btn-secondary" onClick={loadReports}>Cari</button>
            </div>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Memuat laporan...</p>
            </div>
          ) : (
            <>
              {/* Mobile list */}
              <div className="md:hidden space-y-3">
                {reports.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">Tidak ada data</div>
                ) : (
                  reports.map((r) => (
                    <div key={r.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm text-gray-500">#{r.id}</div>
                          <div className="font-semibold">{r.category?.name || r.category_name || '-'}</div>
                          <div className="text-sm text-gray-700">{r.reporter_name || r.name || '-'}</div>
                          <div className="text-xs text-gray-500">{r.reporter_phone || r.phone || ''}</div>
                        </div>
                        {statusBadge(r.status)}
                      </div>
                      <div className="text-sm text-gray-600 mt-2 line-clamp-2">{r.address || r.location || '-'}</div>
                      <div className="flex gap-2 mt-3">
                        <Link to={`/reports/${r.id}`} className="btn btn-secondary flex-1">Detail</Link>
                        {r.status === 'pending' && (
                          <>
                            <button className="btn btn-primary flex-1" onClick={() => handleVerify(r.id)}>Verifikasi</button>
                            <button className="btn btn-danger flex-1" onClick={() => handleReject(r.id)}>Tolak</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-3 px-3">ID</th>
                      <th className="py-3 px-3">Kategori</th>
                      <th className="py-3 px-3">Pelapor</th>
                      <th className="py-3 px-3">Lokasi</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">Tidak ada data</td>
                      </tr>
                    )}
                    {reports.map((r) => (
                      <tr key={r.id} className="border-t border-gray-100">
                        <td className="py-3 px-3 font-mono">#{r.id}</td>
                        <td className="py-3 px-3">{r.category?.name || r.category_name || '-'}</td>
                        <td className="py-3 px-3">
                          <div className="font-medium">{r.reporter_name || r.name || '-'}</div>
                          <div className="text-xs text-gray-500">{r.reporter_phone || r.phone || ''}</div>
                        </td>
                        <td className="py-3 px-3">{r.address || r.location || '-'}</td>
                        <td className="py-3 px-3">{statusBadge(r.status)}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/reports/${r.id}`} className="btn btn-secondary">Detail</Link>
                            {r.status === 'pending' && (
                              <>
                                <button className="btn btn-primary" onClick={() => handleVerify(r.id)}>Verifikasi</button>
                                <button className="btn btn-danger" onClick={() => handleReject(r.id)}>Tolak</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
