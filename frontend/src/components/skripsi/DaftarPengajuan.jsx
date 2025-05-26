import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Edit, Eye } from 'lucide-react';

const DaftarPengajuan = () => {
  const navigate = useNavigate();
  const [pengajuanList, setPengajuanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);

  useEffect(() => {
    fetchPengajuan();
  }, []);

  const fetchPengajuan = async () => {
    try {
      const response = await api.get('/api/skripsi/pengajuan/');
      setPengajuanList(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching thesis submissions:', error);
      toast.error('Gagal memuat daftar pengajuan');
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
      'approved': {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        text: 'Disetujui'
      },
      'rejected': {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        text: 'Ditolak'
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

  const handleViewDetail = (pengajuan) => {
    setSelectedPengajuan(pengajuan);
    setShowDetailModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Pengajuan Judul Skripsi</h1>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mahasiswa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Judul yang Diajukan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Pengajuan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pengajuanList.length > 0 ? (
                pengajuanList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.mahasiswa.user.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.mahasiswa.nim}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-900 font-medium">
                          {item.judul_1}
                        </div>
                        {item.judul_2 && (
                          <div className="text-sm text-gray-600">
                            {item.judul_2}
                          </div>
                        )}
                        {item.judul_3 && (
                          <div className="text-sm text-gray-600">
                            {item.judul_3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.tanggal_pengajuan).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    Belum ada pengajuan judul skripsi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPengajuan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detail Pengajuan</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informasi Mahasiswa */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Informasi Mahasiswa</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nama</p>
                      <p className="font-medium">{selectedPengajuan.mahasiswa.user.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Program Studi</p>
                      <p className="font-medium">{selectedPengajuan.mahasiswa.program_studi}</p>
                    </div>
                  </div>
                </div>

                {/* Judul yang Diajukan */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Judul yang Diajukan</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Judul 1:</p>
                      <p className="mb-1">{selectedPengajuan.judul_1}</p>
                      <p className="text-sm text-gray-600">{selectedPengajuan.deskripsi_1}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Judul 2:</p>
                      <p className="mb-1">{selectedPengajuan.judul_2}</p>
                      <p className="text-sm text-gray-600">{selectedPengajuan.deskripsi_2}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Judul 3:</p>
                      <p className="mb-1">{selectedPengajuan.judul_3}</p>
                      <p className="text-sm text-gray-600">{selectedPengajuan.deskripsi_3}</p>
                    </div>
                  </div>
                </div>

                {/* Status dan Catatan */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Status dan Catatan</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Status:</p>
                      {getStatusBadge(selectedPengajuan.status)}
                    </div>
                    {selectedPengajuan.catatan_prodi && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Catatan Prodi:</p>
                        <p className="text-sm text-gray-600">{selectedPengajuan.catatan_prodi}</p>
                      </div>
                    )}
                    {selectedPengajuan.catatan_fakultas && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Catatan Fakultas:</p>
                        <p className="text-sm text-gray-600">{selectedPengajuan.catatan_fakultas}</p>
                      </div>
                    )}
                    {selectedPengajuan.catatan_pembimbing && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Catatan Pembimbing:</p>
                        <p className="text-sm text-gray-600">{selectedPengajuan.catatan_pembimbing}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pembimbing */}
                {(selectedPengajuan.pembimbing_1_name || selectedPengajuan.pembimbing_2_name) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pembimbing</h3>
                    <div className="space-y-2">
                      {selectedPengajuan.pembimbing_1_name && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Pembimbing 1:</p>
                          <p className="text-gray-900">{selectedPengajuan.pembimbing_1_name}</p>
                        </div>
                      )}
                      {selectedPengajuan.pembimbing_2_name && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Pembimbing 2:</p>
                          <p className="text-gray-900">{selectedPengajuan.pembimbing_2_name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarPengajuan; 