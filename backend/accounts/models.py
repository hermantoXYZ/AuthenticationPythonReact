from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

# Choices untuk jenis user
class UserType(models.TextChoices):
    MAHASISWA = 'mahasiswa', 'Mahasiswa'
    DOSEN = 'dosen', 'Dosen'
    PRODI = 'prodi', 'Program Studi'
    FAKULTAS = 'fakultas', 'Fakultas'

# Custom User Model
class CustomUser(AbstractUser):
    user_type = models.CharField(
        max_length=20,
        choices=UserType.choices,
        default=UserType.MAHASISWA
    )
    profile_picture = models.ImageField(upload_to='profile_pictures/%Y/%m/', null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tempat_lahir = models.CharField(max_length=50, null=True, blank=True)
    birth_date = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=15, choices=[
        ('Laki-laki', 'Laki-laki'),
        ('Perempuan', 'Perempuan'),
    ])
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"

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
        limit_choices_to={'user_type': UserType.FAKULTAS}
    )
    deskripsi = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Fakultas"
    
    def __str__(self):
        return self.nama

# Model untuk Program Studi
class ProgramStudi(models.Model):
    nama = models.CharField(max_length=100)
    kode = models.CharField(max_length=10, unique=True)
    fakultas = models.ForeignKey(Fakultas, on_delete=models.CASCADE, related_name='program_studi')
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
        verbose_name_plural = "Program Studi"
    
    def __str__(self):
        return f"{self.nama} - {self.fakultas.nama}"

# Model untuk Dosen
class Dosen(models.Model):
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='dosen_profile',
        limit_choices_to={'user_type': UserType.DOSEN}
    )
    nidn = models.CharField(max_length=20, unique=True, verbose_name="NIDN")
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
        return f"{self.user.get_full_name()} - {self.nidn}"
    
    def clean(self):
        if self.user.user_type != UserType.DOSEN:
            raise ValidationError('User harus bertipe Dosen')

# Model untuk Mahasiswa
class Mahasiswa(models.Model):
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
        Dosen, 
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

# Model untuk User Prodi (Staff Program Studi)
class StaffProdi(models.Model):
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='staff_prodi_profile',
        limit_choices_to={'user_type': UserType.PRODI}
    )
    program_studi = models.ForeignKey(ProgramStudi, on_delete=models.CASCADE, related_name='staff')
    jabatan = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Staff {self.program_studi.nama}"
    
    def clean(self):
        if self.user.user_type != UserType.PRODI:
            raise ValidationError('User harus bertipe Program Studi')

# Model untuk User Fakultas (Staff Fakultas)
class StaffFakultas(models.Model):
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='staff_fakultas_profile',
        limit_choices_to={'user_type': UserType.FAKULTAS}
    )
    fakultas = models.ForeignKey(Fakultas, on_delete=models.CASCADE, related_name='staff')
    jabatan = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Staff {self.fakultas.nama}"
    
    def clean(self):
        if self.user.user_type != UserType.FAKULTAS:
            raise ValidationError('User harus bertipe Fakultas')

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