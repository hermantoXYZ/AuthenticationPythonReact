import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  CheckCircle2,
  Clock,
  FileText,
  User,
  ArrowLeft,
  Save,
  X,
  ClipboardList,
  QrCode,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const TugasTandaTangan = () => {
  const navigate = useNavigate();
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [layananList, setLayananList] = useState([]);
  const [formData, setFormData] = useState({
    layanan_id: '',
    jabatan_penandatangan: '',
    user_penandatangan_id: '',
    jenis_tanda_tangan: 'manual',
    urutan: '',
    status: 'pending',
    file_tanda_tangan: null
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchSignatures();
    fetchUsers();
    fetchLayananList();
    fetchCurrentUser();
  }, []);

  const fetchSignatures = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/tanda-tangan/');
      setSignatures(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching signatures:', error);
      toast.error('Gagal mengambil data tanda tangan');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal mengambil data pengguna');
    }
  };

  const fetchLayananList = async () => {
    try {
      const response = await api.get('/api/layanan/');
      setLayananList(response.data);
    } catch (error) {
      console.error('Error fetching layanan list:', error);
      toast.error('Gagal mengambil data layanan');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/api/profile/');
      setCurrentUser(response.data);
    } catch (error) {
      toast.error('Gagal memuat data profil pengguna');
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      layanan_id: '',
      jabatan_penandatangan: '',
      user_penandatangan_id: '',
      jenis_tanda_tangan: 'manual',
      urutan: '',
      status: 'pending',
      file_tanda_tangan: null
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setFormData({
      layanan_id: record.layanan.id,
      jabatan_penandatangan: record.jabatan_penandatangan,
      user_penandatangan_id: record.user_penandatangan?.id || '',
      jenis_tanda_tangan: record.jenis_tanda_tangan,
      urutan: record.urutan,
      status: record.status,
      file_tanda_tangan: null
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tanda tangan ini?')) {
    try {
        await api.delete(`/api/tanda-tangan/${id}/`);
        toast.success('Tanda tangan berhasil dihapus');
      fetchSignatures();
    } catch (error) {
        console.error('Error deleting signature:', error);
        toast.error('Gagal menghapus tanda tangan');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use FormData for file uploads
    const dataToSubmit = new FormData();
    dataToSubmit.append('layanan_id', formData.layanan_id);
    dataToSubmit.append('jabatan_penandatangan', formData.jabatan_penandatangan);
    dataToSubmit.append('jenis_tanda_tangan', formData.jenis_tanda_tangan);
    dataToSubmit.append('urutan', formData.urutan);
    dataToSubmit.append('status', formData.status);

    if (formData.user_penandatangan_id) {
        dataToSubmit.append('user_penandatangan_id', formData.user_penandatangan_id);
    }
    
    // Only append file if it's selected
    if (formData.file_tanda_tangan) {
      dataToSubmit.append('file_tanda_tangan', formData.file_tanda_tangan);
    }

    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };

    try {
      if (editingId) {
        // Use PATCH for updates to handle partial data and files correctly
        await api.patch(`/api/tanda-tangan/${editingId}/`, dataToSubmit, config);
        toast.success('Tanda tangan berhasil diperbarui');
      } else {
        await api.post('/api/tanda-tangan/', dataToSubmit, config);
        toast.success('Tanda tangan berhasil ditambahkan');
      }
      setModalVisible(false);
      fetchSignatures();
    } catch (error) {
      console.error('Error saving signature:', error);
      let errorMessage = 'Gagal menyimpan tanda tangan. ';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage += Object.values(error.response.data).flat().join(', ');
        } else if (error.response.status === 401) {
          errorMessage += 'Sesi Anda telah berakhir. Silakan login kembali.';
        } else if (error.response.status === 403) {
          errorMessage += 'Anda tidak memiliki izin untuk mengubah data ini.';
        } else {
          errorMessage += `Server error (${error.response.status}).`;
        }
      } else if (error.request) {
        errorMessage += 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else {
        errorMessage += 'Terjadi kesalahan tidak terduga.';
      }
      
      toast.error(errorMessage);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file_tanda_tangan: e.target.files[0]
    }));
  };

  const showQrCode = (signature) => {
    setSelectedSignature(signature);
    setQrModalVisible(true);
  };

  const getVerificationUrl = (signature) => {
    if (!signature || !signature.tanda_tangan_elektronik) return "";
    return `${window.location.origin}/verify/signature/${signature.tanda_tangan_elektronik}`;
  }

  const filteredSignatures = currentUser
    ? signatures.filter(sig => sig.user_penandatangan?.id === currentUser.id)
    : [];

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Manajemen Tanda Tangan</h2>
            </div>
            {/* <button
              onClick={handleAdd}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Tanda Tangan</span>
            </button> */}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Layanan</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penandatangan</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urutan</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSignatures.map((signature) => (
                      <tr key={signature.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{signature.layanan?.jenis_layanan_nama || 'N/A'}</div>
                          <div className="text-gray-500 text-xs">{signature.layanan?.mahasiswa_name || ''}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{signature.jabatan_penandatangan}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{signature.user_penandatangan?.full_name || '-'}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            signature.jenis_tanda_tangan === 'elektronik' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {signature.jenis_tanda_tangan === 'elektronik' ? 'Elektronik' : 'Manual'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            signature.status === 'signed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {signature.status === 'signed' ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Sudah Ditandatangani</span>
                                <span className="sm:hidden">Sudah</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Belum Ditandatangani</span>
                                <span className="sm:hidden">Belum</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{signature.urutan}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            {signature.status === 'signed' && signature.jenis_tanda_tangan === 'elektronik' && signature.tanda_tangan_elektronik && (
                              <button
                                onClick={() => showQrCode(signature)}
                                className="p-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Lihat QR Code"
                              >
                                <QrCode className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(signature)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(signature.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {qrModalVisible && selectedSignature && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md text-center p-6">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Kode QR Tanda Tangan
                </h3>
                <button
                  onClick={() => setQrModalVisible(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg">
                <QRCodeCanvas 
                  value={getVerificationUrl(selectedSignature)} 
                  size={256}
                  level="H"
                  imageSettings={{
                      src: '/logo.png',
                      height: 48,
                      width: 48,
                      excavate: true,
                  }}
                />
                <p className="mt-4 text-sm text-gray-600">
                    Pindai kode ini untuk verifikasi keaslian dokumen.
                </p>
                <p className="mt-2 text-xs text-gray-500 break-all">
                    {getVerificationUrl(selectedSignature)}
                </p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setQrModalVisible(false)}
                  className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                >
                  Tutup
                </button>
              </div>
          </div>
        </div>
      )}


      {modalVisible && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingId ? 'Edit Tanda Tangan' : 'Tambah Tanda Tangan'}
                </h3>
                <button
                  onClick={() => setModalVisible(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Layanan Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Layanan
                  </label>
                  <div className="relative">
                    <select
                      name="layanan_id"
                      value={formData.layanan_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      required
                    >
                      <option value="">Pilih Layanan</option>
                      {layananList.map((layanan) => (
                        <option key={layanan.id} value={layanan.id}>
                          {layanan.jenis_layanan_nama} - {layanan.mahasiswa_name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ClipboardList className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Jabatan Penandatangan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jabatan Penandatangan
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="jabatan_penandatangan"
                      value={formData.jabatan_penandatangan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: Dekan, Ketua Prodi"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Penandatangan Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penandatangan
                  </label>
                  <div className="relative">
                    <select
                      name="user_penandatangan_id"
                      value={formData.user_penandatangan_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Pilih Penandatangan (Opsional)</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Jenis Tanda Tangan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Tanda Tangan
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, jenis_tanda_tangan: 'manual' }))}
                      className={`p-3 sm:p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                        formData.jenis_tanda_tangan === 'manual'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm font-medium">Manual</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, jenis_tanda_tangan: 'elektronik' }))}
                      className={`p-3 sm:p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                        formData.jenis_tanda_tangan === 'elektronik'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm font-medium">Elektronik</span>
                    </button>
                  </div>
                </div>

                {/* Urutan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urutan
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="urutan"
                      value={formData.urutan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <span className="text-gray-400">#</span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      required
                    >
                      <option value="pending">Belum Ditandatangani</option>
                      <option value="signed">Sudah Ditandatangani</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <CheckCircle2 className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Tanda Tangan (jika manual)
                  </label>
                  <div className="mt-1 flex justify-center px-4 sm:px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                    <div className="space-y-2 text-center">
                      <div className="flex flex-col items-center">
                        <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                        <div className="flex flex-col sm:flex-row text-sm text-gray-600 mt-2">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Upload file</span>
                            <input
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              accept="image/*"
                            />
                          </label>
                          <p className="mt-1 sm:mt-0 sm:pl-1">atau drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF sampai 10MB
                        </p>
                      </div>
                      {formData.file_tanda_tangan && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            File dipilih: {formData.file_tanda_tangan.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalVisible(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TugasTandaTangan;