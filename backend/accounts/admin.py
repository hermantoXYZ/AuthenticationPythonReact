# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import Group
from .models import (
    CustomUser, Fakultas, ProgramStudi, 
    UserDosen, UserMahasiswa, UserKetuaProdi, UserStaffProdi, 
    UserStaffFakultas, Note, Jurusan, PejabatJurusan, SkripsiJudul
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

@admin.register(SkripsiJudul)
class SkripsiJudulAdmin(ModelAdmin):
    list_display = ('get_mahasiswa_name', 'get_program_studi', 'status', 'tanggal_pengajuan', 'judul_diterima')
    list_filter = ('status', 'tanggal_pengajuan', 'mahasiswa__program_studi')
    search_fields = (
        'mahasiswa__user__full_name', 
        'judul_1', 'judul_2', 'judul_3',
        'judul_diterima',
        'pembimbing_1__user__full_name',
        'pembimbing_2__user__full_name'
    )
    date_hierarchy = 'tanggal_pengajuan'
    
    fieldsets = (
        ('Informasi Mahasiswa', {
            'fields': ('mahasiswa',)
        }),
        ('Judul yang Diajukan', {
            'fields': (
                'judul_1', 'deskripsi_1',
                'judul_2', 'deskripsi_2',
                'judul_3', 'deskripsi_3',
            )
        }),
        ('Status dan Review', {
            'fields': (
                'status', 'judul_diterima',
                'catatan_prodi', 'catatan_fakultas', 'catatan_pembimbing'
            )
        }),
        ('Pembimbing', {
            'fields': ('pembimbing_1', 'pembimbing_2')
        }),
        ('Informasi Waktu', {
            'fields': ('tanggal_pengajuan', 'tanggal_update')
        })
    )
    readonly_fields = ('tanggal_pengajuan', 'tanggal_update')

    def get_mahasiswa_name(self, obj):
        return obj.mahasiswa.user.full_name or obj.mahasiswa.user.username
    get_mahasiswa_name.short_description = 'Nama Mahasiswa'
    
    def get_program_studi(self, obj):
        return obj.mahasiswa.program_studi.nama
    get_program_studi.short_description = 'Program Studi'
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return self.readonly_fields + ('mahasiswa',)
        return self.readonly_fields

@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass