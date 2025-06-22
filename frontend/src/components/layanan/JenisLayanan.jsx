import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../api";
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  ArrowLeft,
  Save,
  X,
  AlertCircle,
  Users,
} from "lucide-react";

const USER_TYPE_CHOICES = [
    { value: 'dekan_fakultas', label: 'Dekan Fakultas' },
    { value: 'pejabat_jurusan', label: 'Pejabat Jurusan' },
    { value: 'ketua_prodi', label: 'Ketua Prodi' },
    { value: 'staff_fakultas', label: 'Staff Fakultas' },
    { value: 'staff_prodi', label: 'Staff Prodi' },
    { value: 'dosen', label: 'Dosen' },
];

const JenisLayanan = () => {
  const navigate = useNavigate();
  const [jenisLayanan, setJenisLayanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama_layanan: "",
    deskripsi_layanan: "",
    prasyarat_layanan: "",
    konfigurasi_field: [],
    penandatangan_otomatis: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get("/api/jenis-layanan/");
      setJenisLayanan(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data");
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      nama_layanan: "",
      deskripsi_layanan: "",
      prasyarat_layanan: "",
      konfigurasi_field: [],
      penandatangan_otomatis: [],
    });
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      nama_layanan: item.nama_layanan || "",
      deskripsi_layanan: item.deskripsi_layanan || "",
      prasyarat_layanan: item.prasyarat_layanan || "",
      konfigurasi_field: item.konfigurasi_field || [],
      penandatangan_otomatis: item.penandatangan_otomatis || [],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus jenis layanan ini?")) {
      try {
        await api.delete(`/api/jenis-layanan/${id}/`);
        toast.success("Jenis layanan berhasil dihapus");
        fetchData();
      } catch (error) {
        console.error("Error deleting jenis layanan:", error);
        toast.error("Gagal menghapus jenis layanan");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/api/jenis-layanan/${editingId}/`, formData);
        toast.success("Jenis layanan berhasil diperbarui");
      } else {
        await api.post("/api/jenis-layanan/", formData);
        toast.success("Jenis layanan berhasil ditambahkan");
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response) {
        // Handle specific error responses
        switch (error.response.status) {
          case 400:
            toast.error("Data tidak valid. Silakan periksa kembali.");
            break;
          case 401:
            toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
            break;
          case 403:
            toast.error("Anda tidak memiliki akses untuk melakukan operasi ini.");
            break;
          case 404:
            toast.error("Data tidak ditemukan.");
            break;
          case 405:
            toast.error("Metode tidak diizinkan. Silakan hubungi administrator.");
            break;
          default:
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
        }
      } else {
        toast.error("Gagal menyimpan jenis layanan");
      }
    }
  };

  const addFieldConfig = () => {
    setFormData(prev => ({
      ...prev,
      konfigurasi_field: [
        ...prev.konfigurasi_field,
        { name: "", label: "", type: "text" }
      ]
    }));
  };

  const updateFieldConfig = (idx, key, value) => {
    setFormData(prev => ({
      ...prev,
      konfigurasi_field: prev.konfigurasi_field.map((f, i) =>
        i === idx ? { ...f, [key]: value } : f
      )
    }));
  };

  const removeFieldConfig = (idx) => {
    setFormData(prev => ({
      ...prev,
      konfigurasi_field: prev.konfigurasi_field.filter((_, i) => i !== idx)
    }));
  };

  const addSigner = () => {
    setFormData(prev => ({
      ...prev,
      penandatangan_otomatis: [
        ...prev.penandatangan_otomatis,
        { role: "", user_type: "dosen", order: prev.penandatangan_otomatis.length + 1 }
      ]
    }));
  };

  const updateSigner = (idx, key, value) => {
    setFormData(prev => ({
      ...prev,
      penandatangan_otomatis: prev.penandatangan_otomatis.map((s, i) =>
        i === idx ? { ...s, [key]: value } : s
      )
    }));
  };

  const removeSigner = (idx) => {
    setFormData(prev => ({
      ...prev,
      penandatangan_otomatis: prev.penandatangan_otomatis.filter((_, i) => i !== idx)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Manajemen Jenis Layanan</h2>
            </div>
            <button
              onClick={handleAdd}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Jenis Layanan</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Layanan</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jenisLayanan.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.nama_layanan}
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate">
                            {item.deskripsi_layanan}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
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

      {modalVisible && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingId ? "Edit Jenis Layanan" : "Tambah Jenis Layanan"}
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
              <div className="space-y-4 sm:space-y-6">
                {/* Nama Layanan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Layanan
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="nama_layanan"
                      value={formData.nama_layanan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan nama layanan..."
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Deskripsi Layanan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Layanan
                  </label>
                  <textarea
                    name="deskripsi_layanan"
                    value={formData.deskripsi_layanan}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan deskripsi layanan..."
                    required
                  />
                </div>

                {/* Prasyarat Layanan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prasyarat Layanan
                  </label>
                  <textarea
                    name="prasyarat_layanan"
                    value={formData.prasyarat_layanan}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan prasyarat layanan..."
                    required
                  />
                </div>

                {/* Field Tambahan (Konfigurasi Form) */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Field Tambahan (Konfigurasi Form)
                </label>
                <div className="space-y-4">
                  {formData.konfigurasi_field.map((field, idx) => (
                    <div
                      key={idx}
                      className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-md overflow-hidden"
                    >
                      {/* Label Field */}
                      <span className="absolute top-0 left-0 bg-yellow-600 text-white text-xs font-semibold px-3 py-1 rounded-br-lg shadow-md">
                        Field {idx + 1}
                      </span>

                      {/* Input Fields Container */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 sm:mt-0">
                        <input
                          type="text"
                          placeholder="Nama Field (misal: ipk_terakhir)"
                          value={field.name}
                          onChange={(e) => updateFieldConfig(idx, "name", e.target.value)}
                          className="w-full border-gray-300 focus:ring-yellow-500 focus:border-yellow-500 rounded-lg shadow-sm text-sm p-2.5 transition ease-in-out"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Label (misal: IPK Terakhir)"
                          value={field.label}
                          onChange={(e) => updateFieldConfig(idx, "label", e.target.value)}
                          className="w-full border-gray-300 focus:ring-yellow-500 focus:border-yellow-500 rounded-lg shadow-sm text-sm p-2.5 transition ease-in-out"
                          required
                        />
                        <select
                          value={field.type}
                          onChange={(e) => updateFieldConfig(idx, "type", e.target.value)}
                          className="w-full border-gray-300 focus:ring-yellow-500 focus:border-yellow-500 rounded-lg shadow-sm text-sm p-2.5 transition ease-in-out"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="file">File</option>
                        </select>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFieldConfig(idx)}
                        className="w-full sm:w-10 sm:h-10 flex-shrink-0 p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition duration-200 ease-in-out flex items-center justify-center self-center sm:self-auto focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        title="Hapus Field"
                      >
                        {/* Pastikan ikon Trash2 sudah diimpor dari library ikon yang Anda gunakan */}
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tombol Tambah Field */}
                <button
                  type="button"
                  onClick={addFieldConfig}
                  className="mt-6 w-full sm:w-auto px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold shadow-md hover:bg-yellow-700 transition duration-200 ease-in-out flex items-center justify-center gap-2 text-base"
                >
                  {/* Anda bisa menggunakan ikon plus, file, atau yang relevan di sini */}
                  <Plus className="w-5 h-5" />
                  Tambah Field
                </button>
              </div>
                
                {/* Konfigurasi Penandatangan */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Konfigurasi Penandatangan
                </label>
                <div className="space-y-4">
                  {formData.penandatangan_otomatis.map((signer, idx) => (
                    <div
                      key={idx}
                      className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-5 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden"
                    >
                      {/* Label Penandatangan */}
                      <span className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-br-lg shadow-md">
                        Penandatangan {idx + 1}
                      </span>

                      {/* Input Fields Container */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 sm:mt-0">
                        <input
                          type="text"
                          placeholder="Jabatan (misal: Ketua Prodi)"
                          value={signer.role}
                          onChange={(e) => updateSigner(idx, "role", e.target.value)}
                          className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm text-sm p-2.5 transition ease-in-out"
                          required
                        />
                        <select
                          value={signer.user_type}
                          onChange={(e) => updateSigner(idx, "user_type", e.target.value)}
                          className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm text-sm p-2.5 transition ease-in-out"
                        >
                          <option value="" disabled>Pilih Tipe Pengguna</option> {/* Added a default disabled option */}
                          {USER_TYPE_CHOICES.map((choice) => (
                            <option key={choice.value} value={choice.value}>
                              {choice.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Urutan"
                          value={signer.order}
                          onChange={(e) => updateSigner(idx, "order", parseInt(e.target.value, 10))}
                          className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm text-sm p-2.5 transition ease-in-out"
                          required
                          min="1"
                        />
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeSigner(idx)}
                        className="w-full sm:w-10 sm:h-10 flex-shrink-0 p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition duration-200 ease-in-out flex items-center justify-center self-center sm:self-auto focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        title="Hapus Penandatangan"
                      >
                        {/* Pastikan ikon Trash2 sudah diimpor dari library ikon yang Anda gunakan */}
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tombol Tambah Penandatangan */}
                <button
                  type="button"
                  onClick={addSigner}
                  className="mt-6 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition duration-200 ease-in-out flex items-center justify-center gap-2 text-base"
                >
                  {/* Pastikan ikon Users sudah diimpor */}
                  <Users className="w-5 h-5" />
                  Tambah Penandatangan
                </button>
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
                  {editingId ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JenisLayanan; 