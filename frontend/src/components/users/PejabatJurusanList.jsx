import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, User, Mail, Phone, Calendar, Hash, MoreVertical, Edit2, UserX, UserCheck, GraduationCap, X, Save, ArrowLeft, Building, Award, BookOpen, Plus } from 'lucide-react';
import api from '../../api';
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';

const PejabatJurusanList = () => {
  const navigate = useNavigate();
  const [pejabatList, setPejabatList] = useState([]);
  const [jurusanList, setJurusanList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');
  const [filterPLT, setFilterPLT] = useState('');
  const [sortBy, setSortBy] = useState('user.full_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPejabat, setSelectedPejabat] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form data states
  const [addFormData, setAddFormData] = useState({
    user: '',
    jurusan: '',
    jabatan: '',
    tgl_mulai: '',
    tgl_selesai: '',
    plt: false,
    label: ''
  });

  const [userFilterOptions, setUserFilterOptions] = useState({
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc',
    onlyUnassigned: true,
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch pejabat jurusan list
        const pejabatResponse = await api.get('/api/users/pejabat-jurusan/');
        console.log('Pejabat list:', pejabatResponse.data);
        setPejabatList(pejabatResponse.data);
        
        // Fetch all users that are of type pejabat_jurusan
        const userResponse = await api.get('/api/users/');
        console.log('All users:', userResponse.data);
        const availableUsers = userResponse.data.filter(user => 
          user.is_active && 
          user.user_type === 'pejabat_jurusan' &&
          !pejabatResponse.data.some(pejabat => pejabat.user?.id === user.id)
        );
        console.log('Available users:', availableUsers);
        setUserList(availableUsers);

        // Fetch jurusan list
        const jurusanResponse = await api.get('/api/jurusan/');
        console.log('Jurusan list:', jurusanResponse.data);
        setJurusanList(jurusanResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort users for add modal
  const filteredUsers = useMemo(() => {
    return userList
      .filter(user => {
        const matchesSearch = user.full_name?.toLowerCase().includes(userFilterOptions.searchTerm.toLowerCase()) ||
                            user.email?.toLowerCase().includes(userFilterOptions.searchTerm.toLowerCase());
        
        const isUnassigned = userFilterOptions.onlyUnassigned ? 
          !pejabatList.some(pejabat => pejabat.user?.id === user.id) : true;
        
        return matchesSearch && isUnassigned;
      })
      .sort((a, b) => {
        const aValue = userFilterOptions.sortBy === 'name' ? a.full_name : a.email;
        const bValue = userFilterOptions.sortBy === 'name' ? b.full_name : b.email;
        return userFilterOptions.sortOrder === 'asc' ? 
          aValue.localeCompare(bValue) : 
          bValue.localeCompare(aValue);
      });
  }, [userList, userFilterOptions, pejabatList]);

  // Filter and sort pejabat list
  const filteredAndSortedPejabat = useMemo(() => {
    return pejabatList
      .filter(pejabat => {
        const matchesSearch = 
          pejabat.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pejabat.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pejabat.user?.dosen_profile?.nip?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesJurusan = !filterJurusan || pejabat.jurusan?.nama_jurusan === filterJurusan;
        const matchesPLT = filterPLT === '' || pejabat.plt === (filterPLT === 'true');
        
        return matchesSearch && matchesJurusan && matchesPLT;
      })
      .sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'user.full_name':
            aValue = a.user?.full_name || '';
            bValue = b.user?.full_name || '';
            break;
          case 'jurusan.nama_jurusan':
            aValue = a.jurusan?.nama_jurusan || '';
            bValue = b.jurusan?.nama_jurusan || '';
            break;
          case 'jabatan':
            aValue = a.jabatan || '';
            bValue = b.jabatan || '';
            break;
          case 'periode_mulai':
            aValue = a.periode_mulai || '';
            bValue = b.periode_mulai || '';
            break;
          default:
            aValue = a.user?.full_name || '';
            bValue = b.user?.full_name || '';
        }
        
        return sortOrder === 'asc' ? 
          aValue.localeCompare(bValue) : 
          bValue.localeCompare(aValue);
      });
  }, [pejabatList, searchTerm, filterJurusan, filterPLT, sortBy, sortOrder]);

  // Handlers
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
    setFilterJurusan('');
    setFilterPLT('');
    setSortBy('user.full_name');
    setSortOrder('asc');
  };

  const handleViewPejabat = async (pejabatId) => {
    try {
      const response = await api.get(`/api/users/pejabat-jurusan/${pejabatId}/`);
      setSelectedPejabat(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error fetching pejabat details:', error);
      toast.error('Gagal memuat detail Pejabat Jurusan');
    }
  };

  const handleInputChange = (field, value) => {
    setSelectedPejabat(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.patch(`/api/users/pejabat-jurusan/${selectedPejabat.id}/`, {
        jabatan: selectedPejabat.jabatan,
        tgl_mulai: selectedPejabat.tgl_mulai,
        tgl_selesai: selectedPejabat.tgl_selesai,
        plt: selectedPejabat.plt,
        label: selectedPejabat.label
      });

      // Update the pejabat in the list
      setPejabatList(prev => prev.map(p => 
        p.id === selectedPejabat.id ? response.data : p
      ));

      setIsEditing(false);
      toast.success('Data Pejabat Jurusan berhasil diperbarui');
    } catch (error) {
      console.error('Error updating pejabat:', error);
      toast.error(error.response?.data?.detail || 'Gagal memperbarui data Pejabat Jurusan');
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

    try {
      // Convert the form data to match the serializer requirements
      const submitData = {
        user_id: parseInt(addFormData.user),
        jurusan_id: parseInt(addFormData.jurusan),
        jabatan: addFormData.jabatan,
        tgl_mulai: addFormData.tgl_mulai,
        tgl_selesai: addFormData.tgl_selesai,
        plt: addFormData.plt,
        label: addFormData.label || null
      };

      const response = await api.post('/api/users/pejabat-jurusan/', submitData);
      setPejabatList(prev => [...prev, response.data]);
      setShowAddModal(false);
      setAddFormData({
        user: '',
        jurusan: '',
        jabatan: '',
        tgl_mulai: '',
        tgl_selesai: '',
        plt: false,
        label: ''
      });
      toast.success('Pejabat Jurusan berhasil ditambahkan');
    } catch (error) {
      console.error('Error adding pejabat jurusan:', error);
      toast.error(error.response?.data?.detail || 'Gagal menambahkan Pejabat Jurusan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unique values for filters
  const uniqueJurusan = useMemo(() => {
    return [...new Set(pejabatList
      .map(pejabat => pejabat.jurusan?.nama_jurusan)
      .filter(Boolean))];
  }, [pejabatList]);

  const uniqueJabatan = useMemo(() => {
    return [...new Set(pejabatList
      .map(pejabat => pejabat.jabatan)
      .filter(Boolean))];
  }, [pejabatList]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If a pejabat is selected, show the detail/edit view
  if (selectedPejabat) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedPejabat(null)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali ke Daftar Pejabat Jurusan
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

        {/* Pejabat Details */}
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
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPejabat.user?.full_name || '-'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      NIP
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPejabat.user?.dosen_profile?.nip || '-'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPejabat.user?.email || '-'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Nomor Telepon
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPejabat.user?.phone_number || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Jabatan Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Jabatan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Jurusan
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPejabat.jurusan?.nama_jurusan || '-'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Jabatan
                    </label>
                    {isEditing ? (
                      <select
                        value={selectedPejabat.jabatan || ''}
                        onChange={(e) => handleInputChange('jabatan', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Ketua">Ketua</option>
                        <option value="Sekretaris">Sekretaris</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedPejabat.jabatan || '-'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Periode Mulai
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={selectedPejabat.tgl_mulai || ''}
                        onChange={(e) => handleInputChange('tgl_mulai', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedPejabat.tgl_mulai || '-'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Periode Selesai
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={selectedPejabat.tgl_selesai || ''}
                        onChange={(e) => handleInputChange('tgl_selesai', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedPejabat.tgl_selesai || '-'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Status PLT
                    </label>
                    {isEditing ? (
                      <select
                        value={selectedPejabat.plt ? 'true' : 'false'}
                        onChange={(e) => handleInputChange('plt', e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="false">Tidak</option>
                        <option value="true">Ya</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedPejabat.plt ? 'Ya' : 'Tidak'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Label
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={selectedPejabat.label || ''}
                        onChange={(e) => handleInputChange('label', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: Periode 2024-2028"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedPejabat.label || '-'}
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

  // Main list view
  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Header with Add Button */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Pejabat Jurusan</h1>
          <p className="text-gray-600">Kelola dan lihat informasi semua Pejabat Jurusan</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Pejabat Jurusan</span>
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
          
          {(searchTerm || filterJurusan || filterPLT || sortBy !== 'user.full_name') && (
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Jurusan</label>
              <select
                value={filterJurusan}
                onChange={(e) => setFilterJurusan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Jurusan</option>
                {jurusanList.map(jurusan => (
                  <option key={jurusan.id} value={jurusan.nama_jurusan}>
                    {jurusan.nama_jurusan}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status PLT</label>
              <select
                value={filterPLT}
                onChange={(e) => setFilterPLT(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="true">PLT</option>
                <option value="false">Definitif</option>
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
                  <option value="jurusan.nama_jurusan">Jurusan</option>
                  <option value="jabatan">Jabatan</option>
                  <option value="periode_mulai">Periode Mulai</option>
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
          Menampilkan {filteredAndSortedPejabat.length} dari {pejabatList.length} Pejabat Jurusan
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIP
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('jurusan.nama_jurusan')}>
                  <div className="flex items-center gap-2">
                    Jurusan
                    {sortBy === 'jurusan.nama_jurusan' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('jabatan')}>
                  <div className="flex items-center gap-2">
                    Jabatan
                    {sortBy === 'jabatan' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('periode_mulai')}>
                  <div className="flex items-center gap-2">
                    Periode
                    {sortBy === 'periode_mulai' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                  </div>
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
              {filteredAndSortedPejabat.map((pejabat) => (
                <tr
                  key={pejabat.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewPejabat(pejabat.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pejabat.user?.full_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pejabat.user?.dosen_profile?.nip || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pejabat.jurusan?.nama_jurusan || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pejabat.jabatan || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pejabat.tgl_mulai } - {pejabat.tgl_selesai}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      pejabat.plt 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {pejabat.plt ? 'PLT' : 'Definitif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewPejabat(pejabat.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                        title="Edit Pejabat Jurusan"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleViewPejabat(pejabat.id)}
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
      {!isLoading && filteredAndSortedPejabat.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada Pejabat Jurusan ditemukan</h3>
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
                <h2 className="text-2xl font-semibold text-gray-900">Tambah Pejabat Jurusan</h2>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Pejabat Jurusan
                    </label>
                    <div className="mb-6">
                      <label className="block text-lg font-medium text-gray-900 mb-4">
                        Pilih User Pejabat Jurusan
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
                            Hanya tampilkan user yang belum menjadi Pejabat Jurusan
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
                                    tgl_mulai: new Date().toISOString().split('T')[0],
                                    tgl_selesai: new Date(new Date().setFullYear(new Date().getFullYear() + 4)).toISOString().split('T')[0],
                                    plt: false
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

                {/* Right Column - Form Fields */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jurusan
                    </label>
                    <select
                      value={addFormData.jurusan}
                      onChange={(e) => handleAddInputChange('jurusan', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Jurusan</option>
                      {jurusanList.map(jurusan => (
                        <option key={jurusan.id} value={jurusan.id}>
                          {jurusan.nama_jurusan}
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
                      <option value="Ketua">Ketua</option>
                      <option value="Sekretaris">Sekretaris</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Periode Mulai
                    </label>
                    <input
                      type="date"
                      value={addFormData.tgl_mulai}
                      onChange={(e) => handleAddInputChange('tgl_mulai', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Periode Selesai
                    </label>
                    <input
                      type="date"
                      value={addFormData.tgl_selesai}
                      onChange={(e) => handleAddInputChange('tgl_selesai', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status PLT
                    </label>
                    <select
                      value={addFormData.plt.toString()}
                      onChange={(e) => handleAddInputChange('plt', e.target.value === 'true')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="false">Tidak</option>
                      <option value="true">Ya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label (Opsional)
                    </label>
                    <input
                      type="text"
                      value={addFormData.label}
                      onChange={(e) => handleAddInputChange('label', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: Periode 2024-2028"
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

export default PejabatJurusanList; 