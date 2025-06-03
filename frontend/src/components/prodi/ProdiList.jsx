import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, BookOpen, Award, GraduationCap, Hash, X, Plus, Building, User } from 'lucide-react';
import api from '../../api';
import { toast } from 'sonner';
import { Toaster } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';

const ProdiList = () => {
  const [prodiList, setProdiList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenjang, setFilterJenjang] = useState('');
  const [filterAkreditasi, setFilterAkreditasi] = useState('');
  const [sortBy, setSortBy] = useState('nama');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [fakultasList, setFakultasList] = useState([]);
  const [jurusanList, setJurusanList] = useState([]);
  const [kaprodiList, setKaprodiList] = useState([]);

  const [addFormData, setAddFormData] = useState({
    nama: '',
    kode: '',
    jenjang: 'S1',
    gelar: '',
    akreditasi: 'A',
    fakultas: '',
    jurusan: '',
    kaprodi: ''
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProdi, setSelectedProdi] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nama: '',
    kode: '',
    jenjang: '',
    gelar: '',
    akreditasi: '',
    fakultas: '',
    jurusan: '',
    kaprodi: ''
  });

  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchProdi();
    fetchFakultas();
    fetchJurusan();
    fetchKaprodi();
  }, []);

  const fetchProdi = async () => {
    try {
      const response = await api.get('/api/prodi/');
      setProdiList(response.data);
      setIsLoading(false);
    } catch (error) {
      toast.error('Gagal memuat data Program Studi');
      setIsLoading(false);
    }
  };

  const fetchFakultas = async () => {
    try {
      const response = await api.get('/api/fakultas/');
      setFakultasList(response.data);
    } catch (error) {
      toast.error('Gagal memuat data Fakultas');
    }
  };

  const fetchJurusan = async () => {
    try {
      const response = await api.get('/api/jurusan/');
      setJurusanList(response.data);
    } catch (error) {
      toast.error('Gagal memuat data Jurusan');
    }
  };

  const fetchKaprodi = async () => {
    try {
      const response = await api.get('/api/users/');
      const activeKaprodi = response.data.filter(user => 
        user.is_active && 
        user.user_type === 'ketua_prodi'
      );
      setKaprodiList(activeKaprodi);
    } catch (error) {
      toast.error('Gagal memuat data Ketua Program Studi');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    const requiredFields = {
      nama: 'Nama Program Studi',
      kode: 'Kode Program Studi',
      jenjang: 'Jenjang',
      gelar: 'Gelar',
      akreditasi: 'Akreditasi',
      fakultas: 'Fakultas',
      jurusan: 'Jurusan'
    };

    // Check for empty required fields
    const emptyFields = Object.entries(requiredFields)
      .filter(([key]) => !addFormData[key])
      .map(([_, label]) => label);

    if (emptyFields.length > 0) {
      toast.error(`Field berikut harus diisi: ${emptyFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare the data with proper null handling and type conversion
      const formDataToSubmit = {
        nama: addFormData.nama.trim(),
        kode: addFormData.kode.trim(),
        jenjang: addFormData.jenjang,
        gelar: addFormData.gelar.trim(),
        akreditasi: addFormData.akreditasi,
        fakultas: addFormData.fakultas ? parseInt(addFormData.fakultas) : null,
        jurusan: addFormData.jurusan ? parseInt(addFormData.jurusan) : null,
        kaprodi: addFormData.kaprodi ? parseInt(addFormData.kaprodi) : null
      };

      // Log the data being sent
      console.log('Sending data to server:', formDataToSubmit);

      const response = await api.post('/api/prodi/', formDataToSubmit);
      
      // Log successful response
      console.log('Server response:', response.data);
      
      // Show success message
      toast.success('Program Studi berhasil ditambahkan');
      
      // Reset form
      setAddFormData({
        nama: '',
        kode: '',
        jenjang: 'S1',
        gelar: '',
        akreditasi: 'A',
        fakultas: '',
        jurusan: '',
        kaprodi: ''
      });
      
      // Close modal
      setShowAddModal(false);
      
      // Refresh the data
      await fetchProdi();
    } catch (error) {
      console.error('Error adding prodi:', error);
      console.error('Error response data:', error.response?.data);
      
      // Handle different types of error responses
      let errorMessage = 'Gagal menambahkan Program Studi';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (typeof error.response.data === 'object') {
          // Handle Django REST framework error format
          const errors = Object.entries(error.response.data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              }
              return `${field}: ${messages}`;
            });
          
          if (errors.length > 0) {
            errorMessage = `Validation errors:\n${errors.join('\n')}`;
          }
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for kode field
    if (name === 'kode' && value.length > 10) {
      toast.error('Kode Program Studi tidak boleh lebih dari 10 karakter');
      return;
    }
    
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get unique values for filters
  const uniqueJenjang = useMemo(() => {
    return [...new Set(prodiList.map(prodi => prodi.jenjang))];
  }, [prodiList]);

  const uniqueAkreditasi = useMemo(() => {
    return [...new Set(prodiList.map(prodi => prodi.akreditasi))];
  }, [prodiList]);

  // Filter and sort data
  const filteredAndSortedProdi = useMemo(() => {
    let filtered = prodiList.filter(prodi => {
      const matchesSearch = prodi.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prodi.kode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJenjang = !filterJenjang || prodi.jenjang === filterJenjang;
      const matchesAkreditasi = !filterAkreditasi || prodi.akreditasi === filterAkreditasi;
      
      return matchesSearch && matchesJenjang && matchesAkreditasi;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
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
  }, [prodiList, searchTerm, filterJenjang, filterAkreditasi, sortBy, sortOrder]);

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
    setFilterJenjang('');
    setFilterAkreditasi('');
    setSortBy('nama');
    setSortOrder('asc');
  };

  const getAkreditasiColor = (akreditasi) => {
    switch (akreditasi) {
      case 'A':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEdit = (prodi) => {
    setSelectedProdi(prodi);
    
    const editData = {
      nama: prodi.nama || '',
      kode: prodi.kode || '',
      jenjang: prodi.jenjang || 'S1',
      gelar: prodi.gelar || '',
      akreditasi: prodi.akreditasi || 'A',
      fakultas: prodi.fakultas?.id || prodi.fakultas || '',
      jurusan: prodi.jurusan?.id || prodi.jurusan || '',
      kaprodi: prodi.kaprodi?.id || prodi.kaprodi || ''
    };
    
    setEditFormData(editData);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formattedData = {
        ...editFormData,
        fakultas: editFormData.fakultas || null,
        jurusan: editFormData.jurusan || null,
        kaprodi: editFormData.kaprodi || null
      };

      const response = await api.put(`/api/prodi/${selectedProdi.id}/`, formattedData);
      toast.success('Program Studi berhasil diperbarui');
      
      setProdiList(prevList => 
        prevList.map(item => 
          item.id === selectedProdi.id ? response.data : item
        )
      );
      
      setShowEditModal(false);
      setSelectedProdi(null);
      
      fetchProdi();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal memperbarui Program Studi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetail = (prodi) => {
    setSelectedProdi(prodi);
    setShowDetailModal(true);
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
      {/* Header with Add Button */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Program Studi</h1>
          <p className="text-gray-600">Temukan program studi yang sesuai dengan minat Anda</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Tambah Program Studi
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari program studi atau kode..."
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
          
          {(searchTerm || filterJenjang || filterAkreditasi || sortBy !== 'nama') && (
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenjang</label>
              <select
                value={filterJenjang}
                onChange={(e) => setFilterJenjang(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Jenjang</option>
                {uniqueJenjang.map(jenjang => (
                  <option key={jenjang} value={jenjang}>{jenjang}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Akreditasi</label>
              <select
                value={filterAkreditasi}
                onChange={(e) => setFilterAkreditasi(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Akreditasi</option>
                {uniqueAkreditasi.map(akreditasi => (
                  <option key={akreditasi} value={akreditasi}>{akreditasi}</option>
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
                  <option value="nama">Nama</option>
                  <option value="kode">Kode</option>
                  <option value="jenjang">Jenjang</option>
                  <option value="akreditasi">Akreditasi</option>
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
          Menampilkan {filteredAndSortedProdi.length} dari {prodiList.length} program studi
        </p>
      </div>

      {/* Program Studi Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedProdi.map((prodi) => (
          <div key={prodi.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{prodi.nama}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Hash className="h-4 w-4" />
                    <span>{prodi.kode}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getAkreditasiColor(prodi.akreditasi)}`}>
                  {prodi.akreditasi}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Jenjang:</span>
                    <span>{prodi.jenjang}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Gelar:</span>
                    <span>{prodi.gelar}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Akreditasi:</span>
                    <span className="font-semibold">{prodi.akreditasi}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                <button 
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => handleViewDetail(prodi)}
                >
                  Lihat Detail
                </button>
                <button 
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => handleEdit(prodi)}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedProdi.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada program studi ditemukan</h3>
          <p className="text-gray-600 mb-4">Coba ubah kriteria pencarian atau filter Anda</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Add Prodi Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Tambah Program Studi Baru</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Fakultas */}
                  <div>
                    <label htmlFor="fakultas" className="block text-sm font-medium text-gray-700 mb-2">
                      Fakultas <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="fakultas"
                      name="fakultas"
                      value={addFormData.fakultas}
                      onChange={handleAddInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Fakultas</option>
                      {fakultasList.map(fakultas => (
                        <option key={fakultas.id} value={fakultas.id}>
                          {fakultas.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Jurusan */}
                  <div>
                    <label htmlFor="jurusan" className="block text-sm font-medium text-gray-700 mb-2">
                      Jurusan <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="jurusan"
                      name="jurusan"
                      value={addFormData.jurusan}
                      onChange={handleAddInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Jurusan</option>
                      {jurusanList.map(jurusan => (
                        <option key={jurusan.id} value={jurusan.id}>
                          {jurusan.nama_jurusan}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nama Program Studi */}
                  <div>
                    <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Program Studi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nama"
                      name="nama"
                      value={addFormData.nama}
                      onChange={handleAddInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan nama program studi"
                    />
                  </div>

                  {/* Kode */}
                  <div>
                    <label htmlFor="kode" className="block text-sm font-medium text-gray-700 mb-2">
                      Kode Program Studi <span className="text-red-500">*</span>
                      <span className="text-gray-500 text-xs ml-2">(Maks. 10 karakter)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="kode"
                        name="kode"
                        value={addFormData.kode}
                        onChange={handleAddInputChange}
                        maxLength={10}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan kode program studi"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                        {addFormData.kode.length}/10
                      </span>
                    </div>
                  </div>

                  {/* Kaprodi */}
                  <div>
                    <label htmlFor="kaprodi" className="block text-sm font-medium text-gray-700 mb-2">
                      Ketua Program Studi ({kaprodiList?.length || 0} found)
                    </label>
                    <select
                      id="kaprodi"
                      name="kaprodi"
                      value={addFormData.kaprodi}
                      onChange={handleAddInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Ketua Program Studi</option>
                      {kaprodiList?.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} ({user.dosen_profile?.nip || 'NIP: -'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Jenjang */}
                  <div>
                    <label htmlFor="jenjang" className="block text-sm font-medium text-gray-700 mb-2">
                      Jenjang <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="jenjang"
                      name="jenjang"
                      value={addFormData.jenjang}
                      onChange={handleAddInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="D3">D3 (Diploma 3)</option>
                      <option value="D4">D4 (Diploma 4)</option>
                      <option value="S1">S1 (Sarjana)</option>
                      <option value="S2">S2 (Magister)</option>
                      <option value="S3">S3 (Doktor)</option>
                    </select>
                  </div>

                  {/* Gelar */}
                  <div>
                    <label htmlFor="gelar" className="block text-sm font-medium text-gray-700 mb-2">
                      Gelar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="gelar"
                      name="gelar"
                      value={addFormData.gelar}
                      onChange={handleAddInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: S.Kom., M.Kom."
                    />
                  </div>

                  {/* Akreditasi */}
                  <div>
                    <label htmlFor="akreditasi" className="block text-sm font-medium text-gray-700 mb-2">
                      Akreditasi <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="akreditasi"
                      name="akreditasi"
                      value={addFormData.akreditasi}
                      onChange={handleAddInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="Baik Sekali">Baik Sekali</option>
                      <option value="Baik">Baik</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Sticky Bottom */}
              <div className="sticky bottom-0 bg-white pt-6 mt-8 border-t border-gray-200">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Program Studi'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit Program Studi</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Fakultas */}
                  <div>
                    <label htmlFor="edit_fakultas" className="block text-sm font-medium text-gray-700 mb-2">
                      Fakultas <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit_fakultas"
                      name="fakultas"
                      value={editFormData.fakultas}
                      onChange={(e) => setEditFormData(prev => ({
                        ...prev,
                        fakultas: e.target.value
                      }))}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Fakultas</option>
                      {fakultasList.map(fakultas => (
                        <option key={fakultas.id} value={fakultas.id}>
                          {fakultas.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Jurusan */}
                  <div>
                    <label htmlFor="edit_jurusan" className="block text-sm font-medium text-gray-700 mb-2">
                      Jurusan <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit_jurusan"
                      name="jurusan"
                      value={editFormData.jurusan}
                      onChange={(e) => setEditFormData(prev => ({
                        ...prev,
                        jurusan: e.target.value
                      }))}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Jurusan</option>
                      {jurusanList.map(jurusan => (
                        <option key={jurusan.id} value={jurusan.id}>
                          {jurusan.nama_jurusan}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nama Program Studi */}
                  <div>
                    <label htmlFor="edit_nama" className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Program Studi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit_nama"
                      value={editFormData.nama}
                      onChange={(e) => setEditFormData(prev => ({
                        ...prev,
                        nama: e.target.value
                      }))}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan nama program studi"
                    />
                  </div>

                  {/* Kode */}
                  <div>
                    <label htmlFor="edit_kode" className="block text-sm font-medium text-gray-700 mb-2">
                      Kode Program Studi <span className="text-red-500">*</span>
                      <span className="text-gray-500 text-xs ml-2">(Maks. 10 karakter)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="edit_kode"
                        value={editFormData.kode}
                        onChange={(e) => {
                          if (e.target.value.length <= 10) {
                            setEditFormData(prev => ({
                              ...prev,
                              kode: e.target.value
                            }));
                          } else {
                            toast.error('Kode Program Studi tidak boleh lebih dari 10 karakter');
                          }
                        }}
                        maxLength={10}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan kode program studi"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                        {editFormData.kode.length}/10
                      </span>
                    </div>
                  </div>

                  {/* Kaprodi */}
                  <div>
                    <label htmlFor="edit_kaprodi" className="block text-sm font-medium text-gray-700 mb-2">
                      Ketua Program Studi ({kaprodiList?.length || 0} found)
                    </label>
                    <select
                      id="edit_kaprodi"
                      name="kaprodi"
                      value={editFormData.kaprodi}
                      onChange={(e) => setEditFormData(prev => ({
                        ...prev,
                        kaprodi: e.target.value
                      }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Ketua Program Studi</option>
                      {kaprodiList?.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} ({user.dosen_profile?.nip || 'NIP: -'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Jenjang */}
                  <div>
                    <label htmlFor="edit_jenjang" className="block text-sm font-medium text-gray-700 mb-2">
                      Jenjang <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit_jenjang"
                      value={editFormData.jenjang}
                      onChange={(e) => setEditFormData(prev => ({
                        ...prev,
                        jenjang: e.target.value
                      }))}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="D3">D3 (Diploma 3)</option>
                      <option value="D4">D4 (Diploma 4)</option>
                      <option value="S1">S1 (Sarjana)</option>
                      <option value="S2">S2 (Magister)</option>
                      <option value="S3">S3 (Doktor)</option>
                    </select>
                  </div>

                  {/* Gelar */}
                  <div>
                    <label htmlFor="edit_gelar" className="block text-sm font-medium text-gray-700 mb-2">
                      Gelar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit_gelar"
                      value={editFormData.gelar}
                      onChange={(e) => setEditFormData(prev => ({
                        ...prev,
                        gelar: e.target.value
                      }))}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: S.Kom., M.Kom."
                    />
                  </div>

                  {/* Akreditasi */}
                  <div>
                    <label htmlFor="edit_akreditasi" className="block text-sm font-medium text-gray-700 mb-2">
                      Akreditasi <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit_akreditasi"
                      value={editFormData.akreditasi}
                      onChange={(e) => setEditFormData(prev => ({
                        ...prev,
                        akreditasi: e.target.value
                      }))}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="Baik Sekali">Baik Sekali</option>
                      <option value="Baik">Baik</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Sticky Bottom */}
              <div className="sticky bottom-0 bg-white pt-6 mt-8 border-t border-gray-200">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedProdi && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl max-h-[95vh] w-full overflow-hidden flex flex-col">
            {/* Header - Fixed */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Detail Program Studi</h2>
                  <p className="text-sm text-gray-500 mt-1">Informasi lengkap program studi</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedProdi(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Basic Information */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Informasi Utama</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Program Studi
                      </label>
                      <div className="flex items-center gap-2 text-gray-900 bg-white px-4 py-2.5 rounded-lg border border-gray-200">
                        <BookOpen className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <span className="font-medium break-words">{selectedProdi.nama}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kode Program Studi
                      </label>
                      <div className="flex items-center gap-2 text-gray-900 bg-white px-4 py-2.5 rounded-lg border border-gray-200">
                        <Hash className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <span className="font-medium">{selectedProdi.kode}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status Akreditasi
                      </label>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <div className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getAkreditasiColor(selectedProdi.akreditasi)}`}>
                          Akreditasi {selectedProdi.akreditasi}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4">Informasi Akademik</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenjang Pendidikan
                      </label>
                      <div className="flex items-center gap-2 text-gray-900 bg-white px-4 py-2.5 rounded-lg border border-gray-200">
                        <GraduationCap className="h-5 w-5 text-purple-500 flex-shrink-0" />
                        <span className="font-medium">{selectedProdi.jenjang}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gelar Akademik
                      </label>
                      <div className="flex items-center gap-2 text-gray-900 bg-white px-4 py-2.5 rounded-lg border border-gray-200">
                        <Award className="h-5 w-5 text-purple-500 flex-shrink-0" />
                        <span className="font-medium">{selectedProdi.gelar}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organizational Information */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Struktur Organisasi</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fakultas
                      </label>
                      <div className="flex items-center gap-2 text-gray-900 bg-white px-4 py-2.5 rounded-lg border border-gray-200">
                        <Building className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="font-medium break-words">{selectedProdi.fakultas?.nama || '-'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jurusan
                      </label>
                      <div className="flex items-center gap-2 text-gray-900 bg-white px-4 py-2.5 rounded-lg border border-gray-200">
                        <BookOpen className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="font-medium break-words">{selectedProdi.jurusan?.nama_jurusan || '-'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ketua Program Studi
                      </label>
                      <div className="flex items-center gap-2 text-gray-900 bg-white px-4 py-2.5 rounded-lg border border-gray-200">
                        <User className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="font-medium break-words">{selectedProdi.kaprodi?.full_name || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="p-6 border-t border-gray-200 bg-white">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedProdi(null);
                  }}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Tutup
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

export default ProdiList;