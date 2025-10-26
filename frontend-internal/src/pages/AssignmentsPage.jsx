import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { assignmentAPI } from '../services/api'
import { toast } from 'react-toastify'
import Layout from '../components/Layout'

const statusBadge = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return <span className={`badge ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status?.replace('_', ' ')}</span>
}

export default function AssignmentsPage() {
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState([])
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const load = async () => {
    try {
      setLoading(true)
      const res = await assignmentAPI.getAll({ status: filter !== 'all' ? filter : undefined })
      setAssignments(res?.data || [])
    } catch (err) {
      console.error('Load assignments failed', err)
      toast.error('Gagal memuat penugasan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Penugasan</h1>
        </div>

        <div className="card">
          <div className="flex gap-2">
            {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map(s => (
              <button
                key={s}
                className={`px-3 py-2 rounded border text-sm ${filter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}
                onClick={() => setFilter(s)}
              >
                {s === 'all' ? 'Semua' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="card overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Memuat penugasan...</p>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Laporan</th>
                  <th className="py-3 px-3">Petugas</th>
                  <th className="py-3 px-3">Unit / Kendaraan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Ditugaskan</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">Tidak ada data</td>
                  </tr>
                )}
                {assignments.map((a) => (
                  <tr key={a.id} className="border-t border-gray-100">
                    <td className="py-3 px-3 font-mono">#{a.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-medium">Laporan #{a.report_id}</div>
                      <div className="text-xs text-gray-500">{a.report?.category?.name || '-'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium">{a.assignee?.name || '-'}</div>
                      <div className="text-xs text-gray-500">{a.assignee?.email || ''}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>{a.unit?.name || '-'}</div>
                      <div className="text-xs text-gray-500">{a.vehicle?.plate_number || '-'}</div>
                    </td>
                    <td className="py-3 px-3">{statusBadge(a.status)}</td>
                    <td className="py-3 px-3">{new Date(a.assigned_at).toLocaleDateString()}</td>
                    <td className="py-3 px-3 text-right">
                      <Link to={`/reports/${a.report_id}`} className="btn btn-secondary">
                        Lihat Laporan
                      </Link>
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
