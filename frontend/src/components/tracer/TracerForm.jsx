import { useState } from 'react';
import { toast } from 'sonner';
import {
  ClipboardList,
  Building2,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2
} from 'lucide-react';

const TracerForm = () => {
  const [formData, setFormData] = useState({
    // Data Pribadi
    namaLengkap: '',
    nim: '',
    tahunLulus: '',
    noTelepon: '',
    email: '',
    alamat: '',

    // Data Pekerjaan
    statusPekerjaan: '',
    namaPerusahaan: '',
    bidangUsaha: '',
    jabatan: '',
    lamaBekerja: '',
    gajiPerbulan: '',
    lokasiKerja: '',
    relevansiPekerjaan: '',

    // Data Kompetensi
    kemampuanKerja: [],
    saranPengembangan: '',
    kepuasanLayanan: ''
  });

  const [step, setStep] = useState(1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          kemampuanKerja: [...prev.kemampuanKerja, name]
        };
      } else {
        return {
          ...prev,
          kemampuanKerja: prev.kemampuanKerja.filter(item => item !== name)
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Implementasi API call di sini
      // await api.post('/api/tracer-study/', formData);
      toast.success('Data tracer study berhasil disimpan');
    } catch (error) {
      console.error('Error submitting tracer study:', error);
      toast.error('Gagal menyimpan data tracer study');
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const renderFormStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
              Data Pribadi Alumni
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input
                  type="text"
                  name="namaLengkap"
                  value={formData.namaLengkap}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">NIM</label>
                <input
                  type="text"
                  name="nim"
                  value={formData.nim}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Tahun Lulus</label>
                <input
                  type="number"
                  name="tahunLulus"
                  value={formData.tahunLulus}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
                <input
                  type="tel"
                  name="noTelepon"
                  value={formData.noTelepon}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Alamat</label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
              Data Pekerjaan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status Pekerjaan</label>
                <select
                  name="statusPekerjaan"
                  value={formData.statusPekerjaan}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Pilih Status</option>
                  <option value="bekerja">Bekerja</option>
                  <option value="wirausaha">Wirausaha</option>
                  <option value="studi_lanjut">Studi Lanjut</option>
                  <option value="mencari_kerja">Mencari Kerja</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Perusahaan</label>
                <input
                  type="text"
                  name="namaPerusahaan"
                  value={formData.namaPerusahaan}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Bidang Usaha</label>
                <input
                  type="text"
                  name="bidangUsaha"
                  value={formData.bidangUsaha}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Jabatan</label>
                <input
                  type="text"
                  name="jabatan"
                  value={formData.jabatan}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Lama Bekerja</label>
                <select
                  name="lamaBekerja"
                  value={formData.lamaBekerja}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Pilih Durasi</option>
                  <option value="< 6 bulan">{'< 6 bulan'}</option>
                  <option value="6-12 bulan">6-12 bulan</option>
                  <option value="1-2 tahun">1-2 tahun</option>
                  <option value="> 2 tahun">{'>2 tahun'}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Gaji per Bulan</label>
                <select
                  name="gajiPerbulan"
                  value={formData.gajiPerbulan}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Pilih Range Gaji</option>
                  <option value="< 3 juta">{'< Rp 3.000.000'}</option>
                  <option value="3-5 juta">Rp 3.000.000 - Rp 5.000.000</option>
                  <option value="5-10 juta">Rp 5.000.000 - Rp 10.000.000</option>
                  <option value="> 10 juta">{'> Rp 10.000.000'}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Lokasi Kerja</label>
                <input
                  type="text"
                  name="lokasiKerja"
                  value={formData.lokasiKerja}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Relevansi dengan Prodi</label>
                <select
                  name="relevansiPekerjaan"
                  value={formData.relevansiPekerjaan}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Pilih Relevansi</option>
                  <option value="sangat_relevan">Sangat Relevan</option>
                  <option value="relevan">Relevan</option>
                  <option value="cukup_relevan">Cukup Relevan</option>
                  <option value="kurang_relevan">Kurang Relevan</option>
                  <option value="tidak_relevan">Tidak Relevan</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-blue-600" />
              Evaluasi Kompetensi
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Kompetensi yang Dibutuhkan di Dunia Kerja
                </label>
                <div className="space-y-3">
                  {[
                    'Kemampuan teknis sesuai bidang ilmu',
                    'Kemampuan bahasa Inggris',
                    'Kemampuan komunikasi',
                    'Kemampuan kerjasama tim',
                    'Kemampuan leadership',
                    'Kemampuan problem solving',
                    'Kemampuan teknologi informasi',
                    'Etika profesional'
                  ].map((item) => (
                    <div key={item} className="flex items-center">
                      <input
                        type="checkbox"
                        name={item}
                        checked={formData.kemampuanKerja.includes(item)}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">{item}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Saran Pengembangan Program Studi
                </label>
                <textarea
                  name="saranPengembangan"
                  value={formData.saranPengembangan}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Berikan saran Anda untuk pengembangan program studi ke depan..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Kepuasan terhadap Layanan</label>
                <select
                  name="kepuasanLayanan"
                  value={formData.kepuasanLayanan}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Pilih Tingkat Kepuasan</option>
                  <option value="sangat_puas">Sangat Puas</option>
                  <option value="puas">Puas</option>
                  <option value="cukup">Cukup</option>
                  <option value="kurang">Kurang</option>
                  <option value="tidak_puas">Tidak Puas</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tracer Study Alumni</h2>
              <p className="text-blue-100">Pengisian data penelusuran alumni</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={`flex items-center ${
                    step >= item ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step >= item
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    {item}
                  </div>
                  <span className="ml-2 text-sm font-medium hidden sm:block">
                    {item === 1 ? 'Data Pribadi' : item === 2 ? 'Pekerjaan' : 'Kompetensi'}
                  </span>
                </div>
              ))}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {renderFormStep()}
            
            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Sebelumnya
                </button>
              )}
              
              <div className="ml-auto">
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Selanjutnya
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Kirim Data
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TracerForm; 