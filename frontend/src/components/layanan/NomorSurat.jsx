import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  FileText,
  Calendar,
  Building2,
  GraduationCap,
  User,
  X,
  Save,
  Loader2
} from 'lucide-react';

const NomorSurat = () => {
  const navigate = useNavigate();
  const [nomorSuratList, setNomorSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNomorSurat, setSelectedNomorSurat] = useState(null);
  const [jurusanList, setJurusanList] = useState([]);
  const [prodiList, setProdiList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    tahun: '',
    nomor: '',
    jenis: 'KM',
    perihal: '',
    tujuan: '',
    jurusan: '',
    program_studi: '',
    status: 'draft',
    admin_nomor_surat: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    tahun: '',
    jenis: '',
    status: '',
    jurusan: ''
  });

  useEffect(() => {
    fetchNomorSurat();
    fetchJurusan();
    fetchProdi();
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      setFormData(prev => ({
        ...prev,
        admin_nomor_surat: userData.id
      }));
    }
  }, []);

  const fetchNomorSurat = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/nomor-surat/');
      setNomorSuratList(response.data);
    } catch (error) {
      console.error('Error fetching nomor surat:', error);
      toast.error('Gagal mengambil data nomor surat');
    } finally {
      setLoading(false);
    }
  };

  const fetchJurusan = async () => {
    try {
      const response = await api.get('/api/jurusan/');
      setJurusanList(response.data);
    } catch (error) {
      console.error('Error fetching jurusan:', error);
      toast.error('Gagal mengambil data jurusan');
    }
  };

  const fetchProdi = async () => {
    try {
      console.log('Fetching program studi...');
      const response = await api.get('/api/prodi/');
      console.log('Program studi response:', response.data);
      setProdiList(response.data);
    } catch (error) {
      console.error('Error fetching prodi:', error);
      console.error('Error response:', error.response);
      toast.error('Gagal mengambil data program studi');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for tahun field
    if (name === 'tahun') {
      // Only allow numeric input and max 4 digits
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 4);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }

    // Special handling for nomor field
    if (name === 'nomor') {
      // Only allow positive numbers
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }

    // Special handling for select fields
    if (name === 'jurusan' || name === 'program_studi') {
      setFormData(prev => ({
        ...prev,
        [name]: value || null // Ensure null if empty
      }));
      return;
    }

    // Default handling for other fields
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formData.tahun || !formData.nomor || !formData.perihal || !formData.tujuan) {
        toast.error('Semua field harus diisi');
        return;
      }

      // Validate tahun format (should be numeric and max 4 digits)
      if (!/^\d{1,4}$/.test(formData.tahun)) {
        toast.error('Tahun harus berupa angka (1-4 digit)');
        return;
      }

      // Prepare form data
      const submitData = {
        tahun: formData.tahun,
        nomor: parseInt(formData.nomor, 10),
        jenis: formData.jenis,
        perihal: formData.perihal.trim(),
        tujuan: formData.tujuan.trim(),
        jurusan: formData.jurusan || null,
        program_studi: formData.program_studi || null,
        status: formData.status || 'draft'
      };

      console.log('Submitting data:', submitData); // Debug log

      const response = await api.post('/api/nomor-surat/', submitData);
      console.log('Response:', response.data); // Debug log
      
      toast.success('Nomor surat berhasil ditambahkan');
      setShowAddModal(false);
      fetchNomorSurat();
      resetForm();
    } catch (error) {
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.data) {
        // Handle specific error messages from backend
        const errorData = error.response.data;
        let errorMessage = '';
        
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMessage = fieldErrors || 'Gagal menambahkan nomor surat';
        } else {
          errorMessage = errorData.detail || 'Gagal menambahkan nomor surat';
        }
        
        toast.error(errorMessage);
      } else {
        toast.error('Gagal menambahkan nomor surat');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formData.tahun || !formData.nomor || !formData.perihal || !formData.tujuan) {
        toast.error('Semua field harus diisi');
        return;
      }

      // Validate tahun format (should be numeric and max 4 digits)
      if (!/^\d{1,4}$/.test(formData.tahun)) {
        toast.error('Tahun harus berupa angka (1-4 digit)');
        return;
      }

      // Prepare form data
      const submitData = {
        tahun: formData.tahun,
        nomor: parseInt(formData.nomor, 10),
        jenis: formData.jenis,
        perihal: formData.perihal.trim(),
        tujuan: formData.tujuan.trim(),
        jurusan: formData.jurusan || null,
        program_studi: formData.program_studi || null,
        status: formData.status || 'draft'
      };

      console.log('Submitting edit data:', submitData); // Debug log

      const response = await api.patch(`/api/nomor-surat/${selectedNomorSurat.id}/`, submitData);
      console.log('Edit response:', response.data); // Debug log
      
      toast.success('Nomor surat berhasil diperbarui');
      setShowEditModal(false);
      fetchNomorSurat();
      resetForm();
    } catch (error) {
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.data) {
        // Handle specific error messages from backend
        const errorData = error.response.data;
        let errorMessage = '';
        
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMessage = fieldErrors || 'Gagal memperbarui nomor surat';
        } else {
          errorMessage = errorData.detail || 'Gagal memperbarui nomor surat';
        }
        
        toast.error(errorMessage);
      } else {
        toast.error('Gagal memperbarui nomor surat');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNomorSurat) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/api/nomor-surat/${selectedNomorSurat.id}/`);
      toast.success('Nomor surat berhasil dihapus');
      setShowDeleteModal(false);
      fetchNomorSurat();
    } catch (error) {
      console.error('Error deleting nomor surat:', error);
      toast.error('Gagal menghapus nomor surat');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    setFormData({
      tahun: '',
      nomor: '',
      jenis: 'KM',
      perihal: '',
      tujuan: '',
      jurusan: '',
      program_studi: '',
      status: 'draft',
      admin_nomor_surat: userData?.id || ''
    });
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (nomorSurat) => {
    setSelectedNomorSurat(nomorSurat);
    setFormData({
      tahun: nomorSurat.tahun,
      nomor: nomorSurat.nomor,
      jenis: nomorSurat.jenis,
      perihal: nomorSurat.perihal,
      tujuan: nomorSurat.tujuan,
      jurusan: nomorSurat.jurusan,
      program_studi: nomorSurat.program_studi,
      status: nomorSurat.status
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (nomorSurat) => {
    setSelectedNomorSurat(nomorSurat);
    setShowDeleteModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      aktif: { color: 'bg-green-100 text-green-800', text: 'Aktif' },
      nonaktif: { color: 'bg-yellow-100 text-yellow-800', text: 'Nonaktif' },
      dihapus: { color: 'bg-red-100 text-red-800', text: 'Dihapus' }
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      tahun: '',
      jenis: '',
      status: '',
      jurusan: ''
    });
  };

  const filteredNomorSurat = nomorSuratList.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      item.perihal.toLowerCase().includes(searchTermLower) ||
      item.tujuan.toLowerCase().includes(searchTermLower) ||
      item.full_nomor.toLowerCase().includes(searchTermLower);

    const matchesFilters = 
      (!filters.tahun || item.tahun === filters.tahun) &&
      (!filters.jenis || item.jenis === filters.jenis) &&
      (!filters.status || item.status === filters.status) &&
      (!filters.jurusan || item.jurusan?.id === parseInt(filters.jurusan));

    return matchesSearch && matchesFilters;
  });

  // Get unique years from nomor surat list
  const uniqueYears = [...new Set(nomorSuratList.map(item => item.tahun))].sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nomor Surat</h1>
          <p className="mt-2 text-gray-600">
            Kelola nomor surat untuk berbagai jenis layanan
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Nomor Surat
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari berdasarkan perihal, tujuan, atau nomor surat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tahun Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun
            </label>
            <select
              name="tahun"
              value={filters.tahun}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Tahun</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Jenis Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Surat
            </label>
            <select
              name="jenis"
              value={filters.jenis}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Jenis</option>
              <option value="KM">KM</option>
              <option value="SK">SK</option>
              <option value="PP">PP</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>

          {/* Jurusan Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jurusan
            </label>
            <select
              name="jurusan"
              value={filters.jurusan}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Jurusan</option>
              {jurusanList.map((jurusan) => (
                <option key={jurusan.id} value={jurusan.id}>
                  {jurusan.nama_jurusan}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filters Button */}
        <div className="flex justify-end">
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X className="h-4 w-4 mr-2" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nomor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Perihal
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tujuan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jurusan/Prodi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Dibuat
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNomorSurat.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.full_nomor}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {item.perihal}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {item.tujuan}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {item.jurusan_detail ? item.jurusan_detail.nama_jurusan : '-'}
                      {item.program_studi_detail && ` / ${item.program_studi_detail.nama}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(item.tanggal_dibuat).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tambah Nomor Surat</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tahun */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahun
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="tahun"
                      value={formData.tahun}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Nomor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="nomor"
                      value={formData.nomor}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Jenis */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis
                  </label>
                  <input
                    type="text"
                    name="jenis"
                    value={formData.jenis}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Perihal */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Perihal
                  </label>
                  <input
                    type="text"
                    name="perihal"
                    value={formData.perihal}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Tujuan */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tujuan
                  </label>
                  <input
                    type="text"
                    name="tujuan"
                    value={formData.tujuan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Jurusan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jurusan
                  </label>
                  <div className="relative">
                    <select
                      name="jurusan"
                      value={formData.jurusan}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Pilih Jurusan</option>
                      {jurusanList.map((jurusan) => (
                        <option key={jurusan.id} value={jurusan.id}>
                          {jurusan.nama_jurusan}
                        </option>
                      ))}
                    </select>
                    <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Program Studi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Studi
                  </label>
                  <div className="relative">
                    <select
                      name="program_studi"
                      value={formData.program_studi}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Pilih Program Studi</option>
                      {prodiList.map((prodi) => (
                        <option key={prodi.id} value={prodi.id}>
                          {prodi.nama}
                        </option>
                      ))}
                    </select>
                    <GraduationCap className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2 inline" />
                      Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Nomor Surat</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tahun */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahun
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="tahun"
                      value={formData.tahun}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Nomor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="nomor"
                      value={formData.nomor}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Jenis */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis
                  </label>
                  <input
                    type="text"
                    name="jenis"
                    value={formData.jenis}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Perihal */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Perihal
                  </label>
                  <input
                    type="text"
                    name="perihal"
                    value={formData.perihal}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Tujuan */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tujuan
                  </label>
                  <input
                    type="text"
                    name="tujuan"
                    value={formData.tujuan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Jurusan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jurusan
                  </label>
                  <div className="relative">
                    <select
                      name="jurusan"
                      value={formData.jurusan}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Pilih Jurusan</option>
                      {jurusanList.map((jurusan) => (
                        <option key={jurusan.id} value={jurusan.id}>
                          {jurusan.nama_jurusan}
                        </option>
                      ))}
                    </select>
                    <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Program Studi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Studi
                  </label>
                  <div className="relative">
                    <select
                      name="program_studi"
                      value={formData.program_studi}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Pilih Program Studi</option>
                      {prodiList.map((prodi) => (
                        <option key={prodi.id} value={prodi.id}>
                          {prodi.nama}
                        </option>
                      ))}
                    </select>
                    <GraduationCap className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2 inline" />
                      Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hapus Nomor Surat</h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus nomor surat ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2 inline" />
                      Hapus
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

export default NomorSurat;
