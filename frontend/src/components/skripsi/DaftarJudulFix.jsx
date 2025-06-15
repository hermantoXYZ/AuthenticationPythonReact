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

const DaftarJudulFix = () => {
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
      // Filter hanya pengajuan yang sudah diterima
      const acceptedSubmissions = response.data.filter(item => item.status === 'accepted');
      setPengajuan(acceptedSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Gagal memuat daftar judul fix');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (item) => {
    try {
      const response = await api.get(`/api/skripsi/pengajuan/${item.id}/`);
      console.log('Detail response:', response.data);
      setSelectedPengajuan(response.data);
      setShowDetail(true);
    } catch (error) {
      console.error('Error fetching detail:', error);
      toast.error('Gagal memuat detail pengajuan');
    }
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedPengajuan(null);
  };

  const handleSetJudulFix = async (pengajuanId, judulFix) => {
    try {
      setIsSaving(true);
      console.log('Setting fixed title:', {
        id: pengajuanId,
        judul_diterima: judulFix
      });

      const response = await api.patch(`/api/skripsi/pengajuan/${pengajuanId}/`, {
        judul_diterima: judulFix
      });
      
      console.log('Response:', response.data);
      
      // Update local state
      setPengajuan(pengajuan.map(item => 
        item.id === pengajuanId 
          ? { ...item, judul_diterima: judulFix } 
          : item
      ));
      
      toast.success('Judul fix berhasil disimpan');
      setShowDetail(false);
      setSelectedPengajuan(null);
    } catch (error) {
      console.error('Error setting fixed title:', error);
      toast.error('Gagal menyimpan judul fix');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPengajuan = pengajuan.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    const mahasiswaName = item.mahasiswa_name || '';
    const judulFix = item.judul_diterima || '';

    const matchesSearch = 
      mahasiswaName.toLowerCase().includes(searchTermLower) ||
      judulFix.toLowerCase().includes(searchTermLower);
    
    return matchesSearch;
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
            Kembali ke Daftar Judul Fix
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
                    <label className="text-sm font-medium text-gray-700">NIM</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPengajuan.mahasiswa?.nim || '-'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Program Studi</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPengajuan.program_studi}
                    </p>
                  </div>
                </div>
              </div>

              {/* Judul Options */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pilih Judul Fix</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          Judul {num} {num === 1 ? '(Prioritas Utama)' : num === 2 ? '(Alternatif 1)' : '(Alternatif 2)'}
                        </h3>
                        <button
                          onClick={() => handleSetJudulFix(selectedPengajuan.id, selectedPengajuan[`judul_${num}`])}
                          disabled={isSaving}
                          className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 ${
                            selectedPengajuan.judul_diterima === selectedPengajuan[`judul_${num}`] ? 'bg-green-600 hover:bg-green-700' : ''
                          }`}
                        >
                          {selectedPengajuan.judul_diterima === selectedPengajuan[`judul_${num}`] ? 'Judul Terpilih' : 'Pilih Judul Ini'}
                        </button>
                      </div>
                      <p className="text-gray-900 mb-2">{selectedPengajuan[`judul_${num}`]}</p>
                      <p className="text-sm text-gray-600">{selectedPengajuan[`deskripsi_${num}`]}</p>
                    </div>
                  ))}
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
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daftar Judul Fix Skripsi</h1>
          <p className="mt-2 text-gray-600">
            Kelola judul fix skripsi yang sudah disetujui
          </p>
        </div>
      </div>

      {/* Search */}
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
                  Judul Fix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
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
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">
                      {item.judul_diterima || 'Belum dipilih'}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada judul fix ditemukan</h3>
          <p className="text-gray-600 mb-4">Coba ubah kriteria pencarian Anda</p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Pencarian
          </button>
        </div>
      )}
    </div>
  );
};

export default DaftarJudulFix; 