import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
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
  ExternalLink,
  ChevronRight,
  BookOpen,
  Calculator,
  TrendingUp,
  LineChart,
  PieChart,
  Rocket,
  Monitor,
  ClipboardCheck,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Phone,
  Send,
  ChevronLeft
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
                  src="/logo.png" 
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
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          navigation={{
            nextEl: '.custom-next',
            prevEl: '.custom-prev',
          }}
          pagination={{ 
            clickable: true,
            el: '.custom-pagination',
            bulletClass: 'swiper-pagination-bullet !bg-white/50 !w-2 !h-2',
            bulletActiveClass: 'swiper-pagination-bullet-active !bg-white'
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="h-[400px] sm:h-[500px] md:h-[600px]"
        >
          {/* Slide 1 */}
          <SwiperSlide>
            <div className="relative h-full bg-gradient-to-br from-[#000428] via-[#004e92] to-[#000428] overflow-hidden">
              <div className="absolute inset-0 w-full h-full">
                <div className="absolute inset-0 bg-[url('https://feb.unm.ac.id/media/assets/gifheader.gif')] bg-cover bg-center mix-blend-overlay opacity-30 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)]"></div>
                <div className="absolute inset-0">
                  <div className="h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:500%_500%] animate-gradient"></div>
                </div>
              </div>
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
                <p className="text-green-400 text-lg sm:text-xl font-semibold mb-2 sm:mb-4 animate-fadeIn">SUCCESS!</p>
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-white mb-4 sm:mb-6 animate-slideUp">
                  FEB-UNM
                </h1>
                <p className="text-base sm:text-xl md:text-2xl text-gray-200 max-w-3xl px-4 sm:px-6 animate-fadeIn">
                  Menghasilkan Insan Profesional Dalam Bidang Ekonomi Dan Bisnis Yang Berwawasan Kependidikan Dan Kewirausahaan.
                </p>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 2 */}
          <SwiperSlide>
            <div className="relative h-full bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#1a2a6c] overflow-hidden">
              <div className="absolute inset-0 w-full h-full">
                <div className="absolute inset-0 bg-[url('https://feb.unm.ac.id/media/assets/gifheader.gif')] bg-cover bg-center mix-blend-overlay opacity-30 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)]"></div>
                <div className="absolute inset-0">
                  <div className="h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:500%_500%] animate-gradient"></div>
                </div>
              </div>
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-white mb-4 sm:mb-6 animate-slideUp">
                  Excelence
                </h1>
                <p className="text-base sm:text-xl md:text-2xl text-gray-200 max-w-3xl px-4 sm:px-6 animate-fadeIn">
                  Menjadi Fakultas Terkemuka dalam Pengembangan Pendidikan dan Keilmuan Ekonomi dan Bisnis.
                </p>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 3 */}
          <SwiperSlide>
            <div className="relative h-full bg-gradient-to-br from-[#000428] via-[#004e92] to-[#000428] overflow-hidden">
              <div className="absolute inset-0 w-full h-full">
                <div className="absolute inset-0 bg-[url('https://feb.unm.ac.id/media/assets/gifheader.gif')] bg-cover bg-center mix-blend-overlay opacity-30 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)]"></div>
                <div className="absolute inset-0">
                  <div className="h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:500%_500%] animate-gradient"></div>
                </div>
              </div>
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-white mb-4 sm:mb-6 animate-slideUp">
                  Innovation
            </h1>
                <p className="text-base sm:text-xl md:text-2xl text-gray-200 max-w-3xl px-4 sm:px-6 animate-fadeIn">
                  Mengembangkan Inovasi dalam Pembelajaran dan Riset Ekonomi Berbasis Teknologi.
                </p>
              </div>
            </div>
          </SwiperSlide>

          {/* Custom Navigation Arrows */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="absolute top-1/2 -translate-y-1/2 left-4 sm:left-6 lg:left-8 pointer-events-auto">
                <button className="custom-prev w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-6 lg:right-8 pointer-events-auto">
                <button className="custom-next w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Custom Pagination */}
          <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-10">
            <div className="custom-pagination flex justify-center space-x-2"></div>
        </div>
        </Swiper>
      </div>

      {/* News/Information Section */}
      <div className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Berita & Informasi</h2>
            <div className="w-24 h-1 bg-green-800 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Temukan berita terbaru dan informasi penting seputar Program Studi Bisnis Digital FEB UNM
            </p>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* News Card 1 */}
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                <img 
                  src="https://source.unsplash.com/random/800x600?business" 
                  alt="News 1"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Akademik</span>
                  <span className="text-gray-500 text-sm">24 Mar 2024</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-800 transition-colors">
                  Pembukaan Pendaftaran Mahasiswa Baru Tahun 2024
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Program Studi Bisnis Digital FEB UNM membuka pendaftaran mahasiswa baru untuk tahun akademik 2024/2025.
                </p>
                <a href="#" className="inline-flex items-center text-green-800 hover:text-green-700 font-medium">
                  Baca Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>

            {/* News Card 2 */}
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                <img 
                  src="https://source.unsplash.com/random/800x600?technology" 
                  alt="News 2"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Event</span>
                  <span className="text-gray-500 text-sm">22 Mar 2024</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-800 transition-colors">
                  Seminar Digital Business Transformation
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Menghadirkan pembicara dari berbagai perusahaan teknologi terkemuka untuk berbagi pengalaman transformasi digital.
                </p>
                <a href="#" className="inline-flex items-center text-green-800 hover:text-green-700 font-medium">
                  Baca Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>

            {/* News Card 3 */}
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                <img 
                  src="https://source.unsplash.com/random/800x600?startup" 
                  alt="News 3"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">Prestasi</span>
                  <span className="text-gray-500 text-sm">20 Mar 2024</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-800 transition-colors">
                  Mahasiswa Raih Juara Startup Competition
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Tim mahasiswa Bisnis Digital berhasil meraih juara 1 dalam kompetisi startup tingkat nasional.
                </p>
                <a href="#" className="inline-flex items-center text-green-800 hover:text-green-700 font-medium">
                  Baca Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>

            {/* News Card 4 */}
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                <img 
                  src="https://source.unsplash.com/random/800x600?collaboration" 
                  alt="News 4"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Kerjasama</span>
                  <span className="text-gray-500 text-sm">18 Mar 2024</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-800 transition-colors">
                  MoU dengan Perusahaan Digital
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Penandatanganan kerjasama dengan berbagai perusahaan digital untuk program magang mahasiswa.
                </p>
                <a href="#" className="inline-flex items-center text-green-800 hover:text-green-700 font-medium">
                  Baca Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>

            {/* News Card 5 */}
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                <img 
                  src="https://source.unsplash.com/random/800x600?workshop" 
                  alt="News 5"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Workshop</span>
                  <span className="text-gray-500 text-sm">15 Mar 2024</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-800 transition-colors">
                  Workshop UI/UX Design
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Workshop desain antarmuka pengguna bersama praktisi UI/UX dari industri teknologi.
                </p>
                <a href="#" className="inline-flex items-center text-green-800 hover:text-green-700 font-medium">
                  Baca Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>

            {/* News Card 6 */}
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                <img 
                  src="https://source.unsplash.com/random/800x600?research" 
                  alt="News 6"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">Penelitian</span>
                  <span className="text-gray-500 text-sm">12 Mar 2024</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-800 transition-colors">
                  Publikasi Penelitian Dosen
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Hasil penelitian dosen Prodi Bisnis Digital berhasil dipublikasikan di jurnal internasional bereputasi.
                </p>
                <a href="#" className="inline-flex items-center text-green-800 hover:text-green-700 font-medium">
                  Baca Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2" aria-label="Pagination">
              <button className="p-2 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <button className="px-4 py-2 rounded-lg bg-green-800 text-white font-medium">
                1
              </button>
              <button className="px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-800 font-medium transition-colors">
                2
              </button>
              <button className="px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-800 font-medium transition-colors">
                3
              </button>
              <span className="px-4 py-2 text-gray-500">...</span>
              <button className="px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-800 font-medium transition-colors">
                8
              </button>
              
              <button className="p-2 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-800 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Layanan Digital</h2>
            <div className="w-24 h-1 bg-green-800 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Akses berbagai layanan digital untuk mendukung kegiatan akademik Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="absolute top-0 left-0 w-full h-1 bg-green-800 rounded-t-2xl transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-800 transition-colors duration-300">
                  <BookOpen className="h-7 w-7 text-green-800 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pembelajaran Online</h3>
                <p className="text-gray-600 mb-6">LMS hadir untuk memfasilitasi pembelajaran yang fleksibel</p>
              </div>
              <a href="#" className="inline-flex items-center text-gray-600 hover:text-green-800 text-sm font-medium transition-colors duration-300">
                Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="absolute top-0 left-0 w-full h-1 bg-green-800 rounded-t-2xl transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-800 transition-colors duration-300">
                  <School className="h-7 w-7 text-green-800 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Syam OK</h3>
                <p className="text-gray-600 mb-6">Sistem dan Manajemen Aplikasi (Universitas Negeri Makassar)</p>
              </div>
              <a href="#" className="inline-flex items-center text-gray-600 hover:text-green-800 text-sm font-medium transition-colors duration-300">
                Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>

            {/* Card 3 */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="absolute top-0 left-0 w-full h-1 bg-green-800 rounded-t-2xl transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-800 transition-colors duration-300">
                  <ClipboardCheck className="h-7 w-7 text-green-800 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Layanan Akademik</h3>
                <p className="text-gray-600 mb-6">Sistem Informasi Akademik (SIA) UNM</p>
              </div>
              <a href="#" className="inline-flex items-center text-gray-600 hover:text-green-800 text-sm font-medium transition-colors duration-300">
                Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>

            {/* Card 4 */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="absolute top-0 left-0 w-full h-1 bg-green-800 rounded-t-2xl transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-800 transition-colors duration-300">
                  <GraduationCap className="h-7 w-7 text-green-800 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Kepakaran</h3>
                <p className="text-gray-600 mb-6">Kepakaran FEB Universitas Negeri Makassar</p>
              </div>
              <a href="#" className="inline-flex items-center text-gray-600 hover:text-green-800 text-sm font-medium transition-colors duration-300">
                Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Program Studi Section */}
      <div className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Program Studi</h2>
            <div className="w-24 h-1 bg-green-800 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pilihan Program Studi yang tersedia di Fakultas Ekonomi dan Bisnis Universitas Negeri Makassar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Prodi 1 */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="absolute top-0 left-0 w-full h-1 bg-green-800 rounded-t-2xl transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-800 transition-colors duration-300">
                  <BookOpen className="h-7 w-7 text-green-800 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pendidikan Ekonomi</h3>
                <p className="text-green-800 font-medium mb-4 text-sm">Strata 1 (S1)</p>
              </div>
              <a href="#" className="inline-flex items-center text-gray-600 hover:text-green-800 text-sm font-medium transition-colors duration-300">
                Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>

            {/* Prodi 2 */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="absolute top-0 left-0 w-full h-1 bg-green-800 rounded-t-2xl transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-800 transition-colors duration-300">
                  <Calculator className="h-7 w-7 text-green-800 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pendidikan Akuntansi</h3>
                <p className="text-green-800 font-medium mb-4 text-sm">Strata 1 (S1)</p>
              </div>
              <a href="#" className="inline-flex items-center text-gray-600 hover:text-green-800 text-sm font-medium transition-colors duration-300">
                Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>

            {/* Prodi 3 */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="absolute top-0 left-0 w-full h-1 bg-green-800 rounded-t-2xl transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-800 transition-colors duration-300">
                  <TrendingUp className="h-7 w-7 text-green-800 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Manajemen</h3>
                <p className="text-green-800 font-medium mb-4 text-sm">Strata 1 (S1)</p>
              </div>
              <a href="#" className="inline-flex items-center text-gray-600 hover:text-green-800 text-sm font-medium transition-colors duration-300">
                Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>

            {/* Prodi 4 */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="absolute top-0 left-0 w-full h-1 bg-green-800 rounded-t-2xl transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-800 transition-colors duration-300">
                  <LineChart className="h-7 w-7 text-green-800 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ekonomi Pembangunan</h3>
                <p className="text-green-800 font-medium mb-4 text-sm">Strata 1 (S1)</p>
              </div>
              <a href="#" className="inline-flex items-center text-gray-600 hover:text-green-800 text-sm font-medium transition-colors duration-300">
                Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>

            {/* Prodi 5 */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="absolute top-0 left-0 w-full h-1 bg-green-800 rounded-t-2xl transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-800 transition-colors duration-300">
                  <PieChart className="h-7 w-7 text-green-800 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Akuntansi</h3>
                <p className="text-green-800 font-medium mb-4 text-sm">Strata 1 (S1)</p>
              </div>
              <a href="#" className="inline-flex items-center text-gray-600 hover:text-green-800 text-sm font-medium transition-colors duration-300">
                Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>

            {/* Prodi 6 */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="absolute top-0 left-0 w-full h-1 bg-green-800 rounded-t-2xl transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-800 transition-colors duration-300">
                  <Rocket className="h-7 w-7 text-green-800 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Kewirausahaan</h3>
                <p className="text-green-800 font-medium mb-4 text-sm">Strata 1 (S1)</p>
              </div>
              <a href="#" className="inline-flex items-center text-gray-600 hover:text-green-800 text-sm font-medium transition-colors duration-300">
                Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>

            {/* Prodi 7 */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="absolute top-0 left-0 w-full h-1 bg-green-800 rounded-t-2xl transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-800 transition-colors duration-300">
                  <Monitor className="h-7 w-7 text-green-800 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Bisnis Digital</h3>
                <p className="text-green-800 font-medium mb-4 text-sm">Strata 1 (S1)</p>
              </div>
              <a href="#" className="inline-flex items-center text-gray-600 hover:text-green-800 text-sm font-medium transition-colors duration-300">
                Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>

            {/* Prodi 8 */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="absolute top-0 left-0 w-full h-1 bg-green-800 rounded-t-2xl transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-800 transition-colors duration-300">
                  <ClipboardCheck className="h-7 w-7 text-green-800 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Akuntansi Terapan</h3>
                <p className="text-green-800 font-medium mb-4 text-sm">Diploma 4 (D4)</p>
              </div>
              <a href="#" className="inline-flex items-center text-gray-600 hover:text-green-800 text-sm font-medium transition-colors duration-300">
                Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0f4229] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* About Section */}
            <div className="space-y-6">
              <img 
                src="/logo.png" 
                alt="FEB UNM Logo" 
                className="h-20 mb-4 w-auto"
              />
              <p className="text-gray-300 text-sm leading-relaxed">
               Website ini adalah portal akademik Program Studi Bisnis Digital, Fakultas Ekonomi dan Bisnis Universitas Negeri Makassar
              </p>
              <div className="flex items-center space-x-4">
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-700 transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-700 transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-700 transition-colors duration-300"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-700 transition-colors duration-300"
                  aria-label="Youtube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold relative inline-block">
                Tautan
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-yellow-500"></div>
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/programs" className="text-gray-300 hover:text-white flex items-center group">
                    <ChevronRight className="h-4 w-4 mr-2 text-yellow-500 transition-transform duration-300 group-hover:translate-x-1" />
                    <span className="text-sm">Dosen</span>
                  </Link>
                </li>
                <li>
                  <Link to="/calendar" className="text-gray-300 hover:text-white flex items-center group">
                    <ChevronRight className="h-4 w-4 mr-2 text-yellow-500 transition-transform duration-300 group-hover:translate-x-1" />
                    <span className="text-sm">Kalender Akademik</span>
                  </Link>
                </li>
                <li>
                  <Link to="/guide" className="text-gray-300 hover:text-white flex items-center group">
                    <ChevronRight className="h-4 w-4 mr-2 text-yellow-500 transition-transform duration-300 group-hover:translate-x-1" />
                    <span className="text-sm">Panduan Akademik</span>
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-300 hover:text-white flex items-center group">
                    <ChevronRight className="h-4 w-4 mr-2 text-yellow-500 transition-transform duration-300 group-hover:translate-x-1" />
                    <span className="text-sm">FAQ</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold relative inline-block">
                Kontak Kami
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-yellow-500"></div>
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300 leading-relaxed">
                    Jl. A. P. Pettarani, Tidung, Kec. Rappocini, Kota Makassar, Sulawesi Selatan 90222
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-yellow-500" />
                  <a href="mailto:feb@unm.ac.id" className="text-sm text-gray-300 hover:text-white transition-colors">
                    bisdig@unm.ac.id
                  </a>
                </li>
                <li className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-yellow-500" />
                  <a href="tel:+62411889464" className="text-sm text-gray-300 hover:text-white transition-colors">
                    (0411) 889464
                  </a>
                </li>
                <li className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-yellow-500" />
                  <a href="https://feb.unm.ac.id" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white transition-colors">
                 bisdig-fe.unm.ac.id
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold relative inline-block">
                Newsletter
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-yellow-500"></div>
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Berlangganan newsletter kami untuk mendapatkan informasi terbaru tentang Program Studi Bisnis Digital, FEB UNM
              </p>
              <form className="space-y-3">
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="Masukkan email Anda" 
                    className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} PADINUSANTARA. All rights reserved.
              </p>
              <div className="flex items-center space-x-6">
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .animate-gradient {
          animation: gradient 15s linear infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.4; }
        }
      `}</style> */}
    </div>
  );
}

export default HomePage; 