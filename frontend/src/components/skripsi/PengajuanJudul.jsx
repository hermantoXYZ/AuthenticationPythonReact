import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api';
import { Send, Save, X, AlertCircle } from 'lucide-react';

const PengajuanJudul = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveSubmission, setHasActiveSubmission] = useState(false);
  const [formData, setFormData] = useState({
    judul_1: '',
    deskripsi_1: '',
    judul_2: '',
    deskripsi_2: '',
    judul_3: '',
    deskripsi_3: '',
  });

  // Check user's existing submissions on component mount
  useEffect(() => {
    const checkExistingSubmissions = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/api/skripsi/pengajuan/');
        const submissions = response.data;
        
        // Check for any active submissions (pending, revision, or accepted)
        const activeSubmission = submissions.find(s => 
          ['pending', 'reviewed_prodi', 'reviewed_fakultas', 'accepted'].includes(s.status)
        );
        
        // Check for rejected or revision status
        const rejectedOrRevision = submissions.find(s => 
          ['rejected', 'revision'].includes(s.status)
        );

        if (activeSubmission) {
          setHasActiveSubmission(true);
          let message = '';
          switch(activeSubmission.status) {
            case 'pending':
              message = 'Anda memiliki pengajuan yang sedang diproses';
              break;
            case 'reviewed_prodi':
              message = 'Pengajuan Anda sedang direview oleh prodi';
              break;
            case 'reviewed_fakultas':
              message = 'Pengajuan Anda sedang direview oleh fakultas';
              break;
            case 'accepted':
              message = 'Anda sudah memiliki judul yang diterima';
              break;
            default:
              message = 'Anda memiliki pengajuan yang sedang diproses';
          }
          toast.error(message);
          navigate('/dashboard/skripsi/status');
        } else if (rejectedOrRevision) {
          // If status is rejected or revision, load the existing data
          setFormData({
            judul_1: rejectedOrRevision.judul_1,
            deskripsi_1: rejectedOrRevision.deskripsi_1,
            judul_2: rejectedOrRevision.judul_2,
            deskripsi_2: rejectedOrRevision.deskripsi_2,
            judul_3: rejectedOrRevision.judul_3,
            deskripsi_3: rejectedOrRevision.deskripsi_3,
          });
          
          // Show appropriate message
          if (rejectedOrRevision.status === 'rejected') {
            toast.warning('Pengajuan Anda ditolak. Silakan edit dan ajukan kembali.');
          } else {
            toast.warning('Pengajuan Anda perlu direvisi. Silakan edit sesuai catatan yang diberikan.');
          }
        }
      } catch (error) {
        console.error('Error checking submissions:', error);
        toast.error('Gagal memeriksa status pengajuan');
      } finally {
        setIsLoading(false);
      }
    };
    checkExistingSubmissions();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Validate titles are unique
    const titles = [formData.judul_1, formData.judul_2, formData.judul_3];
    if (new Set(titles).size !== titles.length) {
      toast.error('Judul skripsi tidak boleh sama');
      return false;
    }

    // Validate minimum length for titles and descriptions
    for (let i = 1; i <= 3; i++) {
      if (formData[`judul_${i}`].length < 10) {
        toast.error(`Judul ${i} minimal 10 karakter`);
        return false;
      }
      if (formData[`deskripsi_${i}`].length < 50) {
        toast.error(`Deskripsi ${i} minimal 50 karakter`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (hasActiveSubmission) {
      toast.error('Anda tidak dapat mengajukan judul baru karena masih memiliki pengajuan yang aktif');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting form data:', formData);

    try {
      // Check if there's a rejected or revision submission
      const checkResponse = await api.get('/api/skripsi/pengajuan/');
      const submissions = checkResponse.data;
      const rejectedOrRevision = submissions.find(s => 
        ['rejected', 'revision'].includes(s.status)
      );

      let response;
      if (rejectedOrRevision) {
        // If there's a rejected or revision submission, update it
        response = await api.patch(`/api/skripsi/pengajuan/${rejectedOrRevision.id}/`, {
          ...formData,
          status: 'pending' // Reset status to pending
        });
        toast.success('Pengajuan judul skripsi berhasil diperbarui!');
      } else {
        // If no rejected or revision submission, create new
        response = await api.post('/api/skripsi/pengajuan/', formData);
        toast.success('Pengajuan judul skripsi berhasil dikirim!');
      }
      
      console.log('Submission successful:', response.data);
      navigate('/dashboard/skripsi/status');
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Gagal mengirim pengajuan judul skripsi.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Sesi anda telah berakhir. Silakan login kembali.';
        } else if (error.response.status === 403) {
          errorMessage = 'Anda tidak memiliki akses untuk mengajukan judul skripsi.';
        } else if (error.response.data) {
          errorMessage = error.response.data.detail || 
                        error.response.data.message ||
                        error.response.data[0] ||
                        'Terjadi kesalahan pada server.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/skripsi/status');
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memeriksa status pengajuan...</span>
          </div>
        </div>
      </div>
    );
  }

  if (hasActiveSubmission) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-center text-center">
            <div className="max-w-md">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-12 h-12 text-yellow-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Pengajuan Aktif Ditemukan
              </h2>
              <p className="text-gray-600 mb-4">
                Anda tidak dapat mengajukan judul baru karena masih memiliki pengajuan yang aktif.
                Silakan periksa status pengajuan Anda di halaman status.
              </p>
              <button
                onClick={() => navigate('/dashboard/skripsi/status')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Lihat Status Pengajuan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Pengajuan Judul Skripsi</h1>
          <p className="mt-2 text-gray-600">
            Silakan ajukan tiga judul skripsi beserta deskripsinya. Pastikan judul yang diajukan sesuai dengan bidang penelitian Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Judul {num}</h2>
                  <span className="text-sm text-gray-500">
                    {num === 1 ? '(Prioritas Utama)' : num === 2 ? '(Alternatif 1)' : '(Alternatif 2)'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Judul Skripsi {num}
                    </label>
                    <input
                      type="text"
                      name={`judul_${num}`}
                      value={formData[`judul_${num}`]}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Masukkan judul skripsi ${num}`}
                      required
                      minLength={10}
                      maxLength={255}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Minimal 10 karakter, maksimal 255 karakter
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi dan Latar Belakang
                    </label>
                    <textarea
                      name={`deskripsi_${num}`}
                      value={formData[`deskripsi_${num}`]}
                      onChange={handleChange}
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Jelaskan deskripsi dan latar belakang dari judul yang diajukan"
                      required
                      minLength={50}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Minimal 50 karakter
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 inline-flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Pengajuan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PengajuanJudul; 