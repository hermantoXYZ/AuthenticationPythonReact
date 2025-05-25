# from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, CustomUser, Fakultas, ProgramStudi, UserDosen, UserMahasiswa


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

class DosenProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()

    class Meta:
        model = UserDosen
        fields = ['user', 'nidn', 'nip', 'jabatan_akademik', 'pendidikan_terakhir', 'bidang_keahlian', 'status_kepegawaian']


class MahasiswaProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    class Meta:
        model = UserMahasiswa
        fields = ['user', 'nim', 'program_studi', 'angkatan', 'semester', 'status', 'ipk', 'tanggal_masuk']

class DosenProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    
    class Meta:
        model = UserDosen
        fields = ['user', 'nip', 'jabatan_akademik', 'program_studi', 'pendidikan_terakhir', 'bidang_keahlian','status_kepegawaian']


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}

# Serializer for model lain
class FakultasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fakultas
        fields = '__all__'

class ProgramStudiSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramStudi
        fields = '__all__'

class DosenSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDosen
        fields = '__all__'

class MahasiswaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMahasiswa
        fields = '__all__'
