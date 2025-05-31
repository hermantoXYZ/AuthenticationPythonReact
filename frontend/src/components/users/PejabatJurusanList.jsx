import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, User, Mail, Phone, Calendar, Hash, MoreVertical, Edit2, UserX, UserCheck, GraduationCap, X, Save, ArrowLeft, Building, Award, BookOpen, Plus } from 'lucide-react';
import api from '../../api';
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';

const PejabatJurusanList = () => {
  const navigate = useNavigate();
  const [pejabatList, setPejabatList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');
  const [filterJabatan, setFilterJabatan] = useState('');
  const [sortBy, setSortBy] = useState('user.full_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPejabat, setSelectedPejabat] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [jurusanList, setJurusanList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    user: '',
    jurusan: '',
    jabatan: '',
    tgl_mulai: '',
    tgl_selesai: '',
    plt: false
  });
  const [editFormData, setEditFormData] = useState({
    jurusan: '',
    jabatan: '',
    tgl_mulai: '',
    tgl_selesai: '',
    plt: false
  });
  const [userList, setUserList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pejabat jurusan list
        const pejabatResponse = await api.get('/api/users/pejabat-jurusan/');
        console.log('Pejabat list:', pejabatResponse.data);
        setPejabatList(pejabatResponse.data);
        
        // Fetch all active users that are not yet pejabat jurusan
        const userResponse = await api.get('/api/users/');
        console.log('All users:', userResponse.data);
        const availableUsers = userResponse.data.filter(user => 
          user.is_active && 
          !pejabatResponse.data.some(pejabat => pejabat.pejabat?.id === user.id) &&
          user.user_type !== 'pejabat_jurusan' && 
          !['super_admin', 'dekan_fakultas', 'ketua_prodi', 'mahasiswa', 'staff_prodi', 'staff_fakultas'].includes(user.user_type)
        );
        console.log('Available users:', availableUsers);
        setUserList(availableUsers);
        
        // Fetch jurusan list
        const jurusanResponse = await api.get('/api/jurusan/');
        setJurusanList(jurusanResponse.data);
        
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

  // Filter and sort data
  const filteredAndSortedPejabat = useMemo(() => {
    return pejabatList.filter(pejabat => {
      const matchesSearch = (pejabat.pejabat?.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (pejabat.pejabat?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesJurusan = !filterJurusan || pejabat.jurusan?.nama_jurusan === filterJurusan;
      const matchesJabatan = !filterJabatan || pejabat.jabatan === filterJabatan;
      
      return matchesSearch && matchesJurusan && matchesJabatan;
    }).sort((a, b) => {
      let aValue = a.pejabat?.full_name || '';
      let bValue = b.pejabat?.full_name || '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [pejabatList, searchTerm, filterJurusan, filterJabatan, sortBy, sortOrder]);

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
    setFilterJabatan('');
    setSortBy('user.full_name');
    setSortOrder('asc');
  };

  const handleViewPejabat = async (pejabatId) => {
    try {
      const response = await api.get(`/api/users/pejabat-jurusan/${pejabatId}/`);
      setSelectedPejabat(response.data);
      setEditFormData({
        jurusan: response.data.jurusan?.id || '',
        jabatan: response.data.jabatan || '',
        tgl_mulai: response.data.tgl_mulai || '',
        tgl_selesai: response.data.tgl_selesai || '',
        plt: response.data.plt || false
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error fetching pejabat details:', error);
      toast.error('Gagal memuat detail Pejabat Jurusan');
    }
  };

  const handleEditClick = () => {
    setEditFormData({
      jurusan: selectedPejabat.jurusan?.id || '',
      jabatan: selectedPejabat.jabatan || '',
      tgl_mulai: selectedPejabat.tgl_mulai || '',
      tgl_selesai: selectedPejabat.tgl_selesai || '',
      plt: selectedPejabat.plt || false
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
      if (!editFormData.jurusan || !editFormData.jabatan || !editFormData.tgl_mulai || !editFormData.tgl_selesai) {
        toast.error('Mohon lengkapi semua field yang diperlukan');
        return;
      }

      const response = await api.patch(`/api/users/pejabat-jurusan/${selectedPejabat.id}/`, {
        jurusan_id: parseInt(editFormData.jurusan),
        jabatan: editFormData.jabatan,
        tgl_mulai: editFormData.tgl_mulai,
        tgl_selesai: editFormData.tgl_selesai,
        plt: editFormData.plt
      });

      setSelectedPejabat(response.data);
      setPejabatList(prevList => 
        prevList.map(pejabat => 
          pejabat.id === response.data.id ? response.data : pejabat
        )
      );
      
      setIsEditing(false);
      toast.success('Data Pejabat Jurusan berhasil diperbarui');
    } catch (error) {
      console.error('Error updating pejabat:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.error || 
                         'Gagal memperbarui data Pejabat Jurusan';
      toast.error(errorMessage);
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

    if (!addFormData.user || !addFormData.jurusan || !addFormData.jabatan || !addFormData.tgl_mulai || !addFormData.tgl_selesai) {
      toast.error('Mohon lengkapi semua field yang diperlukan');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = {
        user_id: parseInt(addFormData.user),
        jurusan_id: parseInt(addFormData.jurusan),
        jabatan: addFormData.jabatan,
        tgl_mulai: addFormData.tgl_mulai,
        tgl_selesai: addFormData.tgl_selesai,
        plt: addFormData.plt
      };

      console.log('Submitting data:', formData);

      const response = await api.post('/api/users/pejabat-jurusan/', formData);
      
      console.log('Response:', response.data);
      
      setPejabatList(prev => [...prev, response.data]);
      setShowAddModal(false);
      setAddFormData({
        user: '',
        jurusan: '',
        jabatan: '',
        tgl_mulai: '',
        tgl_selesai: '',
        plt: false
      });
      toast.success('Pejabat Jurusan berhasil ditambahkan');
      
      // Refresh the user list
      const userResponse = await api.get('/api/users/');
      const availableUsers = userResponse.data.filter(user => 
        user.is_active && 
        !pejabatList.some(pejabat => pejabat.pejabat?.id === user.id) &&
        user.user_type !== 'pejabat_jurusan' &&
        !['super_admin', 'dekan_fakultas', 'ketua_prodi', 'mahasiswa', 'staff_prodi', 'staff_fakultas'].includes(user.user_type)
      );
      setUserList(availableUsers);
    } catch (error) {
      console.error('Error adding pejabat:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.error || 
                         'Gagal menambahkan Pejabat Jurusan';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            placeholder="Cari berdasarkan nama..."
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
          
          {(searchTerm || filterJurusan || filterJabatan || sortBy !== 'user.full_name') && (
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
                {uniqueJurusan.map(jurusan => (
                  <option key={jurusan} value={jurusan}>{jurusan}</option>
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
                <option value="Ketua">Ketua</option>
                <option value="Sekretaris">Sekretaris</option>
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Periode Jabatan
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
              <tr key={pejabat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{pejabat.pejabat?.full_name || '-'}</div>
                  <div className="text-sm text-gray-500">{pejabat.pejabat?.email || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{pejabat.jurusan?.nama_jurusan || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {pejabat.jabatan}
                    {pejabat.plt && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        PLT
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(pejabat.tgl_mulai).toLocaleDateString('id-ID')} - 
                    {new Date(pejabat.tgl_selesai).toLocaleDateString('id-ID')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(pejabat.tgl_selesai) > new Date() ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Aktif
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Tidak Aktif
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewPejabat(pejabat.id)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                      title="Edit Pejabat"
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

      {/* Empty State */}
      {filteredAndSortedPejabat.length === 0 && (
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
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User
                    </label>
                    <select
                      value={addFormData.user}
                      onChange={(e) => handleAddInputChange('user', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih User</option>
                      {userList.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} - {user.email}
                        </option>
                      ))}
                    </select>
                  </div>

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
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Mulai
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
                      Tanggal Selesai
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
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={addFormData.plt}
                        onChange={(e) => handleAddInputChange('plt', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Pelaksana Tugas (PLT)</span>
                    </label>
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

      {/* Detail/Edit View */}
      {selectedPejabat && (
        <div className="p-6 max-w-full mx-auto space-y-6">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                setSelectedPejabat(null);
                setIsEditing(false);
              }}
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Pejabat Jurusan</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Nama Lengkap
                      </label>
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedPejabat.pejabat?.full_name || '-'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </label>
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedPejabat.pejabat?.email || '-'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Jurusan
                      </label>
                      {isEditing ? (
                        <select
                          value={editFormData.jurusan || ''}
                          onChange={(e) => handleInputChange('jurusan', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Pilih Jurusan</option>
                          {jurusanList.map(jurusan => (
                            <option key={jurusan.id} value={jurusan.id}>
                              {jurusan.nama_jurusan}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {selectedPejabat.jurusan?.nama_jurusan || '-'}
                        </p>
                      )}
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
                          <option value="Ketua">Ketua</option>
                          <option value="Sekretaris">Sekretaris</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {selectedPejabat.jabatan || '-'}
                          {selectedPejabat.plt && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              PLT
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Tanggal Mulai
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editFormData.tgl_mulai || ''}
                          onChange={(e) => handleInputChange('tgl_mulai', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {new Date(selectedPejabat.tgl_mulai).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Tanggal Selesai
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editFormData.tgl_selesai || ''}
                          onChange={(e) => handleInputChange('tgl_selesai', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {new Date(selectedPejabat.tgl_selesai).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>

                    {isEditing && (
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                          <input
                            type="checkbox"
                            checked={editFormData.plt}
                            onChange={(e) => handleInputChange('plt', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Pelaksana Tugas (PLT)</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default PejabatJurusanList; 