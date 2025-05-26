import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { School } from 'lucide-react';
import api from '../../api';
import { toast } from 'sonner';

const EditJurusan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    nama_jurusan: '',
    kode_surat: '',
    status: ''
  });

  // Validation rules
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nama_jurusan.trim()) {
      newErrors.nama_jurusan = 'Nama jurusan tidak boleh kosong';
    } else if (formData.nama_jurusan.length < 3) {
      newErrors.nama_jurusan = 'Nama jurusan minimal 3 karakter';
    }

    if (!formData.kode_surat.trim()) {
      newErrors.kode_surat = 'Kode surat tidak boleh kosong';
    } else if (!/^[A-Z0-9]+$/.test(formData.kode_surat)) {
      newErrors.kode_surat = 'Kode surat hanya boleh berisi huruf kapital dan angka';
    }

    if (!formData.status) {
      newErrors.status = 'Status harus dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Prompt user when trying to leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!id) {
      toast.error('ID Jurusan tidak ditemukan');
      navigate('/dashboard/jurusan');
      return;
    }

    const fetchJurusan = async () => {
      try {
        const response = await api.get(`/api/jurusan/${id}/`);
        if (!response.data) {
          throw new Error('Data jurusan tidak ditemukan');
        }
        setFormData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching jurusan:', error);
        toast.error(
          error.response?.data?.message || 
          error.message || 
          'Gagal memuat data jurusan'
        );
        navigate('/dashboard/jurusan');
      }
    };

    fetchJurusan();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const sanitizeData = (data) => {
    return {
      ...data,
      nama_jurusan: data.nama_jurusan.trim(),
      kode_surat: data.kode_surat.trim().toUpperCase(),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Mohon periksa kembali form isian');
      return;
    }

    setIsSubmitting(true);
    const sanitizedData = sanitizeData(formData);

    try {
      const response = await api.put(`/api/jurusan/${id}/`, sanitizedData);
      if (response.data) {
        toast.success('Jurusan berhasil diperbarui');
        setIsDirty(false);
        navigate('/dashboard/jurusan');
      }
    } catch (error) {
      console.error('Error updating jurusan:', error);
      if (error.response?.status === 400) {
        const backendErrors = error.response.data;
        setErrors(backendErrors);
        toast.error('Terdapat kesalahan pada data yang diinput');
      } else if (error.response?.status === 404) {
        toast.error('Data jurusan tidak ditemukan');
        navigate('/dashboard/jurusan');
      } else {
        toast.error(
          error.response?.data?.message || 
          'Terjadi kesalahan saat memperbarui jurusan'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Perubahan yang belum disimpan akan hilang. Lanjutkan?')) {
        navigate('/dashboard/jurusan');
      }
    } else {
      navigate('/dashboard/jurusan');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Jurusan</h1>
        <p className="text-gray-600">Ubah informasi jurusan yang ada</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            {/* Nama Jurusan */}
            <div>
              <label htmlFor="nama_jurusan" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Jurusan
              </label>
              <input
                type="text"
                id="nama_jurusan"
                name="nama_jurusan"
                value={formData.nama_jurusan}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nama_jurusan ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan nama jurusan"
                disabled={isSubmitting}
              />
              {errors.nama_jurusan && (
                <p className="mt-1 text-sm text-red-600">{errors.nama_jurusan}</p>
              )}
            </div>

            {/* Kode Surat */}
            <div>
              <label htmlFor="kode_surat" className="block text-sm font-medium text-gray-700 mb-2">
                Kode Surat
              </label>
              <input
                type="text"
                id="kode_surat"
                name="kode_surat"
                value={formData.kode_surat}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.kode_surat ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan kode surat"
                disabled={isSubmitting}
              />
              {errors.kode_surat && (
                <p className="mt-1 text-sm text-red-600">{errors.kode_surat}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Pilih Status</option>
                <option value="Aktif">Aktif</option>
                <option value="NonAktif">Non Aktif</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2">Menyimpan</span>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                </span>
              ) : (
                'Simpan Perubahan'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJurusan;