import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, User, Mail, Phone, Calendar, Hash, MoreVertical, Edit2, UserX, ShieldPlus, UserCheck, GraduationCap, X, Save, ArrowLeft, Building, Award, BookOpen, ShieldCheck } from 'lucide-react';
import api from '../../api';
import { toast } from 'sonner';
import { Toaster } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const navigate = useNavigate();
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUserType, setFilterUserType] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [sortBy, setSortBy] = useState('full_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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

    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/api/profile/');
        setCurrentUser(response.data);
        
        // Check if user is mahasiswa or dosen and redirect
        if (response.data.user_type === 'mahasiswa' || response.data.user_type === 'dosen') {
          toast.error('Anda tidak memiliki akses ke halaman ini');
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchUsers();
    fetchCurrentUser();
  }, []);

  console.log(userList)

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
                          (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
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

  const handleToggleActive = async (user) => {
    try {
      const response = await api.patch(`/api/users/${user.id}/`, {
        is_active: !user.is_active
      });
      
      // Update the user list
      setUserList(userList.map(u => 
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      ));
      
      toast.success(`Akun ${user.is_active ? 'dinonaktifkan' : 'diaktifkan'} berhasil`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Gagal mengubah status user');
    }
  };

  // Get program studi info based on user type
  const getProgramStudiInfo = (user) => {
    if (!user) return '-';

    if (user.mahasiswa_profile?.program_studi) {
      return user.mahasiswa_profile.program_studi.nama;
    }
    if (user.dosen_profile?.program_studi) {
      return user.dosen_profile.program_studi.nama;
    }
    if (user.staff_prodi_profile?.program_studi) {
      return user.staff_prodi_profile.program_studi.nama;
    }
    if (user.ketua_prodi_profile?.program_studi) {
      return user.ketua_prodi_profile.program_studi.nama;
    }
    return '-';
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}/`);
      setSelectedUser(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Gagal memuat detail pengguna');
    }
  };

  const handleCloseDetail = () => {
    setSelectedUser(null);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setSelectedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.patch(`/api/users/${selectedUser.id}/`, {
        username: selectedUser.username,
        full_name: selectedUser.full_name,
        email: selectedUser.email,
        phone_number: selectedUser.phone_number,
        birth_date: selectedUser.birth_date,
        gender: selectedUser.gender,
        tempat_lahir: selectedUser.tempat_lahir,
        is_active: selectedUser.is_active
      });

      // Update both selected user and user list
      setSelectedUser(response.data);
      setUserList(userList.map(user => 
        user.id === response.data.id ? response.data : user
      ));
      
      setIsEditing(false);
      toast.success('Data pengguna berhasil diperbarui');
    } catch (error) {
      console.error('Error updating user:', error);
      
      // More detailed error handling
      let errorMessage = 'Gagal memperbarui data pengguna. ';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage += Object.values(error.response.data).flat().join(', ');
        } else if (error.response.status === 401) {
          errorMessage += 'Sesi Anda telah berakhir. Silakan login kembali.';
        } else if (error.response.status === 403) {
          errorMessage += 'Anda tidak memiliki izin untuk mengubah data ini.';
        } else {
          errorMessage += `Server error (${error.response.status}).`;
        }
      } else if (error.request) {
        errorMessage += 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else {
        errorMessage += 'Terjadi kesalahan tidak terduga.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If a user is selected, show the detail/edit view
  if (selectedUser) {
    return (
      <>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleCloseDetail}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Kembali ke Daftar Pengguna
            </button>
            {currentUser?.user_type !== 'dekan_fakultas' && currentUser?.user_type !== 'dosen' && currentUser?.user_type !== 'pejabat_jurusan' && (
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Data</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Batal</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
                  </button>
                </>
              )}
            </div>
            )}
          </div>

          {/* User Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Personal</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Nomor Induk
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedUser.username || '-'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      TypeUser
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedUser.user_type ? selectedUser.user_type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : '-'}</p>
                  </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Nama Lengkap
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={selectedUser.full_name || ''}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedUser.full_name || '-'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={selectedUser.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedUser.email || '-'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Nomor Telepon
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={selectedUser.phone_number || ''}
                          onChange={(e) => handleInputChange('phone_number', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedUser.phone_number || '-'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Tanggal Lahir
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={selectedUser.birth_date || ''}
                          onChange={(e) => handleInputChange('birth_date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedUser.birth_date || '-'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Jenis Kelamin
                      </label>
                      {isEditing ? (
                        <select
                          value={selectedUser.gender || ''}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedUser.gender || '-'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Status
                      </label>
                      {isEditing ? (
                        <select
                          value={selectedUser.is_active.toString()}
                          onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="true">Aktif</option>
                          <option value="false">Nonaktif</option>
                        </select>
                      ) : (
                        <p className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                          selectedUser.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedUser.is_active ? 'Aktif' : 'Nonaktif'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Akademik</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedUser.mahasiswa_profile && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center">
                            <BookOpen className="h-4 w-4 mr-2" />
                            NIM
                          </label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                            {selectedUser.mahasiswa_profile.nim || 'Data Belum diupdate'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            Program Studi
                          </label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                            {selectedUser.mahasiswa_profile.program_studi?.nama || '-'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Angkatan
                          </label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                            {selectedUser.mahasiswa_profile.angkatan || '-'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center">
                            <GraduationCap className="h-4 w-4 mr-2" />
                            Semester
                          </label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                            {selectedUser.mahasiswa_profile.semester || '-'}
                          </p>
                        </div>
                      </>
                    )}

                    {(selectedUser.dosen_profile || selectedUser.staff_prodi_profile) && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center">
                            <BookOpen className="h-4 w-4 mr-2" />
                            NIP
                          </label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                            {selectedUser.dosen_profile?.nip || selectedUser.staff_prodi_profile?.nip || 'Data Belum diupdate'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            Program Studi
                          </label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                            {selectedUser.dosen_profile?.program_studi?.nama || selectedUser.staff_prodi_profile?.program_studi?.nama || 'Data Belum diupdate'}
                          </p>
                        </div>

                        {selectedUser.dosen_profile && (
                          <>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 flex items-center">
                                <Award className="h-4 w-4 mr-2" />
                                Jabatan Akademik
                              </label>
                              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                                {selectedUser.dosen_profile.jabatan_akademik || 'Data Belum diupdate'}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 flex items-center">
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Pendidikan Terakhir
                              </label>
                              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                                {selectedUser.dosen_profile.pendidikan_terakhir || 'Data Belum diupdate'}
                              </p>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Toaster />
      </>
    );
  }

  // Original user list view
  return (
    <>
      <div className="p-6 max-w-full mx-auto">
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
              placeholder="Cari nama, email, atau Nomor Induk..."
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

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('full_name')}>
                  <div className="flex items-center gap-2">
                    Nama
                    {sortBy === 'full_name' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('username')}>
                  <div className="flex items-center gap-2">
                    Nomor Induk
                    {sortBy === 'username' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('email')}>
                  <div className="flex items-center gap-2">
                    Email
                    {sortBy === 'email' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program Studi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. Telepon
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.full_name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserTypeColor(user.user_type)}`}>
                      {userTypeDisplay[user.user_type]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <GraduationCap className="h-4 w-4 text-indigo-500" />
                      {getProgramStudiInfo(user)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.phone_number || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      {currentUser?.user_type !== 'dekan_fakultas' && currentUser?.user_type !== 'dosen' && currentUser?.user_type !== 'pejabat_jurusan' && currentUser?.user_type !== 'mahasiswa' && (
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          title="Edit User"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`p-1 rounded-full ${
                          user.is_active 
                            ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                            : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                        }`}
                        title={user.is_active ? 'Nonaktifkan User' : 'Aktifkan User'}
                      >
                        {user.is_active ? <ShieldPlus className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-50"
                        title="Lihat Detail"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredAndSortedUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
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
      <Toaster />
    </>
  );
};

export default UserList; 