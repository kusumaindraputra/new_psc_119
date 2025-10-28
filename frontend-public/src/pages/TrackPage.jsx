import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { reportAPI } from '../services/api'

const statusLabels = {
  pending: { text: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
  verified: { text: 'Terverifikasi', color: 'bg-blue-100 text-blue-800' },
  assigned: { text: 'Ditugaskan', color: 'bg-purple-100 text-purple-800' },
  in_progress: { text: 'Diproses', color: 'bg-orange-100 text-orange-800' },
  closed: { text: 'Selesai', color: 'bg-green-100 text-green-800' },
  rejected: { text: 'Ditolak', color: 'bg-red-100 text-red-800' }
}

// Priority badge hidden by request to avoid confusion without context

export default function TrackPage() {
  const [searchParams] = useSearchParams()
  const [phone, setPhone] = useState('')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Auto-search if phone is in URL params
  useEffect(() => {
    const phoneParam = searchParams.get('phone')
    if (phoneParam) {
      setPhone(phoneParam)
      // Trigger search automatically
      performSearch(phoneParam)
    }
  }, [searchParams])

  const performSearch = async (phoneNumber) => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Masukkan nomor telepon yang valid')
      return
    }

    setLoading(true)
    setSearched(true)
    
    try {
      const response = await reportAPI.trackByPhone(phoneNumber)
      setReports(response.data || [])
      
      if (!response.data || response.data.length === 0) {
        toast.info('Tidak ada laporan ditemukan untuk nomor ini')
      } else {
        toast.success(`Ditemukan ${response.data.length} laporan`)
      }
    } catch (error) {
      console.error('Error tracking reports:', error)
      toast.error('Gagal mencari laporan')
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    performSearch(phone)
  }

  const formatDate = (dateInput) => {
    const d = dateInput || null
    const date = d ? new Date(d) : null
    if (!date || isNaN(date.getTime())) return '-'
    try {
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '-'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            🔍 Lacak Laporan
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Masukkan nomor telepon yang Anda gunakan saat melapor
          </p>
        </div>

        <div className="card mb-6 md:mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="input-field flex-1"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:w-auto"
            >
              {loading ? '⏳ Mencari...' : '🔍 Cari'}
            </button>
          </form>
        </div>

        {searched && reports.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Tidak Ada Laporan
            </h3>
            <p className="text-gray-600">
              Belum ada laporan yang ditemukan untuk nomor telepon ini
            </p>
          </div>
        )}

        {reports.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              Laporan Anda ({reports.length})
            </h2>
            
            {reports.map((report) => (
              <div key={report.id} className="card">
                {/* Header - stack badges on mobile */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {report.category?.name || 'Kategori Tidak Tersedia'}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 break-all">
                      ID: {report.id}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[report.status]?.color || 'bg-gray-100'}`}>
                      {statusLabels[report.status]?.text || report.status}
                    </span>
                  </div>
                </div>

                {/* Details - better mobile layout */}
                <div className="space-y-3 mb-4 text-sm md:text-base">
                  <div>
                    <span className="font-semibold text-gray-700">Pelapor:</span>{' '}
                    <span className="text-gray-700">{report.reporter_name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Deskripsi:</span>{' '}
                    <span className="text-gray-700">{report.description}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Alamat:</span>{' '}
                    <span className="text-gray-700">{report.address}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Dilaporkan:</span>{' '}
                    <span className="text-gray-700">{formatDate(report.created_at || report.createdAt)}</span>
                  </div>
                </div>

                {/* Reporter Photo */}
                {report.photo_url && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2 text-sm md:text-base">📷 Foto Pelapor:</h4>
                    <img
                      src={report.photo_url}
                      alt="Foto kejadian dari pelapor"
                      className="w-full max-w-md rounded-lg border shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                {/* Field Officer Photos from Logs */}
                {report.logs && report.logs.filter(log => log.photo_url).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2 text-sm md:text-base">📷 Foto Petugas:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {report.logs
                        .filter(log => log.photo_url)
                        .map((log, idx) => (
                          <div key={idx} className="space-y-1">
                            <img
                              src={log.photo_url}
                              alt={`Foto dari petugas ${idx + 1}`}
                              className="w-full rounded-lg border shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                            {log.notes && (
                              <p className="text-xs text-gray-600 italic">{log.notes}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              {formatDate(log.created_at)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Timeline/Progress */}
                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-700 mb-3 text-sm md:text-base">Status Penanganan:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${report.created_at ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">Laporan diterima</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${report.verified_at ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">Laporan diverifikasi</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${report.status === 'assigned' || report.status === 'in_progress' || report.status === 'closed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">Tim ditugaskan</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${report.status === 'in_progress' || report.status === 'closed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">Dalam penanganan</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${report.status === 'closed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">Selesai</span>
                    </div>
                  </div>
                </div>

                {report.assignments && report.assignments.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-bold text-gray-700 mb-2 text-sm md:text-base">Tim Penanganan:</h4>
                    {report.assignments.map((assignment, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        • Petugas: {assignment.assignee?.name || '-'}
                        {assignment.vehicle && ` - Kendaraan: ${assignment.vehicle.plate_number}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
