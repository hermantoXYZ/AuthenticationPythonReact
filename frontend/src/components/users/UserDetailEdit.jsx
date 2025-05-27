import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Building,
  GraduationCap,
  UserCheck,
  Award,
  BookOpen,
  X,
  Save,
  ArrowLeft
} from 'lucide-react';
import api from '../../api';
import { toast } from 'sonner';

const UserDetailEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState({
    id: '',
    username: '',
    email: '',
    full_name: '',
    phone_number: '',
    user_type: '',
    birth_date: '',
    gender: '',
    tempat_lahir: '',
    is_active: true,
    mahasiswa_profile: null,
    dosen_profile: null,
    staff_prodi_profile: null,
    ketua_prodi_profile: null
  });

  // User type mapping for display
  const userTypeDisplay = {
    'super_admin': 'Super Admin',
    'dekan_fakultas': 'Dekan Fakultas',
    'pejabat_jurusan': 'Pejabat Jurusan',
    'ketua_prodi': 'Ketua Prodi',
    'staff_fakultas': 'Staff Fakultas',
    'staff_prodi': 'Staff Prodi',
    'dosen': 'Dosen',
    'mahasiswa': 'Mahasiswa'
  };

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/api/users/${id}/`);
      setUserData(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Gagal memuat data pengguna');
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        full_name: userData.full_name,
        email: userData.email,
        phone_number: userData.phone_number,
        birth_date: userData.birth_date,
        gender: userData.gender,
        tempat_lahir: userData.tempat_lahir,
        is_active: userData.is_active
      };

      const response = await api.patch(`/api/users/${id}/`, payload);
      setUserData(response.data);
      setIsEditing(false);
      toast.success('Data pengguna berhasil diperbarui');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Gagal memperbarui data pengguna');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <User className="h-4 w-4 mr-2" />
          Nama Lengkap
        </label>
        {isEditing ? (
          <input
            type="text"
            value={userData.full_name || ''}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        ) : (
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{userData.full_name || '-'}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Mail className="h-4 w-4 mr-2" />
          Email
        </label>
        {isEditing ? (
          <input
            type="email"
            value={userData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{userData.email || '-'}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Phone className="h-4 w-4 mr-2" />
          Nomor Telepon
        </label>
        {isEditing ? (
          <input
            type="tel"
            value={userData.phone_number || ''}
            onChange={(e) => handleInputChange('phone_number', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{userData.phone_number || '-'}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Tanggal Lahir
        </label>
        {isEditing ? (
          <input
            type="date"
            value={userData.birth_date || ''}
            onChange={(e) => handleInputChange('birth_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{userData.birth_date || '-'}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <User className="h-4 w-4 mr-2" />
          Jenis Kelamin
        </label>
        {isEditing ? (
          <select
            value={userData.gender || ''}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Pilih Jenis Kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        ) : (
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{userData.gender || '-'}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <User className="h-4 w-4 mr-2" />
          Status
        </label>
        {isEditing ? (
          <select
            value={userData.is_active.toString()}
            onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        ) : (
          <p className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
            userData.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {userData.is_active ? 'Aktif' : 'Nonaktif'}
          </p>
        )}
      </div>
    </div>
  );

  const renderAcademicInfo = () => {
    const profile = userData.mahasiswa_profile || userData.dosen_profile || userData.staff_prodi_profile;
    if (!profile) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userData.mahasiswa_profile && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                NIM
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {userData.mahasiswa_profile.nim || '-'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Angkatan
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {userData.mahasiswa_profile.angkatan || '-'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <GraduationCap className="h-4 w-4 mr-2" />
                Semester
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {userData.mahasiswa_profile.semester || '-'}
              </p>
            </div>
          </>
        )}

        {(userData.dosen_profile || userData.staff_prodi_profile) && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                NIP
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {userData.dosen_profile?.nip || userData.staff_prodi_profile?.nip || '-'}
              </p>
            </div>

            {userData.dosen_profile && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    Jabatan Akademik
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {userData.dosen_profile.jabatan_akademik || '-'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Pendidikan Terakhir
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {userData.dosen_profile.pendidikan_terakhir || '-'}
                  </p>
                </div>
              </>
            )}
          </>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Building className="h-4 w-4 mr-2" />
            Program Studi
          </label>
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
            {profile.program_studi?.nama || '-'}
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/users')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali ke Daftar Pengguna
          </button>
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Edit Data</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Batal</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
                </button>
              </>
            )}
          </div>
        </div>
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-gray-900">Detail Pengguna</h1>
          <p className="text-gray-600 mt-2">
            Tipe User: <span className="font-medium">{userTypeDisplay[userData.user_type]}</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Personal</h2>
              {renderPersonalInfo()}
            </div>

            {/* Academic Information */}
            {(userData.mahasiswa_profile || userData.dosen_profile || userData.staff_prodi_profile) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Akademik</h2>
                {renderAcademicInfo()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailEdit; 