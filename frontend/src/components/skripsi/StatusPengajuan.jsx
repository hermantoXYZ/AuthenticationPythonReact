import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../api';
import { Clock, Check, X, MessageCircle, AlertCircle } from 'lucide-react';

const StatusPengajuan = () => {
  const [pengajuan, setPengajuan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/api/skripsi/pengajuan/');
      console.log('Status response:', response.data);
      
      const submissions = response.data;
      const latestSubmission = submissions.length > 0 ? submissions[0] : null;
      setPengajuan(latestSubmission);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching submission status:', error);
      toast.error('Gagal memuat status pengajuan');
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!pengajuan) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Pengajuan</h3>
        <p className="text-gray-600 mb-4">Anda belum mengajukan judul skripsi</p>
        <button
          onClick={() => window.location.href = '/dashboard/skripsi/pengajuan'}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Ajukan Judul Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Status Pengajuan Judul Skripsi</h1>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Tanggal Pengajuan</div>
            <div className="font-medium">
              {new Date(pengajuan.tanggal_pengajuan).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
          {getStatusBadge(pengajuan.status)}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Judul yang Diajukan</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 mb-1">Judul 1 (Prioritas Utama)</div>
                <div className="text-gray-900">{pengajuan.judul_1}</div>
                <div className="text-sm text-gray-600 mt-2">{pengajuan.deskripsi_1}</div>
              </div>

              {pengajuan.judul_2 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600 mb-1">Judul 2 (Alternatif 1)</div>
                  <div className="text-gray-900">{pengajuan.judul_2}</div>
                  <div className="text-sm text-gray-600 mt-2">{pengajuan.deskripsi_2}</div>
                </div>
              )}

              {pengajuan.judul_3 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600 mb-1">Judul 3 (Alternatif 2)</div>
                  <div className="text-gray-900">{pengajuan.judul_3}</div>
                  <div className="text-sm text-gray-600 mt-2">{pengajuan.deskripsi_3}</div>
                </div>
              )}
            </div>
          </div>

          {pengajuan.judul_diterima && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Judul yang Diterima</h3>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-800">{pengajuan.judul_diterima}</div>
              </div>
            </div>
          )}

          {(pengajuan.catatan_prodi || pengajuan.catatan_fakultas || pengajuan.catatan_pembimbing) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Catatan Review</h3>
              <div className="space-y-4">
                {pengajuan.catatan_prodi && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-1">Catatan Program Studi</div>
                    <div className="text-blue-900">{pengajuan.catatan_prodi}</div>
                  </div>
                )}

                {pengajuan.catatan_fakultas && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-800 mb-1">Catatan Fakultas</div>
                    <div className="text-purple-900">{pengajuan.catatan_fakultas}</div>
                  </div>
                )}

                {pengajuan.catatan_pembimbing && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm font-medium text-orange-800 mb-1">Catatan Pembimbing</div>
                    <div className="text-orange-900">{pengajuan.catatan_pembimbing}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {pengajuan.pembimbing_1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dosen Pembimbing</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-600">Pembimbing 1:</div>
                  <div className="text-gray-900">{pengajuan.pembimbing_1_name}</div>
                </div>
                {pengajuan.pembimbing_2 && (
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-gray-600">Pembimbing 2:</div>
                    <div className="text-gray-900">{pengajuan.pembimbing_2_name}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusPengajuan; 