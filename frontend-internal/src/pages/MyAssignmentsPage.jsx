import { useEffect, useState } from 'react'
import { assignmentAPI } from '../services/api'
import api from '../services/api'
import { toast } from 'react-toastify'
import Layout from '../components/Layout'
import { getAssignmentStatusText } from '../utils/statusLabels'

// Defensive: ensure status function is available
const safeGetStatusText = (status) => {
  try {
    return getAssignmentStatusText(status)
  } catch (err) {
    console.error('[MyAssignments] Error getting status text for:', status, err)
    return status
  }
}

const statusBadge = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return <span className={`badge ${map[status] || 'bg-gray-100 text-gray-800'}`}>{safeGetStatusText(status)}</span>
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
    const onAssigned = () => {
      console.log('[MyAssignments] Received assigned_task event, reloading...')
      load()
    }
    const onReportUpdate = () => {
      console.log('[MyAssignments] Received report_update event, reloading...')
      load()
    }
    window.addEventListener('psc119:assigned_task', onAssigned)
    window.addEventListener('psc119:report_update', onReportUpdate)
    return () => {
      window.removeEventListener('psc119:assigned_task', onAssigned)
      window.removeEventListener('psc119:report_update', onReportUpdate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const load = async () => {
    try {
      console.log('[MyAssignments] Loading assignments with filter:', filter)
      setLoading(true)
      const res = await assignmentAPI.getMyAssignments()
      let data = res?.data || []
      console.log('[MyAssignments] Received data:', data.length, 'assignments')
      if (filter && filter !== 'all') {
        data = data.filter(a => a.status === filter)
        console.log('[MyAssignments] After filter:', data.length, 'assignments')
      }
      setAssignments(data)
    } catch (err) {
      console.error('[MyAssignments] Load assignments failed', err)
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

      // Use raw axios to send multipart
      await api.put(`/assignments/${assignmentId}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success(`Status diperbarui: ${safeGetStatusText(status)}`)
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
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tugas Saya</h1>
        </div>

        <div className="card">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'pending', 'accepted', 'in_progress', 'completed'].map(s => (
              <button
                key={s}
                className={`px-3 py-2 rounded border text-xs md:text-sm whitespace-nowrap ${filter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}
                onClick={() => setFilter(s)}
              >
                {s === 'all' ? 'Semua' : safeGetStatusText(s)}
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
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Tugas #{a.id}</h3>
                    <p className="text-xs md:text-sm text-gray-600">Laporan #{a.report_id}: {a.report?.category?.name || a.report?.category_name || '-'}</p>
                  </div>
                  {statusBadge(a.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4 text-xs md:text-sm">
                  <div>
                    <span className="text-gray-600">Unit:</span> <span className="font-medium">{a.unit?.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Kendaraan:</span> <span className="font-medium">{a.vehicle?.plate_number || '-'}</span>
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <span className="text-gray-600">Ditugaskan:</span> <span className="font-medium">{new Date(a.assigned_at).toLocaleString()}</span>
                  </div>
                </div>

                {/* Lokasi Laporan */}
                {a.report && (a.report.latitude || a.report.longitude || a.report.address) && (
                  <div className="mb-4 p-3 bg-blue-50 rounded text-xs md:text-sm">
                    <div className="font-semibold text-gray-800 mb-2">📍 Lokasi Kejadian</div>
                    {a.report.address && (
                      <div className="text-gray-700 mb-2">{a.report.address}</div>
                    )}
                    {a.report.latitude && a.report.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${a.report.latitude},${a.report.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium min-h-[44px] py-2"
                      >
                        🗺️ Buka di Google Maps
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}

                {a.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded text-xs md:text-sm">
                    <p className="text-gray-700">{a.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
                    {a.status === 'pending' && (
                      <>
                        <button
                          disabled={updating === a.id}
                          className="btn btn-primary w-full sm:w-auto min-h-[44px] text-sm md:text-base"
                          onClick={() => updateStatus(a.id, 'accepted', 'Tugas diterima')}
                        >
                          {updating === a.id ? 'Menyimpan...' : 'Terima Tugas'}
                        </button>
                        <button
                          disabled={updating === a.id}
                          className="btn btn-danger w-full sm:w-auto min-h-[44px] text-sm md:text-base"
                          onClick={() => updateStatus(a.id, 'cancelled', 'Tugas dibatalkan')}
                        >
                          Tolak
                        </button>
                      </>
                    )}

                    {a.status === 'accepted' && (
                      <button
                        disabled={updating === a.id}
                        className="btn btn-primary w-full sm:w-auto min-h-[44px] text-sm md:text-base"
                        onClick={() => updateStatus(a.id, 'in_progress', 'Mulai penanganan')}
                      >
                        {updating === a.id ? 'Menyimpan...' : 'Mulai Penanganan'}
                      </button>
                    )}

                    {a.status === 'in_progress' && (
                      <div className="flex flex-col gap-3 w-full">
                        <div>
                          <label className="label text-xs md:text-sm">Upload Foto Bukti (opsional)</label>
                          <input
                            type="file"
                            accept="image/*;capture=camera"
                            capture="environment"
                            onChange={(e) => setPhotoFile(e.target.files[0])}
                            className="input text-xs md:text-sm min-h-[44px]"
                          />
                          {photoFile && (
                            <p className="text-xs text-gray-600 mt-1">File: {photoFile.name}</p>
                          )}
                        </div>
                        <button
                          disabled={updating === a.id}
                          className="btn btn-primary w-full min-h-[44px] text-sm md:text-base"
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
