import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { reportAPI, categoryAPI } from '../services/api'

export default function ReportPage() {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [location, setLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    reporter_name: '',
    phone: '',
    description: '',
    category_id: '',
    address: '',
    photo: null
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll()
      console.log('Loaded categories:', response)
      setCategories(response || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const getLocation = () => {
    setLocationLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude]
          })
          setLocationLoading(false)
          toast.success('📍 Lokasi berhasil didapatkan!')
        },
        (error) => {
          setLocationLoading(false)
          toast.error('Gagal mendapatkan lokasi. Pastikan GPS aktif.')
          console.error('Geolocation error:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setLocationLoading(false)
      toast.error('Browser tidak mendukung geolocation')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Ukuran foto maksimal 5MB')
        return
      }
      setFormData(prev => ({ ...prev, photo: file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!location) {
      toast.error('Lokasi harus diisi. Klik tombol "Dapatkan Lokasi"')
      return
    }

    setLoading(true)
    
    try {
      const submitData = new FormData()
      submitData.append('reporter_name', formData.reporter_name)
      submitData.append('phone', formData.phone)
      submitData.append('description', formData.description)
      submitData.append('category_id', formData.category_id)
      submitData.append('address', formData.address)
      submitData.append('coordinates', JSON.stringify(location))
      submitData.append('source', 'web')
      
      if (formData.photo) {
        submitData.append('photo', formData.photo)
      }

      const response = await reportAPI.createReport(submitData)
      
      toast.success('✅ Laporan berhasil dikirim! Tim kami akan segera merespons.')
      
      // Reset form
      setFormData({
        reporter_name: '',
        phone: '',
        description: '',
        category_id: '',
        address: '',
        photo: null
      })
      setLocation(null)
      
      // Show report ID
      if (response.data?.id) {
        toast.info(`ID Laporan: ${response.data.id}. Simpan untuk pelacakan.`, {
          autoClose: 10000
        })
      }
      
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error(error.response?.data?.message || 'Gagal mengirim laporan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚨 Lapor Darurat
          </h1>
          <p className="text-gray-600">
            Isi formulir di bawah ini untuk melaporkan keadaan darurat medis
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Pelapor *
              </label>
              <input
                type="text"
                name="reporter_name"
                value={formData.reporter_name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Masukkan nama Anda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori Kejadian *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Pilih kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Kejadian *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="input-field"
                placeholder="Jelaskan kondisi dan kejadian secara detail..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat Lengkap *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={2}
                className="input-field"
                placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lokasi GPS *
              </label>
              <button
                type="button"
                onClick={getLocation}
                disabled={locationLoading || location}
                className="btn-primary w-full mb-2"
              >
                {locationLoading ? '📍 Mendapatkan lokasi...' : location ? '✅ Lokasi sudah didapatkan' : '📍 Dapatkan Lokasi Otomatis'}
              </button>
              {location && (
                <p className="text-sm text-green-600">
                  ✓ Koordinat: {location.coordinates[1].toFixed(6)}, {location.coordinates[0].toFixed(6)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Kejadian (Opsional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maksimal 5MB. Format: JPG, PNG, GIF
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Penting:</strong> Pastikan informasi yang Anda berikan akurat. 
                Tim medis kami akan segera merespons laporan Anda.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-emergency w-full text-lg"
            >
              {loading ? '⏳ Mengirim laporan...' : '🚑 Kirim Laporan Darurat'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Untuk kondisi yang sangat kritis, segera hubungi{' '}
            <a href="tel:119" className="text-emergency-600 font-bold hover:underline">
              119
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
