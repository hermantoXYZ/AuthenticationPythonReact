from rest_framework import serializers
from .models import Note, CustomUser, Fakultas, ProgramStudi, UserDosen, UserMahasiswa, PejabatJurusan, UserKetuaProdi, Jurusan, UserStaffProdi

class JurusanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jurusan
        fields = '__all__'


class PejabatJurusanSerializer(serializers.ModelSerializer):
    jurusan = JurusanSerializer(read_only=True)

    class Meta:
        model = PejabatJurusan
        fields = ['jabatan', 'jurusan', 'tgl_mulai', 'tgl_selesai', 'plt', 'label']

class ProgramStudiSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramStudi
        fields = '__all__'


class FakultasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fakultas
        fields = '__all__'
        

class KetuaProdiSerializer(serializers.ModelSerializer):
    program_studi = ProgramStudiSerializer(read_only=True)

    class Meta:
        model = UserKetuaProdi
        fields = ['program_studi', 'periode_mulai', 'periode_selesai', 'plt']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "password", "user_type"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = CustomUser.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'full_name', 'phone_number', 'tempat_lahir', 'birth_date', 'gender', 'profile_picture', 'user_type']
        read_only_fields = ['id', 'username', 'user_type']

class StaffProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    program_studi = ProgramStudiSerializer(read_only=True)
    class Meta:
        model = UserStaffProdi
        fields = ['user', 'nip', 'program_studi', 'jabatan']

class StaffFakultasProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    fakultas = FakultasSerializer(read_only=True)
    class Meta:
        model = UserStaffProdi
        fields = ['user', 'nip', 'jabatan', 'fakultas']

class DosenProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    program_studi = ProgramStudiSerializer(read_only=True)
    pejabat_jurusan = serializers.SerializerMethodField()
    ketua_prodi = serializers.SerializerMethodField()


    class Meta:
        model = UserDosen
        fields = [
            'user', 'nip', 'jabatan_akademik', 'program_studi',
            'pendidikan_terakhir', 'bidang_keahlian', 'pejabat_jurusan',
            'status_kepegawaian', 'ketua_prodi'
        ]

    def get_ketua_prodi(self, obj):
        user = obj.user
        if hasattr(user, 'ketua_prodi_profile'):
            ketua_prodi = user.ketua_prodi_profile
            return KetuaProdiSerializer(ketua_prodi).data
        return None

    def get_pejabat_jurusan(self, obj):
        user = obj.user
        if hasattr(user, 'pejabat_jurusan'):
            return PejabatJurusanSerializer(user.pejabat_jurusan).data
        return None


class MahasiswaProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    program_studi = ProgramStudiSerializer(read_only=True)
    dosen_wali = DosenProfileSerializer(read_only=True)

    class Meta:
        model = UserMahasiswa
        fields = ['user', 'nim', 'program_studi', 'angkatan', 'semester', 'status', 'ipk', 'tanggal_masuk', 'dosen_wali']

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
