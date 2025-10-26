import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          🚑 Darurat Medis? Hubungi Kami!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Layanan tanggap darurat kesehatan 24/7 untuk melindungi Anda dan keluarga
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="tel:119" 
            className="btn-emergency text-xl px-8 py-4"
          >
            📞 Telepon 119 (Gratis)
          </a>
          <Link 
            to="/report" 
            className="btn-primary text-xl px-8 py-4"
          >
            📝 Kirim Laporan Online
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="card text-center">
          <div className="text-5xl mb-4">⚡</div>
          <h3 className="text-xl font-bold mb-2">Respon Cepat</h3>
          <p className="text-gray-600">
            Tim medis profesional siap merespons dalam hitungan menit
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-5xl mb-4">📍</div>
          <h3 className="text-xl font-bold mb-2">Pelacakan Real-time</h3>
          <p className="text-gray-600">
            Pantau status laporan dan tim medis secara langsung
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-5xl mb-4">🏥</div>
          <h3 className="text-xl font-bold mb-2">Layanan 24/7</h3>
          <p className="text-gray-600">
            Tersedia setiap saat untuk keadaan darurat medis Anda
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="card mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Cara Menggunakan</h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h4 className="font-bold mb-2">Hubungi atau Lapor</h4>
            <p className="text-sm text-gray-600">
              Telepon 119 atau kirim laporan online dengan foto
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h4 className="font-bold mb-2">Verifikasi</h4>
            <p className="text-sm text-gray-600">
              Dispatcher kami akan memverifikasi laporan Anda
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h4 className="font-bold mb-2">Tim Dikirim</h4>
            <p className="text-sm text-gray-600">
              Tim medis akan dikirim ke lokasi Anda
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              4
            </div>
            <h4 className="font-bold mb-2">Penanganan</h4>
            <p className="text-sm text-gray-600">
              Dapatkan penanganan medis profesional
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-600 text-white rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Butuh Bantuan Sekarang?</h2>
        <p className="text-xl mb-6">Jangan ragu untuk menghubungi kami segera!</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="tel:119" 
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            📞 Hubungi 119
          </a>
          <Link 
            to="/track" 
            className="bg-primary-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-800 transition-colors"
          >
            🔍 Lacak Laporan
          </Link>
        </div>
      </div>
    </div>
  )
}
