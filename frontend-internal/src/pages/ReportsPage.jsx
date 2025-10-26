import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { reportAPI } from '../services/api'
import { toast } from 'react-toastify'
import Layout from '../components/Layout'

const statusBadge = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }
  return <span className={`badge ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status?.replace('_', ' ')}</span>
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [filters, setFilters] = useState({ status: 'pending', q: '' })

  useEffect(() => {
    loadReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status])

  const loadReports = async () => {
    try {
      setLoading(true)
      const res = await reportAPI.getAll({ status: filters.status, q: filters.q })
      const data = res?.data || res?.items || res || []
      setReports(Array.isArray(data) ? data : (data.rows || []))
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
              {['pending', 'verified', 'in_progress', 'completed', 'rejected'].map(s => (
                <button
                  key={s}
                  className={`px-3 py-2 rounded border text-sm ${filters.status === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}
                  onClick={() => setFilters(f => ({ ...f, status: s }))}
                >
                  {s.replace('_', ' ')}
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

        <div className="card overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Memuat laporan...</p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </Layout>
  )
}
