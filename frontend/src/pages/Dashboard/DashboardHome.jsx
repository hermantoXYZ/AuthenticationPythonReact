import { useState, useEffect } from "react";
import api from "../../api";
import Dashboard from "../../components/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import {
  Users,
  Award,
  TrendingUp,
  Building2,
  GraduationCap,
  Briefcase,
  Trophy,
  Target,
  Star,
  Globe,
  BookOpen,
  ChartBar
} from 'lucide-react';

function DashboardHome() {
  const [stats, setStats] = useState({
    // Statistik Umum
    totalAlumni: 0,
    totalPerusahaan: 0,
    tingkatKeterserapan: 0,
    rataWaktuTunggu: 0,
    
    // Pencapaian
    achievements: [
      {
        title: "Akreditasi Unggul",
        description: "Program Studi terakreditasi Unggul oleh BAN-PT",
        icon: Star,
        color: "from-yellow-500 to-yellow-600"
      },
      {
        title: "Kerjasama Internasional",
        description: "15+ kerjasama dengan universitas luar negeri",
        icon: Globe,
        color: "from-blue-500 to-blue-600"
      },
      {
        title: "Prestasi Mahasiswa",
        description: "200+ prestasi nasional & internasional",
        icon: Trophy,
        color: "from-purple-500 to-purple-600"
      }
    ],

    // Statistik Karir Alumni
    careerStats: {
      'Bekerja di Perusahaan Multinasional': 35,
      'Wirausaha Sukses': 15,
      'Melanjutkan Studi S2/S3': 25,
      'Professional Bersertifikasi': 25
    },

    // Top Perusahaan Partner
    topCompanies: [
      { name: 'Google Indonesia', logo: '🏢', count: 24 },
      { name: 'Microsoft Indonesia', logo: '🏢', count: 18 },
      { name: 'Gojek', logo: '🏢', count: 32 },
      { name: 'Tokopedia', logo: '🏢', count: 28 },
      { name: 'Bank Mandiri', logo: '🏢', count: 22 },
      { name: 'Telkom Indonesia', logo: '🏢', count: 26 }
    ],

    // Pencapaian Akademik
    academicStats: {
      'Rata-rata IPK': 3.45,
      'Lulus Tepat Waktu': '85%',
      'Publikasi Internasional': 75,
      'Paten Terdaftar': 12
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulasi loading data
        const response = await api.get('/api/dashboard/stats/');
        
        setStats(prevStats => ({
          ...prevStats,
          totalAlumni: 3567,
          totalPerusahaan: 245,
          tingkatKeterserapan: 92.5,
          rataWaktuTunggu: 2.5,
        }));
        
      } catch (error) {
        toast.error('Gagal memuat statistik dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, description, icon: Icon, gradient }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className={`px-6 py-5 bg-gradient-to-r ${gradient}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/90">{title}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
            {description && (
              <p className="text-sm text-white/80 mt-1">{description}</p>
            )}
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  const AchievementCard = ({ title, description, icon: Icon, color }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className={`px-6 py-5 bg-gradient-to-r ${color}`}>
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-white/80 mt-1">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dashboard>
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          {/* Main Stats */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Alumni"
              value={stats.totalAlumni.toLocaleString()}
              description="Alumni tersebar di Indonesia"
              icon={Users}
              gradient="from-blue-600 to-blue-500"
            />
            <StatCard
              title="Perusahaan Partner"
              value={stats.totalPerusahaan}
              description="Kerjasama industri"
              icon={Building2}
              gradient="from-purple-600 to-purple-500"
            />
            <StatCard
              title="Tingkat Keterserapan"
              value={`${stats.tingkatKeterserapan}%`}
              description="Alumni terserap"
              icon={Briefcase}
              gradient="from-green-600 to-green-500"
            />
            <StatCard
              title="Rata-rata Waktu Tunggu"
              value={`${stats.rataWaktuTunggu} Bulan`}
              description="Mendapatkan pekerjaan"
              icon={TrendingUp}
              gradient="from-orange-600 to-orange-500"
            />
          </div> */}

          {/* Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.achievements.map((achievement, index) => (
              <AchievementCard
                key={index}
                title={achievement.title}
                description={achievement.description}
                icon={achievement.icon}
                color={achievement.color}
              />
            ))}
          </div>

          {/* Career Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <ChartBar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Statistik Karir Alumni</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(stats.careerStats).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{key}</span>
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

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Top Perusahaan Partner</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {stats.topCompanies.map((company, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
                    >
                      <div className="text-2xl">{company.logo}</div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.count} alumni</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Achievements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(stats.academicStats).map(([key, value], index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 mb-4">
                  {index === 0 ? (
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                  ) : index === 1 ? (
                    <Target className="w-6 h-6 text-indigo-600" />
                  ) : index === 2 ? (
                    <Globe className="w-6 h-6 text-indigo-600" />
                  ) : (
                    <Award className="w-6 h-6 text-indigo-600" />
                  )}
                </div>
                <h4 className="text-lg font-semibold text-gray-900">{value}</h4>
                <p className="text-sm text-gray-600 mt-1">{key}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Dashboard>
  );
}

export default DashboardHome;