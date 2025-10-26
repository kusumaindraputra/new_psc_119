import { useState } from 'react'
import { toast } from 'react-toastify'
import { reportAPI } from '../services/api'

const statusLabels = {
  pending: { text: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
  verified: { text: 'Terverifikasi', color: 'bg-blue-100 text-blue-800' },
  assigned: { text: 'Ditugaskan', color: 'bg-purple-100 text-purple-800' },
  in_progress: { text: 'Dalam Proses', color: 'bg-orange-100 text-orange-800' },
  closed: { text: 'Selesai', color: 'bg-green-100 text-green-800' },
  rejected: { text: 'Ditolak', color: 'bg-red-100 text-red-800' }
}

const priorityLabels = {
  low: { text: 'Rendah', color: 'bg-gray-100 text-gray-800' },
  medium: { text: 'Sedang', color: 'bg-yellow-100 text-yellow-800' },
  high: { text: 'Tinggi', color: 'bg-orange-100 text-orange-800' },
  critical: { text: 'Kritis', color: 'bg-red-100 text-red-800' }
}

export default function TrackPage() {
  const [phone, setPhone] = useState('')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!phone || phone.length < 10) {
      toast.error('Masukkan nomor telepon yang valid')
      return
    }

    setLoading(true)
    setSearched(true)
    
    try {
      const response = await reportAPI.trackByPhone(phone)
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityLabels[report.priority]?.color || 'bg-gray-100'}`}>
                      {priorityLabels[report.priority]?.text || report.priority}
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
                    <span className="text-gray-700">{formatDate(report.created_at)}</span>
                  </div>
                </div>

                {report.photo_url && (
                  <div className="mb-4">
                    <img
                      src={report.photo_url}
                      alt="Foto kejadian"
                      className="w-full max-w-md rounded-lg"
                    />
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
                        • Petugas: {assignment.assignee?.name || 'N/A'}
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
