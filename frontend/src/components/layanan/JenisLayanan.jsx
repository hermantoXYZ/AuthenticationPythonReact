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
} from "lucide-react";

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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Tambahan (Konfigurasi Form)
                  </label>
                  <div className="space-y-3">
                    {formData.konfigurasi_field.map((field, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm relative"
                      >
                        <span className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded shadow">
                          Field {idx + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="Nama Field (misal: ipk_terakhir)"
                          value={field.name}
                          onChange={e => updateFieldConfig(idx, "name", e.target.value)}
                          className="w-full sm:w-auto flex-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Label (misal: IPK Terakhir)"
                          value={field.label}
                          onChange={e => updateFieldConfig(idx, "label", e.target.value)}
                          className="w-full sm:w-auto flex-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                          required
                        />
                        <select
                          value={field.type}
                          onChange={e => updateFieldConfig(idx, "type", e.target.value)}
                          className="w-full sm:w-auto flex-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="file">File</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeFieldConfig(idx)}
                          className="w-full sm:w-auto ml-0 sm:ml-2 p-2 rounded-full bg-red-100 hover:bg-red-200 transition flex items-center justify-center"
                          title="Hapus Field"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addFieldConfig}
                    className="mt-4 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                  >
                    + Tambah Field
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