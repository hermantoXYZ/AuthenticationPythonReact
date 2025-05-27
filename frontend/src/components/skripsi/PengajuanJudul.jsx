import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api';
import { Send, Save, X } from 'lucide-react';

const PengajuanJudul = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        const response = await api.get('/api/skripsi/pengajuan/');
        const submissions = response.data;
        if (submissions.length > 0) {
          const pendingSubmission = submissions.find(s => 
            s.status === 'pending' || s.status === 'revision'
          );
          if (pendingSubmission) {
            toast.error('Anda masih memiliki pengajuan yang sedang diproses');
            navigate('/dashboard/skripsi/status');
          }
        }
      } catch (error) {
        console.error('Error checking submissions:', error);
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
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting form data:', formData); // Debug log

    try {
      // First, check if user can submit
      const checkResponse = await api.get('/api/skripsi/pengajuan/');
      console.log('Check response:', checkResponse.data);
      
      const pendingSubmission = checkResponse.data.find(s => 
        s.status === 'pending' || s.status === 'revision'
      );
      
      if (pendingSubmission) {
        toast.error('Anda masih memiliki pengajuan yang sedang diproses');
        navigate('/dashboard/skripsi/status');
        return;
      }

      // If no pending submission, proceed with new submission
      const response = await api.post('/api/skripsi/pengajuan/', formData);
      console.log('Submission successful:', response.data);
      
      toast.success('Pengajuan judul skripsi berhasil dikirim!');
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
          // Redirect to login if needed
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