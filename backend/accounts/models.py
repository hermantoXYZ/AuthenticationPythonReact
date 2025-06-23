from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

# Choices untuk jenis user
class UserType(models.TextChoices):
    SUPER_ADMIN = 'super_admin', 'SUPER ADMIN'
    DEKAN_FAKULTAS = 'dekan_fakultas', 'USER DEKAN'  # Fixed: changed from 'fakultas'
    PEJABAT_JURUSAN = 'pejabat_jurusan', 'USER PEJABAT JURUSAN'  # Fixed: changed from 'jurusan'
    KETUA_PRODI = 'ketua_prodi', 'USER KETUA PRODI'  # Fixed: changed from 'prodi'
    STAFF_FAKULTAS = 'staff_fakultas', 'USER STAFF FAKULTAS'
    STAFF_PRODI = 'staff_prodi', 'USER STAFF PRODI'
    DOSEN = 'dosen', 'USER DOSEN'
    MAHASISWA = 'mahasiswa', 'USER MAHASISWA'

# Custom User Model
class CustomUser(AbstractUser):
    # Override first_name dan last_name menjadi tidak digunakan
    first_name = None
    last_name = None

    # Gunakan full_name sebagai pengganti
    full_name = models.CharField(max_length=150, blank=True, null=True, verbose_name="Nama Lengkap")
    
    user_type = models.CharField(
        max_length=20,
        choices=UserType.choices,
        default=UserType.MAHASISWA
    )
    profile_picture = models.ImageField(upload_to='profile_pictures/%Y/%m/', null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tempat_lahir = models.CharField(max_length=50, null=True, blank=True)
    birth_date = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=15, choices=[
        ('Laki-laki', 'Laki-laki'),
        ('Perempuan', 'Perempuan'),
    ], blank=True, null=True)  # Fixed: removed placeholder choice
    is_active = models.BooleanField(default=True)
    
    def get_full_name(self):
        return self.full_name or self.username
    
    def get_short_name(self):
        return self.full_name or self.username

    def __str__(self):
        name = self.full_name or self.username
        
        if self.user_type == UserType.MAHASISWA:
            try:
                nim = self.mahasiswa_profile.nim
            except:
                nim = "N/A"
            return f"{name} (Mahasiswa) - {nim}"

        elif self.user_type == UserType.DEKAN_FAKULTAS:
            try: 
                nip = self.dosen_profile.nip
            except:
                nip = "N/A"
            return f"{name} (Dekan) - {nip}"

        elif self.user_type == UserType.KETUA_PRODI:
            try:
                nip = self.dosen_profile.nip
            except:
                nip = "N/A"
            return f"{name} (Ketua Prodi) - {nip}"

        elif self.user_type == UserType.STAFF_FAKULTAS:
            try:
                nip = getattr(self.staff_fakultas_profile, 'nip', 'N/A')  # Fixed: added handling for staff fakultas
            except:
                nip = "N/A"
            return f"{name} (Staff Fakultas) - {nip}"

        elif self.user_type == UserType.STAFF_PRODI:
            try:
                nip = getattr(self.staff_prodi_profile, 'nip', 'N/A')  # Fixed: added handling for staff prodi
            except:
                nip = "N/A"
            return f"{name} (Staff Prodi) - {nip}"

        elif self.user_type == UserType.PEJABAT_JURUSAN:
            try:
                nip = self.dosen_profile.nip
                jabatan = self.pejabat_jurusan.jabatan
            except:
                nip = "N/A"
                jabatan = "N/A"
            return f"{name} (Pejabat Jurusan) - {jabatan} - {nip}"
           
        elif self.user_type == UserType.DOSEN:
            try:
                nip = self.dosen_profile.nip
            except:
                nip = "N/A"
            return f"{name} (Dosen) - {nip}"
        
        return name

    class Meta:
        verbose_name_plural = "All User"
        verbose_name = "All User"
        ordering = ['-created_at']

# Model untuk Jurusan
class Jurusan(models.Model):
    nama_jurusan = models.CharField(max_length=255, blank=False, null=False)
    status = models.CharField(max_length=10, default='Aktif', choices=[
        ('Aktif', 'Aktif'),
        ('NonAktif', 'NonAktif'), 
        ])
    kode_surat = models.CharField(max_length=20)
    
    def __str__(self):
        return f"{self.nama_jurusan}"

    class Meta:
            verbose_name = 'Nama Jurusan'
            verbose_name_plural = 'Nama Jurusan'


class PejabatJurusan(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='pejabat_jurusan_profile',
        limit_choices_to={'user_type': UserType.PEJABAT_JURUSAN}
    )
    jurusan = models.ForeignKey(Jurusan, on_delete=models.CASCADE, related_name='pejabat_jurusan_rel')
    jabatan = models.CharField(max_length=15, choices=[
        ('Ketua', 'Ketua'),
        ('Sekretaris', 'Sekretaris'),
    ])
    tgl_mulai = models.DateField()
    tgl_selesai = models.DateField()
    label = models.CharField(max_length=255, blank=True, null=True)
    plt = models.BooleanField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.jabatan} {self.jurusan.nama_jurusan}"
    
    def clean(self):
        if self.user.user_type != UserType.PEJABAT_JURUSAN:
            raise ValidationError('User harus bertipe Pejabat Jurusan')

    class Meta:
        verbose_name = 'User Pejabat Jurusan'
        verbose_name_plural = 'User Pejabat Jurusan'

# Model untuk Fakultas
class Fakultas(models.Model):
    nama = models.CharField(max_length=100)
    kode = models.CharField(max_length=10, unique=True)
    dekan = models.OneToOneField(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='fakultas_dipimpin',
        limit_choices_to={'user_type': UserType.DEKAN_FAKULTAS}
    )
    wakil_dekan_akademik = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='fakultas_wd_akademik',
        verbose_name="Wakil Dekan Bidang Akademik",
        limit_choices_to={'user_type__in': [UserType.DEKAN_FAKULTAS]}
    )
    wakil_dekan_umum_keuangan = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='fakultas_wd_umum_keuangan',
        verbose_name="Wakil Dekan Bidang Umum dan Keuangan",
        limit_choices_to={'user_type__in': [UserType.DEKAN_FAKULTAS]}
    )
    wakil_dekan_kemahasiswaan_alumni = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='fakultas_wd_kemahasiswaan_alumni',
        verbose_name="Wakil Dekan Bidang Kemahasiswaan dan Alumni",
        limit_choices_to={'user_type__in': [UserType.DEKAN_FAKULTAS]}
    )
    wakil_dekan_kerjasama = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='fakultas_wd_kerjasama',
        verbose_name="Wakil Dekan Bidang Kerjasama",
        limit_choices_to={'user_type__in': [UserType.DEKAN_FAKULTAS]}
    )
    
    class Meta:
        verbose_name = "Nama Fakultas"
        verbose_name_plural = "Nama Fakultas"
    
    def __str__(self):
        return self.nama

# Model untuk Program Studi
class ProgramStudi(models.Model):
    nama = models.CharField(max_length=100)
    kode = models.CharField(max_length=10, unique=True)
    fakultas = models.ForeignKey(Fakultas, on_delete=models.CASCADE, related_name='program_studi')
    jurusan = models.ForeignKey(Jurusan, on_delete=models.CASCADE, related_name='program_studi')
    gelar = models.CharField(max_length=20, blank=True, null=True)
    kaprodi = models.OneToOneField(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='prodi_dipimpin',
        limit_choices_to={'user_type': UserType.KETUA_PRODI}
    )
    jenjang = models.CharField(
        max_length=20,
        choices=[
            ('D3', 'Diploma 3'),
            ('S1', 'Sarjana'),
            ('S2', 'Magister'),
            ('S3', 'Doktor'),
        ],
        default='S1'
    )
    akreditasi = models.CharField(
        max_length=20,
        choices=[
            ('A', 'A'),
            ('B', 'B'),
            ('C', 'C'),
            ('Baik Sekali', 'Baik Sekali'),
            ('Baik', 'Baik'),
        ],
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "List Program Studi"
    
    def __str__(self):
        return f"{self.nama} - {self.fakultas.nama}"


# Model untuk Dosen
class UserDosen(models.Model):
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='dosen_profile',
        limit_choices_to={'user_type__in': [UserType.DOSEN, UserType.DEKAN_FAKULTAS, UserType.KETUA_PRODI, UserType.PEJABAT_JURUSAN]}
    )
    nip = models.CharField(max_length=20, unique=True, blank=True, null=True, verbose_name="NIP")
    program_studi = models.ForeignKey(ProgramStudi, on_delete=models.CASCADE, related_name='dosen')
    jabatan_akademik = models.CharField(
        max_length=50,
        choices=[
            ('Asisten Ahli', 'Asisten Ahli'),
            ('Lektor', 'Lektor'),
            ('Lektor Kepala', 'Lektor Kepala'),
            ('Profesor', 'Profesor'),
        ],
        blank=True
    )
    pendidikan_terakhir = models.CharField(
        max_length=10,
        choices=[
            ('S1', 'S1'),
            ('S2', 'S2'),
            ('S3', 'S3'),
        ],
        default='S2'
    )
    bidang_keahlian = models.CharField(max_length=100, blank=True)
    status_kepegawaian = models.CharField(
        max_length=20,
        choices=[
            ('PNS', 'PNS'),
            ('Non-PNS', 'Non-PNS'),
            ('Kontrak', 'Kontrak'),
        ],
        default='PNS'
    )
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.nip}"

    def clean(self):
        allowed_types = [UserType.DOSEN, UserType.DEKAN_FAKULTAS, UserType.KETUA_PRODI, UserType.PEJABAT_JURUSAN]
        if self.user.user_type not in allowed_types:
            raise ValidationError('User harus bertipe Dosen, Dekan Fakultas, Ketua Prodi, atau Pejabat Jurusan')

    class Meta:
        verbose_name_plural = "User Dosen"
        verbose_name = "User Dosen"

# Model untuk Mahasiswa
class UserMahasiswa(models.Model):
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='mahasiswa_profile',
        limit_choices_to={'user_type': UserType.MAHASISWA}
    )
    nim = models.CharField(max_length=20, unique=True, verbose_name="NIM", null=True, blank=True)
    program_studi = models.ForeignKey(ProgramStudi, on_delete=models.CASCADE, related_name='mahasiswa')
    angkatan = models.CharField(max_length=4)
    semester = models.PositiveIntegerField(default=1)
    kelas = models.CharField(
        max_length=10,
        choices=[
            ('A', 'A'),
            ('B', 'B'),
            ('C', 'C'),
            ('D', 'D'),
            ('E', 'E'),
            ('F', 'F'),
            ('G', 'G'),
        ],
        blank=True,
        null=True,
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('Aktif', 'Aktif'),
            ('Cuti', 'Cuti'),
            ('Non-Aktif', 'Non-Aktif'),
            ('Lulus', 'Lulus'),
            ('DO', 'Drop Out'),
        ],
        default='Aktif'
    )
    ipk = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    dosen_wali = models.ForeignKey(
        UserDosen, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='mahasiswa_bimbingan'
    )
    tanggal_masuk = models.DateField()
    
    def __str__(self):
        kelas_info = f" - Kelas {self.kelas}" if self.kelas else ""
        return f"{self.user.get_full_name()} - {self.nim}{kelas_info}"
    
    def clean(self):
        if self.user.user_type != UserType.MAHASISWA:
            raise ValidationError('User harus bertipe Mahasiswa')

    class Meta:
        verbose_name_plural = "User Mahasiswa"
        verbose_name = "User Mahasiswa"
        ordering = ['angkatan', 'kelas', 'nim']

# Fixed: Model untuk User Staff Prodi 
class UserStaffProdi(models.Model):
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='staff_prodi_profile',  # Fixed: consistent naming
        limit_choices_to={'user_type': UserType.STAFF_PRODI}  # Fixed: correct user type
    )
    program_studi = models.ForeignKey(ProgramStudi, on_delete=models.CASCADE, related_name='staff_prodi')
    jabatan = models.CharField(max_length=50, choices=[
            ('Admin Prodi', 'Admin Prodi'),
            ('Sekretaris Prodi', 'Sekretaris Prodi'),
        ], blank=True)
    nip = models.CharField(max_length=20, unique=True, blank=True, null=True, verbose_name="NIP")  # Added NIP field
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Staff {self.program_studi.nama}"
    
    def clean(self):
        if self.user.user_type != UserType.STAFF_PRODI:
            raise ValidationError('User harus bertipe Staff Program Studi')

    class Meta:
        verbose_name_plural = "User Staff Program Studi"
        verbose_name = "User Staff Program Studi"

# Fixed: Separate model for Ketua Prodi
class UserKetuaProdi(models.Model):
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='ketua_prodi_profile',
        limit_choices_to={'user_type': UserType.KETUA_PRODI}
    )
    program_studi = models.ForeignKey(ProgramStudi, on_delete=models.CASCADE, related_name='ketua_prodi_rel')
    periode_mulai = models.DateField()
    periode_selesai = models.DateField()
    label = models.CharField(max_length=255, blank=True, null=True)
    plt = models.BooleanField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Ketua Prodi {self.program_studi.nama}"
    
    def clean(self):
        if self.user.user_type != UserType.KETUA_PRODI:
            raise ValidationError('User harus bertipe Ketua Program Studi')

    class Meta:
        verbose_name_plural = "User Ketua Program Studi"
        verbose_name = "User Ketua Program Studi"

# Fixed: Model untuk User Staff Fakultas
class UserStaffFakultas(models.Model):
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='staff_fakultas_profile',
        limit_choices_to={'user_type': UserType.STAFF_FAKULTAS}
    )
    fakultas = models.ForeignKey(Fakultas, on_delete=models.CASCADE, related_name='staff')
    jabatan = models.CharField(max_length=50, blank=True)
    nip = models.CharField(max_length=20, unique=True, blank=True, null=True, verbose_name="NIP")  # Added NIP field
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Staff {self.fakultas.nama}"
    
    def clean(self):
        if self.user.user_type != UserType.STAFF_FAKULTAS:
            raise ValidationError('User harus bertipe Staff Fakultas')

    class Meta:
        verbose_name_plural = "User Staff Fakultas"
        verbose_name = "User Staff Fakultas"

# Model untuk Pengajuan Judul Skripsi
class SkripsiJudul(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Menunggu Review'),
        ('reviewed_prodi', 'Sudah Direview Prodi'),
        ('reviewed_fakultas', 'Sudah Direview Fakultas'),
        ('accepted', 'Diterima'),
        ('rejected', 'Ditolak'),
        ('revision', 'Perlu Revisi')
    ]

    mahasiswa = models.ForeignKey(
        UserMahasiswa,
        on_delete=models.CASCADE,
        related_name='pengajuan_judul'
    )
    
    # Judul 1
    judul_1 = models.CharField(max_length=255)
    deskripsi_1 = models.TextField()
    
    # Judul 2
    judul_2 = models.CharField(max_length=255)
    deskripsi_2 = models.TextField()
    
    # Judul 3
    judul_3 = models.CharField(max_length=255)
    deskripsi_3 = models.TextField()
    
    # Judul yang dipilih (setelah disetujui)
    judul_diterima = models.CharField(max_length=255, null=True, blank=True)
    
    # Status dan tanggal
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    tanggal_pengajuan = models.DateTimeField(auto_now_add=True)
    tanggal_update = models.DateTimeField(auto_now=True)
    
    # Pembimbing
    pembimbing_1 = models.ForeignKey(
        UserDosen,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bimbingan_1'
    )
    pembimbing_2 = models.ForeignKey(
        UserDosen,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bimbingan_2'
    )
    
    # Catatan review
    catatan_prodi = models.TextField(null=True, blank=True)
    catatan_fakultas = models.TextField(null=True, blank=True)
    catatan_pembimbing = models.TextField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Pengajuan Judul Skripsi'
        verbose_name_plural = 'Pengajuan Judul Skripsi'
        ordering = ['-tanggal_pengajuan']
    
    def __str__(self):
        return f"Pengajuan Judul Skripsi - {self.mahasiswa.user.full_name}"

# Model Note yang sudah ada
class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="notes")
    
    # Opsional: Tambahkan visibility berdasarkan level
    visibility = models.CharField(
        max_length=20,
        choices=[
            ('private', 'Private'),
            ('prodi', 'Program Studi'),
            ('fakultas', 'Fakultas'),
            ('public', 'Public'),
        ],
        default='private'
    )
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']

# Model untuk Article/News
class Article(models.Model):
    CATEGORY_CHOICES = [
        ('akademik', 'Akademik'),
        ('event', 'Event'),
        ('prestasi', 'Prestasi'),
        ('kerjasama', 'Kerjasama'),
        ('workshop', 'Workshop'),
        ('penelitian', 'Penelitian'),
        ('pengumuman', 'Pengumuman'),
        ('beasiswa', 'Beasiswa'),
        ('news', 'News'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]

    title = models.CharField(max_length=255, verbose_name="Judul")
    slug = models.SlugField(max_length=255, unique=True)
    content = models.TextField(verbose_name="Konten")
    excerpt = models.TextField(verbose_name="Ringkasan", max_length=300, help_text="Ringkasan singkat artikel (max 300 karakter)")
    
    # Metadata
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="articles")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='news')
    tags = models.CharField(max_length=255, blank=True, help_text="Pisahkan tag dengan koma")
    
    # Media
    featured_image = models.ImageField(
        upload_to='articles/images/%Y/%m/',
        null=True,
        blank=True,
        verbose_name="Gambar Utama"
    )
    
    # Status dan Visibilitas
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False, verbose_name="Tampilkan di Halaman Utama")

    # Program Studi terkait (opsional)
    related_prodi = models.ForeignKey(
        ProgramStudi,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='articles',
        verbose_name="Program Studi Terkait"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    # SEO Fields
    meta_title = models.CharField(max_length=100, blank=True, help_text="Judul untuk SEO (opsional)")
    meta_description = models.TextField(blank=True, help_text="Deskripsi untuk SEO (opsional)")
    
    # Statistics
    view_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = "Artikel"
        verbose_name_plural = "Artikel"
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title

# Layanan pengajuan surat
class NomorSurat(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('aktif', 'Aktif'),
        ('nonaktif', 'Nonaktif'),
        ('dihapus', 'Dihapus')
    ]

    tanggal_dibuat = models.DateTimeField(auto_now_add=True)
    admin_nomor_surat = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='nomor_surat_created')
    jurusan = models.ForeignKey(Jurusan, on_delete=models.SET_NULL, null=True, blank=True, related_name='nomor_surat')
    program_studi = models.ForeignKey(ProgramStudi, on_delete=models.SET_NULL, null=True, blank=True, related_name='nomor_surat')
    nomor = models.IntegerField()
    kode = models.CharField(max_length=20, default='UN36.7.1')  # Kode tetap
    jenis = models.CharField(max_length=10, default='KM')  # Jenis surat (KM, SK, dll)
    tahun = models.CharField(max_length=4)
    perihal = models.TextField()
    tujuan = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')

    class Meta:
        unique_together = ['nomor', 'tahun', 'jenis']
        ordering = ['-tahun', '-nomor']

    def __str__(self):
        return f"{self.nomor}/{self.kode}/{self.jenis}/{self.tahun}"

    def get_full_nomor(self):
        return f"{self.nomor}/{self.kode}/{self.jenis}/{self.tahun}"

class TandaTangan(models.Model):
    surat = models.ForeignKey(NomorSurat, on_delete=models.CASCADE, related_name="daftar_tanda_tangan")
    jabatan_penandatangan = models.CharField(max_length=255)  # Contoh: Dekan, Ketua Prodi, dsb
    user_penandatangan = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="tanda_tangan_user")
    perihal = models.CharField(max_length=255, blank=True, null=True)
    jenis_tanda_tangan = models.CharField(
        max_length=20,
        choices=[('manual', 'Manual'), ('elektronik', 'Elektronik')],
        default='manual'
    )
    file_tanda_tangan = models.ImageField(upload_to='ttd/manual/', null=True, blank=True)
    tanda_tangan_elektronik = models.CharField(max_length=255, null=True, blank=True)
    waktu_tanda_tangan = models.DateTimeField(null=True, blank=True)
    urutan = models.PositiveIntegerField(default=1)
    status = models.CharField(
        max_length=20,
        choices=[('pending', 'Belum Ditandatangani'), ('signed', 'Sudah Ditandatangani')],
        default='pending'
    )

    class Meta:
        ordering = ['urutan']

    def __str__(self):
        return f"{self.surat} - {self.jabatan_penandatangan} - {self.user_penandatangan}"

class JenisLayanan(models.Model):
    nama_layanan = models.CharField(max_length=255)
    deskripsi_layanan = models.TextField(blank=True, null=True)
    prasyarat_layanan = models.TextField(blank=True, null=True)
    konfigurasi_field = models.JSONField(null=True, blank=True)
    template_surat = models.CharField(max_length=255, blank=True, null=True, help_text="Path ke template surat, contoh: surat/cuti_akademik.html")
    # Ini adalah cara yang BENAR untuk mendefinisikan JSONField
    penandatangan_otomatis = models.JSONField(
        null=True,
        blank=True,
        default=list, # Penting: gunakan 'default=list' agar defaultnya adalah list kosong []
        help_text="Daftar penandatangan otomatis dalam format JSON. Contoh: [{'role': 'Ketua Prodi', 'user_type': 'ketua_prodi', 'order': 1}]"
    )
    def __str__(self):
        return self.nama_layanan

class Layanan(models.Model):
    status = models.CharField(max_length=50, default='Waiting', choices=[
        ('Waiting', 'Menunggu Diproses'),
        ('Processing', 'Sedang Diproses'),
        ('Completed', 'Selesai'),
        ('Rejected', 'Ditolak'),
    ])
    tanggal_dibuat = models.DateTimeField(auto_now_add=True)
    mahasiswa = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='layanan_mahasiswa')
    program_studi = models.ForeignKey(ProgramStudi, on_delete=models.SET_NULL, null=True, blank=True)
    jenis_layanan = models.ForeignKey(JenisLayanan, on_delete=models.SET_NULL, null=True, blank=True)
    isi_permohonan = models.TextField()
    file_permohonan = models.FileField(upload_to='layanan/permohonan/', null=True, blank=True)
    data_tambahan = models.JSONField(null=True, blank=True)  # Untuk data dinamis per jenis layanan
    admin_pemroses = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='layanan_admin_pemroses')
    hasil_proses = models.TextField(null=True, blank=True)
    file_hasil = models.FileField(upload_to='layanan/hasil/', null=True, blank=True)
    link_hasil = models.URLField(null=True, blank=True)
    nomor_surat = models.OneToOneField(NomorSurat, on_delete=models.SET_NULL, null=True, blank=True, related_name='layanan_nomor_surat')

    def __str__(self):
        return f"{self.mahasiswa} - {self.jenis_layanan}"

class DataTambahanFile(models.Model):
    layanan = models.ForeignKey(Layanan, on_delete=models.CASCADE, related_name='file_tambahan')
    nama_field = models.CharField(max_length=255)
    file = models.FileField(upload_to='layanan/file_tambahan/')
    tanggal_upload = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.layanan} - {self.nama_field}"