import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  DollarSign
} from 'lucide-react';

const TracerStats = () => {
  const [stats, setStats] = useState({
    totalAlumni: 856,
    totalResponden: 742,
    responseRate: 86.7,
    employmentStats: {
      bekerja: 65,
      wirausaha: 15,
      studi_lanjut: 12,
      mencari_kerja: 8
    },
    salaryRanges: {
      'dibawah_3_juta': 10,
      '3_5_juta': 25,
      '5_10_juta': 45,
      'diatas_10_juta': 20
    },
    topIndustries: [
      { name: 'Teknologi Informasi', percentage: 35 },
      { name: 'Perbankan & Keuangan', percentage: 20 },
      { name: 'Konsultan', percentage: 15 },
      { name: 'Manufaktur', percentage: 12 },
      { name: 'Pendidikan', percentage: 10 },
      { name: 'Lainnya', percentage: 8 }
    ],
    waitingPeriod: {
      'kurang_3_bulan': 45,
      '3_6_bulan': 30,
      '6_12_bulan': 15,
      'lebih_12_bulan': 10
    }
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Implementasi API call di sini
      // const response = await api.get('/api/tracer-study/statistics/');
      // setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Gagal memuat statistik');
    }
  };

  const StatCard = ({ title, value, icon: Icon, gradient }) => (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden`}>
      <div className={`px-6 py-4 ${gradient}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          </div>
          <div className="p-2 bg-white/20 rounded-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  const ChartSection = ({ title, data, icon: Icon }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Icon className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
                <span className="font-medium text-gray-900">{value}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Statistik Alumni</h2>
                <p className="text-purple-100">Ringkasan data tracer study alumni</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Alumni"
            value={stats.totalAlumni}
            icon={Users}
            gradient="bg-gradient-to-r from-blue-600 to-blue-500"
          />
          <StatCard
            title="Total Responden"
            value={stats.totalResponden}
            icon={TrendingUp}
            gradient="bg-gradient-to-r from-green-600 to-green-500"
          />
          <StatCard
            title="Response Rate"
            value={`${stats.responseRate}%`}
            icon={BarChart3}
            gradient="bg-gradient-to-r from-purple-600 to-purple-500"
          />
          <StatCard
            title="Tingkat Keterserapan"
            value={`${stats.employmentStats.bekerja + stats.employmentStats.wirausaha}%`}
            icon={Briefcase}
            gradient="bg-gradient-to-r from-indigo-600 to-indigo-500"
          />
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSection
            title="Status Alumni"
            data={stats.employmentStats}
            icon={GraduationCap}
          />
          <ChartSection
            title="Rentang Gaji"
            data={stats.salaryRanges}
            icon={DollarSign}
          />
        </div>

        {/* Industry Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Distribusi Bidang Industri</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.topIndustries.map((industry) => (
                <div
                  key={industry.name}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-indigo-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{industry.name}</span>
                    <span className="text-sm font-bold text-indigo-600">{industry.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${industry.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Waiting Period */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Masa Tunggu Kerja</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats.waitingPeriod).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-3">
                    <span className="text-xl font-bold text-indigo-600">{value}%</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TracerStats; 