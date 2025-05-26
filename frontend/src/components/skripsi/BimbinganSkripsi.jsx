import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../api';
import { MessageCircle, Calendar, FileText } from 'lucide-react';

const BimbinganSkripsi = () => {
  const [bimbingan, setBimbingan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBimbingan();
  }, []);

  const fetchBimbingan = async () => {
    try {
      const response = await api.get('/api/skripsi/bimbingan/');
      setBimbingan(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching guidance data:', error);
      toast.error('Gagal memuat data bimbingan');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (bimbingan.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Bimbingan</h3>
        <p className="text-gray-600">Belum ada catatan bimbingan skripsi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Bimbingan Skripsi</h1>

      <div className="grid gap-6">
        {bimbingan.map((item) => (
          <div key={item.id} className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.mahasiswa.user.full_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.mahasiswa.nim} - {item.mahasiswa.program_studi}
                </p>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(item.tanggal).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Judul Skripsi
                </div>
                <p className="text-gray-900">{item.judul_skripsi}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Catatan Bimbingan
                </div>
                <p className="text-gray-900">{item.catatan}</p>
              </div>

              {item.hasil_review && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Hasil Review
                  </div>
                  <p className="text-gray-900">{item.hasil_review}</p>
                </div>
              )}

              {item.dokumen && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Dokumen
                  </div>
                  <a
                    href={item.dokumen}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Lihat Dokumen
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BimbinganSkripsi; 