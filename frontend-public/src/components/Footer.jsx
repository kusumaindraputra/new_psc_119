export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">PSC 119</h3>
            <p className="text-gray-400 text-sm">
              Pusat Panggilan Darurat untuk layanan kesehatan dan kegawatdaruratan medis.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-3">Kontak Darurat</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📞 Telepon: 119</li>
              <li>📧 Email: emergency@psc119.id</li>
              <li>🏥 24/7 Layanan Darurat</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-3">Informasi</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Tentang PSC 119</li>
              <li>Cara Menggunakan</li>
              <li>Kebijakan Privasi</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2025 PSC 119. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}
