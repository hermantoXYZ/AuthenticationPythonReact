import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Building2,
  GraduationCap,
  Calendar
} from 'lucide-react';

const TracerHistory = () => {
  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      tanggal: '2024-03-15',
      tahunLulus: 2023,
      statusPekerjaan: 'bekerja',
      perusahaan: 'PT Teknologi Indonesia',
      jabatan: 'Software Engineer',
      gajiRange: '5-10 juta',
      status: 'verified'
    },
    {
      id: 2,
      tanggal: '2023-09-10',
      tahunLulus: 2023,
      statusPekerjaan: 'studi_lanjut',
      perusahaan: 'Universitas Teknologi',
      jabatan: 'Mahasiswa S2',
      gajiRange: '-',
      status: 'verified'
    }
  ]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      // Implementasi API call di sini
      // const response = await api.get('/api/tracer-study/history/');
      // setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submission history:', error);
      toast.error('Gagal memuat riwayat pengisian');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${color}`}>
        {status === 'verified' && <CheckCircle2 className="w-4 h-4 mr-1 inline-block" />}
        {status === 'pending' && <Clock className="w-4 h-4 mr-1 inline-block" />}
        {status === 'rejected' && <XCircle className="w-4 h-4 mr-1 inline-block" />}
        {status === 'verified' ? 'Terverifikasi' : status === 'pending' ? 'Menunggu' : 'Ditolak'}
      </span>
    );
  };

  const getJobStatusLabel = (status) => {
    const statusMap = {
      'bekerja': 'Bekerja',
      'wirausaha': 'Wirausaha',
      'studi_lanjut': 'Studi Lanjut',
      'mencari_kerja': 'Mencari Kerja'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Riwayat Tracer Study</h2>
              <p className="text-indigo-100">Daftar pengisian tracer study Anda</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="rounded-lg bg-indigo-50 p-2 flex-shrink-0">
                          {submission.statusPekerjaan === 'bekerja' ? (
                            <Building2 className="w-6 h-6 text-indigo-600" />
                          ) : submission.statusPekerjaan === 'studi_lanjut' ? (
                            <GraduationCap className="w-6 h-6 text-indigo-600" />
                          ) : (
                            <ChevronRight className="w-6 h-6 text-indigo-600" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {submission.perusahaan}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium">{submission.jabatan}</span>
                            <span className="mx-2">•</span>
                            <span>{getJobStatusLabel(submission.statusPekerjaan)}</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>
                                {new Date(submission.tanggal).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            {submission.gajiRange !== '-' && (
                              <div className="flex items-center text-sm text-gray-500">
                                <span>Gaji: {submission.gajiRange}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="sm:text-right">
                        {getStatusBadge(submission.status)}
                        <div className="mt-2 text-sm text-gray-500">
                          Tahun Lulus: {submission.tahunLulus}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Belum Ada Riwayat</h3>
              <p className="mt-2 text-gray-500">
                Anda belum pernah mengisi form tracer study.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TracerHistory; 