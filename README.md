# E-Library Kaliwungu 05 Ceria 🌟📚

Aplikasi perpustakaan digital resmi siswa dan admin **SD Negeri Kaliwungu 05**, dirancang untuk meningkatkan budaya literasi dan minat membaca siswa melalui tiga pilar: **READ**, **RECORD**, dan **REWARD**.

---

## 🚀 Fitur Unggulan

1. **READ (Membaca Menyenangkan):**
   - Ratusan koleksi buku nonteks resmi Kemendikdasmen RI yang dikurasi langsung oleh **Book Agent**.
   - E-Book PDF reader interaktif dengan kontrol navigasi, zoom, dan proteksi unduhan langsung.
   - Pelacakan waktu membaca aktif (hanya menghitung saat tab browser fokus/terbuka).
   - Penghitungan progres berbasis halaman unik dibaca (otomatis selesai saat mencapai $\ge 90\%$).

2. **RECORD (Mencatat Pemahaman):**
   - Jurnal Membaca Siswa: mencatat ringkasan, pesan moral, dan durasi membaca.
   - Riwayat jurnal tersimpan rapi dan otomatis memberikan +5 Bintang Literasi.

3. **REWARD (Gamifikasi Bintang & Lencana):**
   - **Bintang Literasi:** Poin membaca aktif, halaman unik, penyelesaian buku (+20), dan bonus streak 7 hari (+15).
   - **Lencana Kehormatan:** Pembaca Pemula, Sahabat Buku, Pecinta Literasi, Kutu Buku, Juara Literasi, Pembaca Konsisten.
   - **Leaderboard:** Papan peringkat Kelas & Global SDN Kaliwungu 05 dengan podium juara.

4. **ADMINISTRATION & REPORTING:**
   - Autentikasi Admin via Firebase Authentication.
   - Autentikasi Siswa aman via NISN + PBKDF2 hash (password default `123456` wajib diubah saat login pertama).
   - CRUD data siswa, reset password siswa instan.
   - Impor massal siswa via Excel (.xlsx) dengan validasi NISN duplikat.
   - Ekspor laporan literasi resmi ke Excel (.xlsx) dan PDF siap cetak.
   - Book Agent crawler otomatis untuk katalog SIBI Kemendikdasmen.

---

## 🛠️ Stack Teknologi

- **Frontend & Runtime:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Database & Auth:** Firebase Cloud Firestore & Firebase Authentication (`elibrary-2ba9f`)
- **Backend Admin:** Firebase Admin SDK (Node.js) & WebCrypto PBKDF2 password hashing
- **Reader & Assets:** PDF.js / canvas streaming & logo resmi [logo.png](file:///c:/Users/mukti/Documents/GitHub/ELibraryCeria/public/logo.png)
- **Ekspor Data:** `xlsx` & `jspdf` / `jspdf-autotable`
- **Deployment:** Cloudflare Pages / Workers

---

## ⚙️ Menjalankan Aplikasi di Lokal

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Environment Variables
Pastikan berkas `.env.local` telah terisi (sudah dikonfigurasi dengan kredensial Firebase project `elibrary-2ba9f`).

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 4. Akun Uji Coba Default
- **Siswa Uji Coba:**
  - **NISN:** `1234567890`
  - **Password:** `123456` (Password bawaan)
- **Super Admin:**
  - Login melalui tab **Admin** di halaman `/login` menggunakan email & password Firebase Auth terdaftar.

---

## 🤖 Menjalankan Book Agent (Koleksi Buku Kemendikdasmen)

Untuk memperbarui atau mengunduh ulang metadata 487+ buku nonteks resmi Kemendikdasmen langsung ke Firestore:
```bash
npx tsx scripts/book-agent.ts
```

---

## ☁️ Deployment ke Cloudflare

1. Login ke Cloudflare via Wrangler:
   ```bash
   npx wrangler login
   ```
2. Deploy ke Cloudflare Pages:
   ```bash
   npx wrangler pages deploy .next
   ```
