# Dokumentasi Mekarhub Integrated System (v3.9.1)

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
- **N**: Status / Kategori (Otomatis terisi "Klien" pada pendaftaran baru)
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

---

## 🛠️ Google Apps Script (v3.9.1 - Final Production)

Backend menggunakan skrip terpusat yang mengelola pendaftaran dari website dan manajemen dari dashboard admin.

### Pembaruan v3.9.1:
1. **Hybrid Method**: Mendukung `doPost` untuk pendaftaran website dan `doGet` untuk dashboard admin.
2. **Auto-Category**: Pendaftaran baru otomatis ditandai sebagai "Klien" di Kolom N agar selaras dengan filter dashboard.
3. **Robust Parsing**: Menambahkan logika fallback parsing data untuk memastikan data dari berbagai jenis browser tetap tersimpan di Spreadsheet.

---

## 🖥️ Landing Page & Form Kolaborasi (v3.9)

### Fitur Baru:
- **Premium Loading Animation**: Overlay loading dengan efek glassmorphism dan teks dinamis "Mengirim Kisah Anda...".
- **Automatic WhatsApp Redirect**: Setelah 5 detik sukses mengirim, sistem otomatis membuka WhatsApp Admin di **Tab Baru**.
- **Success Modal**: Notifikasi visual yang bersih dengan instruksi langkah selanjutnya.

---

## 🚀 Admin Dashboard (Responsive v3.0)

**URL:** `/admin` | **PIN:** `mekarhub2026`

### Fitur Unggulan:
- **Mobile First Design**: Tampilan tabel otomatis berubah menjadi kartu (Card View) di layar ponsel.
- **Financial Center**: Perhitungan otomatis nominal DP 50% saat Nilai Kontrak diisi.
- **WhatsApp Professional**: Template sapaan otomatis yang dipersonalisasi sesuai nama klien.

---

## 🚀 Cara Update / Deploy

1. Pastikan kode di Google Apps Script menggunakan versi terbaru (v3.9.1).
2. Klik **Deploy** > **Manage Deployments**.
3. Klik ikon **Pensil (Edit)** pada deployment aktif.
4. Pilih **Version: New Version**, lalu klik **Deploy**.
5. Pastikan URL Script sudah sama dengan variabel `GAS_ENDPOINT` di file `AdminDashboard.tsx` dan `FormCalonFigur.tsx`.
