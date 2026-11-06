# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# E-Library Kaliwungu 05 Ceria

**Versi:** 1.0  
**Status:** Approved for Development Planning  
**Platform:** Web Application  
**Target Pengguna:** Siswa SD Negeri Kaliwungu 05 dan Super Admin  
**Deployment:** Cloudflare  
**Database:** Firebase Cloud Firestore

---

# 1. PRODUCT OVERVIEW

## 1.1 Nama Produk

E-Library Kaliwungu 05 Ceria

## 1.2 Deskripsi Produk

E-Library Kaliwungu 05 Ceria adalah aplikasi perpustakaan digital berbasis website yang dirancang untuk meningkatkan budaya literasi dan minat membaca siswa SD Negeri Kaliwungu 05.

Aplikasi menyediakan koleksi buku digital, fasilitas membaca PDF secara daring, jurnal membaca, sistem penghargaan berbasis poin, rekomendasi buku sesuai usia pembaca, serta dashboard monitoring aktivitas literasi.

Aplikasi memiliki dua jenis pengguna:
- **Siswa:** membaca buku, mencatat aktivitas membaca, mengumpulkan Bintang Literasi, dan melihat peringkat.
- **Super Admin:** mengelola siswa, buku, koleksi digital, serta memonitor perkembangan literasi seluruh siswa.

## 1.3 Product Vision

Menjadikan E-Library Kaliwungu 05 Ceria sebagai pusat kegiatan literasi digital sekolah yang menyenangkan, mudah digunakan, terukur, dan mampu membangun kebiasaan membaca sejak dini.

## 1.4 Tujuan Produk

1. Meningkatkan frekuensi membaca siswa.
2. Menyediakan akses buku digital secara mudah dan gratis.
3. Membangun kebiasaan mencatat hasil bacaan.
4. Memberikan motivasi membaca melalui gamifikasi.
5. Mempermudah sekolah memonitor perkembangan literasi.
6. Menyediakan data evaluasi kegiatan literasi secara otomatis.

---

# 2. USER ROLES

## 2.1 Siswa

Siswa memiliki akses untuk:
- Login menggunakan NISN dan password.
- Melihat dashboard pribadi.
- Menjelajahi katalog buku.
- Membaca buku digital.
- Melanjutkan bacaan terakhir.
- Melihat progres membaca.
- Mengisi jurnal membaca.
- Mengumpulkan Bintang Literasi.
- Melihat lencana pencapaian.
- Melihat peringkat kelas.
- Melihat peringkat global.

## 2.2 Super Admin

Super Admin memiliki kontrol penuh terhadap aplikasi.

Hak akses:
- Login menggunakan email dan password Firebase Authentication.
- Dashboard administrasi.
- CRUD data siswa.
- Impor data siswa melalui Excel.
- Mengubah password siswa.
- Reset password siswa.
- Mengelola koleksi buku.
- Melihat aktivitas membaca siswa.
- Mengelola jurnal membaca.
- Mengelola sistem poin.
- Melihat leaderboard.
- Melihat statistik literasi.
- Mengunduh laporan PDF dan Excel.
- Mengelola rekomendasi dan klasifikasi buku.
- Mengatur tahun ajaran dan kelas siswa.

Tidak diperlukan role guru atau admin tambahan pada versi pertama.

---

# 3. AUTHENTICATION DAN SECURITY

## 3.1 Admin Authentication

Menggunakan Firebase Authentication.

Metode:
- Email.
- Password.

Ketentuan:
- Hanya akun admin yang diizinkan.
- Tidak tersedia registrasi admin publik.
- Session harus aman.
- Halaman admin dilindungi middleware autentikasi.
- Seluruh operasi administrasi harus memeriksa otorisasi server.

## 3.2 Siswa Authentication

Siswa login menggunakan:

- NISN.
- Password.

Password awal seluruh siswa: `123456`.

Siswa tidak melakukan registrasi mandiri.

Admin memasukkan data siswa melalui dashboard atau impor Excel.

### Alur login siswa

1. Siswa membuka halaman login.
2. Mengisi NISN.
3. Mengisi password.
4. Sistem memvalidasi data melalui Cloudflare Worker.
5. Sistem memverifikasi password terhadap hash yang tersimpan.
6. Jika benar, sistem membuat session siswa.
7. Jika password masih default, siswa diarahkan ke halaman ganti password.
8. Setelah berhasil, siswa masuk ke dashboard.

### Keamanan password

- Password tidak boleh disimpan dalam bentuk plaintext.
- Gunakan PBKDF2 atau algoritma password hashing yang sesuai.
- Password awal harus diganti saat login pertama.
- Sediakan pembatasan percobaan login.
- Sediakan mekanisme logout.
- Session memiliki masa berlaku.
- Password tidak boleh dapat dibaca dari client Firestore.

## 3.3 Pergantian Password

Admin dapat:
- Mengubah password siswa.
- Melakukan reset password.
- Mengaktifkan kembali akun siswa.
- Menonaktifkan akun siswa.

Siswa dapat mengganti password sendiri melalui halaman profil.

---

# 4. PRODUCT FEATURES

# 4.1 DASHBOARD SISWA

Dashboard adalah halaman utama siswa setelah login.

### Komponen dashboard

**A. Sapaan personal**

Contoh:

Halo, Andi! Selamat datang di E-Library Kaliwungu 05 Ceria.

**B. Ringkasan literasi**

Menampilkan:
- Total buku selesai dibaca.
- Total halaman dibaca.
- Total waktu membaca.
- Total Bintang Literasi.
- Peringkat kelas.
- Peringkat global.

**C. Lanjutkan membaca**

Menampilkan buku terakhir yang dibaca beserta:
- Sampul buku.
- Judul buku.
- Halaman terakhir.
- Persentase progres.
- Tombol Lanjutkan Membaca.

**D. Rekomendasi buku**

Menampilkan buku berdasarkan jenjang pembaca yang sesuai dengan usia dan tingkat kemampuan membaca siswa.

**E. Pencapaian**

Menampilkan:
- Total bintang.
- Lencana yang diperoleh.
- Target membaca.
- Aktivitas membaca terbaru.

---

# 4.2 E-BOOK READER

Fitur utama untuk membaca buku digital.

### Persyaratan

- Membaca PDF langsung di website.
- Tidak menyediakan tombol download untuk siswa.
- Tampilan PDF responsif.
- Mendukung zoom in dan zoom out.
- Navigasi halaman.
- Menampilkan nomor halaman.
- Menyimpan halaman terakhir.
- Melacak progres membaca otomatis.
- Melanjutkan bacaan sebelumnya.

### Tampilan reader

Komponen:
- Judul buku.
- Tombol kembali.
- PDF Viewer.
- Navigasi halaman.
- Tombol zoom.
- Progress bar.
- Informasi persentase membaca.

### Tracking membaca

Sistem menyimpan:
- ID siswa.
- ID buku.
- Halaman terakhir.
- Halaman tertinggi yang pernah dibaca.
- Total halaman yang telah dibaca.
- Persentase progres.
- Waktu mulai membaca.
- Waktu terakhir membaca.
- Total durasi membaca.

### Aturan progres

Persentase membaca dihitung berdasarkan:

`Halaman unik yang dibaca / Total halaman buku × 100%`

Satu halaman tidak boleh dihitung berulang kali sebagai halaman baru.

Status buku:
- Belum Dibaca.
- Sedang Dibaca.
- Selesai Dibaca.

Buku dinyatakan selesai jika siswa telah membaca minimal 90% halaman unik buku.

Sistem harus membedakan waktu reader terbuka dengan waktu aktif membaca. Tab yang tidak aktif tidak boleh terus menambahkan durasi membaca.

---

# 4.3 KATALOG BUKU

Menyediakan seluruh koleksi buku nonteks yang berhasil diambil dari katalog resmi Kemendikdasmen.

Sumber:
https://buku.kemendikdasmen.go.id/katalog/buku-non-teks

### Kategori buku

- Cerita anak.
- Fiksi.
- Nonfiksi.
- Pengetahuan umum.
- Pendidikan karakter.
- Lingkungan.
- Budaya.
- Sains.
- Sejarah.
- Buku pengayaan.

Kategori ditentukan berdasarkan metadata dan analisis isi buku.

### Fitur pencarian

Siswa dapat mencari berdasarkan:
- Judul.
- Penulis.
- Kategori.
- Jenjang pembaca.
- Kelas rekomendasi.

### Filter

- Kelas 1–2.
- Kelas 3–4.
- Kelas 5–6.
- Pembaca Dini.
- Pembaca Awal.
- Pembaca Semenjana.
- Pembaca Madya.
- Pembaca Mahir.

### Informasi buku

Setiap buku memiliki:
- Cover.
- Judul.
- Penulis.
- Penerbit.
- Tahun terbit.
- Deskripsi.
- Kategori.
- Jumlah halaman.
- Jenjang pembaca.
- Rekomendasi usia.
- Rekomendasi kelas.
- URL atau lokasi file PDF.

---

# 4.4 BOOK AGENT

Book Agent merupakan sistem otomatis yang bertugas mengambil, mengelola, dan menganalisis koleksi buku dari SIBI Kemendikdasmen.

### A. Proses pengambilan buku

Agent harus:

1. Membuka katalog buku nonteks.
2. Mengambil seluruh daftar buku.
3. Melakukan crawling seluruh halaman katalog.
4. Mengambil metadata buku.
5. Mengambil URL PDF yang tersedia.
6. Mengunduh PDF.
7. Memeriksa validitas file.
8. Memeriksa duplikasi.
9. Membuat metadata JSON.
10. Menghasilkan ZIP berisi koleksi PDF dan manifest.

### B. Struktur hasil download

`books-package.zip`

Struktur:

    books-package/
    ├── books/
    │   ├── book-001.pdf
    │   ├── book-002.pdf
    │   ├── book-003.pdf
    │   └── ...
    ├── covers/
    │   ├── book-001.jpg
    │   └── ...
    ├── metadata/
    │   └── books.json
    └── manifest.json

### C. Validasi

Agent harus memeriksa:
- File benar-benar PDF.
- File dapat dibuka.
- File tidak korup.
- Ukuran file.
- Jumlah halaman.
- Duplikasi berdasarkan identitas buku dan checksum.
- Ketersediaan metadata.

Jika ada buku yang gagal diunduh, agent mencatatnya dalam laporan error dan dapat mencoba ulang.

### D. AI Book Classification Agent

Setiap buku dianalisis berdasarkan isi PDF.

Analisis:
- Tema cerita.
- Kompleksitas bahasa.
- Panjang kalimat.
- Kosakata.
- Topik pembahasan.
- Kompleksitas konsep.
- Potensi konten yang belum sesuai untuk anak.

Output klasifikasi:

    {
      "readingLevel": "B2",
      "recommendedAgeMin": 7,
      "recommendedAgeMax": 9,
      "recommendedGrades": [2, 3],
      "category": "Cerita Anak",
      "difficulty": "Mudah",
      "summary": "Ringkasan isi buku",
      "classificationStatus": "pending_review"
    }

AI tidak boleh menganggap klasifikasi usia sebagai kepastian. Hasil analisis perlu memiliki tingkat keyakinan dan dapat ditinjau admin sebelum ditampilkan sebagai rekomendasi.

### E. Distribusi file

ZIP merupakan hasil pengunduhan yang disertakan dalam paket distribusi source code.

Untuk deployment:
- Source code aplikasi dipisahkan dari file PDF.
- PDF diekstrak dan disimpan di Cloudflare R2.
- Metadata diimpor ke Firestore.
- Reader mengambil PDF melalui endpoint yang dilindungi.
- File PDF tidak dimasukkan ke bundle Worker.

Tujuannya agar aplikasi tetap ringan dan deployment dapat dilakukan tanpa mengunggah ulang seluruh koleksi setiap kali source code diperbarui.

---

# 4.5 JURNAL MEMBACA

Jurnal membaca menjadi sarana dokumentasi aktivitas literasi siswa.

### Form jurnal

Field:
1. Judul buku.
2. Tanggal membaca.
3. Durasi membaca.
4. Jumlah halaman dibaca.
5. Ringkasan bacaan.

### Ketentuan

- Siswa dapat membuat jurnal.
- Sistem dapat menghubungkan jurnal dengan buku yang dibaca.
- Judul buku dapat dipilih dari katalog.
- Jurnal tersimpan di Firestore.
- Siswa dapat melihat riwayat jurnalnya.
- Siswa dapat mengedit jurnal miliknya dengan batasan yang ditentukan sistem.

Jurnal tidak memerlukan verifikasi manual untuk mendapatkan poin. Sistem memberikan poin berdasarkan aktivitas yang memenuhi aturan otomatis.

---

# 4.6 BINTANG LITERASI

Nama sistem penghargaan: **Bintang Literasi**.

Tujuan: meningkatkan motivasi membaca melalui pencapaian yang menyenangkan.

### A. Sistem poin

Usulan aturan poin:

| Aktivitas | Poin |
|---|---:|
| Membaca 10 menit aktif | 5 |
| Membaca 20 halaman unik | 5 |
| Menyelesaikan satu buku | 20 |
| Mengisi jurnal membaca | 5 |
| Membaca selama 7 hari berbeda | 15 bonus |

Ketentuan:
- Poin dihitung otomatis.
- Satu aktivitas tidak boleh menghasilkan poin berulang secara tidak sah.
- Poin membaca berdasarkan aktivitas yang tervalidasi.
- Bonus penyelesaian buku hanya diberikan sekali per buku.
- Terdapat batas poin harian untuk mencegah manipulasi.
- Semua transaksi poin dicatat dalam riwayat.

### B. Badge

Contoh penghargaan:

| Badge | Persyaratan |
|---|---|
| Pembaca Pemula | Menyelesaikan buku pertama |
| Sahabat Buku | Menyelesaikan 5 buku |
| Pecinta Literasi | Menyelesaikan 10 buku |
| Kutu Buku | Menyelesaikan 25 buku |
| Juara Literasi | Mencapai 1.000 poin |
| Pembaca Konsisten | Membaca 7 hari berbeda |

### C. Leaderboard

Terdapat dua leaderboard:

**1. Peringkat Kelas**

Menampilkan peringkat siswa dalam kelas masing-masing.

**2. Peringkat Global**

Menampilkan seluruh siswa SD Negeri Kaliwungu 05.

Data:
- Peringkat.
- Nama siswa.
- Kelas.
- Avatar.
- Total poin.
- Total buku selesai.

Periode:
- Mingguan.
- Bulanan.
- Keseluruhan.

Peringkat menggunakan total poin pada periode yang dipilih.

---

# 4.7 REKOMENDASI BUKU

Rekomendasi buku dilakukan berdasarkan hasil analisis isi oleh Book Agent.

### Sistem rekomendasi

AI menganalisis:
- Tingkat kesulitan bahasa.
- Usia pembaca.
- Tingkat pemahaman.
- Kompleksitas cerita.
- Tema bacaan.

### Pemetaan kelas

Rekomendasi awal:

| Kelas | Rentang usia perkiraan |
|---|---|
| 1 | 6–7 tahun |
| 2 | 7–8 tahun |
| 3 | 8–9 tahun |
| 4 | 9–10 tahun |
| 5 | 10–11 tahun |
| 6 | 11–12 tahun |

Usia aktual siswa tetap menjadi pertimbangan.

### Tampilan rekomendasi

- Buku untuk kelas saya.
- Buku cerita menarik.
- Buku pengetahuan.
- Buku mudah dibaca.
- Buku yang direkomendasikan AI.

Admin dapat memperbaiki hasil klasifikasi AI.

---

# 4.8 DASHBOARD ADMIN

Dashboard admin merupakan pusat monitoring kegiatan literasi sekolah.

### Statistik utama

Menampilkan:

1. Total siswa.
2. Total koleksi buku.
3. Total halaman dibaca.
4. Total waktu membaca.
5. Siswa paling aktif.
6. Kelas paling aktif.

### Grafik

- Aktivitas membaca harian.
- Aktivitas membaca mingguan.
- Aktivitas membaca bulanan.
- Perbandingan aktivitas antarkelas.
- Tren jumlah halaman.
- Tren waktu membaca.

### Informasi tambahan

- Aktivitas membaca terbaru.
- Buku terpopuler.
- Siswa dengan poin tertinggi.
- Kelas dengan aktivitas tertinggi.
- Status sinkronisasi katalog buku.

Dashboard harus mendukung filter periode dan kelas.

---

# 4.9 LAPORAN

Admin dapat menghasilkan laporan PDF dan Excel.

### Jenis laporan

**A. Laporan Siswa**
- Nama siswa.
- NISN.
- Kelas.
- Total buku.
- Total halaman.
- Total waktu membaca.
- Total poin.

**B. Laporan Kelas**
- Nama kelas.
- Jumlah siswa aktif.
- Total aktivitas membaca.
- Total halaman.
- Total waktu membaca.
- Rata-rata aktivitas.

**C. Laporan Buku**
- Judul buku.
- Jumlah pembaca.
- Jumlah selesai dibaca.
- Total aktivitas.

**D. Laporan Literasi**
- Grafik perkembangan.
- Aktivitas harian.
- Aktivitas bulanan.
- Peringkat siswa.
- Peringkat kelas.

### Export

- PDF untuk laporan resmi.
- Excel untuk pengolahan data lanjutan.

Laporan dapat difilter berdasarkan tanggal, kelas, dan siswa.

---

# 5. STRUKTUR HALAMAN APLIKASI

## 5.1 Halaman Publik

- Login siswa.
- Login admin.

## 5.2 Halaman Siswa

- Dashboard.
- Katalog Buku.
- Detail Buku.
- Baca Buku.
- Jurnal Membaca.
- Bintang Literasi.
- Leaderboard.
- Profil.
- Ganti Password.

## 5.3 Halaman Admin

- Dashboard.
- Manajemen Siswa.
- Tambah Siswa.
- Import Siswa Excel.
- Detail Siswa.
- Manajemen Buku.
- Book Agent.
- Klasifikasi Buku.
- Jurnal Membaca.
- Statistik Literasi.
- Leaderboard.
- Laporan.
- Pengaturan.

---

# 6. DATABASE ARCHITECTURE

Database utama menggunakan Cloud Firestore.

## 6.1 Collection: students

    students/{studentId}

Field:

    {
      "nisn": "1234567890",
      "name": "Nama Siswa",
      "classId": "kelas-1-a",
      "birthDate": "2015-05-20",
      "passwordHash": "...",
      "mustChangePassword": true,
      "isActive": true,
      "totalPoints": 0,
      "totalBooksCompleted": 0,
      "totalPagesRead": 0,
      "totalReadingMinutes": 0,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }

Catatan: passwordHash hanya boleh diakses melalui backend. NISN tidak boleh menjadi satu-satunya ID dokumen yang dapat ditebak tanpa kontrol akses.

## 6.2 Collection: classes

    classes/{classId}

Field:
- name.
- grade.
- academicYear.
- isActive.

## 6.3 Collection: books

    books/{bookId}

Field:
- title.
- author.
- publisher.
- publicationYear.
- description.
- category.
- coverUrl.
- pdfStoragePath.
- totalPages.
- readingLevel.
- recommendedAgeMin.
- recommendedAgeMax.
- recommendedGrades.
- aiSummary.
- aiConfidence.
- classificationStatus.
- sourceUrl.
- sourceLicenseNotes.
- checksum.
- createdAt.

## 6.4 Collection: reading_progress

    reading_progress/{progressId}

Field:
- studentId.
- bookId.
- lastPage.
- highestPage.
- pagesRead.
- progressPercentage.
- readingMinutes.
- status.
- lastReadAt.
- updatedAt.

Untuk perhitungan halaman unik, sistem harus menyimpan data halaman yang telah dibaca atau struktur agregasi yang setara.

## 6.5 Collection: reading_journals

    reading_journals/{journalId}

Field:
- studentId.
- bookId.
- bookTitle.
- readingDate.
- durationMinutes.
- pagesRead.
- summary.
- createdAt.
- updatedAt.

## 6.6 Collection: point_transactions

    point_transactions/{transactionId}

Field:
- studentId.
- activityType.
- points.
- referenceId.
- description.
- createdAt.

Transaksi poin bersifat immutable dan hanya dapat dibuat oleh backend.

## 6.7 Collection: badges

    badges/{badgeId}

Field:
- name.
- description.
- icon.
- requirementType.
- requirementValue.

## 6.8 Collection: student_badges

    student_badges/{recordId}

Field:
- studentId.
- badgeId.
- awardedAt.

## 6.9 Collection: book_agent_logs

    book_agent_logs/{logId}

Field:
- executionId.
- startedAt.
- finishedAt.
- status.
- totalBooksFound.
- totalBooksDownloaded.
- totalBooksFailed.
- totalDuplicates.
- errors.

---

# 7. SYSTEM ARCHITECTURE

## 7.1 Arsitektur utama

Frontend:

- Next.js.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Responsive layout.

Backend:

- Cloudflare Workers.
- Cloudflare-compatible server runtime.
- API endpoints.

Database:

- Firebase Cloud Firestore.

Authentication:

- Firebase Authentication untuk admin.
- Custom student authentication untuk siswa.

Storage:

- Cloudflare R2 untuk PDF dan cover buku.

Reader:

- PDF.js.

Deployment:

- Cloudflare Workers dengan adapter Next.js yang kompatibel.
- Cloudflare R2 untuk aset buku.

## 7.2 Alur sistem

    Siswa
      |
      v
    Next.js Website
      |
      v
    Cloudflare Worker
      |
      +------ Firebase Authentication (Admin)
      |
      +------ Student Authentication
      |
      +------ Cloud Firestore
      |
      +------ Cloudflare R2
                  |
                  v
              PDF Reader

## 7.3 Keamanan backend

- Semua kredensial server disimpan sebagai Cloudflare Secrets.
- Jangan memasukkan service account key ke frontend.
- Validasi session pada setiap endpoint.
- Gunakan Firestore Security Rules dengan prinsip least privilege.
- Siswa hanya boleh membaca dan mengubah data miliknya melalui jalur yang diizinkan.
- Operasi poin dan statistik dilakukan di backend.
- URL file PDF tidak boleh memberikan akses publik tanpa kontrol.
- Gunakan signed URL atau endpoint streaming terautentikasi.

---

# 8. UI/UX DESIGN GUIDELINES

## 8.1 Tema

Tema: Ceria, Ramah Anak, Modern.

## 8.2 Warna

Palet yang disarankan:

- Primary: Orange.
- Secondary: Sky Blue.
- Accent: Yellow.
- Success: Green.
- Background: Cream atau putih.
- Text: Dark Navy.

## 8.3 Gaya desain

- Rounded cards.
- Ikon ilustratif.
- Typography mudah dibaca.
- Tombol besar.
- Navigasi sederhana.
- Ilustrasi edukatif.
- Badge dan penghargaan menarik.
- Animasi ringan.
- Responsif untuk HP, tablet, dan komputer.

## 8.4 Navigasi siswa

Gunakan sidebar untuk desktop dan bottom navigation untuk mobile.

Navigasi utama:
- Beranda.
- Katalog.
- Jurnal.
- Bintang Literasi.
- Peringkat.

## 8.5 Navigasi admin

Gunakan sidebar dashboard dengan navigasi:
- Dashboard.
- Siswa.
- Buku.
- Book Agent.
- Aktivitas Literasi.
- Laporan.
- Pengaturan.

---

# 9. DATA IMPORT SISWA

Admin dapat mengimpor data siswa melalui file Excel.

Format:

| NISN | Nama | Tanggal Lahir | Kelas |
|---|---|---|---|
| 1234567890 | Andi | 2015-05-20 | 1A |
| 1234567891 | Budi | 2015-07-12 | 1A |

Ketentuan:
- Validasi NISN.
- Mencegah NISN duplikat.
- Validasi kelas.
- Password awal otomatis.
- Menampilkan hasil impor.
- Menampilkan baris gagal.
- Menyediakan template Excel.

---

# 10. NON-FUNCTIONAL REQUIREMENTS

## Performance

- Halaman utama dimuat dengan cepat.
- Katalog menggunakan pagination.
- PDF menggunakan lazy loading.
- Cover menggunakan optimasi gambar.
- Statistik menggunakan data agregat.
- Proses berat dijalankan secara asynchronous.

## Reliability

- Sistem memiliki error handling.
- Proses download dapat dilanjutkan.
- Pengunduhan buku tidak boleh berhenti hanya karena satu file gagal.
- Backup database dilakukan secara berkala.
- Aktivitas membaca tidak hilang ketika siswa keluar dari reader.

## Security

- Password di-hash.
- Tidak ada kredensial sensitif di frontend.
- Validasi semua input.
- Proteksi brute-force.
- Session management.
- Otorisasi admin dan siswa.
- Proteksi manipulasi poin.

## Scalability

Arsitektur dibuat cukup fleksibel untuk menangani pertumbuhan jumlah siswa dan koleksi buku, meskipun aplikasi pada tahap awal hanya digunakan satu sekolah.

---

# 11. ACCEPTANCE CRITERIA

Aplikasi dinyatakan memenuhi kebutuhan jika:

### Authentication
- Admin dapat login dengan Firebase Authentication.
- Siswa dapat login dengan NISN dan password.
- Password awal dapat diganti.
- Admin dapat mereset password siswa.

### Dashboard
- Statistik siswa tampil benar.
- Statistik buku tampil benar.
- Halaman dan waktu membaca terhitung benar.
- Grafik aktivitas dapat ditampilkan.

### Katalog
- Buku dapat dicari.
- Filter kelas berfungsi.
- Detail buku dapat dibuka.
- Cover dan metadata tampil benar.

### PDF Reader
- PDF dapat dibaca secara daring.
- Zoom berfungsi.
- Halaman terakhir tersimpan.
- Progres membaca tersimpan.
- Siswa dapat melanjutkan membaca.

### Jurnal
- Siswa dapat menambahkan jurnal.
- Jurnal tersimpan.
- Riwayat jurnal tampil.

### Gamifikasi
- Poin diberikan otomatis.
- Tidak terjadi duplikasi transaksi.
- Badge diperoleh sesuai persyaratan.
- Leaderboard kelas berfungsi.
- Leaderboard global berfungsi.

### Book Agent
- Agent dapat mengambil daftar buku.
- Agent dapat mengunduh PDF yang tersedia.
- Agent menghasilkan ZIP.
- Metadata tersimpan.
- File yang gagal tercatat.
- AI menghasilkan klasifikasi buku.

### Laporan
- PDF dapat diekspor.
- Excel dapat diekspor.
- Filter laporan berfungsi.

### Deployment
- Aplikasi berjalan di Cloudflare.
- Firestore terhubung.
- R2 dapat menyajikan PDF.
- Tidak ada secret yang terekspos.

---

# 12. DEVELOPMENT ROADMAP

## Phase 1 — Foundation

- Setup Next.js.
- Setup Firebase.
- Setup Cloudflare.
- Desain sistem.
- Authentication admin.
- Authentication siswa.
- Database schema.
- Security Rules.

## Phase 2 — Core Library

- Dashboard siswa.
- Dashboard admin.
- Katalog buku.
- Detail buku.
- PDF reader.
- Reading progress.

## Phase 3 — Literacy System

- Jurnal membaca.
- Bintang Literasi.
- Point engine.
- Badge.
- Leaderboard.

## Phase 4 — Book Intelligence

- Book Agent.
- PDF downloader.
- ZIP generator.
- Metadata extraction.
- AI classification.
- Rekomendasi buku.

## Phase 5 — Administration

- CRUD siswa.
- Import Excel.
- Manajemen buku.
- Laporan PDF.
- Laporan Excel.
- Statistik literasi.

## Phase 6 — Testing and Deployment

- Functional testing.
- Security testing.
- Responsive testing.
- Performance testing.
- Data validation.
- Deployment Cloudflare.
- UAT (User Acceptance Testing).

---

# 13. OUT OF SCOPE

Fitur berikut tidak termasuk versi pertama:

- Peminjaman buku fisik.
- Manajemen stok buku cetak.
- Login guru.
- Login orang tua.
- Registrasi siswa mandiri.
- Aplikasi Android native.
- Chat antar siswa.
- Komentar publik.
- Notifikasi push.
- Forum diskusi.
- Multi-sekolah.
- Mode offline untuk seluruh koleksi.

---

# 14. DEFINITION OF DONE

Pengembangan E-Library Kaliwungu 05 Ceria dinyatakan selesai apabila:

1. Semua halaman utama berfungsi.
2. Semua role dan hak akses berjalan.
3. Data siswa terhubung dengan Firestore.
4. Login admin terhubung dengan Firebase Authentication.
5. PDF dapat dibaca secara daring.
6. Progres membaca tersimpan.
7. Jurnal membaca berfungsi.
8. Sistem Bintang Literasi berfungsi otomatis.
9. Leaderboard berjalan.
10. Book Agent berhasil menghasilkan paket buku dan metadata.
11. AI dapat mengklasifikasikan buku.
12. Laporan PDF dan Excel dapat diunduh.
13. Sistem berjalan pada Cloudflare.
14. Tidak ditemukan masalah keamanan kritis.
15. Seluruh acceptance criteria terpenuhi.

---

# 15. FINAL PRODUCT DIRECTION

E-Library Kaliwungu 05 Ceria harus dikembangkan sebagai aplikasi perpustakaan digital sekolah yang mengutamakan tiga hal:

**1. READ — Membaca**

Siswa memperoleh akses ke banyak koleksi buku digital dengan pengalaman membaca yang nyaman.

**2. RECORD — Mencatat**

Aktivitas membaca terdokumentasi melalui jurnal dan tracking otomatis.

**3. REWARD — Menghargai**

Siswa memperoleh Bintang Literasi, badge, dan penghargaan berdasarkan aktivitas membaca.

**Visi akhir:**

Menciptakan ekosistem literasi digital yang membuat membaca menjadi kebiasaan menyenangkan bagi seluruh siswa SD Negeri Kaliwungu 05.

---

**Dokumen PRD E-LIBRARY KALIWUNGU 05 CERIA — VERSI 1.0**  
**Status: Siap menjadi acuan pengembangan teknis.**