from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

# Choices untuk jenis user
class UserType(models.TextChoices):
    MAHASISWA = 'mahasiswa', 'USER MAHASISWA'
    DOSEN = 'dosen', 'USER DOSEN'
    PRODI = 'prodi', 'USER KETUA PRODI'
    DEKAN_FAKULTAS = 'fakultas', 'USER DEKAN'
    SUPER_ADMIN = 'super_admin', 'SUPER ADMIN'
    PEJABAT_JURUSAN = 'jurusan', 'USER PEJABAT JURUSAN'
    STAFF_FAKULTAS = 'staff_fakultas', 'USER STAFF FAKULTAS'
    STAFF_PRODI = 'staff_prodi', 'USER STAFF PRODI'

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
    ])
    is_active = models.BooleanField(default=True)
    
    # Method untuk mendapatkan nama lengkap (kompatibilitas dengan get_full_name())
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


class JurusanPejabat(models.Model):
    jabatan = models.CharField(max_length=15, choices=[
        ('Ketua', 'Ketua'),
        ('Sekretaris', 'Sekretaris'),
    ])
    jurusan = models.ForeignKey(Jurusan, on_delete=models.CASCADE)
    pejabat = models.OneToOneField(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pejabat_jurusan',
        limit_choices_to={'user_type':UserType.PEJABAT_JURUSAN})
    tgl_mulai = models.DateField(blank=False, null=False)
    tgl_selesai = models.DateField(blank=False, null=False)
    label = models.CharField(max_length=255, blank=True, null=True)
    plt = models.BooleanField(blank=True, null=True)

    def __str__(self):
        return f"{self.jurusan} - {self.pejabat}"

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
    
    class Meta:
        verbose_name_plural = "Nama Fakultas"
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
        limit_choices_to={'user_type': UserType.PRODI}
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
        limit_choices_to={'user_type__in': [UserType.DOSEN, UserType.DEKAN_FAKULTAS, UserType.PRODI]}
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
        if self.user.user_type != UserType.DOSEN:
            raise ValidationError('User harus bertipe Dosen')

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
    nim = models.CharField(max_length=20, unique=True, verbose_name="NIM")
    program_studi = models.ForeignKey(ProgramStudi, on_delete=models.CASCADE, related_name='mahasiswa')
    angkatan = models.CharField(max_length=4)
    semester = models.PositiveIntegerField(default=1)
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
        return f"{self.user.get_full_name()} - {self.nim}"
    
    def clean(self):
        if self.user.user_type != UserType.MAHASISWA:
            raise ValidationError('User harus bertipe Mahasiswa')

    class Meta:
        verbose_name_plural = "User Mahasiswa"
        verbose_name = "User Mahasiswa"  
        

# Model untuk User Prodi (Staff Program Studi)
class UserProdi(models.Model):
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='staff_prodi_profile',
        limit_choices_to={'user_type': UserType.PRODI}
    )
    program_studi = models.ForeignKey(ProgramStudi, on_delete=models.CASCADE, related_name='staff')
    jabatan = models.CharField(max_length=50, choices=[
            ('ketua_prodi', 'Ketua Program Studi'),
            ('admin_prodi', 'Admin Prodi'),
        ], blank=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Staff {self.program_studi.nama}"
    
    def clean(self):
        if self.user.user_type != UserType.PRODI:
            raise ValidationError('User harus bertipe Program Studi')

    class Meta:
        verbose_name_plural = "User Program Studi"
        verbose_name = "User Program Studi"

# Model untuk User Fakultas (Staff Fakultas)
class UserFakultas(models.Model):
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='staff_fakultas_profile',
        limit_choices_to={'user_type': UserType.STAFF_FAKULTAS}
    )
    fakultas = models.ForeignKey(Fakultas, on_delete=models.CASCADE, related_name='staff')
    jabatan = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Staff {self.fakultas.nama}"
    
    def clean(self):
        if self.user.user_type != UserType.FAKULTAS:
            raise ValidationError('User harus bertipe Fakultas')

    class Meta:
        verbose_name_plural = "User Fakultas"
        verbose_name = "User Fakultas"

# Model Note yang sudah ada (diperbarui)
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
