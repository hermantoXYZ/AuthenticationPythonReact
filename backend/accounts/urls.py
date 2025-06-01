from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    UserListView, JurusanViewSet, SkripsiJudulViewSet, UserDetailView, 
    FakultasViewSet, DosenListView, KetuaProdiViewSet, StaffProdiListView,
    StaffProdiDetailView, StaffFakultasListView, StaffFakultasDetailView,
    MahasiswaListView, MahasiswaDetailView, DekanFakultasListView, DekanFakultasDetailView,
    PejabatJurusanViewSet
)

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'jurusan', JurusanViewSet)
router.register(r'skripsi/pengajuan', SkripsiJudulViewSet, basename='skripsi-pengajuan')
router.register(r'fakultas', FakultasViewSet)
router.register(r'ketua-prodi', KetuaProdiViewSet)
router.register(r'users/pejabat-jurusan', PejabatJurusanViewSet, basename='pejabat-jurusan')


urlpatterns = [
    # Include the router URLs first
    path('', include(router.urls)),
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("change-password/", views.ChangePasswordView.as_view(), name="change-password"),
    path('mahasiswa-profile/', views.MahasiswaProfileView.as_view(), name='mahasiswa-profile'),
    path('dosen-profile/', views.DosenProfileView.as_view(), name='dosen-profile'),
    path('staff-prodi-profile/', views.StaffProfileView.as_view(), name='staff-profile'),
    path('staff-fakultas-profile/', views.StaffFakultasProfileView.as_view(), name='staff-fakultas-profile'),
    path('prodi/', views.ProgramStudiListView.as_view(), name='prodi-list'),
    path('prodi/<int:pk>/', views.ProgramStudiDetailView.as_view(), name='prodi-detail'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('users/dosen/', DosenListView.as_view(), name='dosen-list'),
    path('users/mahasiswa/', MahasiswaListView.as_view(), name='mahasiswa-list'),
    path('users/mahasiswa/<int:pk>/', MahasiswaDetailView.as_view(), name='mahasiswa-detail'),
    path('users/staff-prodi/', StaffProdiListView.as_view(), name='staff-prodi-list'),
    path('users/staff-prodi/<int:pk>/', StaffProdiDetailView.as_view(), name='staff-prodi-detail'),
    path('users/staff-fakultas/', StaffFakultasListView.as_view(), name='staff-fakultas-list'),
    path('users/staff-fakultas/<int:pk>/', StaffFakultasDetailView.as_view(), name='staff-fakultas-detail'),
    path('users/dekan/', DekanFakultasListView.as_view(), name='dekan-list'),
    path('users/dekan/<int:pk>/', DekanFakultasDetailView.as_view(), name='dekan-detail'),
]