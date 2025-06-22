import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "sonner";
import { 
  FileText, 
  Loader2, 
  FileCheck, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Search, 
  Eye, 
  Users, 
  Trash2,
  User,
  Building,
  File,
  Link,
  X,
  Calendar,
  ArrowLeft,
  Plus,
  Save,
  Building2,
  GraduationCap
} from "lucide-react";

const statusConfig = {
  Waiting: {
    icon: Clock,
    text: "Menunggu Diproses",
    color: "bg-yellow-100 text-yellow-800",
    bgColor: "bg-yellow-50"
  },
  Processing: {
    icon: FileCheck,
    text: "Sedang Diproses",
    color: "bg-blue-100 text-blue-800",
    bgColor: "bg-blue-50"
  },
  Completed: {
    icon: CheckCircle2,
    text: "Selesai",
    color: "bg-green-100 text-green-800",
    bgColor: "bg-green-50"
  },
  Rejected: {
    icon: XCircle,
    text: "Ditolak",
    color: "bg-red-100 text-red-800",
    bgColor: "bg-red-50"
  }
};

const DaftarAjuanLayanan = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLayanan, setSelectedLayanan] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLayanan, setDetailLayanan] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  // State for Nomor Surat Modal
  const [showNomorSuratModal, setShowNomorSuratModal] = useState(false);
  const [showSelectNomorSuratModal, setShowSelectNomorSuratModal] = useState(false);
  const [nomorSuratFormData, setNomorSuratFormData] = useState({
    tahun: '',
    nomor: '',
    jenis: 'KM',
    perihal: '',
    tujuan: '',
    jurusan: '',
    program_studi: '',
    status: 'aktif',
  });
  const [isSubmittingNomorSurat, setIsSubmittingNomorSurat] = useState(false);
  const [jurusanList, setJurusanList] = useState([]);
  const [prodiList, setProdiList] = useState([]);
  const [nomorSuratList, setNomorSuratList] = useState([]);
  const [nomorSuratLoading, setNomorSuratLoading] = useState(false);
  const [nomorSuratSearchTerm, setNomorSuratSearchTerm] = useState('');
  const [isLinkingNomorSurat, setIsLinkingNomorSurat] = useState(false);

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

    const fetchJurusan = async () => {
      try {
          const response = await api.get('/api/jurusan/');
          setJurusanList(response.data);
      } catch (error) {
          console.error('Error fetching jurusan:', error);
          toast.error('Gagal mengambil data jurusan');
      }
    };

    const fetchProdi = async () => {
        try {
            const response = await api.get('/api/prodi/');
            setProdiList(response.data);
        } catch (error) {
            console.error('Error fetching prodi:', error);
            toast.error('Gagal mengambil data program studi');
        }
    };

    fetchAjuan();
    fetchJurusan();
    fetchProdi();
  }, []);

  const fetchNomorSurat = async () => {
    setNomorSuratLoading(true);
    try {
        const response = await api.get('/api/nomor-surat/?status=aktif');
        setNomorSuratList(response.data);
    } catch (error) {
        console.error('Error fetching nomor surat:', error);
        toast.error('Gagal memuat daftar nomor surat.');
    } finally {
        setNomorSuratLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLayanan) return;
    
    setDeleteLoading(true);
    try {
      await api.delete(`/api/layanan/${selectedLayanan.id}/`);
      setData(data.filter(item => item.id !== selectedLayanan.id));
      toast.success("Ajuan layanan berhasil dihapus");
      setShowDeleteModal(false);
      setSelectedLayanan(null);
    } catch (err) {
      console.error("Error deleting layanan:", err);
      toast.error("Gagal menghapus ajuan layanan");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (layanan) => {
    setSelectedLayanan(layanan);
    setShowDeleteModal(true);
  };

  const openDetail = async (layanan) => {
    setDetailLoading(true);
    setShowDetail(true);
    
    try {
      const response = await api.get(`/api/layanan/${layanan.id}/`);
      setDetailLayanan(response.data);
    } catch (error) {
      console.error("Error fetching layanan detail:", error);
      toast.error("Gagal memuat detail layanan");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCetakSurat = async (layananId) => {
    setPrintLoading(true);
    try {
      const response = await api.get(`/api/layanan/${layananId}/cetak-surat/`);
      const htmlContent = response.data;

      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.onload = () => {
          newWindow.focus();
          newWindow.print();
        };
      } else {
        toast.error("Gagal membuka tab baru. Mohon izinkan pop-up untuk situs ini.");
      }
    } catch (error) {
      console.error("Gagal membuat surat:", error);
      toast.error("Gagal membuat surat. Pastikan template dan data sudah benar.");
    } finally {
      setPrintLoading(false);
    }
  };

  const closeDetail = () => {
    setShowDetail(false);
    setDetailLayanan(null);
  };

  const openNomorSuratModal = (layanan) => {
    setNomorSuratFormData({
      tahun: new Date().getFullYear().toString(),
      nomor: '',
      jenis: 'KM',
      perihal: `Surat ${layanan.jenis_layanan_nama} a.n. ${layanan.mahasiswa_name}`,
      tujuan: layanan.mahasiswa_name,
      jurusan: layanan.program_studi_jurusan_id || '',
      program_studi: layanan.program_studi || '',
      status: 'aktif',
    });
    setSelectedLayanan(layanan);
    setShowNomorSuratModal(true);
  };

  const openSelectNomorSuratModal = (layanan) => {
    setSelectedLayanan(layanan);
    fetchNomorSurat();
    setShowSelectNomorSuratModal(true);
  };

  const handleNomorSuratInputChange = (e) => {
    const { name, value } = e.target;
    setNomorSuratFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNomorSuratSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingNomorSurat(true);
    try {
        const submitData = {
            ...nomorSuratFormData,
            nomor: parseInt(nomorSuratFormData.nomor, 10),
            jurusan: nomorSuratFormData.jurusan || null,
            program_studi: nomorSuratFormData.program_studi || null,
        };

        if (!submitData.nomor || !submitData.tahun || !submitData.perihal || !submitData.tujuan) {
          toast.error("Pastikan semua field nomor surat terisi.");
          return;
        }

        const nomorSuratResponse = await api.post('/api/nomor-surat/', submitData);
        const newNomorSurat = nomorSuratResponse.data;
        toast.success('Nomor surat berhasil dibuat.');

        await api.patch(`/api/layanan/${selectedLayanan.id}/`, {
            nomor_surat: newNomorSurat.id,
        });
        toast.success('Layanan berhasil diperbarui dengan nomor surat.');

        setShowNomorSuratModal(false);
        // Refresh detail view by re-fetching the layanan details
        openDetail(selectedLayanan);

    } catch (error) {
        console.error('Error creating nomor surat:', error);
        toast.error(error.response?.data?.detail || 'Gagal membuat nomor surat.');
    } finally {
        setIsSubmittingNomorSurat(false);
    }
  };

  const handleLinkNomorSurat = async (nomorSuratId) => {
    setIsLinkingNomorSurat(true);
    try {
      await api.patch(`/api/layanan/${selectedLayanan.id}/`, {
        nomor_surat: nomorSuratId,
      });
      toast.success('Nomor surat berhasil ditautkan.');
      setShowSelectNomorSuratModal(false);
      openDetail(selectedLayanan); // Refresh detail view
    } catch (error) {
      console.error('Error linking nomor surat:', error);
      toast.error(error.response?.data?.detail || 'Gagal menautkan nomor surat.');
    } finally {
      setIsLinkingNomorSurat(false);
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getVerificationStatus = (layanan) => {
    const hasMainFile = !!layanan.file_permohonan;
    const hasSupportFiles = layanan.file_tambahan && layanan.file_tambahan.length > 0;
    const hasAdditionalData = layanan.data_tambahan && Object.keys(layanan.data_tambahan).length > 0;
    
    return {
      mainFile: hasMainFile,
      supportFiles: hasSupportFiles,
      additionalData: hasAdditionalData,
      overall: hasMainFile && hasSupportFiles && hasAdditionalData
    };
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

  // Detail View
  if (showDetail && detailLayanan) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={closeDetail}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Detail Ajuan Layanan</h1>
              <p className="text-gray-600">Informasi lengkap ajuan layanan</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {detailLayanan.status === 'Completed' && (
                <button
                  onClick={() => handleCetakSurat(detailLayanan.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                  disabled={printLoading}
                >
                  {printLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memuat...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Cetak Surat
                    </>
                  )}
                </button>
            )}
            {detailLayanan.status === 'Waiting' && (
              <>
                <button
                  onClick={() => window.location.href = `/dashboard/layanan/edit/${detailLayanan.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(detailLayanan)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </>
            )}
          </div>
        </div>

        {detailLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Status Verifikasi */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Status Verifikasi</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">File Permohonan</span>
                      {getVerificationStatus(detailLayanan).mainFile ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          ✓ Terverifikasi
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          ✗ Belum ada file
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">File Pendukung</span>
                      {getVerificationStatus(detailLayanan).supportFiles ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          ✓ {detailLayanan.file_tambahan?.length || 0} file terverifikasi
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          ⚠ Belum ada file pendukung
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Data Tambahan</span>
                      {getVerificationStatus(detailLayanan).additionalData ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          ✓ Lengkap
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          ⚠ Belum ada data
                        </span>
                      )}
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Status Keseluruhan</span>
                        {getVerificationStatus(detailLayanan).overall ? (
                          <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                            ✓ Siap Diproses
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            ⚠ Perlu Dilengkapi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informasi Pemohon */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Informasi Pemohon</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
                      <p className="border border-gray-200 rounded-lg p-2 bg-gray-50 mt-2">{detailLayanan.mahasiswa_name || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">NIM</label>
                      <p className="border border-gray-200 rounded-lg p-2 bg-gray-50 mt-2">{detailLayanan.mahasiswa_username || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="border border-gray-200 rounded-lg p-2 bg-gray-50 mt-2">{detailLayanan.mahasiswa_email || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nomor Telepon</label>
                      <p className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-2">{detailLayanan.mahasiswa_phone || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Informasi Program Studi */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Program Studi</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nama Program Studi</label>
                      <p className="border border-gray-200 rounded-lg p-2 bg-gray-50 mt-2">{detailLayanan.program_studi_nama || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fakultas</label>
                      <p className="border border-gray-200 rounded-lg p-2 bg-gray-50 mt-2">{detailLayanan.program_studi_fakultas || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Jenjang</label>
                      <p className="border border-gray-200 rounded-lg p-2 bg-gray-50 mt-2">{detailLayanan.program_studi_jenjang || "-"}</p>
                    </div>
                  </div>
                </div>
                
                {/* Jenis Layanan */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Jenis Layanan</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nama Layanan</label>
                      <p className="border border-gray-200 rounded-lg p-2 bg-gray-50 mt-2">{detailLayanan.jenis_layanan_nama || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Deskripsi</label>
                      <p className="border border-gray-200 rounded-lg p-2 bg-gray-50 mt-2">{detailLayanan.jenis_layanan_deskripsi || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Prasyarat</label>
                      <p className="border border-gray-200 rounded-lg p-2 bg-gray-50 mt-2">{detailLayanan.jenis_layanan_prasyarat || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                
                {/* Nomor Surat */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-red-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Nomor Surat</h3>
                    </div>
                    {detailLayanan.nomor_surat ? (
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Nomor Lengkap</label>
                                <p className="text-sm font-medium text-gray-900">{detailLayanan.nomor_surat_full || "-"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Perihal</label>
                                <p className="text-sm text-gray-900">{detailLayanan.nomor_surat_perihal || "-"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Tujuan</label>
                                <p className="text-sm text-gray-900">{detailLayanan.nomor_surat_tujuan || "-"}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={() => openNomorSuratModal(detailLayanan)}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex-1"
                            >
                                <Plus className="w-4 h-4" />
                                Buat Baru
                            </button>
                            <button
                                onClick={() => openSelectNomorSuratModal(detailLayanan)}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors flex-1"
                            >
                                <Link className="w-4 h-4" />
                                Pilih Yang Ada
                            </button>
                        </div>
                    )}
                </div>
                {/* Isi Permohonan */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Isi Permohonan</h3>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{detailLayanan.isi_permohonan || "-"}</p>
                  </div>
                </div>
                
                {/* File Permohonan */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <File className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">File Permohonan</h3>
                  </div>
                  {detailLayanan.file_permohonan ? (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <label className="text-sm font-semibold text-gray-700">
                              File Permohonan Utama
                            </label>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p>
                              <span className="font-medium">File:</span> {detailLayanan.file_permohonan.split('/').pop()}
                            </p>
                            <p>
                              <span className="font-medium">Status:</span> 
                              <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                ✓ Terverifikasi
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <a
                            href={detailLayanan.file_permohonan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                          <button
                            onClick={() => window.open(detailLayanan.file_permohonan, '_blank')}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-500">Tidak ada file yang diunggah</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* File Pendukung */}
                {detailLayanan.file_tambahan && detailLayanan.file_tambahan.length > 0 && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <File className="w-5 h-5 text-amber-600" />
                      <h3 className="text-lg font-semibold text-gray-900">File Pendukung</h3>
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                        {detailLayanan.file_tambahan.length} file
                      </span>
                    </div>
                    <div className="space-y-4">
                      {detailLayanan.file_tambahan.map((fileItem, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <File className="w-4 h-4 text-amber-600" />
                                <label className="text-sm font-semibold text-gray-700 capitalize">
                                  {fileItem.nama_field.replace(/_/g, ' ')}
                                </label>
                              </div>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p>
                                  <span className="font-medium">Upload:</span> {new Date(fileItem.tanggal_upload).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </p>
                                <p>
                                  <span className="font-medium">File:</span> {fileItem.file.split('/').pop()}
                                </p>
                                <p>
                                  <span className="font-medium">Status:</span> 
                                  <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                    ✓ Terverifikasi
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <a
                                href={fileItem.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                              <button
                                onClick={() => window.open(fileItem.file, '_blank')}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Preview
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <p className="text-sm text-green-800 font-medium">
                          Semua file pendukung telah diverifikasi dan siap diproses
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Data Tambahan */}
                {detailLayanan.data_tambahan && Object.keys(detailLayanan.data_tambahan).length > 0 && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Data Tambahan</h3>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(detailLayanan.data_tambahan).map(([key, value]) => (
                        <div key={key}>
                          <label className="text-sm font-medium text-gray-600 capitalize">
                            {key.replace(/_/g, ' ')}
                          </label>
                          <p className="border border-gray-200 rounded-lg p-2 bg-gray-50 mt-2">{value || "-"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hasil Proses */}
                {(detailLayanan.hasil_proses || detailLayanan.file_hasil || detailLayanan.link_hasil) && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Hasil Proses</h3>
                    </div>
                    <div className="space-y-4">
                      {detailLayanan.hasil_proses && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Keterangan Hasil</label>
                          <div className="bg-gray-50 p-4 rounded-lg mt-1">
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{detailLayanan.hasil_proses}</p>
                          </div>
                        </div>
                      )}
                      
                      {detailLayanan.file_hasil && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">File Hasil</label>
                          <div className="mt-1">
                            <a
                              href={detailLayanan.file_hasil}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download Hasil
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {detailLayanan.link_hasil && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Link Hasil</label>
                          <div className="mt-1">
                            <a
                              href={detailLayanan.link_hasil}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Link className="w-4 h-4" />
                              Buka Link
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informasi Admin Pemroses */}
                {detailLayanan.admin_pemroses && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Admin Pemroses</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nama Admin</label>
                        <p className="text-sm text-gray-900">{detailLayanan.admin_pemroses_name || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-sm text-gray-900">{detailLayanan.admin_pemroses_email || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Jabatan</label>
                        <p className="text-sm text-gray-900">{detailLayanan.admin_pemroses_user_type || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Hapus</h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus ajuan layanan ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedLayanan(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={deleteLoading}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menghapus...
                    </div>
                  ) : (
                    "Hapus"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Nomor Surat Modal */}
        {showNomorSuratModal && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Buat Nomor Surat</h2>
                <button
                  onClick={() => setShowNomorSuratModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleNomorSuratSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tahun */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                    <div className="relative">
                      <input
                        type="text" name="tahun" value={nomorSuratFormData.tahun}
                        onChange={handleNomorSuratInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" required
                      />
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Nomor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nomor</label>
                    <div className="relative">
                      <input
                        type="number" name="nomor" value={nomorSuratFormData.nomor}
                        onChange={handleNomorSuratInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" required
                      />
                      <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Jenis */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jenis</label>
                    <input
                      type="text" name="jenis" value={nomorSuratFormData.jenis}
                      onChange={handleNomorSuratInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" required
                    />
                  </div>

                  {/* Perihal */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Perihal</label>
                    <input
                      type="text" name="perihal" value={nomorSuratFormData.perihal}
                      onChange={handleNomorSuratInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" required
                    />
                  </div>

                  {/* Tujuan */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tujuan</label>
                    <input
                      type="text" name="tujuan" value={nomorSuratFormData.tujuan}
                      onChange={handleNomorSuratInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" required
                    />
                  </div>

                  {/* Jurusan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jurusan</label>
                    <div className="relative">
                      <select name="jurusan" value={nomorSuratFormData.jurusan} onChange={handleNomorSuratInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white">
                        <option value="">Pilih Jurusan</option>
                        {jurusanList.map((jurusan) => (
                          <option key={jurusan.id} value={jurusan.id}>{jurusan.nama_jurusan}</option>
                        ))}
                      </select>
                      <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Program Studi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Program Studi</label>
                    <div className="relative">
                      <select name="program_studi" value={nomorSuratFormData.program_studi} onChange={handleNomorSuratInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white">
                        <option value="">Pilih Program Studi</option>
                        {prodiList.map((prodi) => (
                          <option key={prodi.id} value={prodi.id}>{prodi.nama}</option>
                        ))}
                      </select>
                      <GraduationCap className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowNomorSuratModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Batal
                  </button>
                  <button type="submit" disabled={isSubmittingNomorSurat}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {isSubmittingNomorSurat ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2 inline" />Menyimpan...</>
                    ) : (
                      <><Save className="h-4 w-4 mr-2 inline" />Simpan</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Select Nomor Surat Modal */}
        {showSelectNomorSuratModal && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl mx-4 h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Pilih Nomor Surat</h2>
                <button onClick={() => setShowSelectNomorSuratModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Cari berdasarkan perihal, tujuan, atau nomor..."
                  value={nomorSuratSearchTerm}
                  onChange={(e) => setNomorSuratSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {nomorSuratLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Nomor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Perihal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Tanggal</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {nomorSuratList
                        .filter(item => {
                          const searchTerm = nomorSuratSearchTerm.toLowerCase();
                          return (
                            item.full_nomor.toLowerCase().includes(searchTerm) ||
                            item.perihal.toLowerCase().includes(searchTerm) ||
                            item.tujuan.toLowerCase().includes(searchTerm)
                          );
                        })
                        .map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 font-medium text-gray-900">{item.full_nomor}</td>
                            <td className="px-6 py-4 text-gray-700">{item.perihal}</td>
                            <td className="px-6 py-4 text-gray-700">{formatDate(item.tanggal_dibuat)}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleLinkNomorSurat(item.id)}
                                disabled={isLinkingNomorSurat}
                                className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                              >
                                {isLinkingNomorSurat ? '...' : 'Pilih'}
                              </button>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daftar Ajuan Layanan</h1>
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
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.mahasiswa_name || "-"}
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
                      {formatDate(item.tanggal_dibuat)}
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openDetail(item)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Lihat Detail"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {item.status === 'Waiting' && (
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="text-red-600 hover:text-red-900"
                          title="Hapus"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus ajuan layanan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedLayanan(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={deleteLoading}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghapus...
                  </div>
                ) : (
                  "Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarAjuanLayanan; 