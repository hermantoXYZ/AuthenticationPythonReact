import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "sonner";
import { FileText, Loader2, FileCheck, Download, Clock, CheckCircle2, AlertCircle, XCircle, Search, Eye, Users } from "lucide-react";

const statusConfig = {
  Waiting: {
    icon: Clock,
    text: "Menunggu Diproses",
    color: "bg-yellow-100 text-yellow-800"
  },
  Processing: {
    icon: FileCheck,
    text: "Sedang Diproses",
    color: "bg-blue-100 text-blue-800"
  },
  Completed: {
    icon: CheckCircle2,
    text: "Selesai",
    color: "bg-green-100 text-green-800"
  },
  Rejected: {
    icon: XCircle,
    text: "Ditolak",
    color: "bg-red-100 text-red-800"
  }
};

const DaftarAjuanLayanan = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAjuan = async () => {
      try {
        const res = await api.get("/api/layanan/?ordering=-tanggal_dibuat");
        setData(res.data.filter(item => item.mahasiswa));
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Gagal memuat daftar ajuan layanan");
      } finally {
        setLoading(false);
      }
    };
    fetchAjuan();
  }, []);

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.Waiting;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const filteredData = data.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    const jenisLayanan = item.jenis_layanan_nama || "";
    const isiPermohonan = item.isi_permohonan || "";
    const mahasiswaName = item.mahasiswa_name || "";
    const nim = item.mahasiswa_nim || "";

    return (
      jenisLayanan.toLowerCase().includes(searchTermLower) ||
      isiPermohonan.toLowerCase().includes(searchTermLower) ||
      mahasiswaName.toLowerCase().includes(searchTermLower) ||
      nim.toLowerCase().includes(searchTermLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daftar Ajuan Layanan Saya</h1>
          <p className="mt-2 text-gray-600">
            Kelola semua ajuan layanan yang telah Anda buat
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari berdasarkan nama mahasiswa, NIM, jenis layanan, atau isi permohonan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pemohon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program Studi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis Layanan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Isi Permohonan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.mahasiswa_name || "-"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.mahasiswa_nim || "-"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.program_studi_nama || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(item.tanggal_dibuat).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.jenis_layanan_nama || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                      {item.isi_permohonan}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.file_permohonan ? (
                      <a
                        href={item.file_permohonan}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Download</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => window.location.href = `/dashboard/layanan/detail/${item.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada ajuan layanan ditemukan</h3>
          <p className="text-gray-600 mb-4">Coba ubah kriteria pencarian Anda</p>
          <button
            onClick={() => setSearchTerm("")}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Pencarian
          </button>
        </div>
      )}
    </div>
  );
};

export default DaftarAjuanLayanan; 