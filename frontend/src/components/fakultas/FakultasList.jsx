import { useState, useEffect } from 'react';
import { Plus, Pencil, Search, Filter, SortAsc, SortDesc, Building2, X, Save } from 'lucide-react';
import api from '../../api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const FakultasList = () => {
  const [fakultas, setFakultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nama');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFakultas, setSelectedFakultas] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    nama: '',
    kode: '',
    dekan: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchFakultas();
    fetchUsers();
  }, []);

  const fetchFakultas = async () => {
    try {
      const response = await api.get('/api/fakultas/');
      setFakultas(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fakultas:', error);
      toast.error('Gagal memuat data fakultas');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users/');
      // Filter hanya user dengan tipe dekan_fakultas
      const dekanUsers = response.data.filter(user => user.user_type === 'dekan_fakultas');
      setUsers(dekanUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat data user');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleAddNew = () => {
    setFormData({
      nama: '',
      kode: '',
      dekan: ''
    });
    setShowAddModal(true);
  };

  const handleEdit = (fak) => {
    setSelectedFakultas(fak);
    setFormData({
      nama: fak.nama,
      kode: fak.kode,
      dekan: fak.dekan?.id || ''
    });
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setIsEditing(false);
    setSelectedFakultas(null);
    setFormData({
      nama: '',
      kode: '',
      dekan: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form field changed:', name, value); // Debug log
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Debug logs
    console.log('Form data before submission:', formData);
    console.log('Is editing mode:', isEditing);

    try {
      // Format the data properly
      const dataToSend = {
        nama: formData.nama.trim(),
        kode: formData.kode.trim(),
        dekan: formData.dekan ? parseInt(formData.dekan) : null // Convert dekan ID to integer
      };

      console.log('Data being sent to API:', dataToSend); // Debug log

      let response;
      if (isEditing && selectedFakultas) {
        response = await api.put(`/api/fakultas/${selectedFakultas.id}/`, dataToSend);
        console.log('Edit response:', response); // Debug log
        toast.success('Fakultas berhasil diperbarui');
      } else {
        response = await api.post('/api/fakultas/', dataToSend);
        console.log('Create response:', response); // Debug log
        toast.success('Fakultas berhasil ditambahkan');
      }
      
      await fetchFakultas(); // Refresh the list
      handleCloseModal();
    } catch (error) {
      console.error('Error saving fakultas:', error);
      console.log('Error response:', error.response?.data); // Debug log
      
      if (error.response?.data) {
        const errorMessages = Object.entries(error.response.data)
          .map(([field, errors]) => {
            if (Array.isArray(errors)) {
              return `${field}: ${errors.join(', ')}`;
            } else if (typeof errors === 'string') {
              return `${field}: ${errors}`;
            } else {
              return `${field}: Invalid value`;
            }
          })
          .join('\n');
        toast.error(`Gagal menyimpan fakultas:\n${errorMessages}`);
      } else {
        toast.error(`Gagal ${isEditing ? 'memperbarui' : 'menambahkan'} fakultas: ${error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Filter and sort fakultas
  const filteredAndSortedFakultas = fakultas
    .filter(fak => 
      fak.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fak.kode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Fakultas</h1>
        <p className="text-gray-600">Kelola dan lihat informasi semua fakultas</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari nama atau kode fakultas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filter & Urutkan
            </button>

            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Tambah Fakultas
            </button>
          </div>
          
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset Pencarian
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urutkan Berdasarkan</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="nama">Nama Fakultas</option>
                  <option value="kode">Kode Fakultas</option>
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
          Menampilkan {filteredAndSortedFakultas.length} dari {fakultas.length} fakultas
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('nama')}
                >
                  <div className="flex items-center gap-2">
                    Nama Fakultas
                    {sortBy === 'nama' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('kode')}
                >
                  <div className="flex items-center gap-2">
                    Kode
                    {sortBy === 'kode' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dekan
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedFakultas.map((fak) => (
                <tr key={fak.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{fak.nama}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{fak.kode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {fak.dekan ? fak.dekan.full_name : 'Belum ditentukan'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(fak)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredAndSortedFakultas.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada fakultas ditemukan</h3>
          <p className="text-gray-600 mb-4">Coba ubah kriteria pencarian Anda</p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Pencarian
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || isEditing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {isEditing ? 'Edit Fakultas' : 'Tambah Fakultas Baru'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Fakultas
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan nama fakultas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Fakultas
                  </label>
                  <input
                    type="text"
                    name="kode"
                    value={formData.kode}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan kode fakultas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dekan
                  </label>
                  <select
                    name="dekan"
                    value={formData.dekan || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih Dekan</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 flex items-center gap-2"
                  >
                    {isSaving ? (
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
        </div>
      )}
    </div>
  );
};

export default FakultasList; 