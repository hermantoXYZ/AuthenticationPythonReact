from django.shortcuts import render
from rest_framework import generics, viewsets
from .serializers import UserSerializer, NoteSerializer, FakultasSerializer, ProgramStudiSerializer, UserProfileSerializer, MahasiswaProfileSerializer, DosenProfileSerializer, StaffProfileSerializer, StaffFakultasProfileSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, CustomUser, Fakultas, ProgramStudi, UserMahasiswa, UserDosen, UserStaffProdi, UserStaffFakultas
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


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