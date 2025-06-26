from rest_framework import serializers
from .models import Note, CustomUser, Fakultas, ProgramStudi, UserDosen, UserMahasiswa, PejabatJurusan, UserKetuaProdi, Jurusan, UserStaffProdi, SkripsiJudul, UserStaffFakultas, UserType, Article, NomorSurat, TandaTangan, JenisLayanan, Layanan, DataTambahanFile
import json

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'full_name', 'email', 'phone_number', 'user_type']

class JurusanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jurusan
        fields = ['id', 'nama_jurusan', 'status', 'kode_surat']

class ProgramStudiSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramStudi
        fields = '__all__'

class DosenBasicSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    program_studi = ProgramStudiSerializer(read_only=True)
    
    class Meta:
        model = UserDosen
        fields = ['user', 'nip', 'program_studi', 'jabatan_akademik', 'pendidikan_terakhir', 'bidang_keahlian', 'status_kepegawaian']

class PejabatJurusanSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    jurusan = JurusanSerializer(read_only=True)
    dosen_profile = DosenBasicSerializer(source='user.dosen_profile', read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    jurusan_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = PejabatJurusan
        fields = ['id', 'user', 'jurusan', 'dosen_profile', 'jabatan', 'tgl_mulai', 'tgl_selesai', 'plt', 'label', 'user_id', 'jurusan_id']
        read_only_fields = ['id', 'user', 'jurusan', 'dosen_profile']

    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        jurusan_id = validated_data.pop('jurusan_id')
        
        user = CustomUser.objects.get(id=user_id)
        jurusan = Jurusan.objects.get(id=jurusan_id)
        
        # Update user type to pejabat_jurusan if not already
        if user.user_type != UserType.PEJABAT_JURUSAN:
            user.user_type = UserType.PEJABAT_JURUSAN
            user.save()
        
        return PejabatJurusan.objects.create(
            user=user,
            jurusan=jurusan,
            **validated_data
        )

    def update(self, instance, validated_data):
        if 'jurusan_id' in validated_data:
            jurusan_id = validated_data.pop('jurusan_id')
            instance.jurusan = Jurusan.objects.get(id=jurusan_id)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

# class FakultasSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Fakultas
#         fields = '__all__'
        
class FakultasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fakultas
        fields = ['id', 'nama', 'kode', 'dekan']

class KetuaProdiSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    program_studi = ProgramStudiSerializer(read_only=True)
    dosen_profile = DosenBasicSerializer(source='user.dosen_profile', read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    program_studi_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = UserKetuaProdi
        fields = ['id', 'user', 'program_studi', 'dosen_profile', 'periode_mulai', 'periode_selesai', 'plt', 'label', 'user_id', 'program_studi_id']
        read_only_fields = ['id', 'user', 'program_studi', 'dosen_profile']

    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        program_studi_id = validated_data.pop('program_studi_id')
        
        user = CustomUser.objects.get(id=user_id)
        program_studi = ProgramStudi.objects.get(id=program_studi_id)
        
        # Update user type to ketua_prodi if not already
        if user.user_type != UserType.KETUA_PRODI:
            user.user_type = UserType.KETUA_PRODI
            user.save()
        
        return UserKetuaProdi.objects.create(
            user=user,
            program_studi=program_studi,
            **validated_data
        )

class DosenProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    program_studi = ProgramStudiSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    program_studi_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = UserDosen
        fields = [
            'id', 'user', 'user_id', 'nip', 'program_studi', 'program_studi_id',
            'jabatan_akademik', 'pendidikan_terakhir', 'bidang_keahlian',
            'status_kepegawaian'
        ]
        read_only_fields = ['id', 'user', 'program_studi']

    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        program_studi_id = validated_data.pop('program_studi_id')
        
        user = CustomUser.objects.get(id=user_id)
        program_studi = ProgramStudi.objects.get(id=program_studi_id)
        
        # Update user type if needed
        if user.user_type not in [UserType.DOSEN, UserType.DEKAN_FAKULTAS, UserType.KETUA_PRODI, UserType.PEJABAT_JURUSAN]:
            user.user_type = UserType.DOSEN
            user.save()
        
        dosen = UserDosen.objects.create(
            user=user,
            program_studi=program_studi,
            **validated_data
        )
        return dosen

    def update(self, instance, validated_data):
        if 'program_studi_id' in validated_data:
            program_studi_id = validated_data.pop('program_studi_id')
            instance.program_studi = ProgramStudi.objects.get(id=program_studi_id)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class MahasiswaProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    program_studi = ProgramStudiSerializer(read_only=True)
    dosen_wali = DosenBasicSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    program_studi_id = serializers.IntegerField(write_only=True)
    dosen_wali_nip = serializers.CharField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = UserMahasiswa
        fields = ['id', 'user', 'user_id', 'nim', 'kelas', 'program_studi', 'program_studi_id', 'angkatan', 'semester', 'status', 'ipk', 'tanggal_masuk', 'dosen_wali', 'dosen_wali_nip']
        read_only_fields = ['id', 'user', 'program_studi', 'dosen_wali']

    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        program_studi_id = validated_data.pop('program_studi_id')
        dosen_wali_nip = validated_data.pop('dosen_wali_nip', None)

        user = CustomUser.objects.get(id=user_id)
        program_studi = ProgramStudi.objects.get(id=program_studi_id)
        dosen_wali = None if dosen_wali_nip is None else UserDosen.objects.filter(nip=dosen_wali_nip).first()

        mahasiswa = UserMahasiswa.objects.create(
            user=user,
            program_studi=program_studi,
            dosen_wali=dosen_wali,
            **validated_data
        )
        return mahasiswa

    def update(self, instance, validated_data):
        if 'program_studi_id' in validated_data:
            program_studi_id = validated_data.pop('program_studi_id')
            instance.program_studi = ProgramStudi.objects.get(id=program_studi_id)
        
        if 'dosen_wali_nip' in validated_data:
            dosen_wali_nip = validated_data.pop('dosen_wali_nip')
            instance.dosen_wali = None if dosen_wali_nip is None else UserDosen.objects.filter(nip=dosen_wali_nip).first()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class StaffProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    program_studi = ProgramStudiSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    program_studi_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = UserStaffProdi
        fields = ['id', 'user', 'nip', 'program_studi', 'jabatan', 'user_id', 'program_studi_id']
        read_only_fields = ['id', 'user', 'program_studi']

    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        program_studi_id = validated_data.pop('program_studi_id')
        
        user = CustomUser.objects.get(id=user_id)
        program_studi = ProgramStudi.objects.get(id=program_studi_id)
        
        return UserStaffProdi.objects.create(
            user=user,
            program_studi=program_studi,
            **validated_data
        )

class StaffFakultasProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    fakultas = FakultasSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    fakultas_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = UserStaffFakultas
        fields = ['id', 'user', 'fakultas', 'user_id', 'fakultas_id', 'jabatan', 'nip']
        read_only_fields = ['id']

    def create(self, validated_data):
        user = CustomUser.objects.get(id=validated_data['user_id'])
        fakultas = Fakultas.objects.get(id=validated_data['fakultas_id'])
        
        # Update user type
        user.user_type = UserType.STAFF_FAKULTAS
        user.save()
        
        staff_fakultas = UserStaffFakultas.objects.create(
            user=user,
            fakultas=fakultas,
            jabatan=validated_data['jabatan'],
            nip=validated_data.get('nip')
        )
        return staff_fakultas

    def update(self, instance, validated_data):
        if 'fakultas_id' in validated_data:
            fakultas = Fakultas.objects.get(id=validated_data['fakultas_id'])
            instance.fakultas = fakultas
        
        instance.jabatan = validated_data.get('jabatan', instance.jabatan)
        instance.nip = validated_data.get('nip', instance.nip)
        instance.save()
        return instance

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "password", "user_type"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """Full user serializer with all profiles"""
    mahasiswa_profile = MahasiswaProfileSerializer(read_only=True)
    dosen_profile = DosenProfileSerializer(read_only=True)
    staff_prodi_profile = StaffProfileSerializer(read_only=True)
    ketua_prodi_profile = KetuaProdiSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'full_name', 'phone_number', 'tempat_lahir', 
            'birth_date', 'gender', 'profile_picture', 'user_type', 'is_active',
            'mahasiswa_profile', 'dosen_profile', 'staff_prodi_profile', 
            'ketua_prodi_profile'
        ]
        read_only_fields = ['id', 'username', 'user_type']

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}


class DosenSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDosen
        fields = '__all__'

class MahasiswaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMahasiswa
        fields = '__all__'

class SkripsiJudulSerializer(serializers.ModelSerializer):
    mahasiswa_name = serializers.CharField(source='mahasiswa.user.full_name', read_only=True)
    pembimbing_1_name = serializers.CharField(source='pembimbing_1.user.full_name', read_only=True)
    pembimbing_2_name = serializers.CharField(source='pembimbing_2.user.full_name', read_only=True)
    dosen_wali_name = serializers.CharField(source='mahasiswa.dosen_wali.user.full_name', read_only=True)
    program_studi = serializers.CharField(source='mahasiswa.program_studi.nama', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Tambahkan nested serializer untuk mahasiswa
    mahasiswa = MahasiswaProfileSerializer(read_only=True)
    
    class Meta:
        model = SkripsiJudul
        fields = [
            'id', 'mahasiswa', 'mahasiswa_name', 'program_studi',
            'judul_1', 'deskripsi_1',
            'judul_2', 'deskripsi_2',
            'judul_3', 'deskripsi_3',
            'judul_diterima',
            'status', 'status_display',
            'tanggal_pengajuan', 'tanggal_update',
            'pembimbing_1', 'pembimbing_1_name',
            'pembimbing_2', 'pembimbing_2_name',
            'dosen_wali_name',
            'catatan_prodi', 'catatan_fakultas', 'catatan_pembimbing'
        ]
        read_only_fields = ['mahasiswa', 'tanggal_pengajuan', 'tanggal_update']

    def validate(self, data):
        # Validate that all required fields are present
        required_fields = ['judul_1', 'deskripsi_1', 'judul_2', 'deskripsi_2', 'judul_3', 'deskripsi_3']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError(f"{field.replace('_', ' ').title()} harus diisi")
        
        # Validate that titles are unique
        titles = [data.get('judul_1'), data.get('judul_2'), data.get('judul_3')]
        if len(set(titles)) != len(titles):
            raise serializers.ValidationError("Judul skripsi tidak boleh sama")
        
        # Validate judul_diterima when status is accepted
        if data.get('status') == 'accepted':
            if not data.get('judul_diterima'):
                raise serializers.ValidationError("Judul yang diterima harus dipilih ketika status 'accepted'")
            
            # Validate that judul_diterima matches one of the submitted titles
            valid_titles = [data.get('judul_1'), data.get('judul_2'), data.get('judul_3')]
            if data.get('judul_diterima') not in valid_titles:
                raise serializers.ValidationError("Judul yang diterima harus salah satu dari judul yang diajukan")
        
        return data

class ArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    related_prodi_name = serializers.CharField(source='related_prodi.nama', read_only=True)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt',
            'author', 'author_name', 'category', 'category_display',
            'tags', 'featured_image', 'status', 'status_display',
            'is_featured', 'related_prodi', 'related_prodi_name',
            'created_at', 'updated_at', 'published_at',
            'meta_title', 'meta_description', 'view_count'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at', 'view_count', 'slug']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        validated_data['slug'] = self.generate_unique_slug(validated_data['title'])
        return super().create(validated_data)

    def generate_unique_slug(self, title):
        from django.utils.text import slugify
        slug = slugify(title)
        unique_slug = slug
        num = 1
        while Article.objects.filter(slug=unique_slug).exists():
            unique_slug = f"{slug}-{num}"
            num += 1
        return unique_slug

class StaffFakultasSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    fakultas = FakultasSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    fakultas_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = UserStaffFakultas
        fields = ['id', 'user', 'fakultas', 'user_id', 'fakultas_id', 'jabatan', 'nip', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = User.objects.get(id=validated_data['user_id'])
        fakultas = Fakultas.objects.get(id=validated_data['fakultas_id'])
        
        # Update user type
        user.user_type = 'staff_fakultas'
        user.save()
        
        staff_fakultas = UserStaffFakultas.objects.create(
            user=user,
            fakultas=fakultas,
            jabatan=validated_data['jabatan'],
            nip=validated_data.get('nip')
        )
        return staff_fakultas

    def update(self, instance, validated_data):
        if 'fakultas_id' in validated_data:
            fakultas = Fakultas.objects.get(id=validated_data['fakultas_id'])
            instance.fakultas = fakultas
        
        instance.jabatan = validated_data.get('jabatan', instance.jabatan)
        instance.nip = validated_data.get('nip', instance.nip)
        instance.save()
        return instance


class NomorSuratSerializer(serializers.ModelSerializer):
    admin_nomor_surat_detail = UserSerializer(source='admin_nomor_surat', read_only=True)
    jurusan_detail = JurusanSerializer(source='jurusan', read_only=True)
    program_studi_detail = ProgramStudiSerializer(source='program_studi', read_only=True)
    full_nomor = serializers.CharField(source='get_full_nomor', read_only=True)

    class Meta:
        model = NomorSurat
        fields = [
            'id', 'tanggal_dibuat', 'admin_nomor_surat', 'admin_nomor_surat_detail',
            'jurusan', 'jurusan_detail', 'program_studi', 'program_studi_detail',
            'nomor', 'kode', 'jenis', 'tahun', 'perihal', 'tujuan', 'status',
            'full_nomor'
        ]
        read_only_fields = ['tanggal_dibuat', 'admin_nomor_surat', 'kode']

    def validate_tahun(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Tahun harus berupa angka")
        if len(value) > 4:
            raise serializers.ValidationError("Tahun maksimal 4 digit")
        return value

    def validate_nomor(self, value):
        if value <= 0:
            raise serializers.ValidationError("Nomor harus lebih besar dari 0")
        return value

    def validate(self, data):
        # Check if nomor, tahun, and jenis combination is unique
        nomor = data.get('nomor')
        tahun = data.get('tahun')
        jenis = data.get('jenis', 'KM')
        
        if nomor and tahun:
            # Get the current instance if it exists (for updates)
            instance = getattr(self, 'instance', None)
            
            # Check for existing records with the same combination
            exists = NomorSurat.objects.filter(nomor=nomor, tahun=tahun, jenis=jenis)
            
            # If this is an update, exclude the current instance
            if instance:
                exists = exists.exclude(pk=instance.pk)
            
            if exists.exists():
                raise serializers.ValidationError({
                    'non_field_errors': ['Nomor surat dengan kombinasi nomor, tahun, dan jenis tersebut sudah ada']
                })
        
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user:
            validated_data['admin_nomor_surat'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Don't allow changing admin_nomor_surat during update
        validated_data.pop('admin_nomor_surat', None)
        return super().update(instance, validated_data)

class JenisLayananSerializer(serializers.ModelSerializer):
    class Meta:
        model = JenisLayanan
        fields = '__all__'

    def validate(self, data):
        # Validasi nama layanan tidak boleh kosong
        if not data.get('nama_layanan'):
            raise serializers.ValidationError("Nama layanan harus diisi")
        
        # Validasi deskripsi layanan tidak boleh kosong
        if not data.get('deskripsi_layanan'):
            raise serializers.ValidationError("Deskripsi layanan harus diisi")
        
        # Validasi prasyarat layanan tidak boleh kosong
        if not data.get('prasyarat_layanan'):
            raise serializers.ValidationError("Prasyarat layanan harus diisi")
        
        return data

class DataTambahanFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataTambahanFile
        fields = ['id', 'nama_field', 'file', 'tanggal_upload']
        read_only_fields = ['tanggal_upload']

class LayananSimpleSerializer(serializers.ModelSerializer):
    jenis_layanan_nama = serializers.SerializerMethodField()
    mahasiswa_name = serializers.SerializerMethodField()
    class Meta:
        model = Layanan
        fields = ['id', 'jenis_layanan_nama', 'mahasiswa_name']
    
    def get_jenis_layanan_nama(self, obj):
        if obj.jenis_layanan:
            return obj.jenis_layanan.nama_layanan
        return None
    
    def get_mahasiswa_name(self, obj):
        if obj.mahasiswa:
            return obj.mahasiswa.full_name
        return None

class TandaTanganSerializer(serializers.ModelSerializer):
    user_penandatangan = UserBasicSerializer(read_only=True)
    layanan = LayananSimpleSerializer(read_only=True)
    layanan_id = serializers.PrimaryKeyRelatedField(
        queryset=Layanan.objects.all(), source='layanan', write_only=True
    )
    user_penandatangan_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), source='user_penandatangan', write_only=True, allow_null=True, required=False
    )

    class Meta:
        model = TandaTangan
        fields = [
            'id', 'layanan', 'user_penandatangan', 'jabatan_penandatangan',
            'jenis_tanda_tangan', 'urutan', 'waktu_tanda_tangan', 'status',
            'perihal', 'file_tanda_tangan', 'tanda_tangan_elektronik',
            'layanan_id', 'user_penandatangan_id'
        ]

class LayananSerializer(serializers.ModelSerializer):
    mahasiswa_name = serializers.SerializerMethodField()
    mahasiswa_nim = serializers.SerializerMethodField()
    mahasiswa_username = serializers.SerializerMethodField()
    mahasiswa_email = serializers.SerializerMethodField()
    mahasiswa_phone = serializers.SerializerMethodField()
    jenis_layanan_nama = serializers.SerializerMethodField()
    jenis_layanan_deskripsi = serializers.SerializerMethodField()
    jenis_layanan_prasyarat = serializers.SerializerMethodField()
    program_studi_nama = serializers.SerializerMethodField()
    program_studi_fakultas = serializers.SerializerMethodField()
    program_studi_jenjang = serializers.SerializerMethodField()
    program_studi_jurusan_id = serializers.SerializerMethodField()
    admin_pemroses_name = serializers.SerializerMethodField()
    admin_pemroses_email = serializers.SerializerMethodField()
    admin_pemroses_user_type = serializers.SerializerMethodField()
    nomor_surat_full = serializers.SerializerMethodField()
    nomor_surat_perihal = serializers.SerializerMethodField()
    nomor_surat_tujuan = serializers.SerializerMethodField()
    file_tambahan = DataTambahanFileSerializer(many=True, read_only=True)
    penandatangan = TandaTanganSerializer(source='daftar_tanda_tangan', many=True, read_only=True)

    class Meta:
        model = Layanan
        fields = '__all__'
        read_only_fields = ['mahasiswa', 'program_studi', 'status', 'admin_pemroses', 'hasil_proses', 'file_hasil', 'link_hasil']

    def get_mahasiswa_name(self, obj):
        if obj.mahasiswa:
            return obj.mahasiswa.full_name
        return None

    def get_mahasiswa_username(self, obj): 
        if obj.mahasiswa:
            return obj.mahasiswa.username
        return None

    def get_mahasiswa_nim(self, obj):
        if obj.mahasiswa and hasattr(obj.mahasiswa, 'mahasiswa_profile'):
            return obj.mahasiswa.mahasiswa_profile.nim
        return None

    def get_mahasiswa_email(self, obj):
        if obj.mahasiswa:
            return obj.mahasiswa.email
        return None

    def get_mahasiswa_phone(self, obj):
        if obj.mahasiswa:
            return obj.mahasiswa.phone_number
        return None

    def get_jenis_layanan_nama(self, obj):
        if obj.jenis_layanan:
            return obj.jenis_layanan.nama_layanan
        return None

    def get_jenis_layanan_deskripsi(self, obj):
        if obj.jenis_layanan:
            return obj.jenis_layanan.deskripsi_layanan
        return None

    def get_jenis_layanan_prasyarat(self, obj):
        if obj.jenis_layanan:
            return obj.jenis_layanan.prasyarat_layanan
        return None

    def get_program_studi_nama(self, obj):
        if obj.program_studi:
            return obj.program_studi.nama
        return None

    def get_program_studi_fakultas(self, obj):
        if obj.program_studi and obj.program_studi.fakultas:
            return obj.program_studi.fakultas.nama
        return None

    def get_program_studi_jenjang(self, obj):
        if obj.program_studi:
            return obj.program_studi.jenjang
        return None

    def get_program_studi_jurusan_id(self, obj):
        if obj.program_studi and obj.program_studi.jurusan:
            return obj.program_studi.jurusan.id
        return None

    def get_admin_pemroses_name(self, obj):
        if obj.admin_pemroses:
            return obj.admin_pemroses.full_name
        return None

    def get_admin_pemroses_email(self, obj):
        if obj.admin_pemroses:
            return obj.admin_pemroses.email
        return None

    def get_admin_pemroses_user_type(self, obj):
        if obj.admin_pemroses:
            return obj.admin_pemroses.get_user_type_display()
        return None

    def get_nomor_surat_full(self, obj):
        if obj.nomor_surat:
            return obj.nomor_surat.get_full_nomor()
        return None

    def get_nomor_surat_perihal(self, obj):
        if obj.nomor_surat:
            return obj.nomor_surat.perihal
        return None

    def get_nomor_surat_tujuan(self, obj):
        if obj.nomor_surat:
            return obj.nomor_surat.tujuan
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        if not request:
            raise serializers.ValidationError("Request context is required")

        # Get jenis_layanan from validated_data
        jenis_layanan = validated_data.get('jenis_layanan')
        if not jenis_layanan:
            raise serializers.ValidationError("Jenis layanan is required")

        # Handle data_tambahan (text/number fields)
        data_tambahan = {}
        if 'data_tambahan' in request.data:
            try:
                if isinstance(request.data['data_tambahan'], str):
                    data_tambahan = json.loads(request.data['data_tambahan'])
                else:
                    data_tambahan = request.data['data_tambahan']
            except json.JSONDecodeError:
                raise serializers.ValidationError("Invalid data_tambahan format")

        # Create layanan instance
        instance = Layanan.objects.create(**validated_data)

        # Process file fields from request.FILES
        if request.FILES:
            for field_name, file in request.FILES.items():
                # Check if this is a file field from konfigurasi_field
                if jenis_layanan.konfigurasi_field:
                    field_config = next(
                        (field for field in jenis_layanan.konfigurasi_field 
                         if field.get('name') == field_name and field.get('type') == 'file'),
                        None
                    )
                    if field_config:
                        # Create DataTambahanFile instance
                        DataTambahanFile.objects.create(
                            layanan=instance,
                            nama_field=field_name,
                            file=file
                        )

        # Update data_tambahan
        if data_tambahan:
            instance.data_tambahan = data_tambahan
            instance.save()

        return instance

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if not request:
            raise serializers.ValidationError("Request context is required")

        # Handle data_tambahan (text/number fields)
        data_tambahan = instance.data_tambahan or {}
        if 'data_tambahan' in request.data:
            try:
                if isinstance(request.data['data_tambahan'], str):
                    new_data = json.loads(request.data['data_tambahan'])
                else:
                    new_data = request.data['data_tambahan']
                data_tambahan.update(new_data)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Invalid data_tambahan format")

        # Process file fields from request.FILES
        if request.FILES:
            for field_name, file in request.FILES.items():
                # Check if this is a file field from konfigurasi_field
                if instance.jenis_layanan.konfigurasi_field:
                    field_config = next(
                        (field for field in instance.jenis_layanan.konfigurasi_field 
                         if field.get('name') == field_name and field.get('type') == 'file'),
                        None
                    )
                    if field_config:
                        # Update or create DataTambahanFile instance
                        DataTambahanFile.objects.update_or_create(
                            layanan=instance,
                            nama_field=field_name,
                            defaults={'file': file}
                        )

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Update data_tambahan
        instance.data_tambahan = data_tambahan
        instance.save()
        return instance