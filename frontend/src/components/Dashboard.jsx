import { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  Home, 
  Building2, 
  GraduationCap, 
  Users, 
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronDown,
  List,
  FileText,
  Settings,
  Plus,
  Edit,
  UserPlus,
  FileCheck,
  User,
  UserCheck,
  ClipboardList,
  Calendar,
  Award,
  School,
  Bell,
  ChevronRight,
  User2Icon
} from "lucide-react";
import ProfilePage from './ProfilePage';
import api from "../api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ProdiList from "./prodi/ProdiList";
import UserList from "./users/UserList";
import JurusanList from "./jurusan/JurusanList";
import PengajuanJudul from "./skripsi/PengajuanJudul";
import DaftarPengajuan from "./skripsi/DaftarPengajuan";
import ReviewPengajuan from "./skripsi/ReviewPengajuan";
import StatusPengajuan from "./skripsi/StatusPengajuan";
import BimbinganSkripsi from "./skripsi/BimbinganSkripsi";
import SkripsiRoadmap from "./skripsi/SkripsiRoadmap";
import NilaiSeminar from "./skripsi/NilaiSeminar";
import TracerForm from './tracer/TracerForm';
import TracerHistory from './tracer/TracerHistory';
import TracerStats from './tracer/TracerStats';
import Pengumuman from './informasi/Pengumuman';
import KalenderAkademik from './informasi/KalenderAkademik';
import PanduanAkademik from './informasi/PanduanAkademik';
import UserDetailEdit from './users/UserDetailEdit';
import DosenList from "./users/DosenList";
import KetuaProdiList from "./users/KetuaProdiList";
import StaffProdiList from "./users/StaffProdiList";
import StaffFakultasList from "./users/StaffFakultasList";
import ListMahasiswa from "./users/ListMahasiswa";
import ListDekanFakultas from "./users/ListDekanFakultas";
import PejabatJurusanList from "./users/PejabatJurusanList";





// Komponen Dashboard yang diperbarui
function Dashboard({ children, activeMenu = "/dashboard" }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [currentPage, setCurrentPage] = useState(activeMenu);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetchdata API PROFILE
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/api/profile/');
        setUser(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Gagal memuat data profil');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);


  const getMenuItemsByUserType = (userType) => {
    const baseMenu = [
      { 
        icon: Home, 
        label: "Dashboard", 
        path: "/dashboard",
        type: "single"
      },
      { 
        icon: User, 
        label: "Profil", 
        path: "/dashboard/profile",
        type: "single"
      }
    ];

    switch (userType) {
      case 'super_admin':
        return [
          ...baseMenu.slice(0, 1),
          {
            icon: School,
            label: "Jurusan",
            key: "jurusan",
            type: "single",
            path: "/dashboard/jurusan"
          },
          {
            icon: GraduationCap,
            label: "Program Studi",
            key: "prodi",
            type: "single",
            path: "/dashboard/prodi"
          },
          {
            icon: Users,
            label: "Manajemen User",
            key: "users",
            type: "dropdown",
            submenu: [
              { 
                icon: User2Icon, 
                label: "All Users", 
                path: "/dashboard/users" 
              },
              { 
                icon: Award, 
                label: "Dekan Fakultas", 
                path: "/dashboard/users/dekan" 
              },
              { 
                icon: School, 
                label: "Pejabat Jurusan", 
                path: "/dashboard/users/pejabat-jurusan" 
              },
              { 
                icon: Award, 
                label: "Ketua Program Studi", 
                path: "/dashboard/users/ketua-prodi" 
              },
              { 
                icon: Users, 
                label: "Staff Fakultas", 
                path: "/dashboard/users/staff-fakultas" 
              },
              { 
                icon: Users, 
                label: "Staff Prodi", 
                path: "/dashboard/users/staff-prodi" 
              },
              { 
                icon: GraduationCap, 
                label: "Dosen", 
                path: "/dashboard/users/dosen" 
              },
              { 
                icon: BookOpen, 
                label: "Mahasiswa", 
                path: "/dashboard/users/mahasiswa" 
              },
            ]
          },
          {
            icon: FileText,
            label: "Skripsi",
            key: "skripsi",
            type: "dropdown",
            submenu: [
              { icon: List, label: "Semua Pengajuan", path: "/dashboard/skripsi/pengajuan" },
              { icon: Settings, label: "Pengaturan Skripsi", path: "/dashboard/skripsi/settings" }
            ]
          },
          {
            icon: Settings,
            label: "Sistem",
            key: "sistem",
            type: "dropdown",
            submenu: [
              { icon: Settings, label: "Pengaturan Umum", path: "/dashboard/sistem/settings" },
              { icon: FileText, label: "Log Aktivitas", path: "/dashboard/sistem/logs" },
              { icon: Award, label: "Backup & Restore", path: "/dashboard/sistem/backup" }
            ]
          },
          baseMenu[1]
        ];

      case 'dekan_fakultas':
        return [
          ...baseMenu.slice(0, 1),
          {
            icon: GraduationCap,
            label: "Program Studi",
            key: "prodi",
            type: "dropdown",
            submenu: [
              { icon: List, label: "List Program Studi", path: "/dashboard/prodi" },
              { icon: Settings, label: "Kelola Program Studi", path: "/dashboard/prodi/manage" }
            ]
          },
          {
            icon: FileText,
            label: "Skripsi",
            key: "skripsi",
            type: "dropdown",
            submenu: [
              { icon: List, label: "Review Pengajuan", path: "/dashboard/skripsi/review" },
              { icon: FileCheck, label: "Persetujuan Judul", path: "/dashboard/skripsi/approve" },
              { icon: ClipboardList, label: "Laporan Skripsi", path: "/dashboard/skripsi/reports" }
            ]
          },
          {
            icon: Users,
            label: "Dosen Fakultas",
            key: "dosen",
            type: "dropdown",
            submenu: [
              { icon: List, label: "List Dosen", path: "/dashboard/dosen" },
              { icon: UserPlus, label: "Tambah Dosen", path: "/dashboard/dosen/add" },
              { icon: Edit, label: "Kelola Dosen", path: "/dashboard/dosen/manage" }
            ]
          },
          baseMenu[1]
        ];

      case 'ketua_prodi':
        return [
          ...baseMenu.slice(0, 1),
          {
            icon: FileText,
            label: "Skripsi",
            key: "skripsi",
            type: "dropdown",
            submenu: [
              { icon: List, label: "Review Pengajuan", path: "/dashboard/skripsi/review" },
              { icon: UserCheck, label: "Penentuan Pembimbing", path: "/dashboard/skripsi/pembimbing" },
              { icon: ClipboardList, label: "Laporan Skripsi", path: "/dashboard/skripsi/reports" }
            ]
          },
          {
            icon: Users,
            label: "Dosen Prodi",
            key: "dosen",
            type: "dropdown",
            submenu: [
              { icon: List, label: "List Dosen", path: "/dashboard/dosen" },
              { icon: Settings, label: "Jadwal Mengajar", path: "/dashboard/dosen/jadwal" }
            ]
          },
          {
            icon: BookOpen,
            label: "Mahasiswa Prodi",
            key: "mahasiswa",
            type: "dropdown",
            submenu: [
              { icon: List, label: "List Mahasiswa", path: "/dashboard/mahasiswa" },
              { icon: UserPlus, label: "Tambah Mahasiswa", path: "/dashboard/mahasiswa/add" },
              { icon: FileCheck, label: "Verifikasi Pengajuan", path: "/dashboard/mahasiswa/verifikasi" },
              { icon: Award, label: "Monitoring IPK", path: "/dashboard/mahasiswa/ipk" }
            ]
          },
          baseMenu[1]
        ];

      case 'pejabat_jurusan':
        return [
          ...baseMenu.slice(0, 1),
          {
            icon: GraduationCap,
            label: "Program Studi",
            key: "prodi",
            type: "dropdown",
            submenu: [
              { icon: List, label: "List Program Studi", path: "/dashboard/prodi" },
              { icon: Settings, label: "Koordinasi Prodi", path: "/dashboard/prodi/koordinasi" }
            ]
          },
          {
            icon: Users,
            label: "Dosen Jurusan",
            key: "dosen",
            type: "dropdown",
            submenu: [
              { icon: List, label: "List Dosen", path: "/dashboard/dosen" },
              { icon: Award, label: "Evaluasi Kinerja", path: "/dashboard/dosen/evaluasi" }
            ]
          },
          {
            icon: FileText,
            label: "Laporan Jurusan",
            key: "laporan",
            type: "dropdown",
            submenu: [
              { icon: FileText, label: "Laporan Bulanan", path: "/dashboard/laporan/bulanan" },
              { icon: ClipboardList, label: "Laporan Tahunan", path: "/dashboard/laporan/tahunan" }
            ]
          },
          baseMenu[1]
        ];

      case 'dosen':
        return [
          ...baseMenu.slice(0, 1),
          {
            icon: FileText,
            label: "Bimbingan Skripsi",
            key: "skripsi",
            type: "dropdown",
            submenu: [
              { icon: List, label: "Mahasiswa Bimbingan", path: "/dashboard/skripsi/bimbingan" },
              { icon: FileCheck, label: "Review Pengajuan", path: "/dashboard/skripsi/review" },
              { icon: ClipboardList, label: "Riwayat Bimbingan", path: "/dashboard/skripsi/history" }
            ]
          },
          {
            icon: Users,
            label: "Mahasiswa",
            key: "mahasiswa",
            type: "dropdown",
            submenu: [
              { icon: List, label: "Mahasiswa Bimbingan", path: "/dashboard/mahasiswa/bimbingan" },
              { icon: Award, label: "Nilai Mahasiswa", path: "/dashboard/mahasiswa/nilai" },
              { icon: FileCheck, label: "Presensi", path: "/dashboard/mahasiswa/presensi" }
            ]
          },
          baseMenu[1]
        ];

      case 'staff_fakultas':
        return [
          ...baseMenu.slice(0, 1),
          {
            icon: FileText,
            label: "Administrasi",
            key: "administrasi",
            type: "dropdown",
            submenu: [
              { icon: FileText, label: "Surat Menyurat", path: "/dashboard/administrasi/surat" },
              { icon: FileCheck, label: "Verifikasi Dokumen", path: "/dashboard/administrasi/verifikasi" },
              { icon: ClipboardList, label: "Arsip Dokumen", path: "/dashboard/administrasi/arsip" }
            ]
          },
          {
            icon: Users,
            label: "Data Fakultas",
            key: "data",
            type: "dropdown",
            submenu: [
              { icon: Users, label: "Data Dosen", path: "/dashboard/data/dosen" },
              { icon: BookOpen, label: "Data Mahasiswa", path: "/dashboard/data/mahasiswa" },
              { icon: GraduationCap, label: "Data Program Studi", path: "/dashboard/data/prodi" }
            ]
          },
          baseMenu[1]
        ];

      case 'staff_prodi':
        return [
          ...baseMenu.slice(0, 1),
          {
            icon: FileText,
            label: "Skripsi",
            key: "skripsi",
            type: "dropdown",
            submenu: [
              { icon: List, label: "Daftar Pengajuan", path: "/dashboard/skripsi/list" },
              { icon: FileCheck, label: "Verifikasi Berkas", path: "/dashboard/skripsi/verify" },
              { icon: ClipboardList, label: "Laporan", path: "/dashboard/skripsi/reports" }
            ]
          },
          {
            icon: BookOpen,
            label: "Mahasiswa Prodi",
            key: "mahasiswa",
            type: "dropdown",
            submenu: [
              { icon: List, label: "Data Mahasiswa", path: "/dashboard/mahasiswa" },
              { icon: FileText, label: "Pengajuan Mahasiswa", path: "/dashboard/mahasiswa/pengajuan" },
              { icon: Award, label: "Transkrip Nilai", path: "/dashboard/mahasiswa/transkrip" }
            ]
          },
          baseMenu[1]
        ];

      case 'mahasiswa':
      default:
        return [
          ...baseMenu.slice(0, 1),
          {
            icon: FileText,
            label: "Skripsi",
            key: "skripsi",
            type: "dropdown",
            submenu: [
              { icon: FileText, label: "Roadmap Skripsi", path: "/dashboard/skripsi/roadmap" },
              { icon: Plus, label: "Pengajuan Judul", path: "/dashboard/skripsi/pengajuan" },
              { icon: List, label: "Status Pengajuan", path: "/dashboard/skripsi/status" },
              { icon: FileCheck, label: "Bimbingan", path: "/dashboard/skripsi/bimbingan" },
              { icon: Award, label: "Nilai Seminar/Ujian", path: "/dashboard/skripsi/nilai" }
            ]
          },
          {
            icon: ChevronRight,
            label: "Tracer Study",
            key: "tracer",
            type: "dropdown",
            submenu: [
              { icon: FileText, label: "Isi Tracer Study", path: "/dashboard/tracer/form" },
              { icon: List, label: "Riwayat Pengisian", path: "/dashboard/tracer/history" },
              { icon: Award, label: "Statistik Alumni", path: "/dashboard/tracer/stats" }
            ]
          },
          {
            icon: Bell,
            label: "Informasi",
            key: "informasi",
            type: "dropdown",
            submenu: [
              { icon: Bell, label: "Pengumuman", path: "/dashboard/informasi/pengumuman" },
              { icon: Calendar, label: "Kalender Akademik", path: "/dashboard/informasi/kalender" },
              { icon: BookOpen, label: "Panduan Akademik", path: "/dashboard/informasi/panduan" }
            ]
          },
          baseMenu[1]
        ];
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    console.log("Logout button clicked!");
    navigate("/logout");  // Gunakan navigate (huruf kecil)

  };


  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setOpenDropdowns({});
    }
  };

  const toggleDropdown = (key) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isActiveMenu = (path) => {
    return currentPage === path;
  };

  const isActiveParent = (submenu) => {
    return submenu.some(item => currentPage === item.path);
  };

  const handleNavigation = (path) => {
    setCurrentPage(path);
    closeSidebar();
  };

  // Tambahkan pengecekan loading dan user null
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Error loading user data</div>;
  }

  const menuItems = getMenuItemsByUserType(user.user_type); // Error: Cannot read properties of null ('user_type' of null)

  // Get user type display name
  const getUserTypeDisplay = (userType) => {
    const typeMap = {
      'super_admin': 'Super Admin',
      'dekan_fakultas': 'Dekan Fakultas',
      'pejabat_jurusan': 'Pejabat Jurusan',
      'ketua_prodi': 'Ketua Program Studi',
      'staff_fakultas': 'Staff Fakultas',
      'staff_prodi': 'Staff Program Studi',
      'dosen': 'Dosen',
      'mahasiswa': 'Mahasiswa'
    };
    return typeMap[userType] || 'User';
  };

  const renderMenuItem = (item, index) => {
    const Icon = item.icon;
    const isActive = item.type === "single" ? isActiveMenu(item.path) : isActiveParent(item.submenu);
    
    if (item.type === "single") {
      return (
        <button
          key={index}
          className={`
            ${isCollapsed ? 'justify-center px-2' : 'justify-start px-4'} 
            w-full h-12 transition-all duration-200 rounded-xl group relative flex items-center
            ${isActive 
              ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' 
              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
            }
          `}
          onClick={() => handleNavigation(item.path)}
        >
          <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} group-hover:scale-110 transition-transform duration-200 ${isActive ? 'text-blue-700' : ''}`} />
          {!isCollapsed && (
            <span className="font-medium">{item.label}</span>
          )}
          
          {isActive && !isCollapsed && (
            <div className="absolute right-3 w-2 h-2 bg-blue-600 rounded-full"></div>
          )}
          
          {isCollapsed && (
            <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {item.label}
            </div>
          )}
        </button>
      );
    }

    if (item.type === "dropdown") {
      const isOpen = openDropdowns[item.key];
      
      return (
        <div key={index} className="w-full">
          <button
            className={`
              ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'} 
              w-full h-12 transition-all duration-200 rounded-xl group relative flex items-center
              ${isActive 
                ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }
              ${isOpen && !isActive ? 'bg-blue-50 text-blue-700' : ''}
            `}
            onClick={() => isCollapsed ? handleNavigation(item.submenu[0].path) : toggleDropdown(item.key)}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
              <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} group-hover:scale-110 transition-transform duration-200 ${isActive ? 'text-blue-700' : ''}`} />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </div>
            
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                {isActive && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            )}
            
            {isCollapsed && (
              <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </button>

          {!isCollapsed && isOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-100 pl-4">
              {item.submenu.map((subItem, subIndex) => {
                const SubIcon = subItem.icon;
                const isSubActive = isActiveMenu(subItem.path);
                return (
                  <button
                    key={subIndex}
                    className={`
                      justify-start px-3 w-full h-10 text-sm transition-all duration-200 rounded-lg group relative flex items-center
                      ${isSubActive 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm font-medium' 
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                      }
                    `}
                    onClick={() => handleNavigation(subItem.path)}
                  >
                    <SubIcon className={`h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200 ${isSubActive ? 'text-blue-700' : ''}`} />
                    <span className={isSubActive ? 'font-medium' : 'font-medium'}>{subItem.label}</span>
                    
                    {isSubActive && (
                      <div className="absolute right-2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }
  };

  const componentMap = {
    "/dashboard/profile": ProfilePage,
    "/dashboard/prodi": ProdiList,
    "/dashboard/jurusan": JurusanList,
    "/dashboard/users": UserList,
    "/dashboard/users/dosen": DosenList,
    "/dashboard/users/mahasiswa": ListMahasiswa,
    "/dashboard/users/ketua-prodi": KetuaProdiList,
    "/dashboard/users/staff-prodi": StaffProdiList,
    "/dashboard/users/staff-fakultas": StaffFakultasList,
    "/dashboard/users/dekan": ListDekanFakultas,
    "/dashboard/users/pejabat-jurusan": PejabatJurusanList,
    // Skripsi Routes for Mahasiswa
    "/dashboard/skripsi/pengajuan": PengajuanJudul,
    "/dashboard/skripsi/status": StatusPengajuan,
    "/dashboard/skripsi/bimbingan": BimbinganSkripsi,
    "/dashboard/skripsi/roadmap": SkripsiRoadmap,
    "/dashboard/skripsi/nilai": NilaiSeminar,
    // Skripsi Routes for Staff/Dosen
    "/dashboard/skripsi/list": DaftarPengajuan,
    "/dashboard/skripsi/review": ReviewPengajuan,
    // Tracer Study Routes
    "/dashboard/tracer/form": TracerForm,
    "/dashboard/tracer/history": TracerHistory,
    "/dashboard/tracer/stats": TracerStats,
    // Informasi Routes
    "/dashboard/informasi/pengumuman": Pengumuman,
    "/dashboard/informasi/kalender": KalenderAkademik,
    "/dashboard/informasi/panduan": PanduanAkademik,
  };

  const renderContent = () => {
    // Handle dynamic routes
    const editJurusanMatch = currentPage.match(/^\/dashboard\/jurusan\/edit\/(\d+)$/);
    if (editJurusanMatch) {
      return <EditJurusan id={editJurusanMatch[1]} />;
    }

    // Handle static routes
    const Component = componentMap[currentPage];
    if (Component) {
      return <Component />;
    }
  
    if (children) {
      return children;
    }
  
    // Fallback ke tampilan dashboard default
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {currentPage === "/dashboard" ? "Dashboard" : currentPage.split('/').pop()}
          </h2>
          <p className="text-gray-600 mb-4">
            Selamat datang, {user.full_name || user.username}
          </p>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {getUserTypeDisplay(user.user_type)}
          </div>
        </div>
        <p className="text-gray-500">Konten untuk halaman {currentPage} akan ditampilkan di sini.</p>
        
        {/* Demo user type switcher */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Demo: Ubah tipe user untuk melihat menu yang berbeda</p>
          <select 
            value={user.user_type} 
            onChange={(e) => setUser({...user, user_type: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="mahasiswa">Mahasiswa</option>
            <option value="dosen">Dosen</option>
            <option value="staff_prodi">Staff Prodi</option>
            <option value="staff_fakultas">Staff Fakultas</option>
            <option value="ketua_prodi">Ketua Prodi</option>
            <option value="pejabat_jurusan">Pejabat Jurusan</option>
            <option value="dekan_fakultas">Dekan Fakultas</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 shadow-md z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Sistem Akademik</h1>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${isCollapsed ? 'w-16' : 'w-72'} 
        bg-white shadow-lg transform transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:transform-none border-r border-gray-200 flex flex-col
      `}>
        {/* Mobile Sidebar Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-blue-700/10 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white">Sistem Akademik</h1>
              <p className="text-sm text-blue-100">{getUserTypeDisplay(user.user_type)}</p>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block relative">
          <div className={`p-6 bg-gradient-to-r from-blue-600 to-blue-700 ${isCollapsed ? 'px-4' : ''}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-white">Sistem Akademik</h1>
                  <p className="text-blue-100 text-sm">{getUserTypeDisplay(user.user_type)}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Collapse Button */}
          <button
            onClick={toggleCollapse}
            className={`absolute -right-3 top-8 w-6 h-6 bg-white border-2 border-gray-200 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </div>
        </nav>

         {/* Logout Button */}
         <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <button
            className={`
              ${isCollapsed ? 'justify-center px-2' : 'justify-start px-4'} 
              w-full h-12 text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 
              transition-all duration-200 rounded-xl group relative flex items-center bg-white
            `}
            onClick={handleLogout}
          >
            <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} group-hover:scale-110 transition-transform duration-200`} />
            {!isCollapsed && (
              <span className="font-medium">Logout</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>


      {/* Main Content */}
      <main className="flex-1 w-full lg:ml-0 pt-16 lg:pt-0 bg-gray-50 overflow-hidden">
        <div className="p-4 lg:p-8 w-full h-screen overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-4rem)]">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;