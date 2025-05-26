import { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Mail, 
  Phone, 
  Calendar, 
  Camera,
  BookOpen,
  Building,
  GraduationCap,
  UserCheck,
  Award,
  Users
} from 'lucide-react';
import api from "../api";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    id: '',
    username: '',
    email: '',
    full_name: '',
    phone_number: '',
    user_type: '',
    birth_date: '',
    gender: '',
    tempat_lahir: '',
    profile_picture: null,
    nip: '',
    nim: '',
    program_studi: null,
    fakultas: null,
    jurusan: null,
    jabatan_akademik: '',
    pendidikan_terakhir: '',
    bidang_keahlian: '',
    status_kepegawaian: '',
    angkatan: '',
    semester: '',
    status: '',
    ipk: '',
    dosen_wali: '',
    tanggal_masuk: '',
    jabatan: '',
    periode_mulai: '',
    periode_selesai: '',
    tgl_mulai: '',
    tgl_selesai: '',
  });

  // console.log(profileData); 

  const [originalProfileData, setOriginalProfileData] = useState({}); 

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Model lama belum diatur type of usernya
  // useEffect(() => {
  //   const fetchProfileData = async () => {
  //     try {
  //       const response = await api.get('/api/profile/');
  //       console.log('Profile data fetched:', response.data);
  //       setProfileData(response.data);
  //       setOriginalProfileData(response.data); // Store original data
  //     } catch (error) {
  //       console.error('Error fetching profile:', error);
  //       toast.alert('Gagal memuat data profil. Silakan refresh halaman.');
  //     }
  //   };

  //   fetchProfileData();
  // }, []);

  // Fetch comprehensive profile data based on user type
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get('/api/profile/');
        // console.log('Profile data fetched:', response.data);
        
        // Fetch additional data based on user type
        let additionalData = {};
        const userType = response.data.user_type;
        
        if (userType === 'dosen' || userType === 'dekan_fakultas' || userType === 'ketua_prodi' || userType === 'pejabat_jurusan') {
          try {
            const dosenResponse = await api.get('/api/dosen-profile/');
            additionalData = { ...dosenResponse.data };
          } catch (error) {
            console.log('No dosen profile found');
          }
        } else if (userType === 'mahasiswa') {
          try {
            const mahasiswaResponse = await api.get('/api/mahasiswa-profile/');
            additionalData = { ...mahasiswaResponse.data };
          } catch (error) {
            console.log('No mahasiswa profile found');
          }
        } else if (userType === 'staff_prodi') {
          try {
            const staffProdiResponse = await api.get('/api/staff-prodi-profile/');
            additionalData = { ...staffProdiResponse.data };
          } catch (error) {
            console.log('No staff prodi profile found');
          }
        } else if (userType === 'staff_fakultas') {
          try {
            const staffFakultasResponse = await api.get('/api/staff-fakultas-profile/');
            additionalData = { ...staffFakultasResponse.data };
          } catch (error) {
            console.log('No staff fakultas profile found');
          }
        }
        
        const combinedData = { ...response.data, ...additionalData };
        setProfileData(combinedData);
        setOriginalProfileData(combinedData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Gagal memuat data profil. Silakan refresh halaman.');
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Validate required fields
      if (!profileData.full_name) {
        toast.alert('Nama depan dan nama belakang wajib diisi!');
        return;
      }

      if (profileData.email && !isValidEmail(profileData.email)) {
        toast.alert('Format email tidak valid!');
        return;
      }

      // Create payload with only changed fields or all fields based on backend requirement
      const payload = {
        full_name: profileData.full_name || '',
        email: profileData.email || '',
        phone_number: profileData.phone_number || '',
        birth_date: profileData.birth_date || '',
        gender: profileData.gender || '',
        tempat_lahir: profileData.tempat_lahir || ''
      };

      console.log('Sending payload:', payload);

      // Use JSON instead of FormData for profile update (excluding profile_picture)
      const response = await api.patch('/api/profile/', payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Profile update response:', response.data);

      // Update local state with response data
      setProfileData(prev => ({
        ...prev,
        ...response.data
      }));
      setOriginalProfileData(response.data);
      
      setIsEditing(false);
      toast.success('Profil berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // More detailed error handling
      let errorMessage = 'Gagal memperbarui profil. ';
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        if (error.response.status === 400) {
          // Handle validation errors
          const errors = error.response.data;
          if (typeof errors === 'object') {
            const errorMessages = Object.entries(errors).map(([field, messages]) => {
              const fieldName = getFieldDisplayName(field);
              const message = Array.isArray(messages) ? messages[0] : messages;
              return `${fieldName}: ${message}`;
            });
            errorMessage += errorMessages.join(', ');
          } else {
            errorMessage += 'Data tidak valid.';
          }
        } else if (error.response.status === 401) {
          errorMessage += 'Sesi Anda telah berakhir. Silakan login kembali.';
        } else if (error.response.status === 403) {
          errorMessage += 'Anda tidak memiliki izin untuk mengubah data ini.';
        } else {
          errorMessage += `Server error (${error.response.status}).`;
        }
      } else if (error.request) {
        errorMessage += 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else {
        errorMessage += 'Terjadi kesalahan tidak terduga.';
      }
      
      toast.warning(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Restore original data when canceling
    setProfileData(originalProfileData);
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.warning('Password baru dan konfirmasi tidak sama!');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.warning('Password baru harus minimal 6 karakter!');
      return;
    }
    
    try {
      await api.post('/api/change-password/', {
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword
      });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password berhasil diubah!');
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.error || 'Gagal mengubah password. Silakan coba lagi.';
      toast.warning(errorMessage);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getFieldDisplayName = (field) => {
    const fieldNames = {
      full_name: 'Nama Lengkap',
      email: 'Email',
      phone_number: 'Nomor Telepon',
      birth_date: 'Tanggal Lahir',
      gender: 'Jenis Kelamin',
      tempat_lahir: 'Tempat Lahir'
    };
    return fieldNames[field] || field;
  };

  const getUserTypeLabel = (userType) => {
    const labels = {
      'super_admin': 'Super Admin',
      'dekan_fakultas': 'Dekan Fakultas',
      'pejabat_jurusan': 'Pejabat Jurusan',
      'ketua_prodi': 'Ketua Program Studi',
      'staff_fakultas': 'Staff Fakultas',
      'staff_prodi': 'Staff Program Studi',
      'dosen': 'Dosen',
      'mahasiswa': 'Mahasiswa'
    };
    return labels[userType] || userType;
  };

  const tabs = [
    { id: 'personal', label: 'Informasi Personal', icon: User },
    { id: 'academic', label: 'Informasi Akademik', icon: BookOpen },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'notifications', label: 'Notifikasi', icon: Bell }
  ];

  const handleProfilePictureClick = () => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.alert('Format file tidak didukung. Gunakan JPG, PNG, atau GIF.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.alert('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      console.log('Uploading profile picture...');
      const response = await api.patch('/api/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      console.log('Profile picture upload response:', response.data);
      
      // Update profile data with new picture URL
       // Update profile data with new picture URL
       setProfileData(prev => ({
        ...prev,
        profile_picture: response.data.profile_picture
      }));
      
      toast.success('Foto profil berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      
      let errorMessage = 'Gagal memperbarui foto profil. ';
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        if (error.response.status === 400) {
          errorMessage += 'File tidak valid atau terlalu besar.';
        } else if (error.response.status === 413) {
          errorMessage += 'File terlalu besar.';
        } else {
          errorMessage += 'Silakan coba lagi.';
        }
      } else {
        errorMessage += 'Periksa koneksi internet Anda.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Render academic information based on user type
  const renderAcademicInfo = () => {
    const userType = profileData.user_type;

    if (userType === 'mahasiswa') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              NIM
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.nim || '-'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Program Studi
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.program_studi?.nama || '-'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Angkatan
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.angkatan || '-'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" />
              Semester
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.semester || '-'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              Status
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.status || '-'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Award className="h-4 w-4 mr-2" />
              IPK
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.ipk || '-'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Dosen Wali
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg"> {profileData.dosen_wali?.user?.full_name || '-'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Tanggal Masuk
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.tanggal_masuk || '-'}</p>
          </div>
        </div>
      );
    }

    if (['dekan_fakultas', 'ketua_prodi', 'pejabat_jurusan', 'dosen'].includes(userType)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              NIP
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.nip || '-'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Program Studi
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.program_studi?.nama || '-'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Jabatan Akademik
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.jabatan_akademik || '-'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" />
              Pendidikan Terakhir
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.pendidikan_terakhir || '-'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Bidang Keahlian
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.bidang_keahlian || '-'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              Status Kepegawaian
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.status_kepegawaian || '-'}</p>
          </div>

          {userType === 'ketua_prodi' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Periode Mulai
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.ketua_prodi.periode_mulai || '-'}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Periode Selesai
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.ketua_prodi.periode_selesai || '-'}</p>
              </div>
            </>
          )}


          {userType === 'pejabat_jurusan' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Periode Mulai
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg"> {profileData.pejabat_jurusan?.tgl_mulai || '-'}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Periode Selesai
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">  {profileData.pejabat_jurusan?.tgl_selesai || '-'}</p>
              </div>

                <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
                Jabatan
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {profileData.pejabat_jurusan?.jabatan || '-'}
              </p>
            </div>

              <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
          <UserCheck className="h-4 w-4 mr-2" />
            Label
          </label>
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
            {profileData.pejabat_jurusan?.label || '-'}
          </p>
        </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center">
      <Building className="h-4 w-4 mr-2" />
        Jurusan
      </label>
      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
        {profileData.pejabat_jurusan?.jurusan?.nama_jurusan || '-'}
      </p>
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center">
      <UserCheck className="h-4 w-4 mr-2" />
        PLT
      </label>
      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
        {profileData.pejabat_jurusan?.plt ? 'Ya' : 'Tidak'}
      </p>
    </div>
            </>
          )}

        </div>
      );
    }

    if (['staff_prodi', 'staff_fakultas'].includes(userType)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              NIP
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.nip || '-'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Building className="h-4 w-4 mr-2" />
              {userType === 'staff_prodi' ? 'Program Studi' : 'Fakultas'}
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {userType === 'staff_prodi' ? (profileData.program_studi?.nama || '-') : (profileData.fakultas?.nama || '-')}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              Jabatan
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.jabatan || '-'}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Tidak ada informasi akademik untuk tipe user ini.</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
              {profileData.profile_picture ? (
                <img
                  src={profileData.profile_picture}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
            </div>
            <button 
              onClick={handleProfilePictureClick} 
              disabled={isUploading}
              className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                isUploading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-400'
              }`}
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Camera className="h-4 w-4 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profileData.full_name || 'Nama Lengkap'}</h1>
            <p className="text-blue-100 text-lg">{getUserTypeLabel(profileData.user_type)}</p>
            <p className="text-blue-100 text-sm">{profileData.email || 'null' }</p>
            <p className="text-blue-200 text-sm">{profileData.nip || profileData.nim || '-'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Content - Personal Information */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <h2 className="text-xl font-semibold text-gray-900">Informasi Personal</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isEditing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isEditing ? 'Batal' : 'Edit Profil'}
                  </button>
                  {isEditing && (
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 ${
                        isSaving ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSaving && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      )}
                      <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Nama Lengkap *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.full_name || ''}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.full_name || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Tempat Lahir
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileData.tempat_lahir || ''}
                      onChange={(e) => handleInputChange('tempat_lahir', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {profileData.tempat_lahir || '-'}
                    </p>
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
                      value={profileData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.email || '-'}</p>
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
                      value={profileData.phone_number || ''}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.phone_number || '-'}</p>
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
                      value={profileData.birth_date || ''}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.birth_date || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Jenis Kelamin
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.gender || ''}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.gender || '-'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

           {/* Tab Content - Academic Information */}
           {activeTab === 'academic' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Informasi Akademik</h2>
              {renderAcademicInfo()}
            </div>
          )}


          {/* Tab Content - Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Pengaturan Keamanan</h2>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Ubah Password</h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="text-sm font-medium text-gray-700 block mb-2">Password Lama</label>
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={passwordData.oldPassword}
                        onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-8 text-sm text-gray-500 hover:text-gray-700"
                      >
                        {showOldPassword ? 'Sembunyikan' : 'Tampilkan'}
                      </button>
                    </div>

                    <div className="relative">
                      <label className="text-sm font-medium text-gray-700 block mb-2">Password Baru</label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-8 text-sm text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? 'Sembunyikan' : 'Tampilkan'}
                      </button>
                    </div>

                    <div className="relative">
                      <label className="text-sm font-medium text-gray-700 block mb-2">Konfirmasi Password Baru</label>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-8 text-sm text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}
                      </button>
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Ubah Password
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Verifikasi Dua Faktor</h3>
                  <p className="text-gray-600 mb-4">Aktifkan verifikasi dua faktor untuk meningkatkan keamanan akun Anda.</p>
                  <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    Aktifkan 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content - Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Pengaturan Notifikasi</h2>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifikasi</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
                      <span className="text-gray-700">Pengumuman Penting</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
                      <span className="text-gray-700">Update Sistem</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
                      <span className="text-gray-700">Informasi Akademik</span>
                    </label>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notifikasi Browser</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
                      <span className="text-gray-700">Aktifkan Notifikasi Browser</span>
                    </label>
                    <p className="text-sm text-gray-500">Terima notifikasi langsung di browser Anda saat ada informasi penting.</p>
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default ProfilePage;
