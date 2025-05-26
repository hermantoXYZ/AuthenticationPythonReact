import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../api';
import { Check, X, MessageCircle } from 'lucide-react';

const ReviewPengajuan = () => {
  const [pengajuan, setPengajuan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    fetchPengajuan();
  }, []);

  const fetchPengajuan = async () => {
    try {
      const response = await api.get('/api/skripsi/pengajuan/review/');
      setPengajuan(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching thesis submissions:', error);
      toast.error('Gagal memuat data pengajuan untuk review');
      setIsLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await api.post(`/api/skripsi/pengajuan/${id}/review/`, {
        status,
        catatan: reviewNote
      });
      toast.success('Review berhasil disimpan');
      fetchPengajuan(); // Refresh data
      setSelectedPengajuan(null);
      setReviewNote('');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Gagal menyimpan review');
    }
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
      <h1 className="text-2xl font-bold text-gray-800">Review Pengajuan Judul Skripsi</h1>

      <div className="grid gap-6">
        {pengajuan.map((item) => (
          <div key={item.id} className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.mahasiswa.user.full_name}
                </h3>
                <p className="text-sm text-gray-600">{item.mahasiswa.nim} - {item.mahasiswa.program_studi}</p>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(item.tanggal_pengajuan).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Judul 1:</h4>
                <p className="text-gray-900">{item.judul_1}</p>
                <p className="text-sm text-gray-600 mt-1">{item.deskripsi_1}</p>
              </div>
              
              {item.judul_2 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Judul 2:</h4>
                  <p className="text-gray-900">{item.judul_2}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.deskripsi_2}</p>
                </div>
              )}
              
              {item.judul_3 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Judul 3:</h4>
                  <p className="text-gray-900">{item.judul_3}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.deskripsi_3}</p>
                </div>
              )}
            </div>

            {selectedPengajuan?.id === item.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Review
                  </label>
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tambahkan catatan review di sini..."
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReview(item.id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                    Setujui
                  </button>
                  <button
                    onClick={() => handleReview(item.id, 'rejected')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                    Tolak
                  </button>
                  <button
                    onClick={() => setSelectedPengajuan(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setSelectedPengajuan(item)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <MessageCircle className="w-4 h-4" />
                Review Pengajuan
              </button>
            )}
          </div>
        ))}

        {pengajuan.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Pengajuan</h3>
            <p className="text-gray-600">Belum ada pengajuan judul yang perlu direview</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPengajuan; 