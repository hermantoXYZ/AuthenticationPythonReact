# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import Group
from .models import (
    CustomUser, Fakultas, ProgramStudi, 
    UserDosen, UserMahasiswa, UserKetuaProdi, UserStaffProdi, 
    UserStaffFakultas, Note, Jurusan, PejabatJurusan
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
    
    # Updated to use full_name instead of first_name and last_name
    list_display = ('full_name', 'email', 'gender', 'user_type', 'is_active','created_at')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'user_type')
    
    # Custom fieldsets since we're not using first_name and last_name
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('full_name', 'email')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Additional Info', {'fields': ('user_type', 'phone_number', 'tempat_lahir', 'birth_date', 'gender', 'profile_picture')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
        ('Personal info', {'fields': ('full_name', 'email')}),
        ('Additional Info', {'fields': ('user_type', 'phone_number', 'profile_picture')}),
    )
    
    search_fields = ('username', 'full_name', 'email')
    ordering = ('username',)

@admin.register(Fakultas)
class FakultasAdmin(ModelAdmin):
    list_display = ('nama', 'kode', 'dekan')
    search_fields = ('nama', 'kode')

@admin.register(ProgramStudi)
class ProgramStudiAdmin(ModelAdmin):
    list_display = ('nama', 'kode', 'fakultas', 'kaprodi', 'jenjang', 'akreditasi')
    list_filter = ('jenjang', 'akreditasi', 'fakultas')
    search_fields = ('nama', 'kode')

@admin.register(UserDosen)
class UserDosenAdmin(ModelAdmin):
    list_display = ('get_full_name', 'nip', 'program_studi', 'jabatan_akademik', 'status_kepegawaian')
    list_filter = ('program_studi', 'jabatan_akademik', 'status_kepegawaian', 'pendidikan_terakhir')
    search_fields = ('user__username', 'user__full_name', 'nip', 'bidang_keahlian')
    
    def get_full_name(self, obj):
        return obj.user.full_name or obj.user.username
    get_full_name.short_description = 'Nama Lengkap'

@admin.register(UserMahasiswa)
class MahasiswaAdmin(ModelAdmin):
    list_display = ('get_full_name', 'nim', 'program_studi', 'angkatan', 'semester', 'status', 'ipk')
    list_filter = ('program_studi', 'angkatan', 'semester', 'status')
    search_fields = ('user__username', 'user__full_name', 'nim')
    
    def get_full_name(self, obj):
        return obj.user.full_name or obj.user.username
    get_full_name.short_description = 'Nama Lengkap'

# New: Admin for UserKetuaProdi (replacing UserProdi)
@admin.register(UserKetuaProdi)
class UserKetuaProdiAdmin(ModelAdmin):
    list_display = ('get_full_name', 'program_studi', 'periode_mulai', 'periode_selesai')
    list_filter = ('program_studi', 'periode_mulai')
    search_fields = ('user__username', 'user__full_name', 'program_studi__nama')
    date_hierarchy = 'periode_mulai'
    
    def get_full_name(self, obj):
        return obj.user.full_name or obj.user.username
    get_full_name.short_description = 'Nama Lengkap'

# New: Admin for UserStaffProdi
@admin.register(UserStaffProdi)
class UserStaffProdiAdmin(ModelAdmin):
    list_display = ('get_full_name', 'nip', 'program_studi', 'jabatan')
    list_filter = ('program_studi', 'jabatan')
    search_fields = ('user__username', 'user__full_name', 'nip', 'jabatan')
    
    def get_full_name(self, obj):
        return obj.user.full_name or obj.user.username
    get_full_name.short_description = 'Nama Lengkap'

# Updated: Admin for UserStaffFakultas (renamed from UserFakultas)
@admin.register(UserStaffFakultas)
class UserStaffFakultasAdmin(ModelAdmin):
    list_display = ('get_full_name', 'nip', 'fakultas', 'jabatan')
    list_filter = ('fakultas', 'jabatan')
    search_fields = ('user__username', 'user__full_name', 'nip', 'jabatan')
    
    def get_full_name(self, obj):
        return obj.user.full_name or obj.user.username
    get_full_name.short_description = 'Nama Lengkap'

@admin.register(Note)
class NoteAdmin(ModelAdmin):
    list_display = ('title', 'author', 'visibility', 'created_at')
    list_filter = ('visibility', 'created_at', 'author')
    search_fields = ('title', 'content')

@admin.register(Jurusan)
class JurusanAdmin(ModelAdmin):
    list_display = ['nama_jurusan', 'kode_surat', 'status']
    list_filter = ['status']
    search_fields = ['nama_jurusan', 'kode_surat']

@admin.register(PejabatJurusan)
class PejabatJurusanAdmin(ModelAdmin):
    list_display = ('jurusan', 'jabatan', 'get_pejabat_name', 'tgl_mulai', 'tgl_selesai', 'plt')
    list_filter = ('jabatan', 'plt', 'jurusan', 'tgl_mulai')
    search_fields = ('jurusan__nama_jurusan', 'pejabat__full_name', 'label')
    date_hierarchy = 'tgl_mulai'
    
    def get_pejabat_name(self, obj):
        return obj.pejabat.full_name if obj.pejabat else 'Belum Ditentukan'
    get_pejabat_name.short_description = 'Nama Pejabat'

@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass