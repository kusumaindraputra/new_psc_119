import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-emergency-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-emergency-600 font-bold text-xl">119</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">PSC 119</h1>
              <p className="text-sm text-emergency-100">Pusat Panggilan Darurat</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-emergency-200 transition-colors">
              Beranda
            </Link>
            <Link to="/report" className="hover:text-emergency-200 transition-colors">
              Lapor Darurat
            </Link>
            <Link to="/track" className="hover:text-emergency-200 transition-colors">
              Lacak Laporan
            </Link>
          </nav>
          
          <a 
            href="tel:119" 
            className="btn-emergency bg-white text-emergency-600 hover:bg-emergency-50"
          >
            📞 Hubungi 119
          </a>
        </div>
      </div>
    </header>
  )
}
