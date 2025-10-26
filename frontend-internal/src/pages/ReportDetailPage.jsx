import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { reportAPI } from '../services/api'
import { toast } from 'react-toastify'
import Layout from '../components/Layout'
import AssignmentCreateModal from '../components/AssignmentCreateModal'

export default function ReportDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [openAssign, setOpenAssign] = useState(false)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const load = async () => {
    try {
      setLoading(true)
      const res = await reportAPI.getById(id)
      setReport(res?.data || res)
    } catch (err) {
      console.error('Error loading report', err)
      toast.error('Gagal memuat detail laporan')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status, notes) => {
    try {
      await reportAPI.updateStatus(id, status, notes)
      toast.success('Status laporan diperbarui')
      load()
    } catch (err) {
      console.error('Update status failed', err)
      toast.error('Gagal memperbarui status')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Memuat detail laporan...</p>
        </div>
      </Layout>
    )
  }

  if (!report) {
    return (
      <Layout>
        <div className="card text-center py-12">
          <p className="text-gray-600">Laporan tidak ditemukan</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Detail Laporan #{report.id}</h1>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>Kembali</button>
            {report.status === 'pending' && (
              <>
                <button className="btn btn-primary" onClick={() => updateStatus('verified', 'Diverifikasi')}>Verifikasi</button>
                <button className="btn btn-danger" onClick={() => updateStatus('rejected', 'Ditolak')}>Tolak</button>
              </>
            )}
            {(report.status === 'verified' || report.status === 'pending') && (
              <button className="btn btn-primary" onClick={() => setOpenAssign(true)}>Buat Penugasan</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Informasi Laporan</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Kategori</span><span className="font-medium">{report.category?.name || report.category_name || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Status</span><span className="font-medium">{report.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Prioritas</span><span className="font-medium">{report.priority || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Sumber</span><span className="font-medium">{report.source || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Dibuat</span><span className="font-medium">{new Date(report.createdAt || report.created_at).toLocaleString()}</span></div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Pelapor</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Nama</span><span className="font-medium">{report.reporter_name || report.name || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Telepon</span><span className="font-medium">{report.reporter_phone || report.phone || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Alamat</span><span className="font-medium">{report.address || report.location || '-'}</span></div>
            </div>
          </div>
        </div>

        {(report.description || report.notes) && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-2">Deskripsi</h2>
            <p className="text-gray-700 whitespace-pre-line">{report.description || report.notes}</p>
          </div>
        )}
        <AssignmentCreateModal
          report={report}
          open={openAssign}
          onClose={() => setOpenAssign(false)}
          onCreated={() => {
            // after assignment, reload detail to see updated status
            load()
          }}
        />
      </div>
    </Layout>
  )
}
