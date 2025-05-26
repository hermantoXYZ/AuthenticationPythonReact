import { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, SortDesc, School, BookOpen, Hash, X } from 'lucide-react';
import api from '../../api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const JurusanList = () => {
  const [jurusanList, setJurusanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('nama_jurusan');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedJurusan, setSelectedJurusan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [editFormData, setEditFormData] = useState({
    nama_jurusan: '',
    kode_surat: '',
    status: ''
  });

  useEffect(() => {
    fetchJurusan();
  }, []);

  const fetchJurusan = async () => {
    try {
      const response = await api.get('/api/jurusan/');
      setJurusanList(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching jurusan:', error);
      toast.error('Gagal memuat data Jurusan');
      setIsLoading(false);
    }
  };

  const handleEdit = (jurusan) => {
    setSelectedJurusan(jurusan);
    setEditFormData({
      nama_jurusan: jurusan.nama_jurusan,
      kode_surat: jurusan.kode_surat,
      status: jurusan.status
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.put(`/api/jurusan/${selectedJurusan.id}/`, editFormData);
      toast.success('Jurusan berhasil diperbarui');
      
      // Update the list with new data
      setJurusanList(prevList => 
        prevList.map(item => 
          item.id === selectedJurusan.id ? response.data : item
        )
      );
      
      setShowEditModal(false);
      setSelectedJurusan(null);
    } catch (error) {
      console.error('Error updating jurusan:', error);
      toast.error(error.response?.data?.error || 'Gagal memperbarui jurusan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and sort data
  const filteredAndSortedJurusan = jurusanList.filter(jurusan => {
    const matchesSearch = jurusan.nama_jurusan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        jurusan.kode_surat.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || jurusan.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const aValue = a[sortBy].toLowerCase();
    const bValue = b[sortBy].toLowerCase();
    
    return sortOrder === 'asc' 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setSortBy('nama_jurusan');
    setSortOrder('asc');
  };

  const getStatusColor = (status) => {
    return status === 'Aktif'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Jurusan</h1>
        <p className="text-gray-600">Kelola dan lihat informasi semua jurusan</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari nama jurusan atau kode surat..."
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
          
          {(searchTerm || filterStatus || sortBy !== 'nama_jurusan' || sortOrder !== 'asc') && (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="NonAktif">Non Aktif</option>
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
                  <option value="nama_jurusan">Nama Jurusan</option>
                  <option value="kode_surat">Kode Surat</option>
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
          Menampilkan {filteredAndSortedJurusan.length} dari {jurusanList.length} jurusan
        </p>
      </div>

      {/* Jurusan Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedJurusan.map((jurusan) => (
          <div key={jurusan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{jurusan.nama_jurusan}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Hash className="h-4 w-4" />
                    <span>{jurusan.kode_surat}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(jurusan.status)}`}>
                  {jurusan.status}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                <button 
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => navigate(`/dashboard/jurusan/${jurusan.id}`)}
                >
                  Lihat Detail
                </button>
                <button 
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => handleEdit(jurusan)}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedJurusan.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada jurusan ditemukan</h3>
          <p className="text-gray-600 mb-4">Coba ubah kriteria pencarian atau filter Anda</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
       <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Jurusan</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Jurusan
                  </label>
                  <input
                    type="text"
                    value={editFormData.nama_jurusan}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      nama_jurusan: e.target.value
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Surat
                  </label>
                  <input
                    type="text"
                    value={editFormData.kode_surat}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      kode_surat: e.target.value
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      status: e.target.value
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="NonAktif">Non Aktif</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
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

export default JurusanList; 