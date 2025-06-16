import React, { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { FileText, Loader2, Send } from "lucide-react";

const AjukanLayanan = () => {
  const [jenisLayanan, setJenisLayanan] = useState([]);
  const [formData, setFormData] = useState({
    jenis_layanan: "",
    isi_permohonan: "",
    file_permohonan: null,
  });
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    api.get("/api/jenis-layanan/")
      .then(res => setJenisLayanan(res.data))
      .catch(() => toast.error("Gagal memuat jenis layanan"));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file_permohonan") {
      setFormData(prev => ({ ...prev, file_permohonan: files[0] }));
      setFileName(files[0]?.name || "");
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("jenis_layanan", formData.jenis_layanan);
    data.append("isi_permohonan", formData.isi_permohonan);
    if (formData.file_permohonan) {
      data.append("file_permohonan", formData.file_permohonan);
    }
    try {
      await api.post("/api/layanan/", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Pengajuan layanan berhasil dikirim");
      setFormData({ jenis_layanan: "", isi_permohonan: "", file_permohonan: null });
      setFileName("");
    } catch (err) {
      toast.error("Gagal mengajukan layanan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
        <FileText className="w-6 h-6 text-blue-500" /> Ajukan Layanan
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Jenis Layanan */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">Jenis Layanan <span className="text-red-500">*</span></label>
          <select
            name="jenis_layanan"
            value={formData.jenis_layanan}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          >
            <option value="">Pilih Jenis Layanan</option>
            {jenisLayanan.map(jl => (
              <option key={jl.id} value={jl.id}>{jl.nama_layanan}</option>
            ))}
          </select>
        </div>
        {/* Isi Permohonan */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">Isi Permohonan <span className="text-red-500">*</span></label>
          <textarea
            name="isi_permohonan"
            value={formData.isi_permohonan}
            onChange={handleChange}
            required
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 resize-none"
            placeholder="Tuliskan alasan atau detail permohonan layanan yang Anda ajukan..."
          />
        </div>
        {/* File Pendukung */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">File Pendukung (opsional)</label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              name="file_permohonan"
              onChange={handleChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {fileName && (
              <span className="text-xs text-gray-500 truncate max-w-[120px]">{fileName}</span>
            )}
          </div>
        </div>
        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Ajukan Layanan
        </button>
      </form>
      <Toaster />
    </div>
  );
};

export default AjukanLayanan; 