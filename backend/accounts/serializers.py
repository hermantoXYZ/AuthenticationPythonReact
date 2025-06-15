from rest_framework import serializers
from .models import Note, CustomUser, Fakultas, ProgramStudi, UserDosen, UserMahasiswa, PejabatJurusan, UserKetuaProdi, Jurusan, UserStaffProdi, SkripsiJudul, UserStaffFakultas, UserType, Article

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
        read_only_fields = ['mahasiswa', 'pembimbing_1', 'pembimbing_2', 'tanggal_pengajuan', 'tanggal_update']

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
