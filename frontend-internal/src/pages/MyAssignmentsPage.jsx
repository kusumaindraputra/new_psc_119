import { useEffect, useState } from 'react'
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

export default function MyAssignmentsPage() {
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState([])
  const [filter, setFilter] = useState('pending')
  const [updating, setUpdating] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  useEffect(() => {
    const onAssigned = () => load()
    const onReportUpdate = () => load()
    window.addEventListener('psc119:assigned_task', onAssigned)
    window.addEventListener('psc119:report_update', onReportUpdate)
    return () => {
      window.removeEventListener('psc119:assigned_task', onAssigned)
      window.removeEventListener('psc119:report_update', onReportUpdate)
    }
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const res = await assignmentAPI.getMyAssignments()
      let data = res?.data || []
      if (filter && filter !== 'all') {
        data = data.filter(a => a.status === filter)
      }
      setAssignments(data)
    } catch (err) {
      console.error('Load assignments failed', err)
      toast.error('Gagal memuat tugas')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (assignmentId, status, notes) => {
    try {
      setUpdating(assignmentId)
      const formData = new FormData()
      formData.append('status', status)
      if (notes) formData.append('notes', notes)
      if (photoFile) formData.append('photo', photoFile)

      // Use raw axios instead of assignmentAPI.updateStatus to send multipart
      const api = (await import('../services/api')).default
      await api.put(`/assignments/${assignmentId}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success(`Status diperbarui: ${status}`)
      setPhotoFile(null)
      load()
    } catch (err) {
      console.error('Update status failed', err)
      toast.error('Gagal memperbarui status')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Tugas Saya</h1>
        </div>

        <div className="card">
          <div className="flex gap-2">
            {['all', 'pending', 'accepted', 'in_progress', 'completed'].map(s => (
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

        <div className="space-y-4">
          {loading ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Memuat tugas...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600">Tidak ada tugas</p>
            </div>
          ) : (
            assignments.map((a) => (
              <div key={a.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Tugas #{a.id}</h3>
                    <p className="text-sm text-gray-600">Laporan #{a.report_id}: {a.report?.category?.name || a.report?.category_name || '-'}</p>
                  </div>
                  {statusBadge(a.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Unit:</span> <span className="font-medium">{a.unit?.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Kendaraan:</span> <span className="font-medium">{a.vehicle?.plate_number || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ditugaskan:</span> <span className="font-medium">{new Date(a.assigned_at).toLocaleString()}</span>
                  </div>
                </div>

                {a.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                    <p className="text-gray-700">{a.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex flex-wrap gap-2">
                    {a.status === 'pending' && (
                      <>
                        <button
                          disabled={updating === a.id}
                          className="btn btn-primary"
                          onClick={() => updateStatus(a.id, 'accepted', 'Tugas diterima')}
                        >
                          {updating === a.id ? 'Menyimpan...' : 'Terima Tugas'}
                        </button>
                        <button
                          disabled={updating === a.id}
                          className="btn btn-danger"
                          onClick={() => updateStatus(a.id, 'cancelled', 'Tugas dibatalkan')}
                        >
                          Tolak
                        </button>
                      </>
                    )}

                    {a.status === 'accepted' && (
                      <button
                        disabled={updating === a.id}
                        className="btn btn-primary"
                        onClick={() => updateStatus(a.id, 'in_progress', 'Mulai penanganan')}
                      >
                        {updating === a.id ? 'Menyimpan...' : 'Mulai Penanganan'}
                      </button>
                    )}

                    {a.status === 'in_progress' && (
                      <div className="flex flex-col gap-2 w-full">
                        <div>
                          <label className="label text-sm">Upload Foto Bukti (opsional)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhotoFile(e.target.files[0])}
                            className="input text-sm"
                          />
                        </div>
                        <button
                          disabled={updating === a.id}
                          className="btn btn-primary"
                          onClick={() => updateStatus(a.id, 'completed', 'Penanganan selesai')}
                        >
                          {updating === a.id ? 'Menyimpan...' : 'Tandai Selesai'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
