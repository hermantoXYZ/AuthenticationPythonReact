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
  Presentation,
  GraduationCap,
  ScrollText,
  Download,
  Upload,
  ClipboardCheck,
  FileSignature,
  CalendarCheck,
  Award
} from 'lucide-react';

const SkripsiRoadmap = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      // In the future, this will fetch from your API
      // const response = await api.get('/api/skripsi/progress/');
      // setSteps(response.data);
      
      // For now, we'll use dummy data
      setSteps([
        {
          id: 1,
          title: 'Pengajuan Judul',
          description: 'Mengajukan 3 judul skripsi',
          status: 'completed',
          actions: [
            { label: 'Ajukan Judul', path: '/dashboard/skripsi/pengajuan' },
            { label: 'Lihat Status', path: '/dashboard/skripsi/status' }
          ]
        },
        {
          id: 2,
          title: 'Verifikasi Judul',
          description: 'Pengecekan kesamaan judul oleh admin',
          status: 'in_progress',
          actions: [
            { label: 'Lihat Status', path: '/dashboard/skripsi/status' },
            { label: 'Ada Revisi', path: '/dashboard/skripsi/judul' }
          ]
        },
        {
          id: 3,
          title: 'Persetujuan PA',
          description: 'Persetujuan judul oleh Penasehat Akademik',
          status: 'pending',
          actions: [
            { label: 'Upload Lembar Pengesahan', path: '/dashboard/skripsi/upload-pa' }
          ]
        },
        {
          id: 4,
          title: 'Seleksi Judul',
          description: 'Seleksi oleh tim jurusan/prodi',
          status: 'locked',
          prerequisite: 'Menunggu persetujuan PA'
        },
        {
          id: 5,
          title: 'Penentuan Pembimbing',
          description: 'Penentuan dosen pembimbing oleh jurusan/program studi',
          status: 'pending',
          prerequisite: 'Menunggu hasil seleksi judul'
        },
        {
          id: 6,
          title: 'Daftar SK Pembimbing',
          description: 'Pendaftaran SK Pembimbing untuk mendapatkan SK resmi',
          status: 'pending',
          actions: [
            { label: 'Cetak Form SK', path: '/dashboard/skripsi/cetak-form-sk' },
            { label: 'Isi Form SK', path: '/dashboard/skripsi/form-sk' }
          ]
        },
        {
          id: 7,
          title: 'SK Pembimbing',
          description: 'SK Pembimbing berlaku 6 bulan sejak diterbitkan',
          status: 'pending',
          actions: [
            { label: 'Download SK', path: '/dashboard/skripsi/sk-pembimbing' },
            { label: 'Perbarui SK', path: '/dashboard/skripsi/update-sk' },
            { label: 'Cek Masa Berlaku', path: '/dashboard/skripsi/cek-sk' }
          ]
        },
        {
          id: 8,
          title: 'Proposal Skripsi',
          description: 'Penyusunan dan konsultasi proposal dengan pembimbing',
          status: 'success',
          actions: [
            { label: 'Download Panduan', path: '/dashboard/skripsi/panduan' },
            { label: 'Cetak Lembar Konsultasi', path: '/dashboard/skripsi/lembar-konsultasi' },
            { label: 'Upload Proposal', path: '/dashboard/skripsi/upload-proposal' }
          ]
        },
        {
          id: 9,
          title: 'Persetujuan Seminar',
          description: 'Persetujuan seminar proposal dari kedua pembimbing',
          status: 'pending',
          actions: [
            { label: 'Cetak Lembar Persetujuan', path: '/dashboard/skripsi/lembar-persetujuan-seminar' },
            { label: 'Upload Persetujuan', path: '/dashboard/skripsi/upload-persetujuan-seminar' }
          ]
        },
        {
          id: 10,
          title: 'Pendaftaran Seminar',
          description: 'Pendaftaran dan pelaksanaan seminar proposal',
          status: 'pending',
          actions: [
            { label: 'Daftar Seminar', path: '/dashboard/skripsi/daftar-seminar' },
            { label: 'Jadwal Seminar', path: '/dashboard/skripsi/jadwal-seminar' }
          ]
        },
        {
          id: 11,
          title: 'Perbaikan Proposal',
          description: 'Perbaikan proposal untuk penerbitan izin penelitian',
          status: 'pending',
          actions: [
            { label: 'Cetak Form Perbaikan', path: '/dashboard/skripsi/form-perbaikan' },
            { label: 'Upload Revisi', path: '/dashboard/skripsi/upload-revisi' }
          ]
        },
        {
          id: 12,
          title: 'Izin Penelitian',
          description: 'Pengurusan surat izin penelitian',
          status: 'pending',
          actions: [
            { label: 'Form Layanan', path: '/dashboard/skripsi/form-izin' },
            { label: 'Upload Disposisi', path: '/dashboard/skripsi/upload-disposisi' }
          ]
        },
        {
          id: 13,
          title: 'Seminar Hasil',
          description: 'Perbaikan dan persiapan ujian skripsi',
          status: 'pending',
          actions: [
            { label: 'Cetak Lembar Persetujuan', path: '/dashboard/skripsi/lembar-persetujuan-hasil' },
            { label: 'Upload Persetujuan', path: '/dashboard/skripsi/upload-persetujuan-hasil' }
          ]
        },
        {
          id: 14,
          title: 'Persiapan Ujian',
          description: 'Persetujuan ujian dari pembimbing dan penguji',
          status: 'pending',
          actions: [
            { label: 'Cetak Form Persetujuan', path: '/dashboard/skripsi/form-persetujuan-ujian' },
            { label: 'Upload Persetujuan', path: '/dashboard/skripsi/upload-persetujuan-ujian' }
          ]
        },
        {
          id: 15,
          title: 'Pendaftaran Ujian',
          description: 'Pendaftaran ujian skripsi/meja/tutup',
          status: 'pending',
          actions: [
            { label: 'Isi Form Pendaftaran', path: '/dashboard/skripsi/daftar-ujian' },
            { label: 'Jadwal Ujian', path: '/dashboard/skripsi/jadwal-ujian' }
          ]
        },
        {
          id: 16,
          title: 'Finalisasi',
          description: 'Pengesahan dan pengumpulan berkas akhir',
          status: 'pending',
          actions: [
            { label: 'Form Layanan', path: '/dashboard/skripsi/finalisasi' },
            { label: 'Upload Berkas Final', path: '/dashboard/skripsi/upload-final' },
            { label: 'Pengesahan Skripsi', path: '/dashboard/skripsi/pengesahan' }
          ]
        },
        {
          id: 17,
          title: 'Pengambilan Ijazah',
          description: 'Proses akhir pengambilan ijazah',
          status: 'pending',
          prerequisite: 'Semua tahap sebelumnya harus selesai',
          actions: [
            { label: 'Cek Persyaratan', path: '/dashboard/skripsi/syarat-ijazah' },
            { label: 'Form Pengambilan', path: '/dashboard/skripsi/form-ijazah' }
          ]
        }
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching progress:', error);
      toast.error('Gagal memuat progress skripsi');
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-6 h-6 text-blue-500 animate-pulse" />;
      case 'pending':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'locked':
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStepIcon = (id) => {
    const icons = {
      1: FileText,
      2: Users,
      3: FileCheck,
      4: BookOpen,
      5: Users,
      6: ScrollText,
      7: FileText,
      8: Presentation,
      9: FileSignature,
      10: ClipboardCheck,
      11: CalendarCheck,
      12: Award
    };
    const Icon = icons[id] || FileText;
    return <Icon className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">Roadmap Penyelesaian Skripsi</h1>
        <p className="mt-2 text-gray-600">
          Ikuti langkah-langkah berikut untuk menyelesaikan skripsi Anda
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`bg-white rounded-lg border ${
              step.status === 'locked' ? 'border-gray-200' : 'border-blue-200'
            } shadow-sm overflow-hidden`}
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  step.status === 'locked' ? 'bg-gray-100' : 'bg-blue-100'
                }`}>
                  {getStepIcon(step.id)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {step.id}. {step.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                    </div>
                    {getStatusIcon(step.status)}
                  </div>

                  {step.status === 'locked' && step.prerequisite && (
                    <div className="mt-2 text-sm text-gray-500 italic">
                      {step.prerequisite}
                    </div>
                  )}

                  {step.actions && step.status !== 'locked' && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {step.actions.map((action, index) => (
                        <a
                          key={index}
                          href={action.path}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          {action.label}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkripsiRoadmap; 