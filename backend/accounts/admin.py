# admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import Group
from .models import (
    CustomUser, Fakultas, ProgramStudi, 
    Dosen, Mahasiswa, StaffProdi, StaffFakultas, Note
)

from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm
from unfold.admin import ModelAdmin


admin.site.unregister(Group)


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin, ModelAdmin):
    # Forms loaded from `unfold.forms`
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm
    
    # Add custom fields to list_display if you have any in your CustomUser model
    list_display = ('username', 'email', 'user_type', 'first_name', 'last_name', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'user_type')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'phone_number', 'tempat_lahir', 'birth_date', 'gender', 'profile_picture')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'phone_number', 'profile_picture')}),
    )
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)

@admin.register(Fakultas)
class FakultasAdmin(ModelAdmin):
    list_display = ('nama', 'kode', 'dekan')
    search_fields = ('nama', 'kode')
    list_filter = ('created_at',)


@admin.register(ProgramStudi)
class ProgramStudiAdmin(ModelAdmin):
    list_display = ('nama', 'kode', 'fakultas', 'kaprodi', 'jenjang', 'akreditasi')
    list_filter = ('jenjang', 'akreditasi', 'fakultas')
    search_fields = ('nama', 'kode')


@admin.register(Dosen)
class DosenAdmin(ModelAdmin):
    list_display = ('user', 'nidn', 'nip', 'program_studi', 'jabatan_akademik', 'status_kepegawaian')
    list_filter = ('program_studi', 'jabatan_akademik', 'status_kepegawaian', 'pendidikan_terakhir')
    search_fields = ('user__username', 'nidn', 'nip', 'bidang_keahlian')

@admin.register(Mahasiswa)
class MahasiswaAdmin(ModelAdmin):
    list_display = ('user', 'nim', 'program_studi', 'angkatan', 'semester', 'status', 'ipk')
    list_filter = ('program_studi', 'angkatan', 'semester', 'status')
    search_fields = ('user__username', 'nim', 'user__first_name', 'user__last_name')

@admin.register(StaffProdi)
class StaffProdiAdmin(ModelAdmin):
    list_display = ('user', 'program_studi', 'jabatan')
    list_filter = ('program_studi',)
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'jabatan')

@admin.register(StaffFakultas)
class StaffFakultasAdmin(ModelAdmin):
    list_display = ('user', 'fakultas', 'jabatan')
    list_filter = ('fakultas',)
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'jabatan')


@admin.register(Note)
class NoteAdmin(ModelAdmin):
    list_display = ('title', 'author', 'created_at')
    list_filter = ('created_at', 'author')
    search_fields = ('title', 'content')

@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass