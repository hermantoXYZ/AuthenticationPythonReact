from django.shortcuts import render
from rest_framework import generics, viewsets, permissions
from .serializers import (
    UserSerializer, NoteSerializer, FakultasSerializer, ProgramStudiSerializer, 
    UserProfileSerializer, MahasiswaProfileSerializer, DosenProfileSerializer, 
    StaffProfileSerializer, StaffFakultasProfileSerializer, JurusanSerializer, 
    SkripsiJudulSerializer, PejabatJurusanSerializer, KetuaProdiSerializer,
    ArticleSerializer, NomorSuratSerializer, TandaTanganSuratSerializer, JenisLayananSerializer, LayananSerializer
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import (
    Note, CustomUser, Fakultas, ProgramStudi, UserMahasiswa, UserDosen, 
    UserStaffProdi, UserStaffFakultas, Jurusan, SkripsiJudul, UserType, 
    PejabatJurusan, UserKetuaProdi, Article, NomorSurat, TandaTanganSurat, JenisLayanan, Layanan
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from rest_framework.decorators import action


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
        user_type = self.request.query_params.get('user_type', None)
        queryset = CustomUser.objects.select_related(
            'mahasiswa_profile__program_studi',
            'dosen_profile__program_studi',
            'staff_prodi_profile__program_studi',
            'ketua_prodi_profile__program_studi'
        ).prefetch_related(
            'mahasiswa_profile__dosen_wali',
        )
        
        if user_type:
            queryset = queryset.filter(user_type=user_type)
            
        return queryset.order_by('-created_at')

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
            # Mahasiswa hanya bisa update jika status masih pending, perlu revisi, atau ditolak
            if instance.status not in ['pending', 'revision', 'rejected']:
                raise PermissionDenied("Tidak dapat mengubah pengajuan yang sudah diproses")
            
            # Jika status rejected atau revision, reset status ke pending
            if instance.status in ['rejected', 'revision']:
                request.data['status'] = 'pending'
            
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

class DosenListView(generics.ListCreateAPIView):
    serializer_class = DosenProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get all active dosen profiles
        queryset = UserDosen.objects.filter(
            user__is_active=True,
            user__user_type__in=[
                UserType.DOSEN,
                UserType.DEKAN_FAKULTAS,
                UserType.KETUA_PRODI,
                UserType.PEJABAT_JURUSAN
            ]
        ).select_related(
            'user',
            'program_studi'
        ).order_by('user__full_name')
        return queryset

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class DosenDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DosenProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserDosen.objects.select_related('user', 'program_studi')

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(
                instance,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            user = instance.user
            
            # Delete the dosen profile
            self.perform_destroy(instance)
            
            # Update user type back to default if needed
            if user.user_type in [UserType.DOSEN, UserType.DEKAN_FAKULTAS, UserType.KETUA_PRODI, UserType.PEJABAT_JURUSAN]:
                user.user_type = UserType.DOSEN
                user.save()
            
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class KetuaProdiViewSet(viewsets.ModelViewSet):
    serializer_class = KetuaProdiSerializer
    permission_classes = [IsAuthenticated]
    queryset = UserKetuaProdi.objects.select_related(
        'user',
        'program_studi',
        'user__dosen_profile'
    ).all()

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return KetuaProdiSerializer
        return super().get_serializer_class()

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

class StaffProdiListView(generics.ListCreateAPIView):
    serializer_class = StaffProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get all active staff prodi
        queryset = UserStaffProdi.objects.filter(
            user__is_active=True,
            user__user_type=UserType.STAFF_PRODI
        ).select_related(
            'user',
            'program_studi'
        ).order_by('user__full_name')
        
        return queryset

    def create(self, request, *args, **kwargs):
        try:
            print("Received data:", request.data)
            
            # Validate required fields
            required_fields = ['user_id', 'program_studi_id', 'jabatan']
            for field in required_fields:
                if field not in request.data:
                    return Response(
                        {"detail": f"Field {field} is required"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Validate user exists and is not already staff prodi
            try:
                user = CustomUser.objects.get(id=request.data['user_id'])
                if UserStaffProdi.objects.filter(user=user).exists():
                    return Response(
                        {"detail": "User sudah menjadi staff prodi"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except CustomUser.DoesNotExist:
                return Response(
                    {"detail": "User tidak ditemukan"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Validate program studi exists
            try:
                program_studi = ProgramStudi.objects.get(id=request.data['program_studi_id'])
            except ProgramStudi.DoesNotExist:
                return Response(
                    {"detail": "Program Studi tidak ditemukan"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Create serializer and validate
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Update user type
            user.user_type = UserType.STAFF_PRODI
            user.save()
            
            # Save staff prodi
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
            
        except Exception as e:
            print(f"Error in create: {str(e)}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class StaffProdiDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StaffProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserStaffProdi.objects.select_related('user', 'program_studi')

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            
            # Get the data to update
            data = {}
            if 'nip' in request.data:
                data['nip'] = request.data['nip']
            if 'jabatan' in request.data:
                data['jabatan'] = request.data['jabatan']
            if 'program_studi' in request.data:
                try:
                    program_studi = ProgramStudi.objects.get(id=request.data['program_studi'])
                    data['program_studi'] = program_studi
                except ProgramStudi.DoesNotExist:
                    return Response(
                        {"detail": "Program Studi tidak ditemukan"},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Update the instance
            for key, value in data.items():
                setattr(instance, key, value)
            instance.save()
            
            # Return the updated data
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class StaffFakultasListView(generics.ListCreateAPIView):
    serializer_class = StaffFakultasProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get all active staff fakultas
        queryset = UserStaffFakultas.objects.filter(
            user__is_active=True,
            user__user_type=UserType.STAFF_FAKULTAS
        ).select_related(
            'user',
            'fakultas'
        ).order_by('user__full_name')
        
        return queryset

    def create(self, request, *args, **kwargs):
        try:
            print("Received data:", request.data)
            
            # Validate required fields
            required_fields = ['user_id', 'fakultas_id', 'jabatan']
            for field in required_fields:
                if field not in request.data:
                    return Response(
                        {"detail": f"Field {field} is required"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Validate user exists and is not already staff fakultas
            try:
                user = CustomUser.objects.get(id=request.data['user_id'])
                if UserStaffFakultas.objects.filter(user=user).exists():
                    return Response(
                        {"detail": "User sudah menjadi staff fakultas"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except CustomUser.DoesNotExist:
                return Response(
                    {"detail": "User tidak ditemukan"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Validate fakultas exists
            try:
                fakultas = Fakultas.objects.get(id=request.data['fakultas_id'])
            except Fakultas.DoesNotExist:
                return Response(
                    {"detail": "Fakultas tidak ditemukan"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Create serializer and validate
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Update user type
            user.user_type = UserType.STAFF_FAKULTAS
            user.save()
            
            # Save staff fakultas
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
            
        except Exception as e:
            print(f"Error in create: {str(e)}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class StaffFakultasDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StaffFakultasProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserStaffFakultas.objects.select_related('user', 'fakultas')

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            
            # Get the data to update
            data = {}
            if 'nip' in request.data:
                data['nip'] = request.data['nip']
            if 'jabatan' in request.data:
                data['jabatan'] = request.data['jabatan']
            if 'fakultas_id' in request.data:
                try:
                    fakultas = Fakultas.objects.get(id=request.data['fakultas_id'])
                    data['fakultas'] = fakultas
                except Fakultas.DoesNotExist:
                    return Response(
                        {"detail": "Fakultas tidak ditemukan"},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Update the instance
            for key, value in data.items():
                setattr(instance, key, value)
            instance.save()
            
            # Return the updated data
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class MahasiswaListView(generics.ListCreateAPIView):
    serializer_class = MahasiswaProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get all active mahasiswa profiles
        return UserMahasiswa.objects.select_related(
            'user',
            'program_studi',
            'dosen_wali',
            'dosen_wali__user'
        ).filter(user__is_active=True)

    def create(self, request, *args, **kwargs):
        try:
            # Extract user_id from request data
            user_id = request.data.get('user_id')
            if not user_id:
                return Response(
                    {'error': 'user_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if user exists and is not already a mahasiswa
            try:
                user = CustomUser.objects.get(id=user_id)
            except CustomUser.DoesNotExist:
                return Response(
                    {'error': 'User not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            if UserMahasiswa.objects.filter(user_id=user_id).exists():
                return Response(
                    {'error': 'User is already a mahasiswa'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create mahasiswa profile
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            # Update user type
            user.user_type = 'mahasiswa'
            user.save()

            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class MahasiswaDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MahasiswaProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserMahasiswa.objects.select_related(
        'user',
        'program_studi',
        'dosen_wali',
        'dosen_wali__user'
    )

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(
                instance,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            user = instance.user
            
            # Delete the mahasiswa profile
            self.perform_destroy(instance)
            
            # Update user type to default value
            user.user_type = UserType.MAHASISWA  # Set to default value instead of None
            user.save()
            
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class DekanFakultasListView(generics.ListAPIView):
    serializer_class = DosenProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get all active dekan fakultas profiles
        queryset = UserDosen.objects.filter(
            user__is_active=True,
            user__user_type=UserType.DEKAN_FAKULTAS
        ).select_related(
            'user',
            'fakultas'
        ).order_by('user__full_name')
        
        # Log the available dekan
        print("Available dekan in DekanFakultasListView:")
        for dekan in queryset:
            print(f"ID: {dekan.id}, Name: {dekan.user.full_name}, NIP: {dekan.nip}")
        
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        print("Response data from DekanFakultasListView:", response.data)
        return response

class DekanFakultasDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DosenProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserDosen.objects.select_related(
        'user',
        'fakultas'
    ).filter(user__user_type=UserType.DEKAN_FAKULTAS)

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(
                instance,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            user = instance.user
            
            # Delete the dekan profile
            self.perform_destroy(instance)
            
            # Update user type back to dosen
            user.user_type = UserType.DOSEN
            user.save()
            
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class PejabatJurusanViewSet(viewsets.ModelViewSet):
    serializer_class = PejabatJurusanSerializer
    permission_classes = [IsAuthenticated]
    queryset = PejabatJurusan.objects.select_related('jurusan', 'user', 'user__dosen_profile').all()

    def create(self, request, *args, **kwargs):
        try:
            # Log incoming data for debugging
            print("Received data:", request.data)
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            print("Validation error:", str(e))
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print("Unexpected error:", str(e))
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        try:
            # Log incoming data for debugging
            print("Update data:", request.data)
            
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except ValidationError as e:
            print("Validation error:", str(e))
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print("Unexpected error:", str(e))
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(
                {'message': 'Pejabat Jurusan berhasil dihapus'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print("Delete error:", str(e))
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class ArticleViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Article.objects.select_related('author', 'related_prodi').all()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
            
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
            
        # Filter by program studi
        prodi = self.request.query_params.get('prodi', None)
        if prodi:
            queryset = queryset.filter(related_prodi=prodi)
            
        # Filter featured articles
        is_featured = self.request.query_params.get('featured', None)
        if is_featured:
            queryset = queryset.filter(is_featured=True)
            
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search) |
                Q(excerpt__icontains=search) |
                Q(tags__icontains=search)
            )
            
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.instance
        
        # Update view count if status changes to published
        if 'status' in serializer.validated_data:
            if serializer.validated_data['status'] == 'published' and instance.status != 'published':
                instance.published_at = timezone.now()
        
        serializer.save()

    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        article = self.get_object()
        article.view_count += 1
        article.save()
        return Response({'status': 'view count incremented', 'view_count': article.view_count})

class NomorSuratViewSet(viewsets.ModelViewSet):
    queryset = NomorSurat.objects.all()
    serializer_class = NomorSuratSerializer

class TandaTanganSuratViewSet(viewsets.ModelViewSet):
    queryset = TandaTanganSurat.objects.all()
    serializer_class = TandaTanganSuratSerializer

class JenisLayananViewSet(viewsets.ModelViewSet):
    queryset = JenisLayanan.objects.all()
    serializer_class = JenisLayananSerializer

class LayananViewSet(viewsets.ModelViewSet):
    queryset = Layanan.objects.all()
    serializer_class = LayananSerializer

    def perform_create(self, serializer):
        serializer.save(mahasiswa=self.request.user)

