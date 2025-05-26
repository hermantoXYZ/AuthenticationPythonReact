from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import UserListView, JurusanViewSet

router = DefaultRouter()
router.register(r'jurusan', JurusanViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("change-password/", views.ChangePasswordView.as_view(), name="change-password"),
    path('mahasiswa-profile/', views.MahasiswaProfileView.as_view(), name='mahasiswa-profile'),
    path('dosen-profile/', views.DosenProfileView.as_view(), name='dosen-profile'),
    path('staff-prodi-profile/', views.StaffProfileView.as_view(), name='staff-profile'),
    path('staff-fakultas-profile/', views.StaffFakultasProfileView.as_view(), name='staff-fakultas-profile'),

    # Tambahkan URL untuk Program Studi
    path('prodi/', views.ProgramStudiListView.as_view(), name='prodi-list'),
    path('prodi/<int:pk>/', views.ProgramStudiDetailView.as_view(), name='prodi-detail'),

    # Tambahkan URL untuk User
    path('users/', UserListView.as_view(), name='user-list'),
]