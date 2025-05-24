import { useState, useEffect } from "react";
import api from "../../api";
import Dashboard from "../../components/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function DashboardHome() {
  const [stats, setStats] = useState({
    fakultas: 0,
    prodi: 0,
    dosen: 0,
    mahasiswa: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi data - ganti dengan panggilan API sebenarnya
    // ketika endpoint sudah tersedia
    setTimeout(() => {
      setStats({
        fakultas: 5,
        prodi: 20,
        dosen: 150,
        mahasiswa: 2500
      });
      setLoading(false);
    }, 1000);
    
    // Implementasi sebenarnya akan seperti ini:
    // const fetchStats = async () => {
    //   try {
    //     const [fakultasRes, prodiRes, dosenRes, mahasiswaRes] = await Promise.all([
    //       api.get('/api/fakultas/count/'),
    //       api.get('/api/prodi/count/'),
    //       api.get('/api/dosen/count/'),
    //       api.get('/api/mahasiswa/count/')
    //     ]);
    //     
    //     setStats({
    //       fakultas: fakultasRes.data.count,
    //       prodi: prodiRes.data.count,
    //       dosen: dosenRes.data.count,
    //       mahasiswa: mahasiswaRes.data.count
    //     });
    //   } catch (error) {
    //     console.error('Error fetching stats:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // 
    // fetchStats();
  }, []);

  return (
    <Dashboard>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fakultas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.fakultas}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Program Studi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.prodi}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Dosen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.dosen}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Mahasiswa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.mahasiswa}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </Dashboard>
  );
}

export default DashboardHome;