import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School } from 'lucide-react';
import api from '../../api';
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const AddJurusan = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama_jurusan: '',
    kode_surat: '',
    status: 'Aktif'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/api/jurusan/', formData);
      toast.success('Jurusan berhasil ditambahkan');
    } catch (error) {
      console.error('Error adding jurusan:', error);
      toast.error(error.response?.data?.error || 'Gagal menambahkan jurusan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tambah Jurusan Baru</h1>
        <p className="text-gray-600">Isi formulir berikut untuk menambahkan jurusan baru</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit}>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama jurusan"
              />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan kode surat"
              />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Aktif">Aktif</option>
                <option value="NonAktif">Non Aktif</option>
              </select>
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Jurusan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/jurusan')}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
};

export default AddJurusan; 