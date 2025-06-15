import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../api';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  FileText,
  Users,
  FileCheck,
  BookOpen,
  Search,
  Filter,
  Eye,
  Check,
  X,
  MessageSquare,
  ArrowLeft,
  UserPlus,
  UserCheck,
  Trash2,
  FileEdit,
  FileUp,
  ArrowRight
} from 'lucide-react';

const DaftarJudulFix = () => {
  const [pengajuan, setPengajuan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dosenList, setDosenList] = useState([]);
  const [showPembimbingModal, setShowPembimbingModal] = useState(false);
  const [selectedPembimbingType, setSelectedPembimbingType] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSKModal, setShowSKModal] = useState(false);
  const [showRevisiModal, setShowRevisiModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showPerpanjangModal, setShowPerpanjangModal] = useState(false);
  const [showSeminarModal, setShowSeminarModal] = useState(false);

  useEffect(() => {
    fetchPengajuan();
    fetchDosenList();
  }, []);

  const fetchDosenList = async () => {
    try {
      const response = await api.get('/api/users/dosen/');
      setDosenList(response.data);
    } catch (error) {
      console.error('Error fetching dosen list:', error);
      toast.error('Gagal memuat daftar dosen');
    }
  };

  const fetchPengajuan = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/skripsi/pengajuan/');
      console.log('Response data:', response.data);
      // Filter hanya pengajuan yang sudah diterima
      const acceptedSubmissions = response.data.filter(item => item.status === 'accepted');
      setPengajuan(acceptedSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Gagal memuat daftar judul fix');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (item) => {
    try {
      const response = await api.get(`/api/skripsi/pengajuan/${item.id}/`);
      console.log('Detail response:', response.data);
      setSelectedPengajuan(response.data);
      setShowDetail(true);
    } catch (error) {
      console.error('Error fetching detail:', error);
      toast.error('Gagal memuat detail pengajuan');
    }
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedPengajuan(null);
  };

  const handleSetJudulFix = async (pengajuanId, judulFix) => {
    try {
      setIsSaving(true);
      console.log('Setting fixed title:', {
        id: pengajuanId,
        judul_diterima: judulFix
      });

      const response = await api.patch(`/api/skripsi/pengajuan/${pengajuanId}/`, {
        judul_diterima: judulFix
      });
      
      console.log('Response:', response.data);
      
      // Update local state
      setPengajuan(pengajuan.map(item => 
        item.id === pengajuanId 
          ? { ...item, judul_diterima: judulFix } 
          : item
      ));
      
      toast.success('Judul fix berhasil disimpan');
      setShowDetail(false);
      setSelectedPengajuan(null);
    } catch (error) {
      console.error('Error setting fixed title:', error);
      toast.error('Gagal menyimpan judul fix');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetPembimbing = async (pengajuanId, pembimbingId, type) => {
    try {
      setIsSaving(true);
      
      // Get current pengajuan data
      const currentPengajuan = pengajuan.find(item => item.id === pengajuanId);
      if (!currentPengajuan) {
        throw new Error('Data pengajuan tidak ditemukan');
      }

      // Prepare data with all required fields
      const data = {
        [`pembimbing_${type}`]: pembimbingId,
        // Include existing data to prevent validation errors
        judul_1: currentPengajuan.judul_1,
        deskripsi_1: currentPengajuan.deskripsi_1,
        judul_2: currentPengajuan.judul_2,
        deskripsi_2: currentPengajuan.deskripsi_2,
        judul_3: currentPengajuan.judul_3,
        deskripsi_3: currentPengajuan.deskripsi_3,
        status: currentPengajuan.status,
        judul_diterima: currentPengajuan.judul_diterima
      };

      console.log('Sending data:', data);
      const response = await api.patch(`/api/skripsi/pengajuan/${pengajuanId}/`, data);
      console.log('Response:', response.data);
      
      // Update local state
      setPengajuan(pengajuan.map(item => 
        item.id === pengajuanId 
          ? { 
              ...item, 
              [`pembimbing_${type}`]: response.data[`pembimbing_${type}`],
              [`pembimbing_${type}_name`]: response.data[`pembimbing_${type}_name`]
            } 
          : item
      ));
      
      // Update selected pengajuan
      setSelectedPengajuan(prev => ({
        ...prev,
        [`pembimbing_${type}`]: response.data[`pembimbing_${type}`],
        [`pembimbing_${type}_name`]: response.data[`pembimbing_${type}_name`]
      }));
      
      toast.success(`Pembimbing ${type} berhasil diset`);
      setShowPembimbingModal(false);
      setSelectedPembimbingType(null);
    } catch (error) {
      console.error('Error setting pembimbing:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else if (error.response?.data) {
        // Handle validation errors
        const errorMessages = Object.values(error.response.data).flat();
        toast.error(errorMessages[0] || 'Gagal menyet pembimbing');
      } else {
        toast.error('Gagal menyet pembimbing');
      }
    } finally {
      setIsSaving(false);
    }
  };


  const handleCreateSK = async (pengajuanId) => {
    try {
      setIsSaving(true);
      const response = await api.post(`/api/skripsi/pengajuan/${pengajuanId}/create-sk/`);
      toast.success('SK berhasil dibuat');
      setShowSKModal(false);
      // Refresh data
      fetchPengajuan();
    } catch (error) {
      console.error('Error creating SK:', error);
      toast.error('Gagal membuat SK');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevisiSK = async (pengajuanId) => {
    try {
      setIsSaving(true);
      const response = await api.post(`/api/skripsi/pengajuan/${pengajuanId}/revisi-sk/`);
      toast.success('Revisi SK berhasil diajukan');
      setShowRevisiModal(false);
      // Refresh data
      fetchPengajuan();
    } catch (error) {
      console.error('Error revising SK:', error);
      toast.error('Gagal mengajukan revisi SK');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanjutProposal = async (pengajuanId) => {
    try {
      setIsSaving(true);
      const response = await api.post(`/api/skripsi/pengajuan/${pengajuanId}/lanjut-proposal/`);
      toast.success('Berhasil lanjut ke proposal');
      // Redirect ke halaman proposal
      window.location.href = `/dashboard/skripsi/proposal/${pengajuanId}`;
    } catch (error) {
      console.error('Error continuing to proposal:', error);
      toast.error('Gagal lanjut ke proposal');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePerpanjangSK = async (pengajuanId) => {
    try {
      setIsSaving(true);
      const response = await api.post(`/api/skripsi/pengajuan/${pengajuanId}/perpanjang-sk/`);
      toast.success('Surat Keputusan berhasil diperpanjang');
      setShowPerpanjangModal(false);
      // Refresh data
      fetchPengajuan();
    } catch (error) {
      console.error('Error perpanjang SK:', error);
      toast.error('Gagal memperpanjang Surat Keputusan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAjukanSeminar = async (pengajuanId) => {
    try {
      setIsSaving(true);
      const response = await api.post(`/api/skripsi/pengajuan/${pengajuanId}/ajukan-seminar/`);
      toast.success('Seminar proposal berhasil diajukan');
      setShowSeminarModal(false);
      // Refresh data
      fetchPengajuan();
    } catch (error) {
      console.error('Error ajukan seminar:', error);
      toast.error('Gagal mengajukan seminar proposal');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPengajuan = pengajuan.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    const mahasiswaName = item.mahasiswa_name || '';
    const judulFix = item.judul_diterima || '';

    const matchesSearch = 
      mahasiswaName.toLowerCase().includes(searchTermLower) ||
      judulFix.toLowerCase().includes(searchTermLower);
    
    return matchesSearch;
  });

  const renderProgramStudi = (programStudi) => {
    if (!programStudi) return null;
    
    try {
      if (typeof programStudi === 'object') {
        return programStudi.nama || programStudi.kode || 'Tidak tersedia';
      }
      return String(programStudi);
    } catch (error) {
      console.error('Error rendering program studi:', error);
      return 'Tidak tersedia';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If showing detail view
  if (showDetail && selectedPengajuan) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleCloseDetail}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali ke Daftar Judul Fix
          </button>
        </div>

        {/* Detail Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="space-y-8">
              {/* Student Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Mahasiswa</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nama Mahasiswa</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPengajuan.mahasiswa_name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">NIM</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPengajuan.mahasiswa?.nim || '-'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Kelas</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPengajuan.mahasiswa?.kelas || '-'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Angkatan</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPengajuan.mahasiswa?.angkatan || '-'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status Mahasiswa</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPengajuan.mahasiswa?.status || '-'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">IPK</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPengajuan.mahasiswa?.ipk || '-'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Semester</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPengajuan.mahasiswa?.semester || '-'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tanggal Masuk</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPengajuan.mahasiswa?.tanggal_masuk ? new Date(selectedPengajuan.mahasiswa.tanggal_masuk).toLocaleDateString('id-ID') : '-'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Dosen Wali</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPengajuan.dosen_wali_name || 'Belum ditentukan'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Program Studi</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedPengajuan.program_studi}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pembimbing Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pembimbing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pembimbing 1 */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Pembimbing 1</h3>
                      <button
                        onClick={() => {
                          setSelectedPembimbingType(1);
                          setShowPembimbingModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {selectedPengajuan.pembimbing_1 ? 'Ubah' : 'Tambah'}
                      </button>
                    </div>
                    {selectedPengajuan.pembimbing_1 ? (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedPengajuan.pembimbing_1_name}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Belum ada pembimbing</p>
                    )}
                  </div>

                  {/* Pembimbing 2 */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Pembimbing 2</h3>
                      <button
                        onClick={() => {
                          setSelectedPembimbingType(2);
                          setShowPembimbingModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {selectedPengajuan.pembimbing_2 ? 'Ubah' : 'Tambah'}
                      </button>
                    </div>
                    {selectedPengajuan.pembimbing_2 ? (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedPengajuan.pembimbing_2_name}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Belum ada pembimbing</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Judul Options */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pilih Judul Fix</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          Judul {num} {num === 1 ? '(Prioritas Utama)' : num === 2 ? '(Alternatif 1)' : '(Alternatif 2)'}
                        </h3>
                        <button
                          onClick={() => handleSetJudulFix(selectedPengajuan.id, selectedPengajuan[`judul_${num}`])}
                          disabled={isSaving}
                          className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 ${
                            selectedPengajuan.judul_diterima === selectedPengajuan[`judul_${num}`] ? 'bg-green-600 hover:bg-green-700' : ''
                          }`}
                        >
                          {selectedPengajuan.judul_diterima === selectedPengajuan[`judul_${num}`] ? 'Judul Terpilih' : 'Judul Tidak Terpilih'}
                        </button>
                      </div>
                      <p className="text-gray-900 mb-2">{selectedPengajuan[`judul_${num}`]}</p>
                      <p className="text-sm text-gray-600">{selectedPengajuan[`deskripsi_${num}`]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Aksi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => {
                setSelectedAction('sk');
                setShowSKModal(true);
              }}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FileCheck className="h-5 w-5 mr-2" />
              Buat SK
            </button>

            <button
              onClick={() => {
                setSelectedAction('perpanjang');
                setShowPerpanjangModal(true);
              }}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Clock className="h-5 w-5 mr-2" />
              Perpanjang SK
            </button>

            <button
              onClick={() => {
                setSelectedAction('revisi');
                setShowRevisiModal(true);
              }}
              className="flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              <FileEdit className="h-5 w-5 mr-2" />
              Revisi SK
            </button>

            <button
              onClick={() => {
                setSelectedAction('seminar');
                setShowSeminarModal(true);
              }}
              className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Ajukan Seminar
            </button>
          </div>
        </div>

        {/* Pembimbing Selection Modal */}
        {showPembimbingModal && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Pilih Pembimbing {selectedPembimbingType}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Pilih dosen yang akan menjadi pembimbing {selectedPembimbingType}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPembimbingModal(false);
                      setSelectedPembimbingType(null);
                    }}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari dosen berdasarkan nama atau NIP..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* Dosen List */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dosenList.map((dosen) => (
                    <button
                      key={dosen.id}
                      onClick={() => handleSetPembimbing(selectedPengajuan.id, dosen.id, selectedPembimbingType)}
                      disabled={isSaving}
                      className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                        isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:border-blue-300'
                      } ${
                        (selectedPembimbingType === 1 && selectedPengajuan.pembimbing_1?.id === dosen.id) ||
                        (selectedPembimbingType === 2 && selectedPengajuan.pembimbing_2?.id === dosen.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
                            (selectedPembimbingType === 1 && selectedPengajuan.pembimbing_1?.id === dosen.id) ||
                            (selectedPembimbingType === 2 && selectedPengajuan.pembimbing_2?.id === dosen.id)
                              ? 'bg-blue-100 ring-2 ring-blue-500'
                              : 'bg-gray-100'
                          }`}>
                            <UserCheck className={`h-7 w-7 ${
                              (selectedPembimbingType === 1 && selectedPengajuan.pembimbing_1?.id === dosen.id) ||
                              (selectedPembimbingType === 2 && selectedPengajuan.pembimbing_2?.id === dosen.id)
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-base font-semibold text-gray-900 truncate">
                              {dosen.user.full_name}
                            </p>
                            {(selectedPembimbingType === 1 && selectedPengajuan.pembimbing_1?.id === dosen.id) ||
                             (selectedPembimbingType === 2 && selectedPengajuan.pembimbing_2?.id === dosen.id) ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Terpilih
                              </span>
                            ) : null}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600 flex items-center">
                              <span className="font-medium text-gray-700 w-16">NIP:</span>
                              {dosen.nip || '-'}
                            </p>
                            {dosen.program_studi && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <span className="font-medium text-gray-700 w-16">Prodi:</span>
                                {renderProgramStudi(dosen.program_studi)}
                              </p>
                            )}
                            {dosen.gelar && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <span className="font-medium text-gray-700 w-16">Gelar:</span>
                                {dosen.gelar}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Empty State */}
                {dosenList.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada dosen ditemukan</h3>
                    <p className="text-gray-600">Coba ubah kriteria pencarian Anda</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowPembimbingModal(false);
                      setSelectedPembimbingType(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create SK Modal */}
        {showSKModal && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Buat Surat Keputusan</h3>
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin membuat Surat Keputusan untuk pengajuan ini?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowSKModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleCreateSK(selectedPengajuan.id)}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSaving ? 'Memproses...' : 'Buat SK'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Perpanjang SK Modal */}
        {showPerpanjangModal && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Perpanjang Surat Keputusan</h3>
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin memperpanjang Surat Keputusan ini?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPerpanjangModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handlePerpanjangSK(selectedPengajuan.id)}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSaving ? 'Memproses...' : 'Perpanjang SK'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revisi SK Modal */}
        {showRevisiModal && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ajukan Revisi SK</h3>
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin mengajukan revisi untuk Surat Keputusan ini?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRevisiModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleRevisiSK(selectedPengajuan.id)}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {isSaving ? 'Memproses...' : 'Ajukan Revisi'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ajukan Seminar Modal */}
        {showSeminarModal && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ajukan Seminar Proposal</h3>
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin mengajukan seminar proposal untuk pengajuan ini?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowSeminarModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleAjukanSeminar(selectedPengajuan.id)}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isSaving ? 'Memproses...' : 'Ajukan Seminar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main list view
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daftar Judul Fix Skripsi</h1>
          <p className="mt-2 text-gray-600">
            Kelola judul fix skripsi yang sudah disetujui
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari berdasarkan nama mahasiswa atau judul..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* List Pengajuan */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mahasiswa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Judul Fix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPengajuan.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.mahasiswa_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.program_studi}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">
                      {item.judul_diterima || 'Belum dipilih'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(item.tanggal_pengajuan).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetail(item)}
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
      {filteredPengajuan.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada judul fix ditemukan</h3>
          <p className="text-gray-600 mb-4">Coba ubah kriteria pencarian Anda</p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Pencarian
          </button>
        </div>
      )}
    </div>
  );
};

export default DaftarJudulFix; 