# LMS For Campus
# Learning Management System (LMS) For Campus

## Description
A comprehensive Learning Management System designed specifically for campus environments. This system facilitates online learning, course management, and academic interactions between students, faculty, and administrators.

## User Types
1. SUPER_ADMIN - Super Administrator
2. DEKAN_FAKULTAS - Dean of Faculty
3. PEJABAT_JURUSAN - Department Officials
4. KETUA_PRODI - Head of Study Program
5. STAFF_FAKULTAS - Faculty Staff
6. STAFF_PRODI - Study Program Staff 
7. DOSEN - Lecturers
8. MAHASISWA - Students

## Features
- Multi-level User Management System
- Course and Academic Program Management
- Assignment Submission & Grading
- Online Quizzes & Assessments
- Discussion Forums
- File Sharing & Resource Management
- Attendance Tracking
- Grade Management
- Academic Calendar & Schedule Management
- Thesis/Final Project Management
- Faculty and Department Administration
- Student Academic Progress Tracking

## Technologies Used
- Backend: Django/Python
- Database: PostgreSQL
- Authentication: Django Authentication System
- File Storage: Django File Storage

## Getting Started

### Prerequisites
- Python 3.8+
- PostgreSQL
- pip (Python package manager)

### Installation
1. Clone the repository

# Akun Page Super User

## Pelayanan Akademik for Admin
- id, Createdat, @usermahasiswa, @layanan @status[menunggu, diproses, selesai, ], @Aksi


## Jenis-jenis layanan
- Surat Izin Penelitian
- Keterangan Izin Selesai Meneliti

## List User
- List berdasarkan type_user, Dosen Prodi/ Mahasiswa/ Admin
- Fitur Edit data user [blokir, ubah data personal, or change passwords, etc]
- No page create account, 

## Nomor Surat
- Format nomor surat, tanggal, perihal, tujuan surat, aksi [edit + batalkan nomor surat]

### Feilds nomor surat baru
- Perihal surat
- Tujuan surat

## TTD 
- ID, Created at, perihal, tujuan, aksi [edit, delete]


## Pengjuan Judul
- List Judul
- Proses Seleksi
// Nama, Prodi, Seleksi judul [3 judul diajukan, desc], Penasehat Akdemik, aksi [proses, approve, reset]
- List judul fix
// Pengjuan, nama/nim, prodi, judul fix, pembimbing 1,2, aksi[proses pembuat sk, aksi[edit, hapus, perpanjang sk, revisi sk, lanjut proposal]]


## Seminar Proposal
- id, nama, pembimbing 1, pembimbing 2, penguji, penguji 2, judul, tempat tgl seminar, aksi []
- add data seminar proposal
-- data mahasiswa, program studi, judul, waktu seminar, tempat/link seminar, pembimbing 1, 2, penggap 1, dan penanggap 2, aksi, submit, delete,

if data success

## Seminar proposal >
### List seminar proposal
- id, nama, pembimbing1,2, penguji 1,2 and titile, and date/location, add fitur [edit, cetak undangan [contoh undangan ada di folder/img], nilai, lanjut hasil, selesai meneliti, validator]

## Seminar Hasil
- id, nama, pembimbing 1,2 penguji 1,2 dan title, and date/location, add fitur [edit, cetak undangan [contoh undangan ada di folder/img]

## Ujian Meja
- id nim, nama, pembimbing 1,2, penguji 1,2 judul, and date/location/ aksi [ edit, undangan, pengesahan, nilai [ nilai berdasarkan userdOSEN], chat wa+ CETAK BERITA ACARA]

## Finalisasi Akhir
-- id. nim, nama, pembimbing 1,2, penguji 1,2 judul, sk pembimbiing, sk proposal, sk hasil, sk tutup, status, ipk/belum ujian

# Rekapitulasi 
## Seminar/Ujian
- List dosen, sebagai pembimbing 1, pembimbing 2, penguji 1, penguji 2, total menguji
- filter by data remon/dateset data [aksi: cetak data]
## Progress Mahsiswa per prodi, mulai dari angkatan awal
- Filter by prodi, strata
- id, nama. nim, prodi, judul, pembimbing, proposal, hasil, tutup, ket: belum ada progresss, misalnya mahsiswa itu sudah proposal, hasil, selesai,
## Lulusan Per Prodi
-  2020, 2021, total selesai
## Lulusan perangkatan
-  2020, 2021, 2023 [penerimaan berapa, lulus, belum lulus, presenstasi kelulusan


# Selesai Meneliti
## List Surat keterangan selesai meneliti
- tanggal surat, nama, nim, juful, tempat meneliti, aksi

## Add new Surat Keterangan selesai meneliti
- Data mahasiswa, data, pribadi, jenis tingkat penelitian, [ contoh akhir, skripsi, tesis], judul, tempat meneliti, perjabat yang bertandatangan, TTD Barcode, aksi proses 

# Perkuliahan
## Jadwal Kuliah
- KODE, MK, W/P, SKS, Hari, Jam, Ruangan, kELAS, Dosen [aksi, edit, delete]
## Monitoring Kuliah
- No, Prodi, Kode, Mata Kuliah, Kelas, Dosen 1, Dosen 2, Progress bar


# Surat Lain
# Surat Rekomendasi
- Tanggal Surat, Nim,Nama, IPK, Kegiatanya apa, [aksi, edit,/ cetak]
# Suket Cuti Akademik,




# AKUN PAGE ADMIN FAKULTAS 
## SK Pembimbing [ Buat SK+add no surat, dan klik proses maka sk berhasil dibuat/terbiat]
- list SK Pembimbing

## Rekapitulasi WAKTU SK Pembimbing per prodi, 
## Pejabat 
- dekan, ketua prodi, penjamin mutu, skretaris, 
## Periode Data, [ list periode data


# AKUN PAGE USER MAHASISWA
## Layanan Akademik
- Pengajuan Judul
- Revisi SK Pembimbing
- Daftar Seminar Propsal
- Daftar Seminar  Hasil
- Daftar Ujian Tutup
- Surat Izin Penelitian
- Keterangan Surat Izin Meneliti
## Panduan Skripsi
- Show layanan mahasiswa, mulai siapa pembimbingnya , daftar SK Pembimbing
- Alur atau roadmap mahasiswa itu selesai
example
### Pengajuan Judul
1. Mengajukan 3 judul
2. Judul akan dicek kesamaan oleh admin [Revisi jika ada, revisi judul]
3. Judul diseetujui oleh penasehat akademik, PA Bisa menyetujui lewat akunnya masing-masing, bisa ttd manual lembar pengesahan, jika PA ttd manual upload lembar pengajuan juduul di form layanan
4. Judul diseleksi oleh tim oleh tim seleksi judul jurusan/prodi {judul hasil seleksi}
5. penentuan pembimbing oleh jurusan dan prodi [dosen A, Dosen B]
6. SK Pembimbing terbit [ NAMA DOSEN A, DOSEN B]
7. Daftar SK Pembimbing [format, cetak SK]
8. Pembaruan SK Pembimbing, sk pembing kadaluarsa dalam waktu 6 bulan setelah diterbitkan, lakukan pembaruan sk
9. buatlah proposal skripsi mengikuti penduan [link panduan]
10. Bualtlah proposal dan konsultasikan kedua pemimbing dan membawa proposal dan lembar konsultasi [cetak lembar]
11. melaksanakan seminar proposal, dengn syarat lembar persetujuan seminar poposal di ttd oleh kedua pembimng [ cetak]
12. mendaftar seminar proposal
13. melakaukan perbaikan proposal untuk penerbitan izin meneliti [cetak
14. menerbitkan surat izin meneliti [ form layanan]]
15. lembar disposisi caldiator
16. 

22. melakukan perbaikian seminar hasil sebagai syarat ujian skripsi/meja/tutup berikut lembar persetujuan ujian skripsi yang harus ttd oleh kedua pembimng dan penguji [cetak]
23. melengkapi form persujuan hari ujian [cetak]
24. mendaftar ujian tutup [ isi form]
25. finalisasi akhir [form yananan
26. pengesahan akhir skripsi]
27. pengambilan IJAZAH
## Nilai Seminar Ujian
## Trace Studi
## atur profile
