import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, AlertCircle } from 'lucide-react';
import api from '../../api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ManageJurusan = () => {
  const navigate = useNavigate();
  const [jurusanList, setJurusanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJurusan, setSelectedJurusan] = useState(null);
  const [currentPage, setCurrentPage] = useState('');

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
    navigate(`/dashboard/jurusan/edit/${jurusan.id}`);
  };

  const handleDelete = async () => {
    if (!selectedJurusan) return;

    try {
      await api.delete(`/api/jurusan/${selectedJurusan.id}/`);
      toast.success('Jurusan berhasil dihapus');
      setShowDeleteModal(false);
      setSelectedJurusan(null);
      fetchJurusan(); // Refresh the list
    } catch (error) {
      console.error('Error deleting jurusan:', error);
      toast.error(error.response?.data?.error || 'Gagal menghapus jurusan');
    }
  };

  const filteredJurusan = jurusanList.filter(jurusan =>
    jurusan.nama_jurusan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jurusan.kode_surat.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Jurusan</h1>
        <p className="text-gray-600">Edit atau hapus data jurusan yang ada</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari jurusan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Jurusan Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Jurusan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kode Surat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredJurusan.map((jurusan) => (
              <tr key={jurusan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{jurusan.nama_jurusan}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{jurusan.kode_surat}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    jurusan.status === 'Aktif'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {jurusan.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(jurusan)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedJurusan(jurusan);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredJurusan.length === 0 && (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada jurusan ditemukan</h3>
            <p className="mt-1 text-sm text-gray-500">
              Coba cari dengan kata kunci lain atau tambahkan jurusan baru.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Hapus Jurusan
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Apakah Anda yakin ingin menghapus jurusan "{selectedJurusan?.nama_jurusan}"? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedJurusan(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJurusan; 