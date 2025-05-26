import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, User, Mail, Phone, Calendar, Hash } from 'lucide-react';
import api from '../../api';
import { toast } from 'sonner';

const UserList = () => {
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUserType, setFilterUserType] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [sortBy, setSortBy] = useState('full_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  // User type mapping for display
  const userTypeDisplay = {
    'super_admin': 'Super Admin',
    'dekan_fakultas': 'Dekan Fakultas',
    'pejabat_jurusan': 'Pejabat Jurusan',
    'ketua_prodi': 'Ketua Prodi',
    'staff_fakultas': 'Staff Fakultas',
    'staff_prodi': 'Staff Prodi',
    'dosen': 'Dosen',
    'mahasiswa': 'Mahasiswa'
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/users/');
        setUserList(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Gagal memuat data User');
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Get unique values for filters
  const uniqueUserTypes = useMemo(() => {
    return [...new Set(userList.map(user => user.user_type))];
  }, [userList]);

  const uniqueGenders = useMemo(() => {
    return [...new Set(userList.map(user => user.gender).filter(Boolean))];
  }, [userList]);

  // Filter and sort data
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = userList.filter(user => {
      const matchesSearch = (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesUserType = !filterUserType || user.user_type === filterUserType;
      const matchesGender = !filterGender || user.gender === filterGender;
      
      return matchesSearch && matchesUserType && matchesGender;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [userList, searchTerm, filterUserType, filterGender, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterUserType('');
    setFilterGender('');
    setSortBy('full_name');
    setSortOrder('asc');
  };

  const getUserTypeColor = (userType) => {
    const colors = {
      'super_admin': 'bg-purple-100 text-purple-800 border-purple-200',
      'dekan_fakultas': 'bg-blue-100 text-blue-800 border-blue-200',
      'pejabat_jurusan': 'bg-green-100 text-green-800 border-green-200',
      'ketua_prodi': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'staff_fakultas': 'bg-orange-100 text-orange-800 border-orange-200',
      'staff_prodi': 'bg-pink-100 text-pink-800 border-pink-200',
      'dosen': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'mahasiswa': 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return colors[userType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Pengguna</h1>
        <p className="text-gray-600">Kelola dan lihat informasi semua pengguna sistem</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari nama, email, atau username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filter & Urutkan
          </button>
          
          {(searchTerm || filterUserType || filterGender || sortBy !== 'full_name') && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe User</label>
              <select
                value={filterUserType}
                onChange={(e) => setFilterUserType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Tipe</option>
                {uniqueUserTypes.map(type => (
                  <option key={type} value={type}>{userTypeDisplay[type]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua</option>
                {uniqueGenders.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urutkan Berdasarkan</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="full_name">Nama</option>
                  <option value="email">Email</option>
                  <option value="username">Username</option>
                  <option value="created_at">Tanggal Dibuat</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Menampilkan {filteredAndSortedUsers.length} dari {userList.length} pengguna
        </p>
      </div>

      {/* User Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{user.full_name || user.username}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Hash className="h-4 w-4" />
                    <span>{user.username}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getUserTypeColor(user.user_type)}`}>
                  {userTypeDisplay[user.user_type]}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {user.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span>{user.email}</span>
                  </div>
                )}
                
                {user.phone_number && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span>{user.phone_number}</span>
                  </div>
                )}

                {user.birth_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span>{new Date(user.birth_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Lihat Detail
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pengguna ditemukan</h3>
          <p className="text-gray-600 mb-4">Coba ubah kriteria pencarian atau filter Anda</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default UserList; 