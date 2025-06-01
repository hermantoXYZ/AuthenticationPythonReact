import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, User, Mail, Phone, Calendar, Hash, MoreVertical, Edit2, X, Save, ArrowLeft, Building, Award, BookOpen, Plus, GraduationCap, UserCheck } from 'lucide-react';
import api from '../../api';
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';

const ListMahasiswa = () => {
  const navigate = useNavigate();
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProdi, setFilterProdi] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAngkatan, setFilterAngkatan] = useState('');
  const [sortBy, setSortBy] = useState('user.full_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [programStudiList, setProgramStudiList] = useState([]);
  const [dosenList, setDosenList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    user: '',
    nim: '',
    kelas: '',
    program_studi: '',
    angkatan: '',
    semester: 1,
    status: 'Aktif',
    dosen_wali: '',
    tanggal_masuk: '',
  });
  const [editFormData, setEditFormData] = useState({
    program_studi: '',
    angkatan: '',
    semester: '',
    status: '',
    dosen_wali: '',
    tanggal_masuk: '',
  });
  const [userList, setUserList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFilterOptions, setUserFilterOptions] = useState({
    searchTerm: '',
    sortBy: 'name', // 'name' or 'email'
    sortOrder: 'asc',
    onlyUnassigned: true, // hanya tampilkan yang belum jadi mahasiswa
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch mahasiswa list
        const mahasiswaResponse = await api.get('/api/users/mahasiswa/');
        console.log('Mahasiswa list:', mahasiswaResponse.data);
        setMahasiswaList(mahasiswaResponse.data);
        
        // Fetch all active users that are of type mahasiswa but not yet in UserMahasiswa
        const userResponse = await api.get('/api/users/');
        console.log('All users:', userResponse.data);
        const availableUsers = userResponse.data.filter(user => 
          user.is_active && 
          user.user_type === 'mahasiswa' &&  // Only show users with type mahasiswa
          !mahasiswaResponse.data.some(mhs => mhs.user.id === user.id)
        );
        console.log('Available mahasiswa users:', availableUsers);
        setUserList(availableUsers);
        
        // Fetch program studi list with the correct endpoint
        console.log('Fetching program studi list...');
        const prodiResponse = await api.get('/api/prodi/');
        console.log('Program studi response:', prodiResponse.data);
        setProgramStudiList(prodiResponse.data);

        // Fetch dosen list with detailed logging
        console.log('Fetching dosen list...');
        const dosenResponse = await api.get('/api/users/dosen/');
        console.log('Dosen list raw response:', dosenResponse.data);
        
        // Log each dosen's complete data structure
        dosenResponse.data.forEach(dosen => {
          console.log('Dosen complete data:', {
            id: dosen.id,
            user: dosen.user,
            nip: dosen.nip,
            program_studi: dosen.program_studi,
            jabatan_akademik: dosen.jabatan_akademik
          });
        });
        
        setDosenList(dosenResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.error || 
                           'Gagal memuat data';
        toast.error(errorMessage);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique values for filters
  const uniqueProdi = useMemo(() => {
    return [...new Set(mahasiswaList
      .map(mhs => mhs.program_studi?.nama)
      .filter(Boolean))];
  }, [mahasiswaList]);

  const uniqueStatus = useMemo(() => {
    return [...new Set(mahasiswaList
      .map(mhs => mhs.status)
      .filter(Boolean))];
  }, [mahasiswaList]);

  const uniqueAngkatan = useMemo(() => {
    return [...new Set(mahasiswaList
      .map(mhs => mhs.angkatan)
      .filter(Boolean))];
  }, [mahasiswaList]);

  // Filter and sort data
  const filteredAndSortedMahasiswa = useMemo(() => {
    return mahasiswaList.filter(mhs => {
      const matchesSearch = (mhs.user?.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (mhs.user?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (mhs.nim?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesProdi = !filterProdi || mhs.program_studi?.nama === filterProdi;
      const matchesStatus = !filterStatus || mhs.status === filterStatus;
      const matchesAngkatan = !filterAngkatan || mhs.angkatan === filterAngkatan;
      
      return matchesSearch && matchesProdi && matchesStatus && matchesAngkatan;
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
  }, [mahasiswaList, searchTerm, filterProdi, filterStatus, filterAngkatan, sortBy, sortOrder]);

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
    setFilterProdi('');
    setFilterStatus('');
    setFilterAngkatan('');
    setSortBy('user.full_name');
    setSortOrder('asc');
  };

  const handleViewMahasiswa = async (mahasiswaId) => {
    try {
      console.log('Fetching mahasiswa details for ID:', mahasiswaId);
      const response = await api.get(`/api/users/mahasiswa/${mahasiswaId}/`);
      console.log('Mahasiswa details response:', response.data);
      
      if (!response.data?.id) {
        throw new Error('Data Mahasiswa tidak valid');
      }

      setSelectedMahasiswa(response.data);
      setEditFormData({
        kelas: response.data.kelas || '',
        program_studi: response.data.program_studi?.id || '',
        angkatan: response.data.angkatan || '',
        semester: response.data.semester || '',
        status: response.data.status || '',
        dosen_wali: response.data.dosen_wali?.id || '',
        tanggal_masuk: response.data.tanggal_masuk || '',
      });
      setIsEditing(false);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching mahasiswa details:', error);
      toast.error('Gagal memuat detail Mahasiswa');
    }
  };

  const handleEditClick = () => {
    setEditFormData({
      kelas: selectedMahasiswa.kelas || '',
      program_studi: selectedMahasiswa.program_studi?.id || '',
      angkatan: selectedMahasiswa.angkatan || '',
      semester: selectedMahasiswa.semester || '',
      status: selectedMahasiswa.status || '',
      dosen_wali: selectedMahasiswa.dosen_wali?.id || '',
      tanggal_masuk: selectedMahasiswa.tanggal_masuk || '',
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
      if (!selectedMahasiswa?.id) {
        throw new Error('ID Mahasiswa tidak valid');
      }

      // Log the current state before preparing form data
      console.log('Current form data:', editFormData);
      console.log('Selected dosen_wali:', editFormData.dosen_wali);

      // Prepare the form data
      const formData = {
        kelas: editFormData.kelas,
        program_studi_id: parseInt(editFormData.program_studi),
        angkatan: editFormData.angkatan,
        semester: parseInt(editFormData.semester),
        status: editFormData.status,
        dosen_wali_id: editFormData.dosen_wali ? parseInt(editFormData.dosen_wali) : null,
        tanggal_masuk: editFormData.tanggal_masuk
      };
      

      console.log('Sending update request with data:', formData);

      // Make the API call
      const response = await api.patch(`/api/users/mahasiswa/${selectedMahasiswa.id}/`, formData);
      console.log('Update response:', response.data);

      toast.success('Data Mahasiswa berhasil diperbarui');

      // Update the local state
      setMahasiswaList(prevList => 
        prevList.map(mhs => 
          mhs.id === selectedMahasiswa.id ? response.data : mhs
        )
      );

      setSelectedMahasiswa(response.data);
      setIsEditing(false);
      setIsSaving(false);
      toast.success('Data Mahasiswa berhasil diperbarui');
      
      // Refresh the data
      const mahasiswaResponse = await api.get('/api/users/mahasiswa/');
      setMahasiswaList(mahasiswaResponse.data);
      
    } catch (error) {
      console.error('Error updating mahasiswa:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Gagal memperbarui data Mahasiswa';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        } else {
          errorMessage = error.response.data;
        }
      }
      
      toast.error(errorMessage);
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

    if (!addFormData.user || !addFormData.nim || !addFormData.kelas || !addFormData.program_studi || !addFormData.angkatan || !addFormData.tanggal_masuk) {
      toast.error('Mohon lengkapi semua field yang diperlukan');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Form data before submission:', addFormData);
      
      const formData = {
        user_id: parseInt(addFormData.user),
        nim: addFormData.nim,
        kelas: addFormData.kelas,
        program_studi_id: parseInt(addFormData.program_studi),
        angkatan: addFormData.angkatan,
        semester: parseInt(addFormData.semester),
        status: addFormData.status,
        dosen_wali: addFormData.dosen_wali ? parseInt(addFormData.dosen_wali) : null,
        tanggal_masuk: addFormData.tanggal_masuk
      };

      console.log('Submitting data to backend:', formData);

      const response = await api.post('/api/users/mahasiswa/', formData);
      
      console.log('Response from backend:', response.data);
      
      // Update the mahasiswa list with the new data
      setMahasiswaList(prev => [...prev, response.data]);
      
      // Close the modal and reset form
      setShowAddModal(false);
      setAddFormData({
        user: '',
        nim: '',
        kelas: '',
        program_studi: '',
        angkatan: '',
        semester: 1,
        status: 'Aktif',
        dosen_wali: '',
        tanggal_masuk: '',
      });
      
      toast.success('Mahasiswa berhasil ditambahkan');
      
      // Refresh the data
      const mahasiswaResponse = await api.get('/api/users/mahasiswa/');
      setMahasiswaList(mahasiswaResponse.data);
      
      // Refresh available users
      const userResponse = await api.get('/api/users/');
      const availableUsers = userResponse.data.filter(user => 
        user.is_active && 
        user.user_type === 'mahasiswa' &&
        !mahasiswaResponse.data.some(mhs => mhs.user.id === user.id)
      );
      setUserList(availableUsers);
      
    } catch (error) {
      console.error('Error adding mahasiswa:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.error || 
                         'Gagal menambahkan Mahasiswa';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return userList
      .filter(user => {
        const matchesSearch = (
          user.full_name?.toLowerCase().includes(userFilterOptions.searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(userFilterOptions.searchTerm.toLowerCase())
        );
        
        // Filter hanya user yang belum terdaftar sebagai mahasiswa
        const isUnassigned = userFilterOptions.onlyUnassigned ? 
          !mahasiswaList.some(mhs => mhs.user.id === user.id) : true;

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
  }, [userList, mahasiswaList, userFilterOptions]);

  // If a mahasiswa is selected, show the detail/edit view
  if (selectedMahasiswa) {
    return (
      <div className="p-6 max-w-full mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              setSelectedMahasiswa(null);
              setIsEditing(false);
            }}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali ke Daftar Mahasiswa
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

        {/* Mahasiswa Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="space-y-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Mahasiswa</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Nama Lengkap
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedMahasiswa.user?.full_name || '-'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedMahasiswa.user?.email || '-'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      NIM
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedMahasiswa.nim || '-'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Kelas
                    </label>
                    {isEditing ? (
                      <select
                        value={editFormData.kelas || ''}
                        onChange={(e) => handleInputChange('kelas', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih Kelas</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                        <option value="G">G</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedMahasiswa.kelas || '-'}
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
                        value={editFormData.program_studi || ''}
                        onChange={(e) => handleInputChange('program_studi', e.target.value)}
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
                        {selectedMahasiswa.program_studi?.nama || '-'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Angkatan
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.angkatan || ''}
                        onChange={(e) => handleInputChange('angkatan', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan Tahun Angkatan"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedMahasiswa.angkatan || '-'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Semester
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        max="14"
                        value={editFormData.semester || ''}
                        onChange={(e) => handleInputChange('semester', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedMahasiswa.semester || '-'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Status
                    </label>
                    {isEditing ? (
                      <select
                        value={editFormData.status || ''}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Cuti">Cuti</option>
                        <option value="Non-Aktif">Non-Aktif</option>
                        <option value="Lulus">Lulus</option>
                        <option value="DO">Drop Out</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedMahasiswa.status || '-'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Dosen Wali
                    </label>
                    {isEditing ? (
                      <select
                        value={editFormData.dosen_wali || ''}
                        onChange={(e) => {
                          console.log('Selected dosen value:', e.target.value);
                          handleInputChange('dosen_wali', e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih Dosen Wali</option>
                        {dosenList.map(dosen => {
                          console.log('Rendering dosen option:', {
                            id: dosen.id,
                            name: dosen.user?.full_name,
                            nip: dosen.nip
                          });
                          return (
                            <option key={dosen.id} value={dosen.id}>
                              {dosen.user?.full_name} {dosen.nip ? `- ${dosen.nip}` : ''} ({dosen.jabatan_akademik || 'Dosen'})
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedMahasiswa.dosen_wali?.user?.full_name || '-'}
                      </p>
                    )}
                    {isEditing && dosenList.length === 0 && (
                      <p className="mt-1 text-sm text-gray-500">
                        Tidak ada dosen yang tersedia. Silakan tambahkan dosen terlebih dahulu.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Tanggal Masuk
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editFormData.tanggal_masuk || ''}
                        onChange={(e) => handleInputChange('tanggal_masuk', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedMahasiswa.tanggal_masuk || '-'}
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

  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Mahasiswa</h1>
          <p className="text-gray-600">Kelola dan lihat informasi semua Mahasiswa</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Mahasiswa</span>
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari nama, NIM, atau email..."
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
          
          {(searchTerm || filterProdi || filterStatus || filterAngkatan || sortBy !== 'user.full_name') && (
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program Studi</label>
              <select
                value={filterProdi}
                onChange={(e) => setFilterProdi(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Program Studi</option>
                {uniqueProdi.map(prodi => (
                  <option key={prodi} value={prodi}>{prodi}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Angkatan</label>
              <select
                value={filterAngkatan}
                onChange={(e) => setFilterAngkatan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Angkatan</option>
                {uniqueAngkatan.map(angkatan => (
                  <option key={angkatan} value={angkatan}>{angkatan}</option>
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
                  <option value="nim">NIM</option>
                  <option value="angkatan">Angkatan</option>
                  <option value="program_studi.nama">Program Studi</option>
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
          Menampilkan {filteredAndSortedMahasiswa.length} dari {mahasiswaList.length} Mahasiswa
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        /* Table */
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('nim')}>
                  <div className="flex items-center gap-2">
                    NIM
                    {sortBy === 'nim' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('kelas')}>
                  <div className="flex items-center gap-2">
                    Kelas
                    {sortBy === 'kelas' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program Studi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Angkatan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dosen Wali
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedMahasiswa.map((mahasiswa) => (
                <tr
                  key={mahasiswa.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewMahasiswa(mahasiswa.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mahasiswa.user?.full_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mahasiswa.nim || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mahasiswa.kelas || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mahasiswa.program_studi?.nama || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mahasiswa.angkatan || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mahasiswa.semester || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mahasiswa.status || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mahasiswa.dosen_wali?.user?.full_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewMahasiswa(mahasiswa.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                        title="Edit Mahasiswa"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleViewMahasiswa(mahasiswa.id)}
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
      )}

      {/* Empty State */}
      {!isLoading && filteredAndSortedMahasiswa.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada Mahasiswa ditemukan</h3>
          <p className="text-gray-600 mb-4">Coba ubah kriteria pencarian atau filter Anda</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Tambah Mahasiswa</h2>
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
                      User Mahasiswa
                    </label>
                    <div className="mb-6">
                      <label className="block text-lg font-medium text-gray-900 mb-4">
                        Pilih User Mahasiswa
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
                            Hanya tampilkan user yang belum terdaftar sebagai mahasiswa
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
                                    user: user.id,
                                    angkatan: new Date().getFullYear().toString(),
                                    semester: 1,
                                    status: 'Aktif',
                                    tanggal_masuk: new Date().toISOString().split('T')[0]
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
                      NIM
                    </label>
                    <input
                      type="text"
                      value={addFormData.nim}
                      onChange={(e) => handleAddInputChange('nim', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan NIM"
                      required
                    />
                  </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kelas
                    </label>
                    <select
                      value={addFormData.kelas}
                      onChange={(e) => handleAddInputChange('kelas', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Kelas</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                      <option value="F">F</option>
                      <option value="G">G</option>
                    </select>
                  </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program Studi
                    </label>
                    <select
                      value={addFormData.program_studi}
                      onChange={(e) => handleAddInputChange('program_studi', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Program Studi</option>
                      {programStudiList && programStudiList.map(prodi => (
                        <option key={prodi.id} value={prodi.id}>
                          {prodi.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Angkatan
                    </label>
                    <input
                      type="text"
                      value={addFormData.angkatan}
                      onChange={(e) => handleAddInputChange('angkatan', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan Tahun Angkatan"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={addFormData.semester}
                      onChange={(e) => handleAddInputChange('semester', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={addFormData.status}
                      onChange={(e) => handleAddInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Cuti">Cuti</option>
                      <option value="Non-Aktif">Non-Aktif</option>
                      <option value="Lulus">Lulus</option>
                      <option value="DO">Drop Out</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dosen Wali
                    </label>
                    <select
                      value={addFormData.dosen_wali}
                      onChange={(e) => handleAddInputChange('dosen_wali', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Dosen Wali</option>
                      {dosenList.map(dosen => (
                        <option key={dosen.id} value={dosen.id}>
                          {dosen.user.full_name} {dosen.nip ? `- ${dosen.nip}` : ''} ({dosen.jabatan_akademik || 'Dosen'})
                        </option>
                      ))}
                    </select>
                    {dosenList.length === 0 && (
                      <p className="mt-1 text-sm text-gray-500">
                        Tidak ada dosen yang tersedia. Silakan tambahkan dosen terlebih dahulu.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Masuk
                    </label>
                    <input
                      type="date"
                      value={addFormData.tanggal_masuk}
                      onChange={(e) => handleAddInputChange('tanggal_masuk', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
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

      <Toaster />
    </div>
  );
};

export default ListMahasiswa; 