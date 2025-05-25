from django.urls import path
from . import views

urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("change-password/", views.ChangePasswordView.as_view(), name="change-password"),
    path('mahasiswa-profile/', views.MahasiswaProfileView.as_view(), name='mahasiswa-profile'),
    path('dosen-profile/', views.DosenProfileView.as_view(), name='dosen-profile'),
    path('staff-prodi-profile/', views.StaffProfileView.as_view(), name='staff-profile'),
    path('staff-fakultas-profile/', views.StaffFakultasProfileView.as_view(), name='staff-fakultas-profile')
]