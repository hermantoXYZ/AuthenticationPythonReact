import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, User, Mail, Phone, Calendar, Hash, MoreVertical, Edit2, UserX, UserCheck, GraduationCap, X, Save, ArrowLeft, Building, Award, BookOpen, Plus } from 'lucide-react';
import api from '../../api';
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';

const StaffFakultasList = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFakultas, setFilterFakultas] = useState('');
  const [filterJabatan, setFilterJabatan] = useState('');
  const [sortBy, setSortBy] = useState('user.full_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fakultasList, setFakultasList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addFormData, setAddFormData] = useState({
    user: '',
    fakultas: '',
    jabatan: '',
  });
  const [editFormData, setEditFormData] = useState({
    fakultas: '',
    jabatan: '',
  });
  const [userList, setUserList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFilterOptions, setUserFilterOptions] = useState({
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc',
    onlyUnassigned: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is mahasiswa
        const userResponse = await api.get('/api/profile/');
        if (userResponse.data.user_type === 'mahasiswa') {
          toast.error('Anda tidak memiliki akses ke halaman ini');
          navigate('/dashboard');
          return;
        }

        // First fetch staff list
        const staffResponse = await api.get('/api/users/staff-fakultas/');
        // console.log('Staff listsss:', staffResponse.data);
        setStaffList(staffResponse.data);
        
        // Then fetch all active users that are of type staff_fakultas
        const usersResponse = await api.get('/api/users/');
        // console.log('All users:', usersResponse.data);
        const availableUsers = usersResponse.data.filter(user => 
          user.is_active && 
          user.user_type === 'staff_fakultas' &&  // Only show users with type staff_fakultas
          !staffResponse.data.some(staff => staff.user.id === user.id)
        );
        // console.log('Available staff users:', availableUsers);
        setUserList(availableUsers);
        
        // Finally fetch fakultas list
        const fakultasResponse = await api.get('/api/fakultas/');
        setFakultasList(fakultasResponse.data);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return userList
      .filter(user => {
        const matchesSearch = (
          user.full_name?.toLowerCase().includes(userFilterOptions.searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(userFilterOptions.searchTerm.toLowerCase())
        );
        
        // Filter only users not yet assigned as staff fakultas
        const isUnassigned = userFilterOptions.onlyUnassigned ? 
          !staffList.some(staff => staff.user.id === user.id) : true;

        return matchesSearch && isUnassigned;
      })
      .sort((a, b) => {
        let aValue = userFilterOptions.sortBy === 'name' ? 
          (a.full_name || '').toLowerCase() : 
          (a.email || '').toLowerCase();
        let bValue = userFilterOptions.sortBy === 'name' ? 
          (b.full_name || '').toLowerCase() : 
          (b.email || '').toLowerCase();
        
        return userFilterOptions.sortOrder === 'asc' ? 
          aValue.localeCompare(bValue) : 
          bValue.localeCompare(aValue);
      });
  }, [userList, staffList, userFilterOptions]);

  // Get unique values for filters
  const uniqueFakultas = useMemo(() => {
    return [...new Set(staffList
      .map(staff => staff.fakultas?.nama)
      .filter(Boolean))];
  }, [staffList]);

  const uniqueJabatan = useMemo(() => {
    return [...new Set(staffList
      .map(staff => staff.jabatan)
      .filter(Boolean))];
  }, [staffList]);

  // Filter and sort data
  const filteredAndSortedStaff = useMemo(() => {
    return staffList.filter(staff => {
      const matchesSearch = (staff.user?.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (staff.user?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
                        
      const matchesFakultas = !filterFakultas || staff.fakultas?.nama === filterFakultas;
      const matchesJabatan = !filterJabatan || staff.jabatan === filterJabatan;
      
      return matchesSearch && matchesFakultas && matchesJabatan;
    }).sort((a, b) => {
      let aValue = a.user?.full_name || '';
      let bValue = b.user?.full_name || '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [staffList, searchTerm, filterFakultas, filterJabatan, sortBy, sortOrder]);

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
    setFilterFakultas('');
    setFilterJabatan('');
    setSortBy('user.full_name');
    setSortOrder('asc');
  };

  const handleViewStaff = async (staffId) => {
    try {
      const response = await api.get(`/api/users/staff-fakultas/${staffId}/`);
      setSelectedStaff(response.data);
      setEditFormData({
        fakultas: response.data.fakultas?.id || '',
        jabatan: response.data.jabatan || ''
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error fetching staff details:', error);
      toast.error('Gagal memuat detail Staff Fakultas');
    }
  };

  const handleEditClick = () => {
    setEditFormData({
      fakultas: selectedStaff.fakultas?.id || '',
      jabatan: selectedStaff.jabatan || '',
    });
    setIsEditing(true);
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate required fields
      if (!editFormData.jabatan) {
        toast.error('Jabatan harus diisi');
        return;
      }

      const response = await api.patch(`/api/users/staff-fakultas/${selectedStaff.id}/`, {
        fakultas_id: editFormData.fakultas || selectedStaff.fakultas?.id,
        jabatan: editFormData.jabatan,
      });

      setSelectedStaff(response.data);
      setStaffList(prevList => 
        prevList.map(staff => 
          staff.id === response.data.id ? response.data : staff
        )
      );
      
      setIsEditing(false);
      toast.success('Data Staff Fakultas berhasil diperbarui', {
        description: `${response.data.user.full_name} - ${response.data.jabatan}`
      });
    } catch (error) {
      console.error('Error updating staff:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.error || 
                         'Gagal memperbarui data Staff Fakultas';
      toast.error('Gagal memperbarui data', {
        description: errorMessage
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddInputChange = (field, value) => {
    setAddFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!addFormData.user || !addFormData.fakultas || !addFormData.jabatan) {
      toast.error('Mohon lengkapi semua field yang diperlukan');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = {
        user_id: parseInt(addFormData.user),
        fakultas_id: parseInt(addFormData.fakultas),
        jabatan: addFormData.jabatan,
      };

      console.log('Submitting data:', formData);

      const response = await api.post('/api/users/staff-fakultas/', formData);
      
      console.log('Response:', response.data);
      
      setStaffList(prev => [...prev, response.data]);
      setShowAddModal(false);
      setAddFormData({
        user: '',
        fakultas: '',
        jabatan: '',
      });
      toast.success('Staff Fakultas berhasil ditambahkan');
      
      // Refresh the user list
      const userResponse = await api.get('/api/users/');
      const availableUsers = userResponse.data.filter(user => 
        user.is_active && 
        user.user_type === 'staff_fakultas' &&  // Only show users with type staff_fakultas
        !staffList.some(staff => staff.user.id === user.id)
      );
      setUserList(availableUsers);
    } catch (error) {
      console.error('Error adding staff:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.error || 
                         'Gagal menambahkan Staff Fakultas';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!staffToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/api/users/staff-fakultas/${staffToDelete.id}/`);
      
      // Remove from list
      setStaffList(prevList => prevList.filter(staff => staff.id !== staffToDelete.id));
      
      // Close modal
      setShowDeleteModal(false);
      setStaffToDelete(null);
      
      // Show success message
      toast.success('Staff Fakultas berhasil dihapus');
      
      // If we're in detail view, go back to list
      if (selectedStaff?.id === staffToDelete.id) {
        setSelectedStaff(null);
      }
      
      // Refresh user list
      const userResponse = await api.get('/api/users/');
      const availableUsers = userResponse.data.filter(user => 
        user.is_active && 
        user.user_type === 'staff_fakultas' &&
        !staffList.some(staff => staff.user.id === user.id)
      );
      setUserList(availableUsers);
      
    } catch (error) {
      console.error('Error deleting staff:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.error || 
                         'Gagal menghapus Staff Fakultas';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (staff) => {
    setStaffToDelete(staff);
    setShowDeleteModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If a staff is selected, show the detail/edit view
  if (selectedStaff) {
    return (
      <div className="p-6 max-w-full mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              setSelectedStaff(null);
              setIsEditing(false);
            }}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali ke Daftar Staff Fakultas
          </button>
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
        </div>

        {/* Staff Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="space-y-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Staff Fakultas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Nama Lengkap
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedStaff.user?.full_name || '-'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedStaff.user?.email || '-'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Nomor Induk
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedStaff.user?.username || '-'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Jabatan
                    </label>
                    {isEditing ? (
                      <select
                        value={editFormData.jabatan || ''}
                        onChange={(e) => handleInputChange('jabatan', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih Jabatan</option>
                        <option value="Admin Fakultas">Admin Fakultas</option>
                        <option value="Sekretaris Fakultas">Sekretaris Fakultas</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedStaff.jabatan || '-'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Fakultas
                    </label>
                    {isEditing ? (
                      <select
                        value={editFormData.fakultas || ''}
                        onChange={(e) => handleInputChange('fakultas', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih Fakultas</option>
                        {fakultasList.map(fakultas => (
                          <option key={fakultas.id} value={fakultas.id}>
                            {fakultas.nama}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedStaff.fakultas?.nama || '-'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original staff list view
  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Header with Add Button */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Staff Fakultas</h1>
          <p className="text-gray-600">Kelola dan lihat informasi semua Staff Fakultas</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Staff Fakultas</span>
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Tambah Staff Fakultas</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Staff Fakultas
                    </label>
                    <div className="mb-6">
                      <label className="block text-lg font-medium text-gray-900 mb-4">
                        Pilih User Staff Fakultas
                      </label>
                      
                      {/* Filter Controls */}
                      <div className="space-y-4 mb-4">
                        {/* Search and Sort Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                              <input
                                type="text"
                                placeholder="Cari berdasarkan nama atau email..."
                                value={userFilterOptions.searchTerm}
                                onChange={(e) => setUserFilterOptions(prev => ({
                                  ...prev,
                                  searchTerm: e.target.value
                                }))}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <select
                              value={userFilterOptions.sortBy}
                              onChange={(e) => setUserFilterOptions(prev => ({
                                ...prev,
                                sortBy: e.target.value
                              }))}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="name">Urutkan: Nama</option>
                              <option value="email">Urutkan: Email</option>
                            </select>
                            
                            <button
                              type="button"
                              onClick={() => setUserFilterOptions(prev => ({
                                ...prev,
                                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                              }))}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              {userFilterOptions.sortOrder === 'asc' ? 
                                <SortAsc className="h-5 w-5" /> : 
                                <SortDesc className="h-5 w-5" />
                              }
                            </button>
                          </div>
                        </div>

                        {/* Filter Options */}
                        <div className="flex items-center gap-4 px-2">
                          <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={userFilterOptions.onlyUnassigned}
                              onChange={(e) => setUserFilterOptions(prev => ({
                                ...prev,
                                onlyUnassigned: e.target.checked
                              }))}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Hanya tampilkan user yang belum menjadi Staff Fakultas
                          </label>
                        </div>

                        {/* Quick Stats */}
                        <div className="text-sm text-gray-600 px-2">
                          Menampilkan {filteredUsers.length} dari {userList.length} user
                        </div>
                      </div>

                      {/* User List */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                          {filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              Tidak ada user yang sesuai dengan filter
                            </div>
                          ) : (
                            filteredUsers.map(user => (
                              <div
                                key={user.id}
                                onClick={() => {
                                  setSelectedUser(user);
                                  setAddFormData(prev => ({
                                    ...prev,
                                    user: user.id
                                  }));
                                }}
                                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                  selectedUser?.id === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <h3 className="font-medium text-gray-900">{user.full_name}</h3>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    {user.phone_number && (
                                      <p className="text-sm text-gray-500">
                                        <Phone className="inline-block h-4 w-4 mr-1" />
                                        {user.phone_number}
                                      </p>
                                    )}
                                  </div>
                                  {selectedUser?.id === user.id && (
                                    <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                      Terpilih
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fakultas
                    </label>
                    <select
                      value={addFormData.fakultas}
                      onChange={(e) => handleAddInputChange('fakultas', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Fakultas</option>
                      {fakultasList.map(fakultas => (
                        <option key={fakultas.id} value={fakultas.id}>
                          {fakultas.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jabatan
                    </label>
                    <select
                      value={addFormData.jabatan}
                      onChange={(e) => handleAddInputChange('jabatan', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Jabatan</option>
                      <option value="Admin Fakultas">Admin Fakultas</option>
                      <option value="Sekretaris Fakultas">Sekretaris Fakultas</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-8 flex justify-end space-x-3 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Simpan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari nama, Nomor Induk, atau email..."
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
          
          {(searchTerm || filterFakultas || filterJabatan || sortBy !== 'user.full_name') && (
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Fakultas</label>
              <select
                value={filterFakultas}
                onChange={(e) => setFilterFakultas(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Fakultas</option>
                {uniqueFakultas.map(fakultas => (
                  <option key={fakultas} value={fakultas}>{fakultas}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan</label>
              <select
                value={filterJabatan}
                onChange={(e) => setFilterJabatan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Jabatan</option>
                {uniqueJabatan.map(jabatan => (
                  <option key={jabatan} value={jabatan}>{jabatan}</option>
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
                  <option value="user.full_name">Nama</option>
                  <option value="fakultas.nama">Fakultas</option>
                  <option value="jabatan">Jabatan</option>
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
          Menampilkan {filteredAndSortedStaff.length} dari {staffList.length} Staff Fakultas
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('user.full_name')}>
                <div className="flex items-center gap-2">
                  Nama
                  {sortBy === 'user.full_name' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nomor Induk
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('fakultas.nama')}>
                <div className="flex items-center gap-2">
                  Fakultas
                  {sortBy === 'fakultas.nama' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('jabatan')}>
                <div className="flex items-center gap-2">
                  Jabatan
                  {sortBy === 'jabatan' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedStaff.map((staff) => (
              <tr key={staff.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{staff.user?.full_name || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{staff.user?.username || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{staff.fakultas?.nama || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{staff.jabatan || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{staff.user?.email || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewStaff(staff.id)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                      title="Edit Staff"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(staff)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                      title="Hapus Staff"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredAndSortedStaff.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada Staff Fakultas ditemukan</h3>
          <p className="text-gray-600 mb-4">Coba ubah kriteria pencarian atau filter Anda</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="text-center">
              <UserX className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Hapus Staff Fakultas
              </h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus {staffToDelete?.user?.full_name} dari daftar Staff Fakultas? 
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setStaffToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4" />
                      <span>Hapus Staff</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default StaffFakultasList; 