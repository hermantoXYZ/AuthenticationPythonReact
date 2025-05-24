# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import Group
from .models import (
    CustomUser, Fakultas, ProgramStudi, 
    UserDosen, UserMahasiswa, UserProdi, UserFakultas, Note, Jurusan, JurusanPejabat
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

@admin.register(UserProdi)
class UserProdiAdmin(ModelAdmin):
    list_display = ('get_full_name', 'program_studi', 'jabatan')
    list_filter = ('program_studi',)
    search_fields = ('user__username', 'user__full_name', 'jabatan')
    
    def get_full_name(self, obj):
        return obj.user.full_name or obj.user.username
    get_full_name.short_description = 'Nama Lengkap'

@admin.register(UserFakultas)
class UserFakultasAdmin(ModelAdmin):
    list_display = ('get_full_name', 'fakultas', 'jabatan')
    list_filter = ('fakultas',)
    search_fields = ('user__username', 'user__full_name', 'jabatan')
    
    def get_full_name(self, obj):
        return obj.user.full_name or obj.user.username
    get_full_name.short_description = 'Nama Lengkap'


@admin.register(Note)
class NoteAdmin(ModelAdmin):
    list_display = ('title', 'author', 'created_at')
    list_filter = ('created_at', 'author')
    search_fields = ('title', 'content')

@admin.register(Jurusan)
class JurusanAdmin(ModelAdmin):
    list_display = ['nama_jurusan', 'kode_surat', 'status']
    list_filter = ['status']


@admin.register(JurusanPejabat)
class JurusanPejabatAdmin(ModelAdmin):
    list_display = ('jurusan', 'jabatan', 'pejabat', 'tgl_mulai', 'tgl_selesai', 'plt')
    list_filter = ('jabatan', 'plt', 'jurusan')



@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass