import { useState } from "react";
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
  User
} from "lucide-react";
import ProfilePage from './ProfilePage';
import { useNavigate } from "react-router-dom";
// Komponen Dashboard yang diperbarui
function Dashboard({ children, activeMenu = "/dashboard" }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [currentPage, setCurrentPage] = useState(activeMenu);
  const navigate = useNavigate();

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

  const menuItems = [
    { 
      icon: Home, 
      label: "Dashboard", 
      path: "/dashboard",
      type: "single"
    },
    {
      icon: Building2,
      label: "Fakultas",
      key: "fakultas",
      type: "dropdown",
      submenu: [
        { icon: List, label: "List Fakultas", path: "/dashboard/fakultas" },
        { icon: Plus, label: "Tambah Fakultas", path: "/dashboard/fakultas/add" },
        { icon: Settings, label: "Kelola Fakultas", path: "/dashboard/fakultas/manage" }
      ]
    },
    {
      icon: GraduationCap,
      label: "Program Studi",
      key: "prodi",
      type: "dropdown",
      submenu: [
        { icon: List, label: "List Program Studi", path: "/dashboard/prodi" },
        { icon: Plus, label: "Tambah Program Studi", path: "/dashboard/prodi/add" },
        { icon: Settings, label: "Kelola Program Studi", path: "/dashboard/prodi/manage" }
      ]
    },
    {
      icon: Users,
      label: "Dosen",
      key: "dosen",
      type: "dropdown",
      submenu: [
        { icon: List, label: "List Dosen", path: "/dashboard/dosen" },
        { icon: UserPlus, label: "Tambah Dosen", path: "/dashboard/dosen/add" },
        { icon: Edit, label: "Kelola Dosen", path: "/dashboard/dosen/manage" }
      ]
    },
    {
      icon: BookOpen,
      label: "Mahasiswa",
      key: "mahasiswa",
      type: "dropdown",
      submenu: [
        { icon: List, label: "List Mahasiswa", path: "/dashboard/mahasiswa" },
        { icon: UserPlus, label: "Tambah Mahasiswa", path: "/dashboard/mahasiswa/add" },
        { icon: FileText, label: "Pengajuan", path: "/dashboard/mahasiswa/pengajuan" },
        { icon: FileCheck, label: "Verifikasi", path: "/dashboard/mahasiswa/verifikasi" },
        { icon: Settings, label: "Kelola Mahasiswa", path: "/dashboard/mahasiswa/manage" }
      ]
    },
    { 
      icon: User, 
      label: "Profil", 
      path: "/dashboard/profile",
      type: "single"
    }
  ];

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

  const renderContent = () => {
    if (currentPage === "/dashboard/profile") {
      return <ProfilePage />;
    }
    
    return children || (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {currentPage === "/dashboard" ? "Dashboard" : currentPage.split('/').pop()}
        </h2>
        <p className="text-gray-600">Konten untuk halaman {currentPage} akan ditampilkan di sini.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-30 px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-800">Sistem Akademik</h1>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
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
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Sistem Akademik</h1>
          </div>
          <button
            onClick={closeSidebar}
            className="p-2 hover:bg-white/10 text-white rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block relative">
          <div className={`p-6 bg-gradient-to-r from-blue-600 to-blue-700 ${isCollapsed ? 'px-4' : ''}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-white">Sistem Akademik</h1>
                  <p className="text-blue-100 text-sm">Management System</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Collapse Button */}
          <button
            onClick={toggleCollapse}
            className={`absolute -right-3 top-8 w-6 h-6 p-0 bg-white border-2 border-gray-200 rounded-full shadow-md hover:shadow-lg transition-all duration-200 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          >
            <ChevronLeft className="h-3 w-3 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-1 p-4 flex-1 overflow-hidden">
          <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 space-y-1 pr-2">
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