import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Search,
  MapPin,
  Mail,
  Globe,
  Bell,
  User,
  School,
  ChevronDown,
  GraduationCap,
  ExternalLink
} from 'lucide-react';

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDropdownEnter = (title) => {
    setActiveDropdown(title);
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };

  const navLinks = [
    {
      title: "Home",
      href: "/"
    },
    {
      title: "Profil",
      submenu: [
        { name: "Sejarah", href: "/profil/sejarah" },
        { name: "Visi & Misi", href: "/profil/visi-misi" },
        { name: "Struktur Organisasi", href: "/profil/struktur" },
        { name: "Dosen", href: "/profil/dosen" }
      ]
    },
    {
      title: "Akademik",
      submenu: [
        { name: "Kalender Akademik", href: "/akademik/kalender" },
        { name: "Kurikulum", href: "/akademik/kurikulum" },
        { name: "Peraturan Akademik", href: "/akademik/peraturan" }
      ]
    },
    {
      title: "Program Studi",
      submenu: [
        { name: "S1 Manajemen", href: "/prodi/manajemen" },
        { name: "S1 Akuntansi", href: "/prodi/akuntansi" },
        { name: "S1 Ekonomi Pembangunan", href: "/prodi/ekonomi" }
      ]
    },
    {
      title: "Kemahasiswaan",
      submenu: [
        { name: "Organisasi Mahasiswa", href: "/kemahasiswaan/organisasi" },
        { name: "Beasiswa", href: "/kemahasiswaan/beasiswa" },
        { name: "Tracer Study", href: "/kemahasiswaan/tracer" },
        { name: "Alumni", href: "/kemahasiswaan/alumni" }
      ]
    },
    {
      title: "Kerja Sama",
      submenu: [
        { name: "Dalam Negeri", href: "/kerjasama/dalam-negeri" },
        { name: "Luar Negeri", href: "/kerjasama/luar-negeri" }
      ]
    },
    {
      title: "Karya Ilmiah",
      submenu: [
        { name: "Jurnal", href: "/karya-ilmiah/jurnal" },
        { name: "Penelitian", href: "/karya-ilmiah/penelitian" },
        { name: "Pengabdian", href: "/karya-ilmiah/pengabdian" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-11 items-center text-sm">
            <div className="hidden sm:flex items-center divide-x divide-gray-200">
              <a href="#" className="flex items-center text-gray-600 hover:text-green-700 transition-colors pr-6">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Temukan Lokasi</span>
              </a>
              <a href="mailto:fe@unm.ac.id" className="flex items-center text-gray-600 hover:text-green-700 transition-colors pl-6">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">fe@unm.ac.id</span>
              </a>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex items-center space-x-4">
                <a href="#" className="flex items-center text-gray-600 hover:text-green-700 transition-colors">
                  <Globe className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Portal</span>
                </a>
                <a href="#" className="flex items-center text-gray-600 hover:text-green-700 transition-colors">
                  <School className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">SIAKAD</span>
                </a>
              </div>
              <div className="flex items-center text-gray-600 border-l border-gray-200 pl-6">
                <Globe className="h-4 w-4 mr-2" />
                <select className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer pr-6">
                  <option>Bahasa Indonesia</option>
                  <option>English</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav 
        className={`bg-green-800 sticky top-0 z-50 transition-all duration-300 ease-out
          ${isScrolled ? 'shadow-lg py-2' : 'py-4'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="block">
                <img 
                  src="https://feb.unm.ac.id/media/logo/LOGO.png" 
                  alt="FEBUNM Logo" 
                  className={`transition-all duration-300 ease-out ${isScrolled ? 'h-12' : 'h-16'}`}
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center">
              {navLinks.map((link) => (
                <div 
                  key={link.title} 
                  className="relative group px-1"
                  onMouseEnter={() => handleDropdownEnter(link.title)}
                  onMouseLeave={handleDropdownLeave}
                >
                  {link.submenu ? (
                    <button 
                      className={`
                        flex items-center px-4 py-2 rounded-md text-sm font-medium
                        transition-all duration-200 group
                        ${activeDropdown === link.title 
                          ? 'text-green-200 bg-green-700/30' 
                          : 'text-white hover:text-green-200 hover:bg-green-700/20'
                        }
                      `}
                    >
                      <span>{link.title}</span>
                      <ChevronDown className={`h-4 w-4 ml-1.5 transition-transform duration-200
                        ${activeDropdown === link.title ? 'rotate-180' : ''}
                      `} />
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white hover:text-green-200 hover:bg-green-700/20 rounded-md transition-all duration-200"
                    >
                      {link.title}
                    </Link>
                  )}
                  
                  {link.submenu && (
                    <div 
                      className={`
                        absolute z-10 left-0 mt-1 w-64 transform
                        transition-all duration-200 ease-out origin-top-left
                        ${activeDropdown === link.title 
                          ? 'opacity-100 scale-100 translate-y-0' 
                          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                        }
                      `}
                    >
                      <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                        <div className="relative bg-white">
                          {link.submenu.map((item, idx) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`
                                flex items-center justify-between px-4 py-3 text-sm text-gray-700 
                                hover:bg-green-50 hover:text-green-700 transition-colors
                                ${idx !== link.submenu.length - 1 ? 'border-b border-gray-100' : ''}
                              `}
                            >
                              <span>{item.name}</span>
                              <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side Items */}
            <div className="flex items-center space-x-2">
              <button className="p-2.5 text-white hover:text-green-200 hover:bg-green-700/20 rounded-md transition-all duration-200">
                <Search className="h-5 w-5" />
              </button>

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className={`
                  inline-flex items-center justify-center p-2.5 rounded-md 
                  transition-all duration-200 lg:hidden
                  ${isMenuOpen 
                    ? 'text-green-200 bg-green-700/30' 
                    : 'text-white hover:text-green-200 hover:bg-green-700/20'
                  }
                `}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div 
          className={`
            lg:hidden overflow-hidden transition-all duration-300 ease-in-out
            ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-green-700/30 mt-2">
            {navLinks.map((link) => (
              <div key={link.title} className="space-y-1">
                {link.submenu ? (
                  <div className="space-y-1">
                    <button className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-white hover:text-green-200 hover:bg-green-700/20 rounded-md transition-colors">
                      <span>{link.title}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <div className="pl-4 space-y-1 border-l border-green-700/30">
                      {link.submenu.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center justify-between px-3 py-2 text-sm font-medium text-green-100 hover:text-white hover:bg-green-700/20 rounded-md transition-colors"
                        >
                          <span>{item.name}</span>
                          <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={link.href}
                    className="block px-3 py-2 text-base font-medium text-white hover:text-green-200 hover:bg-green-700/20 rounded-md transition-colors"
                  >
                    {link.title}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
              Selamat Datang di Portal Akademik
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              Akses informasi akademik, jadwal kuliah, nilai, dan layanan akademik lainnya dalam satu platform terpadu.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
              >
                Masuk ke Dashboard
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600"
              >
                Daftar Sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Layanan Akademik</h2>
            <p className="mt-4 text-lg text-gray-600">
              Akses berbagai layanan akademik dengan mudah dan cepat
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="relative group">
              <div className="relative p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Portal Mahasiswa</h3>
                <p className="text-gray-600">
                  Akses informasi akademik, KRS, nilai, dan transkrip dalam satu tempat.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative group">
              <div className="relative p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Informasi Akademik</h3>
                <p className="text-gray-600">
                  Dapatkan informasi terbaru tentang kegiatan akademik dan pengumuman penting.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative group">
              <div className="relative p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Layanan Mahasiswa</h3>
                <p className="text-gray-600">
                  Akses layanan konsultasi akademik, bimbingan skripsi, dan bantuan lainnya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Tentang Kami</h3>
              <p className="text-gray-400 text-sm">
                Portal Akademik Universitas XYZ menyediakan layanan akademik terpadu untuk mahasiswa, dosen, dan staff.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Link Cepat</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/programs" className="hover:text-white">Program Studi</Link></li>
                <li><Link to="/calendar" className="hover:text-white">Kalender Akademik</Link></li>
                <li><Link to="/guide" className="hover:text-white">Panduan Akademik</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Kontak</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Email: info@universitasxyz.ac.id</li>
                <li>Telp: (021) 1234567</li>
                <li>Fax: (021) 1234568</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Ikuti Kami</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Portal Akademik Universitas XYZ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage; 