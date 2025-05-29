from django.shortcuts import render
from rest_framework import generics, viewsets, permissions
from .serializers import UserSerializer, NoteSerializer, FakultasSerializer, ProgramStudiSerializer, UserProfileSerializer, MahasiswaProfileSerializer, DosenProfileSerializer, StaffProfileSerializer, StaffFakultasProfileSerializer, JurusanSerializer, SkripsiJudulSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, CustomUser, Fakultas, ProgramStudi, UserMahasiswa, UserDosen, UserStaffProdi, UserStaffFakultas, Jurusan, SkripsiJudul, UserType
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied


class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class FakultasViewSet(viewsets.ModelViewSet):
    queryset = Fakultas.objects.all()
    serializer_class = FakultasSerializer
    permission_classes = [IsAuthenticated]

class ProgramStudiListView(generics.ListCreateAPIView):
    serializer_class = ProgramStudiSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'pejabat_jurusan':
            try:
                pejabat = self.request.user.pejabat_jurusan
                return ProgramStudi.objects.filter(jurusan=pejabat.jurusan)
            except PejabatJurusan.DoesNotExist:
                return ProgramStudi.objects.none()
        return ProgramStudi.objects.all()

class ProgramStudiDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProgramStudi.objects.all()
    serializer_class = ProgramStudiSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'pejabat_jurusan':
            try:
                pejabat = self.request.user.pejabat_jurusan
                return ProgramStudi.objects.filter(jurusan=pejabat.jurusan)
            except PejabatJurusan.DoesNotExist:
                return ProgramStudi.objects.none()
        return ProgramStudi.objects.all()

        
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
        
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

class DosenProfileView(generics.RetrieveAPIView):
    serializer_class = DosenProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        try:
            return UserDosen.objects.get(user=self.request.user)
        except UserDosen.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Profil dosen tidak ditemukan")
            
class StaffProfileView(generics.RetrieveAPIView):
    serializer_class = StaffProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return UserStaffProdi.objects.select_related('user', 'program_studi').get(user=self.request.user)

class StaffFakultasProfileView(generics.RetrieveAPIView):
    serializer_class = StaffFakultasProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return UserStaffFakultas.objects.select_related('user', 'fakultas').get(user=self.request.user)


class MahasiswaProfileView(generics.RetrieveAPIView):
    serializer_class = MahasiswaProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        try:
            return UserMahasiswa.objects.get(user=self.request.user)
        except UserMahasiswa.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Profil mahasiswa tidak ditemukan")

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not user.check_password(old_password):
            return Response({'error': 'Password lama tidak sesuai'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            validate_password(new_password, user)
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password berhasil diubah'}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'error': e.messages[0]}, status=status.HTTP_400_BAD_REQUEST)

class UserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        return CustomUser.objects.select_related(
            'mahasiswa_profile__program_studi',
            'dosen_profile__program_studi',
            'staff_prodi_profile__program_studi',
            'ketua_prodi_profile__program_studi'
        ).prefetch_related(
            'mahasiswa_profile__dosen_wali',
        ).all().order_by('-created_at')

class UserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer
    queryset = CustomUser.objects.select_related(
        'mahasiswa_profile__program_studi',
        'dosen_profile__program_studi',
        'staff_prodi_profile__program_studi',
        'ketua_prodi_profile__program_studi'
    ).prefetch_related(
        'mahasiswa_profile__dosen_wali'
    )

class JurusanViewSet(viewsets.ModelViewSet):
    queryset = Jurusan.objects.all()
    serializer_class = JurusanSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({'message': 'Jurusan berhasil dihapus'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SkripsiJudulViewSet(viewsets.ModelViewSet):
    serializer_class = SkripsiJudulSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        print(f"User type: {user.user_type}")  # Debug print
        
        if user.user_type == 'mahasiswa':
            queryset = SkripsiJudul.objects.filter(mahasiswa__user=user)
            print(f"Mahasiswa queryset count: {queryset.count()}")  # Debug print
            return queryset
        elif user.user_type == 'staff_prodi':
            return SkripsiJudul.objects.filter(
                mahasiswa__program_studi=user.staff_prodi_profile.program_studi
            )
        elif user.user_type == 'staff_fakultas':
            return SkripsiJudul.objects.filter(
                mahasiswa__program_studi__fakultas=user.staff_fakultas_profile.fakultas
            )
        elif user.user_type == 'dosen':
            return SkripsiJudul.objects.filter(
                Q(pembimbing_1__user=user) | 
                Q(pembimbing_2__user=user)
            )
        return SkripsiJudul.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        print(f"Creating submission for user: {user.username}, type: {user.user_type}")  # Debug print
        
        if user.user_type != 'mahasiswa':
            raise PermissionDenied("Hanya mahasiswa yang dapat mengajukan judul skripsi")
        
        try:
            mahasiswa = UserMahasiswa.objects.get(user=user)
            print(f"Found mahasiswa profile: {mahasiswa.nim}")  # Debug print
            
            # Check if student already has a pending submission
            existing_submission = SkripsiJudul.objects.filter(
                mahasiswa=mahasiswa,
                status__in=['pending', 'revision']
            ).exists()
            
            if existing_submission:
                raise ValidationError("Anda masih memiliki pengajuan judul yang sedang diproses")
            
            serializer.save(mahasiswa=mahasiswa, status='pending')
            print("Submission created successfully")  # Debug print
            
        except UserMahasiswa.DoesNotExist:
            print(f"No mahasiswa profile found for user: {user.username}")  # Debug print
            raise ValidationError("Profil mahasiswa tidak ditemukan")
        except Exception as e:
            print(f"Error creating submission: {str(e)}")  # Debug print
            raise ValidationError(str(e))

    def create(self, request, *args, **kwargs):
        print("Request data:", request.data)  # Debug print
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"Error in create method: {str(e)}")  # Debug print
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        partial = kwargs.pop('partial', False)

        # Validasi berdasarkan user type
        if user.user_type == 'mahasiswa':
            # Mahasiswa hanya bisa update jika status masih pending atau perlu revisi
            if instance.status not in ['pending', 'revision']:
                raise PermissionDenied("Tidak dapat mengubah pengajuan yang sudah diproses")
            
        elif user.user_type == 'staff_prodi':
            # Staff prodi hanya bisa update status dan catatan prodi
            allowed_fields = ['status', 'catatan_prodi']
            request.data.update({
                k: v for k, v in request.data.items() 
                if k in allowed_fields
            })
            
        elif user.user_type == 'staff_fakultas':
            # Staff fakultas bisa update status, catatan fakultas, dan menentukan pembimbing
            allowed_fields = ['status', 'catatan_fakultas', 'pembimbing_1', 'pembimbing_2', 'judul_diterima']
            request.data.update({
                k: v for k, v in request.data.items() 
                if k in allowed_fields
            })
            
        elif user.user_type == 'dosen':
            # Dosen (pembimbing) hanya bisa memberikan catatan
            if user.dosen_profile not in [instance.pembimbing_1, instance.pembimbing_2]:
                raise PermissionDenied("Anda bukan pembimbing untuk pengajuan ini")
            request.data.update({'catatan_pembimbing': request.data.get('catatan_pembimbing')})

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user

        # Hanya mahasiswa yang bisa menghapus, dan hanya jika masih pending
        if user.user_type != 'mahasiswa' or instance.status != 'pending':
            raise PermissionDenied("Tidak dapat menghapus pengajuan yang sudah diproses")

        return super().destroy(request, *args, **kwargs)

class FakultasViewSet(viewsets.ModelViewSet):
    queryset = Fakultas.objects.all()
    serializer_class = FakultasSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({'message': 'Fakultas berhasil dihapus'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DosenListView(generics.ListAPIView):
    serializer_class = DosenProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get users that are ketua_prodi
        ketua_prodi_users = CustomUser.objects.filter(
            user_type=UserType.KETUA_PRODI,
            is_active=True
        )
        
        # Get dosen profiles for these users
        queryset = UserDosen.objects.filter(
            user__in=ketua_prodi_users
        ).select_related(
            'user',
            'program_studi'
        )
        
        print("\n=== DEBUG KETUA PRODI ===")
        print(f"Total Ketua Prodi users found: {ketua_prodi_users.count()}")
        print(f"Total Dosen profiles found: {queryset.count()}")
        
        for dosen in queryset:
            print(f"\nKetua Prodi Detail:")
            print(f"- Nama: {dosen.user.full_name}")
            print(f"- NIP: {dosen.nip}")
            print(f"- User Type: {dosen.user.user_type}")
            print(f"- Program Studi: {dosen.program_studi.nama if dosen.program_studi else 'No Prodi'}")
        
        print("\n=== END DEBUG ===\n")
        return queryset