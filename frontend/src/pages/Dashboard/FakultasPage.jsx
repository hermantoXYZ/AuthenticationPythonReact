import { useState, useEffect } from "react";
import api from "../../api";
import Dashboard from "../../components/Dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function FakultasPage() {
  const [fakultasList, setFakultasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    kode: "",
    deskripsi: ""
  });

  useEffect(() => {
    // Simulasi data - ganti dengan panggilan API sebenarnya
    setTimeout(() => {
      setFakultasList([
        { id: 1, nama: "Fakultas Teknik", kode: "FT", deskripsi: "Fakultas Teknik" },
        { id: 2, nama: "Fakultas Ekonomi dan Bisnis", kode: "FEB", deskripsi: "Fakultas Ekonomi dan Bisnis" },
        { id: 3, nama: "Fakultas Ilmu Komputer", kode: "FILKOM", deskripsi: "Fakultas Ilmu Komputer" },
      ]);
      setLoading(false);
    }, 1000);
    
    // Implementasi sebenarnya:
    // const fetchFakultas = async () => {
    //   try {
    //     const response = await api.get('/api/fakultas/');
    //     setFakultasList(response.data);
    //   } catch (error) {
    //     console.error('Error fetching fakultas:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // 
    // fetchFakultas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simulasi penambahan data
    const newFakultas = {
      id: fakultasList.length + 1,
      ...formData
    };
    
    setFakultasList([...fakultasList, newFakultas]);
    setFormData({ nama: "", kode: "", deskripsi: "" });
    setShowForm(false);
    
    // Implementasi sebenarnya:
    // try {
    //   const response = await api.post('/api/fakultas/', formData);
    //   setFakultasList([...fakultasList, response.data]);
    //   setFormData({ nama: "", kode: "", deskripsi: "" });
    //   setShowForm(false);
    // } catch (error) {
    //   console.error('Error creating fakultas:', error);
    // }
  };

  const handleDelete = async (id) => {
    // Simulasi penghapusan data
    setFakultasList(fakultasList.filter(item => item.id !== id));
    
    // Implementasi sebenarnya:
    // try {
    //   await api.delete(`/api/fakultas/${id}/`);
    //   setFakultasList(fakultasList.filter(item => item.id !== id));
    // } catch (error) {
    //   console.error('Error deleting fakultas:', error);
    // }
  };

  return (
    <Dashboard>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Fakultas</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Batal" : "Tambah Fakultas"}
        </Button>
      </div>
      
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tambah Fakultas Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Fakultas</label>
                  <Input
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kode</label>
                  <Input
                    name="kode"
                    value={formData.kode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  rows="3"
                />
              </div>
              <Button type="submit">Simpan</Button>
            </form>
          </CardContent>
        </Card>
      )}
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fakultasList.map((fakultas) => (
            <Card key={fakultas.id}>
              <CardHeader>
                <CardTitle>{fakultas.nama}</CardTitle>
                <div className="text-sm text-gray-500">Kode: {fakultas.kode}</div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{fakultas.deskripsi}</p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(fakultas.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Dashboard>
  );
}

export default FakultasPage;