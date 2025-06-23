# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import Group
from .models import (
    CustomUser, Fakultas, ProgramStudi, 
    UserDosen, UserMahasiswa, UserKetuaProdi, UserStaffProdi, 
    UserStaffFakultas, Note, Jurusan, PejabatJurusan, SkripsiJudul,
    Article, NomorSurat, TandaTangan, JenisLayanan, Layanan, DataTambahanFile
)

from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm
from unfold.admin import ModelAdmin
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from unfold.contrib.import_export.forms import ImportForm, ExportForm

# Resource classes for all models
class CustomUserResource(resources.ModelResource):
    class Meta:
        model = CustomUser
        import_id_fields = ['username']
        fields = ('username', 'password', 'email', 'full_name', 'user_type', 'phone_number', 'gender', 'is_active')
        exclude = ('id',)

    def before_import_row(self, row, **kwargs):
        if 'password' in row:
            user = CustomUser()
            user.set_password(row['password'])
            row['password'] = user.password

class FakultasResource(resources.ModelResource):
    class Meta:
        model = Fakultas
        import_id_fields = ['kode']
        fields = ('nama', 'kode', 'dekan')

class ProgramStudiResource(resources.ModelResource):
    class Meta:
        model = ProgramStudi
        import_id_fields = ['kode']
        fields = ('nama', 'kode', 'fakultas', 'kaprodi', 'jenjang', 'akreditasi')

class UserDosenResource(resources.ModelResource):
    class Meta:
        model = UserDosen
        import_id_fields = ['nip']
        exclude = ('id',)

class UserMahasiswaResource(resources.ModelResource):
    class Meta:
        model = UserMahasiswa
        import_id_fields = ['nim']
        exclude = ('id',)

class UserKetuaProdiResource(resources.ModelResource):
    class Meta:
        model = UserKetuaProdi
        exclude = ('id',)

class UserStaffProdiResource(resources.ModelResource):
    class Meta:
        model = UserStaffProdi
        import_id_fields = ['nip']
        exclude = ('id',)

class UserStaffFakultasResource(resources.ModelResource):
    class Meta:
        model = UserStaffFakultas
        import_id_fields = ['nip']
        exclude = ('id',)

class NoteResource(resources.ModelResource):
    class Meta:
        model = Note
        exclude = ('id',)

class JurusanResource(resources.ModelResource):
    class Meta:
        model = Jurusan
        import_id_fields = ['kode_surat']
        fields = ('nama_jurusan', 'kode_surat', 'status')

class PejabatJurusanResource(resources.ModelResource):
    class Meta:
        model = PejabatJurusan
        exclude = ('id',)

class SkripsiJudulResource(resources.ModelResource):
    class Meta:
        model = SkripsiJudul
        exclude = ('id',)

class ArticleResource(resources.ModelResource):
    class Meta:
        model = Article
        fields = ('title', 'slug', 'content', 'excerpt', 'author', 'category', 
                 'tags', 'featured_image', 'status', 'is_featured', 'related_prodi',
                 'created_at', 'updated_at', 'published_at', 'meta_title', 
                 'meta_description', 'view_count')
        export_order = ('title', 'author', 'category', 'status', 'created_at', 'published_at')

class DataTambahanFileResource(resources.ModelResource):
    class Meta:
        model = DataTambahanFile
        exclude = ('id',)

admin.site.unregister(Group)

@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin, ModelAdmin, ImportExportModelAdmin):
    resource_class = CustomUserResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    
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
class FakultasAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = FakultasResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ('nama', 'kode', 'dekan')
    search_fields = ('nama', 'kode')

@admin.register(ProgramStudi)
class ProgramStudiAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = ProgramStudiResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ('nama', 'kode', 'fakultas', 'kaprodi', 'jenjang', 'akreditasi')
    list_filter = ('jenjang', 'akreditasi', 'fakultas')
    search_fields = ('nama', 'kode')

@admin.register(UserDosen)
class UserDosenAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = UserDosenResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ('get_full_name', 'nip', 'program_studi', 'jabatan_akademik', 'status_kepegawaian')
    list_filter = ('program_studi', 'jabatan_akademik', 'status_kepegawaian', 'pendidikan_terakhir')
    search_fields = ('user__username', 'user__full_name', 'nip', 'bidang_keahlian')
    
    def get_full_name(self, obj):
        return obj.user.full_name or obj.user.username
    get_full_name.short_description = 'Nama Lengkap'

@admin.register(UserMahasiswa)
class MahasiswaAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = UserMahasiswaResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ('get_full_name', 'nim', 'program_studi', 'angkatan', 'semester', 'status', 'ipk')
    list_filter = ('program_studi', 'angkatan', 'semester', 'status')
    search_fields = ('user__username', 'user__full_name', 'nim')
    
    def get_full_name(self, obj):
        return obj.user.full_name or obj.user.username
    get_full_name.short_description = 'Nama Lengkap'

# New: Admin for UserKetuaProdi (replacing UserProdi)
@admin.register(UserKetuaProdi)
class UserKetuaProdiAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = UserKetuaProdiResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ('get_full_name', 'program_studi', 'periode_mulai', 'periode_selesai')
    list_filter = ('program_studi', 'periode_mulai')
    search_fields = ('user__username', 'user__full_name', 'program_studi__nama')
    date_hierarchy = 'periode_mulai'
    
    def get_full_name(self, obj):
        return obj.user.full_name or obj.user.username
    get_full_name.short_description = 'Nama Lengkap'

# New: Admin for UserStaffProdi
@admin.register(UserStaffProdi)
class UserStaffProdiAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = UserStaffProdiResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ('get_full_name', 'nip', 'program_studi', 'jabatan')
    list_filter = ('program_studi', 'jabatan')
    search_fields = ('user__username', 'user__full_name', 'nip', 'jabatan')
    
    def get_full_name(self, obj):
        return obj.user.full_name or obj.user.username
    get_full_name.short_description = 'Nama Lengkap'

# Updated: Admin for UserStaffFakultas (renamed from UserFakultas)
@admin.register(UserStaffFakultas)
class UserStaffFakultasAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = UserStaffFakultasResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ('get_full_name', 'nip', 'fakultas', 'jabatan')
    list_filter = ('fakultas', 'jabatan')
    search_fields = ('user__username', 'user__full_name', 'nip', 'jabatan')
    
    def get_full_name(self, obj):
        return obj.user.full_name or obj.user.username
    get_full_name.short_description = 'Nama Lengkap'

@admin.register(Note)
class NoteAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = NoteResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ('title', 'author', 'visibility', 'created_at')
    list_filter = ('visibility', 'created_at', 'author')
    search_fields = ('title', 'content')

@admin.register(Jurusan)
class JurusanAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = JurusanResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ['nama_jurusan', 'kode_surat', 'status']
    list_filter = ['status']
    search_fields = ['nama_jurusan', 'kode_surat']

@admin.register(PejabatJurusan)
class PejabatJurusanAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = PejabatJurusanResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ('get_pejabat_name', 'get_jurusan_name', 'jabatan', 'tgl_mulai', 'tgl_selesai', 'plt')
    list_filter = ('jabatan', 'plt', 'jurusan')
    search_fields = ('user__full_name', 'jurusan__nama_jurusan')
    
    def get_pejabat_name(self, obj):
        return obj.user.full_name if obj.user else 'Belum Ditentukan'
    get_pejabat_name.short_description = 'Nama Pejabat'
    
    def get_jurusan_name(self, obj):
        return obj.jurusan.nama_jurusan if obj.jurusan else '-'
    get_jurusan_name.short_description = 'Jurusan'

@admin.register(SkripsiJudul)
class SkripsiJudulAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = SkripsiJudulResource
    import_form_class = ImportForm
    export_form_class = ExportForm
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

@admin.register(Article)
class ArticleAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = ArticleResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    
    list_display = ('title', 'author', 'category', 'status', 'is_featured', 'view_count', 'created_at', 'published_at')
    list_filter = ('status', 'category', 'is_featured', 'created_at', 'published_at')
    search_fields = ('title', 'content', 'excerpt', 'tags', 'meta_title')
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Konten Artikel', {
            'fields': (
                'title', 'slug', 'content', 'excerpt', 'featured_image'
            )
        }),
        ('Metadata', {
            'fields': (
                'author', 'category', 'tags', 'related_prodi'
            ),
        }),
        ('Status & Visibilitas', {
            'fields': (
                'status', 'is_featured', 'published_at'
            ),
        }),
        ('SEO', {
            'classes': ('collapse',),
            'fields': (
                'meta_title', 'meta_description'
            ),
        }),
        ('Statistik', {
            'classes': ('collapse',),
            'fields': ('view_count',),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'view_count')
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing existing object
            return self.readonly_fields
        return ('view_count',)  # only view_count readonly when creating new object
    
    def save_model(self, request, obj, form, change):
        if not change:  # if creating new object
            obj.author = request.user
        super().save_model(request, obj, form, change)

class NomorSuratResource(resources.ModelResource):
    class Meta:
        model = NomorSurat
        exclude = ('id',)

class TandaTanganResource(resources.ModelResource):
    class Meta:
        model = TandaTangan
        exclude = ('id',)

class JenisLayananResource(resources.ModelResource):
    class Meta:
        model = JenisLayanan
        exclude = ('id',)

class LayananResource(resources.ModelResource):
    class Meta:
        model = Layanan
        exclude = ('id',)

@admin.register(NomorSurat)
class NomorSuratAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = NomorSuratResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ('nomor', 'perihal', 'tahun', 'jurusan', 'admin_nomor_surat', 'tanggal_dibuat')
    list_filter = ('tahun', 'jurusan')
    search_fields = ('nomor', 'perihal', 'tujuan')
    ordering = ('-tanggal_dibuat',)

@admin.register(TandaTangan)
class TandaTanganAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = TandaTanganResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ('surat', 'jabatan_penandatangan', 'user_penandatangan', 'jenis_tanda_tangan', 'status', 'waktu_tanda_tangan')
    list_filter = ('jenis_tanda_tangan', 'status', 'jabatan_penandatangan')
    search_fields = ('surat__nomor', 'jabatan_penandatangan', 'user_penandatangan__full_name')
    ordering = ('surat', 'urutan')

@admin.register(JenisLayanan)
class JenisLayananAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = JenisLayananResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ('nama_layanan', 'deskripsi_layanan')
    search_fields = ('nama_layanan',)

@admin.register(Layanan)
class LayananAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = LayananResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ('mahasiswa', 'jenis_layanan', 'status', 'tanggal_dibuat', 'nomor_surat')
    list_filter = ('status', 'jenis_layanan', 'program_studi')
    search_fields = ('mahasiswa__full_name', 'jenis_layanan__nama_layanan', 'isi_permohonan')
    ordering = ('-tanggal_dibuat',)

@admin.register(DataTambahanFile)
class DataTambahanFileAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_class = DataTambahanFileResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ('layanan', 'nama_field', 'file', 'tanggal_upload')
    list_filter = ('nama_field', 'tanggal_upload', 'layanan__jenis_layanan')
    search_fields = ('layanan__mahasiswa__full_name', 'nama_field', 'layanan__jenis_layanan__nama_layanan')
    ordering = ('-tanggal_upload',)
    readonly_fields = ('tanggal_upload',)

@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin, ImportExportModelAdmin):
    import_form_class = ImportForm
    export_form_class = ExportForm
    pass

