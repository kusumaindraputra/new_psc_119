import { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'
import { toast } from 'react-toastify'
import api from '../services/api'

export default function ReportCreateModal({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [photoFile, setPhotoFile] = useState(null)
  const [form, setForm] = useState({
    reporter_name: '',
    phone: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    source: 'walk-in',
    category_id: '',
    priority: 'medium'
  })

  useEffect(() => {
    if (open) {
      loadCategories()
    }
  }, [open])

  const loadCategories = async () => {
    try {
      const res = await adminAPI.getCategories()
      setCategories(res?.data || [])
    } catch (err) {
      console.error('Failed loading categories', err)
      toast.error('Gagal memuat kategori')
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    
    if (!form.reporter_name || !form.phone || !form.description || !form.category_id) {
      return toast.warn('Nama, telepon, deskripsi, dan kategori wajib diisi')
    }

    try {
      setLoading(true)
      const formData = new FormData()
      
      formData.append('reporter_name', form.reporter_name)
      formData.append('phone', form.phone)
      formData.append('description', form.description)
      formData.append('address', form.address || '')
      formData.append('latitude', form.latitude || '')
      formData.append('longitude', form.longitude || '')
      formData.append('source', form.source)
      formData.append('category_id', form.category_id)
      formData.append('priority', form.priority)
      
      if (photoFile) {
        formData.append('photo', photoFile)
      }

      await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Laporan berhasil dibuat')
      
      // Reset form
      setForm({
        reporter_name: '',
        phone: '',
        description: '',
        address: '',
        latitude: '',
        longitude: '',
        source: 'walk-in',
        category_id: '',
        priority: 'medium'
      })
      setPhotoFile(null)
      
      onCreated?.()
      onClose?.()
    } catch (err) {
      console.error('Create report failed', err)
      const msg = err.response?.data?.message || 'Gagal membuat laporan'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-4 max-h-[95vh] overflow-y-auto">
        <div className="px-4 py-3 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-base md:text-lg text-gray-900">Buat Laporan Manual</h3>
          <button 
            className="text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center" 
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={submit} className="p-4 space-y-4">
          {/* Reporter Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-sm md:text-base">
                Nama Pelapor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input text-sm md:text-base min-h-[44px]"
                placeholder="Nama lengkap pelapor"
                value={form.reporter_name}
                onChange={(e) => setForm(f => ({ ...f, reporter_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="label text-sm md:text-base">
                No. Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className="input text-sm md:text-base min-h-[44px]"
                placeholder="08xx atau +62"
                value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label text-sm md:text-base">
              Deskripsi Kejadian <span className="text-red-500">*</span>
            </label>
            <textarea
              className="input text-sm md:text-base min-h-[44px]"
              rows={4}
              placeholder="Jelaskan detail kejadian..."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-sm md:text-base">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                className="input text-sm md:text-base min-h-[44px]"
                value={form.category_id}
                onChange={(e) => setForm(f => ({ ...f, category_id: e.target.value }))}
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label text-sm md:text-base">Prioritas</label>
              <select
                className="input text-sm md:text-base min-h-[44px]"
                value={form.priority}
                onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
              >
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
              </select>
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="label text-sm md:text-base">Sumber Laporan</label>
            <select
              className="input text-sm md:text-base min-h-[44px]"
              value={form.source}
              onChange={(e) => setForm(f => ({ ...f, source: e.target.value }))}
            >
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="phone">Telepon</option>
              <option value="walk-in">Datang Langsung</option>
              <option value="other">Lainnya</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="label text-sm md:text-base">Alamat/Lokasi</label>
            <input
              type="text"
              className="input text-sm md:text-base min-h-[44px]"
              placeholder="Alamat lokasi kejadian"
              value={form.address}
              onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-sm md:text-base">Latitude (opsional)</label>
              <input
                type="text"
                className="input text-sm md:text-base min-h-[44px]"
                placeholder="-6.200000"
                value={form.latitude}
                onChange={(e) => setForm(f => ({ ...f, latitude: e.target.value }))}
              />
            </div>
            <div>
              <label className="label text-sm md:text-base">Longitude (opsional)</label>
              <input
                type="text"
                className="input text-sm md:text-base min-h-[44px]"
                placeholder="106.816666"
                value={form.longitude}
                onChange={(e) => setForm(f => ({ ...f, longitude: e.target.value }))}
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="label text-sm md:text-base">Foto (opsional)</label>
            <input
              type="file"
              accept="image/*"
              className="input text-sm md:text-base min-h-[44px]"
              onChange={(e) => setPhotoFile(e.target.files[0])}
            />
            {photoFile && (
              <p className="text-xs text-gray-600 mt-1">File: {photoFile.name}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary w-full sm:w-auto min-h-[44px] text-sm md:text-base"
              disabled={loading}
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-primary w-full sm:w-auto min-h-[44px] text-sm md:text-base"
            >
              {loading ? 'Menyimpan...' : 'Buat Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
