# Dokumentasi Mekarhub Integrated System (v3.0)

## 📁 Struktur Database

### 1. Spreadsheet Klien
**ID:** `1dGrwqokk3jXgpZChfvRQhA8Ht75L_XdqWOdxNN2w92Q`
**Fungsi:** Menyimpan data pendaftaran klien dan detail produksi/keuangan.

**Pemetaan Kolom Utama:**
- **A**: Tanggal (Timestamp)
- **B**: Nama Lengkap
- **C**: Jabatan
- **D**: No. WhatsApp
- **E**: Sosial Media Brand
- **F**: Lokasi Brand
- **G**: Deskripsi Usaha
- **H**: Momen Berkesan
- **M**: Harapan
- **N**: Status (Nominee / Client)
- **P**: Link Brief (Otomatis)
- **V**: Link MoU (Otomatis)
- **W**: Nilai Kontrak
- **X**: Nomor Rekening
- **Y**: Target Produksi
- **Z**: Status Pelunasan
- **AA**: Nama Lead
- **AB**: Nama Videografer
- **AC**: Nama Editor
- **AD**: Jadwal Visit
- **AE**: Status Produksi
- **AF**: Link Hasil Final

### 2. Spreadsheet Figur
**ID:** `18iGYoxGPp6A0CuAtw0L8qMj9Tth4XzBglA-sU4WkyxE`
**Fungsi:** Menyimpan data narasi cerita yang akan ditampilkan di website.

**Pemetaan Kolom:**
- **A**: ID (Auto)
- **B**: Nama Figur
- **C**: Judul Cerita
- **D**: Kategori
- **G**: Slug URL
- **H**: Narasi Cerita
- **J**: Link Gambar Utama
- **K**: ID Relasi Klien (Penghubung ke Spreadsheet Klien)

---

## 🛠️ Google Apps Script (v3.0 - Integrated)

Backend sekarang menggunakan satu skrip terpusat yang mengelola kedua spreadsheet sekaligus.

### Fitur Utama GAS:
1. **Integrated Access**: Menggunakan `openById` untuk mengakses data klien dan figur dalam satu pintu API.
2. **Auto-Document**: Membuat MoU dan Brief secara otomatis ke Google Drive.
3. **Public Access**: Pengaturan Deployment harus diset ke **"Anyone"** agar dashboard dapat menarik data tanpa kendala CORS.

---

## 🖥️ Admin Dashboard (Responsive v3.0)

**URL:** `/admin` | **PIN:** `mekarhub2026`

### Fitur Unggulan Baru:
- **Mobile First Design**: 
  - **Card View**: Tabel otomatis berubah menjadi kartu di layar HP.
  - **Hamburger Menu**: Navigasi sidebar yang dapat disembunyikan.
  - **No Auto-Zoom**: Font input 16px untuk kenyamanan mengetik di seluler.
- **Financial Center**: 
  - **Live DP 50%**: Perhitungan otomatis nominal DP saat Nilai Kontrak diisi.
- **WhatsApp Professional**:
  - Tombol WhatsApp otomatis menyertakan template sapaan profesional: *"Halo [Nama], salam hangat dari Mekarhub. Kami telah menerima kiriman kisah Anda..."*
- **Live Preview Modal**:
  - Pratinjau dokumen (Brief/MoU) menggunakan modal layar penuh dengan sistem otomatis mengubah link `/edit` menjadi `/preview`.

---

## 🚀 Cara Update / Deploy

1. Salin kode dari `apps_script_sheet.js` (v2.8).
2. Tempel di editor Google Apps Script (Sangat disarankan di Apps Script file **Figur**).
3. Klik **Deploy** > **New Deployment**.
4. Pilih **Web App**, Jalankan sebagai **Me**, Akses **Anyone**.
5. Salin URL baru tersebut ke variabel `GAS_ENDPOINT` di file `AdminDashboard.tsx` dan `FormCalonFigur.tsx`.
6. Lakukan **Hard Refresh (Ctrl + F5)** pada browser setelah update frontend.
