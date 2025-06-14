import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../api';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  FileText,
  Users,
  FileCheck,
  BookOpen,
  Search,
  Filter,
  Eye,
  Check,
  X,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';

const DaftarPengajuanAdmin = () => {
  const [pengajuan, setPengajuan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPengajuan();
  }, []);

  const fetchPengajuan = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/skripsi/pengajuan/');
      console.log('Response data:', response.data);
      setPengajuan(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Gagal memuat daftar pengajuan');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        text: 'Menunggu Review'
      },
      'reviewed_prodi': {
        color: 'bg-blue-100 text-blue-800',
        icon: Check,
        text: 'Sudah Direview Prodi'
      },
      'reviewed_fakultas': {
        color: 'bg-purple-100 text-purple-800',
        icon: Check,
        text: 'Sudah Direview Fakultas'
      },
      'accepted': {
        color: 'bg-green-100 text-green-800',
        icon: Check,
        text: 'Diterima'
      },
      'rejected': {
        color: 'bg-red-100 text-red-800',
        icon: X,
        text: 'Ditolak'
      },
      'revision': {
        color: 'bg-orange-100 text-orange-800',
        icon: AlertCircle,
        text: 'Perlu Revisi'
      }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  const handleReview = async (pengajuanId, status, catatan) => {
    try {
      setIsSaving(true);
      await api.patch(`/api/skripsi/pengajuan/${pengajuanId}/`, {
        status,
        catatan_prodi: catatan
      });
      
      // Update local state
      setPengajuan(pengajuan.map(item => 
        item.id === pengajuanId 
          ? { ...item, status, catatan_prodi: catatan } 
          : item
      ));
      
      toast.success('Review berhasil disimpan');
      setShowDetail(false);
      setSelectedPengajuan(null);
    } catch (error) {
      console.error('Error reviewing submission:', error);
      toast.error('Gagal menyimpan review');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewDetail = (item) => {
    setSelectedPengajuan(item);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedPengajuan(null);
  };

  const filteredPengajuan = pengajuan.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    const mahasiswaName = item.mahasiswa_name || '';
    const judul1 = item.judul_1 || '';
    const judul2 = item.judul_2 || '';
    const judul3 = item.judul_3 || '';

    const matchesSearch = 
      mahasiswaName.toLowerCase().includes(searchTermLower) ||
      judul1.toLowerCase().includes(searchTermLower) ||
      judul2.toLowerCase().includes(searchTermLower) ||
      judul3.toLowerCase().includes(searchTermLower);
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If showing detail view
  if (showDetail && selectedPengajuan) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleCloseDetail}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali ke Daftar Pengajuan
          </button>
        </div>

        {/* Detail Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="space-y-8">
              {/* Student Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Mahasiswa</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nama Mahasiswa</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPengajuan.mahasiswa_name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Program Studi</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPengajuan.program_studi}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Dosen Wali</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPengajuan.dosen_wali_name || 'Belum ditentukan'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submission Details */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Detail Pengajuan</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      Judul 1 (Prioritas Utama)
                    </div>
                    <div className="text-gray-900">{selectedPengajuan.judul_1}</div>
                    <div className="text-sm text-gray-600 mt-2">
                      {selectedPengajuan.deskripsi_1}
                    </div>
                  </div>

                  {selectedPengajuan.judul_2 && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        Judul 2 (Alternatif 1)
                      </div>
                      <div className="text-gray-900">{selectedPengajuan.judul_2}</div>
                      <div className="text-sm text-gray-600 mt-2">
                        {selectedPengajuan.deskripsi_2}
                      </div>
                    </div>
                  )}

                  {selectedPengajuan.judul_3 && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        Judul 3 (Alternatif 2)
                      </div>
                      <div className="text-gray-900">{selectedPengajuan.judul_3}</div>
                      <div className="text-sm text-gray-600 mt-2">
                        {selectedPengajuan.deskripsi_3}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Review</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={selectedPengajuan.status}
                      onChange={(e) => setSelectedPengajuan({
                        ...selectedPengajuan,
                        status: e.target.value
                      })}
                    >
                      <option value="pending">Menunggu Review</option>
                      <option value="reviewed_prodi">Sudah Direview Prodi</option>
                      <option value="reviewed_fakultas">Sudah Direview Fakultas</option>
                      <option value="accepted">Diterima</option>
                      <option value="rejected">Ditolak</option>
                      <option value="revision">Perlu Revisi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows="4"
                      value={selectedPengajuan.catatan_prodi || ''}
                      onChange={(e) => setSelectedPengajuan({
                        ...selectedPengajuan,
                        catatan_prodi: e.target.value
                      })}
                      placeholder="Tambahkan catatan review..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseDetail}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleReview(
                    selectedPengajuan.id,
                    selectedPengajuan.status,
                    selectedPengajuan.catatan_prodi
                  )}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daftar Pengajuan Judul Skripsi</h1>
          <p className="mt-2 text-gray-600">
            Review dan kelola pengajuan judul skripsi dari mahasiswa
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari berdasarkan nama mahasiswa atau judul..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu Review</option>
            <option value="reviewed_prodi">Sudah Direview Prodi</option>
            <option value="reviewed_fakultas">Sudah Direview Fakultas</option>
            <option value="accepted">Diterima</option>
            <option value="rejected">Ditolak</option>
            <option value="revision">Perlu Revisi</option>
          </select>
        </div>
      </div>

      {/* List Pengajuan */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mahasiswa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Judul Utama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
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
              {filteredPengajuan.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.mahasiswa_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.program_studi}
                        </div>
                        <div className="text-xs text-gray-400">
                          Dosen Wali: {item.dosen_wali_name || 'Belum ditentukan'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">
                      {item.judul_1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(item.tanggal_pengajuan).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetail(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredPengajuan.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pengajuan ditemukan</h3>
          <p className="text-gray-600 mb-4">Coba ubah kriteria pencarian atau filter Anda</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default DaftarPengajuanAdmin; 