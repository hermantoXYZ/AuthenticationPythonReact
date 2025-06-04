import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, User, Mail, Phone, Calendar, Hash, MoreVertical, Edit2, UserX, UserCheck, GraduationCap, X, Save, ArrowLeft, Building, Award, BookOpen, Plus } from 'lucide-react';
import api from '../../api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const DosenList = () => {
  const navigate = useNavigate();
  const [dosenList, setDosenList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJabatan, setFilterJabatan] = useState('');
  const [filterPendidikan, setFilterPendidikan] = useState('');
  const [filterProdi, setFilterProdi] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('full_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDosen, setSelectedDosen] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userList, setUserList] = useState([]);
  const [programStudiList, setProgramStudiList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addFormData, setAddFormData] = useState({
    user: '',
    nip: '',
    program_studi: '',
    jabatan_akademik: '',
    pendidikan_terakhir: 'S2',
    bidang_keahlian: '',
    status_kepegawaian: 'PNS',
  });
  const [editFormData, setEditFormData] = useState({
    nip: '',
    program_studi: '',
    jabatan_akademik: '',
    pendidikan_terakhir: '',
    bidang_keahlian: '',
    status_kepegawaian: '',
  });
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFilterOptions, setUserFilterOptions] = useState({
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc',
    onlyUnassigned: true,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dosenToDelete, setDosenToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dosen list
        const dosenResponse = await api.get('/api/users/dosen/');
        setDosenList(dosenResponse.data);
        
        // Fetch all active users that are of type dosen but not yet in UserDosen
        const userResponse = await api.get('/api/users/');
        const availableUsers = userResponse.data.filter(user => 
          user.is_active && 
          (user.user_type === 'dosen' || 
           user.user_type === 'dekan_fakultas' || 
           user.user_type === 'ketua_prodi' || 
           user.user_type === 'pejabat_jurusan') &&
          !dosenResponse.data.some(dosen => dosen.user.id === user.id)
        );
        setUserList(availableUsers);
        
        // Fetch program studi list
        const prodiResponse = await api.get('/api/prodi/');
        setProgramStudiList(prodiResponse.data);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique values for filters
  const uniqueJabatan = useMemo(() => {
    return [...new Set(dosenList
      .map(dosen => dosen.jabatan_akademik)
      .filter(Boolean))];
  }, [dosenList]);

  const uniquePendidikan = useMemo(() => {
    return [...new Set(dosenList
      .map(dosen => dosen.pendidikan_terakhir)
      .filter(Boolean))];
  }, [dosenList]);

  const uniqueStatus = useMemo(() => {
    return [...new Set(dosenList
      .map(dosen => dosen.status_kepegawaian)
      .filter(Boolean))];
  }, [dosenList]);

  // Filter and sort data
  const filteredAndSortedDosen = useMemo(() => {
    return dosenList.filter(dosen => {
      const matchesSearch = (dosen.user?.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (dosen.user?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (dosen.nip?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesJabatan = !filterJabatan || dosen.jabatan_akademik === filterJabatan;
      const matchesPendidikan = !filterPendidikan || dosen.pendidikan_terakhir === filterPendidikan;
      const matchesProdi = !filterProdi || dosen.program_studi?.id === parseInt(filterProdi);
      const matchesStatus = !filterStatus || dosen.status_kepegawaian === filterStatus;
      
      return matchesSearch && matchesJabatan && matchesPendidikan && matchesProdi && matchesStatus;
    }).sort((a, b) => {
      let aValue = '';
      let bValue = '';

      switch(sortBy) {
        case 'full_name':
          aValue = a.user?.full_name || '';
          bValue = b.user?.full_name || '';
          break;
        case 'email':
          aValue = a.user?.email || '';
          bValue = b.user?.email || '';
          break;
        case 'nip':
          aValue = a.nip || '';
          bValue = b.nip || '';
          break;
        case 'program_studi':
          aValue = a.program_studi?.nama || '';
          bValue = b.program_studi?.nama || '';
          break;
        default:
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [dosenList, searchTerm, filterJabatan, filterPendidikan, filterProdi, filterStatus, sortBy, sortOrder]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return userList
      .filter(user => {
        const matchesSearch = (
          user.full_name?.toLowerCase().includes(userFilterOptions.searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(userFilterOptions.searchTerm.toLowerCase())
        );
        
        // Filter hanya user yang belum terdaftar sebagai dosen
        const isUnassigned = userFilterOptions.onlyUnassigned ? 
          !dosenList.some(dosen => dosen.user.id === user.id) : true;

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
  }, [userList, dosenList, userFilterOptions]);

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
    setFilterJabatan('');
    setFilterPendidikan('');
    setFilterProdi('');
    setFilterStatus('');
    setSortBy('full_name');
    setSortOrder('asc');
  };

  const handleViewDosen = async (dosenId) => {
    try {
      const response = await api.get(`/api/users/dosen/${dosenId}/`);
      setSelectedDosen(response.data);
      setEditFormData({
        nip: response.data.nip || '',
        program_studi: response.data.program_studi?.id || '',
        jabatan_akademik: response.data.jabatan_akademik || '',
        pendidikan_terakhir: response.data.pendidikan_terakhir || '',
        bidang_keahlian: response.data.bidang_keahlian || '',
        status_kepegawaian: response.data.status_kepegawaian || '',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error fetching dosen details:', error);
      toast.error('Gagal memuat detail dosen');
    }
  };

  const handleInputChange = (field, value) => {
    setSelectedDosen(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!addFormData.user || !addFormData.nip || !addFormData.program_studi) {
      toast.error('Mohon lengkapi semua field yang diperlukan');
      setIsSubmitting(false);
      return;
    }

    try {
      // First check if NIP is already used
      const existingDosen = dosenList.find(dosen => dosen.nip === addFormData.nip);
      if (existingDosen) {
        toast.error('NIP sudah digunakan oleh dosen lain');
        setIsSubmitting(false);
        return;
      }

      const formData = {
        user_id: parseInt(addFormData.user),
        program_studi_id: parseInt(addFormData.program_studi),
        nip: addFormData.nip,
        jabatan_akademik: addFormData.jabatan_akademik || null,
        pendidikan_terakhir: addFormData.pendidikan_terakhir,
        bidang_keahlian: addFormData.bidang_keahlian || '',
        status_kepegawaian: addFormData.status_kepegawaian,
      };

      const response = await api.post('/api/users/dosen/', formData);
      
      setDosenList(prev => [...prev, response.data]);
      setShowAddModal(false);
      setAddFormData({
        user: '',
        nip: '',
        program_studi: '',
        jabatan_akademik: '',
        pendidikan_terakhir: 'S2',
        bidang_keahlian: '',
        status_kepegawaian: 'PNS',
      });
      
      toast.success('Dosen berhasil ditambahkan');
      
      // Refresh the data
      const dosenResponse = await api.get('/api/users/dosen/');
      setDosenList(dosenResponse.data);
      
    } catch (error) {
      console.error('Error adding dosen:', error);
      let errorMessage = 'Gagal menambahkan Dosen';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          // Handle specific error cases
          if (error.response.data.email) {
            errorMessage = 'Email sudah digunakan';
          } else if (error.response.data.nip) {
            errorMessage = 'NIP sudah digunakan';
          } else if (error.response.data.user) {
            errorMessage = 'User sudah terdaftar sebagai dosen';
          } else {
            errorMessage = Object.entries(error.response.data)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n');
          }
        } else {
          errorMessage = error.response.data;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!selectedDosen?.id) {
        throw new Error('ID Dosen tidak valid');
      }

      const formData = {
        program_studi_id: parseInt(editFormData.program_studi),
        nip: editFormData.nip,
        jabatan_akademik: editFormData.jabatan_akademik || null,
        pendidikan_terakhir: editFormData.pendidikan_terakhir,
        bidang_keahlian: editFormData.bidang_keahlian || '',
        status_kepegawaian: editFormData.status_kepegawaian,
      };

      const response = await api.patch(`/api/users/dosen/${selectedDosen.id}/`, formData);

      setDosenList(prevList => 
        prevList.map(dosen => 
          dosen.id === selectedDosen.id ? response.data : dosen
        )
      );
      
      setSelectedDosen(response.data);
      setIsEditing(false);
      toast.success('Data dosen berhasil diperbarui');
      
    } catch (error) {
      console.error('Error updating dosen:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.error || 
                         Object.values(error.response?.data || {}).flat().join(', ') ||
                         'Gagal memperbarui data Dosen';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!dosenToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/api/users/dosen/${dosenToDelete.id}/`);
      
      // Remove from list
      setDosenList(prevList => prevList.filter(dosen => dosen.id !== dosenToDelete.id));
      
      // Close modal
      setShowDeleteModal(false);
      setDosenToDelete(null);
      
      // Show success message
      toast.success('Dosen berhasil dihapus');
      
      // If we're in detail view, go back to list
      if (selectedDosen?.id === dosenToDelete.id) {
        setSelectedDosen(null);
      }
      
      // Refresh user list
      const userResponse = await api.get('/api/users/');
      const availableUsers = userResponse.data.filter(user => 
        user.is_active && 
        (user.user_type === 'dosen' || 
         user.user_type === 'dekan_fakultas' || 
         user.user_type === 'ketua_prodi' || 
         user.user_type === 'pejabat_jurusan') &&
        !dosenList.some(dosen => dosen.user.id === user.id)
      );
      setUserList(availableUsers);
      
    } catch (error) {
      console.error('Error deleting dosen:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.error || 
                         'Gagal menghapus Dosen';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (dosen) => {
    setDosenToDelete(dosen);
    setShowDeleteModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If a dosen is selected, show the detail/edit view
  if (selectedDosen) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedDosen(null)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali ke Daftar Dosen
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

        {/* Dosen Details */}
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
                      Nama Lengkap
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={selectedDosen.user?.full_name || ''}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedDosen.user?.full_name || '-'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      NIP
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedDosen.user?.username || '-'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={selectedDosen.user?.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedDosen.user?.email || '-'}
                      </p>
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
                        value={selectedDosen.user?.phone_number || ''}
                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedDosen.user?.phone_number || '-'}
                      </p>
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
                        value={selectedDosen.user?.birth_date || ''}
                        onChange={(e) => handleInputChange('birth_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedDosen.user?.birth_date || '-'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Jenis Kelamin
                    </label>
                    {isEditing ? (
                      <select
                        value={selectedDosen.user?.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedDosen.user?.gender || '-'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Akademik</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      Nomor Induk 
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.nip}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, nip: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedDosen.nip || '-'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Program Studi
                    </label>
                    {isEditing ? (
                      <select
                        value={editFormData.program_studi}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, program_studi: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih Program Studi</option>
                        {programStudiList.map(prodi => (
                          <option key={prodi.id} value={prodi.id}>
                            {prodi.nama}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedDosen.program_studi?.nama || '-'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Jabatan Akademik
                    </label>
                    {isEditing ? (
                      <select
                        value={editFormData.jabatan_akademik}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, jabatan_akademik: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih Jabatan Akademik</option>
                        <option value="Asisten Ahli">Asisten Ahli</option>
                        <option value="Lektor">Lektor</option>
                        <option value="Lektor Kepala">Lektor Kepala</option>
                        <option value="Profesor">Profesor</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedDosen.jabatan_akademik || '-'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Pendidikan Terakhir
                    </label>
                    {isEditing ? (
                      <select
                        value={editFormData.pendidikan_terakhir}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, pendidikan_terakhir: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedDosen.pendidikan_terakhir || '-'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Bidang Keahlian
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.bidang_keahlian}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, bidang_keahlian: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedDosen.bidang_keahlian || '-'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Status Kepegawaian
                    </label>
                    {isEditing ? (
                      <select
                        value={editFormData.status_kepegawaian}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, status_kepegawaian: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="PNS">PNS</option>
                        <option value="Non PNS">Non PNS</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedDosen.status_kepegawaian || '-'}
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

  // Main dosen list view
  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Dosen</h1>
        <p className="text-gray-600">Kelola dan lihat informasi semua dosen</p>
        </div>
          {/* Add Button */}
          <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Dosen
        </button>
      </div>
     

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari nama, NIP, atau email..."
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
          
          {(searchTerm || filterJabatan || filterPendidikan || filterProdi || filterStatus || sortBy !== 'full_name') && (
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Program Studi</label>
              <select
                value={filterProdi}
                onChange={(e) => setFilterProdi(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Program Studi</option>
                {programStudiList.map(prodi => (
                  <option key={prodi.id} value={prodi.id}>{prodi.nama}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan Akademik</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Kepegawaian</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                {uniqueStatus.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pendidikan Terakhir</label>
              <select
                value={filterPendidikan}
                onChange={(e) => setFilterPendidikan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Pendidikan</option>
                {uniquePendidikan.map(pendidikan => (
                  <option key={pendidikan} value={pendidikan}>{pendidikan}</option>
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
                  <option value="nip">NIP</option>
                  <option value="program_studi">Program Studi</option>
                  <option value="jabatan_akademik">Jabatan Akademik</option>
                  <option value="status_kepegawaian">Status Kepegawaian</option>
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

      {/* Add Dosen Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Tambah Dosen</h2>
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
                {/* Left Column - User Selection */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      Pilih User Dosen
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
                          Hanya tampilkan user yang belum terdaftar sebagai dosen
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

                {/* Right Column - Dosen Details */}
                <div className="space-y-6">
                  {/* NIP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIP
                    </label>
                    <input
                      type="text"
                      value={addFormData.nip}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, nip: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Program Studi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program Studi
                    </label>
                    <select
                      value={addFormData.program_studi}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, program_studi: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Program Studi</option>
                      {programStudiList.map(prodi => (
                        <option key={prodi.id} value={prodi.id}>
                          {prodi.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Jabatan Akademik */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jabatan Akademik
                    </label>
                    <select
                      value={addFormData.jabatan_akademik}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, jabatan_akademik: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Jabatan Akademik</option>
                      <option value="Asisten Ahli">Asisten Ahli</option>
                      <option value="Lektor">Lektor</option>
                      <option value="Lektor Kepala">Lektor Kepala</option>
                      <option value="Profesor">Profesor</option>
                    </select>
                  </div>

                  {/* Pendidikan Terakhir */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pendidikan Terakhir
                    </label>
                    <select
                      value={addFormData.pendidikan_terakhir}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, pendidikan_terakhir: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                    </select>
                  </div>

                  {/* Bidang Keahlian */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bidang Keahlian
                    </label>
                    <input
                      type="text"
                      value={addFormData.bidang_keahlian}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, bidang_keahlian: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Status Kepegawaian */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Kepegawaian
                    </label>
                    <select
                      value={addFormData.status_kepegawaian}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, status_kepegawaian: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="PNS">PNS</option>
                      <option value="Non PNS">Non PNS</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Tambah Dosen</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

     

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Menampilkan {filteredAndSortedDosen.length} dari {dosenList.length} dosen
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NIP
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('email')}>
                <div className="flex items-center gap-2">
                  Email
                  {sortBy === 'email' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Program Studi
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jabatan Akademik
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedDosen.map((dosen) => (
              <tr key={dosen.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{dosen.user?.full_name || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{dosen.user?.username || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{dosen.user?.email || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{dosen.program_studi?.nama || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{dosen.jabatan_akademik || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDosen(dosen.id)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                      title="Edit Dosen"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(dosen)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                      title="Hapus Dosen"
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
      {filteredAndSortedDosen.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada dosen ditemukan</h3>
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
                Hapus Dosen
              </h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus {dosenToDelete?.user?.full_name} dari daftar Dosen? 
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDosenToDelete(null);
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
                      <span>Hapus Dosen</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DosenList; 