import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../api';
import {
  FileText,
  Award,
  Users,
  UserCheck,
  Calculator,
  Star,
  ChevronRight,
  GraduationCap,
  Trophy
} from 'lucide-react';

const NilaiSeminar = () => {
  const [nilaiData, setNilaiData] = useState({
    proposal: {
      pembimbing1: { nama: 'Dr. John Doe', jabatan: 'Profesor', nilai: 85 },
      pembimbing2: { nama: 'Dr. Jane Smith', jabatan: 'Lektor', nilai: 88 },
      penanggap1: { nama: 'Dr. Alice Johnson', jabatan: 'Lektor Kepala', nilai: 82 },
      penanggap2: { nama: 'Dr. Bob Wilson', jabatan: 'Lektor', nilai: 84 },
      rataRata: 84.75
    },
    hasil: {
      pembimbing1: { nama: 'Dr. John Doe', jabatan: 'Profesor', nilai: 87 },
      pembimbing2: { nama: 'Dr. Jane Smith', jabatan: 'Lektor', nilai: 89 },
      penanggap1: { nama: 'Dr. Alice Johnson', jabatan: 'Lektor Kepala', nilai: 85 },
      penanggap2: { nama: 'Dr. Bob Wilson', jabatan: 'Lektor', nilai: 86 },
      rataRata: 86.75
    },
    ujianTutup: {
      pimpinanSidang: { nama: 'Prof. Dr. Michael Brown', jabatan: 'Profesor', nilai: 90 },
      pembimbing1: { nama: 'Dr. John Doe', jabatan: 'Profesor', nilai: 88 },
      pembimbing2: { nama: 'Dr. Jane Smith', jabatan: 'Lektor', nilai: 89 },
      penanggap1: { nama: 'Dr. Alice Johnson', jabatan: 'Lektor Kepala', nilai: 87 },
      penanggap2: { nama: 'Dr. Bob Wilson', jabatan: 'Lektor', nilai: 88 },
      rataRata: 88.4
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNilai();
  }, []);

  const fetchNilai = async () => {
    try {
      // In the future, fetch from API
      // const response = await api.get('/api/skripsi/nilai-seminar/');
      // setNilaiData(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching nilai:', error);
      toast.error('Gagal memuat data nilai');
      setIsLoading(false);
    }
  };

  const getGradeColor = (nilai) => {
    if (nilai >= 90) return 'text-green-600';
    if (nilai >= 80) return 'text-blue-600';
    if (nilai >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBackground = (nilai) => {
    if (nilai >= 90) return 'bg-green-50';
    if (nilai >= 80) return 'bg-blue-50';
    if (nilai >= 70) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const NilaiCard = ({ title, icon: Icon, data, showPimpinan = false, gradientFrom, gradientTo }) => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
      <div className={`px-6 py-4 border-b bg-gradient-to-r ${gradientFrom} ${gradientTo}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="text-sm text-white/80">
                {showPimpinan ? '5 Penguji' : '4 Penguji'}
              </p>
            </div>
          </div>
          <div className="flex items-center bg-white/20 rounded-xl px-4 py-2">
            <Star className="w-5 h-5 text-white mr-2" />
            <span className="text-xl font-bold text-white">{data.rataRata}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {showPimpinan && (
            <div className="relative">
              <div className="absolute -left-2 top-1/2 w-1 h-16 bg-yellow-400 -translate-y-1/2 rounded-full"></div>
              <div className="flex items-center justify-between pl-4 pr-6 py-4 bg-gradient-to-r from-yellow-50 to-yellow-100/50 rounded-xl">
                <div>
                  <div className="font-semibold text-gray-900">{data.pimpinanSidang.nama}</div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                    Pimpinan Sidang - {data.pimpinanSidang.jabatan}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`text-lg font-bold ${getGradeColor(data.pimpinanSidang.nilai)}`}>
                    {data.pimpinanSidang.nilai}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Pembimbing
            </h4>
            <div className="relative">
              <div className="absolute -left-2 top-1/2 w-1 h-24 bg-green-400 -translate-y-1/2 rounded-full"></div>
              <div className="space-y-2">
                <div className="flex items-center justify-between pl-4 pr-6 py-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-900">{data.pembimbing1.nama}</div>
                    <div className="text-sm text-gray-600">Pembimbing 1 - {data.pembimbing1.jabatan}</div>
                  </div>
                  <div className={`text-lg font-bold ${getGradeColor(data.pembimbing1.nilai)}`}>
                    {data.pembimbing1.nilai}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pl-4 pr-6 py-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-900">{data.pembimbing2.nama}</div>
                    <div className="text-sm text-gray-600">Pembimbing 2 - {data.pembimbing2.jabatan}</div>
                  </div>
                  <div className={`text-lg font-bold ${getGradeColor(data.pembimbing2.nilai)}`}>
                    {data.pembimbing2.nilai}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500 flex items-center">
              <UserCheck className="w-4 h-4 mr-2" />
              Penguji
            </h4>
            <div className="relative">
              <div className="absolute -left-2 top-1/2 w-1 h-24 bg-blue-400 -translate-y-1/2 rounded-full"></div>
              <div className="space-y-2">
                <div className="flex items-center justify-between pl-4 pr-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-900">{data.penanggap1.nama}</div>
                    <div className="text-sm text-gray-600">Penguji 1 - {data.penanggap1.jabatan}</div>
                  </div>
                  <div className={`text-lg font-bold ${getGradeColor(data.penanggap1.nilai)}`}>
                    {data.penanggap1.nilai}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pl-4 pr-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-900">{data.penanggap2.nama}</div>
                    <div className="text-sm text-gray-600">Penguji 2 - {data.penanggap2.jabatan}</div>
                  </div>
                  <div className={`text-lg font-bold ${getGradeColor(data.penanggap2.nilai)}`}>
                    {data.penanggap2.nilai}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl px-6 py-4">
              <div>
                <div className="text-lg font-semibold text-gray-900">Rata-rata Nilai</div>
                <div className="text-sm text-gray-600">
                  {showPimpinan ? 'Dari 5 penguji' : 'Dari 4 penguji'}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-purple-500" />
                <div className="text-2xl font-bold text-purple-600">{data.rataRata}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const nilaiAkhir = ((nilaiData.proposal.rataRata + nilaiData.hasil.rataRata + nilaiData.ujianTutup.rataRata) / 3).toFixed(2);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daftar Nilai Seminar dan Ujian</h1>
          <p className="mt-2 text-gray-600">
            Ringkasan nilai dari semua tahap ujian skripsi
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <NilaiCard 
          title="Seminar Proposal" 
          icon={FileText} 
          data={nilaiData.proposal}
          gradientFrom="from-blue-600"
          gradientTo="to-blue-500"
        />
        
        <NilaiCard 
          title="Seminar Hasil" 
          icon={UserCheck} 
          data={nilaiData.hasil}
          gradientFrom="from-purple-600"
          gradientTo="to-purple-500"
        />
        
        <NilaiCard 
          title="Ujian Tutup" 
          icon={Award} 
          data={nilaiData.ujianTutup} 
          showPimpinan={true}
          gradientFrom="from-indigo-600"
          gradientTo="to-indigo-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Nilai Akhir Skripsi</h3>
                <p className="text-sm text-white/80">Rata-rata dari semua tahap ujian</p>
              </div>
            </div>
            <div className="flex items-center bg-white/20 rounded-xl px-6 py-3">
              <Star className="w-6 h-6 text-white mr-3" />
              <span className="text-3xl font-bold text-white">{nilaiAkhir}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-blue-50">
              <div className="text-sm text-blue-600 font-medium">Seminar Proposal</div>
              <div className="text-2xl font-bold text-blue-700 mt-1">{nilaiData.proposal.rataRata}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-purple-50">
              <div className="text-sm text-purple-600 font-medium">Seminar Hasil</div>
              <div className="text-2xl font-bold text-purple-700 mt-1">{nilaiData.hasil.rataRata}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-indigo-50">
              <div className="text-sm text-indigo-600 font-medium">Ujian Tutup</div>
              <div className="text-2xl font-bold text-indigo-700 mt-1">{nilaiData.ujianTutup.rataRata}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NilaiSeminar; 