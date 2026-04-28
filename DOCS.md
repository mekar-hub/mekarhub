# Dokumentasi Mekarhub Integrated System (v5.4)

## 📁 Struktur Database

### 1. Spreadsheet Klien
**ID:** `1dGrwqokk3jXgpZChfvRQhA8Ht75L_XdqWOdxNN2w92Q`

**Pemetaan Kolom Utama:**
- ... (Sama seperti sebelumnya)
- **AD (Kolom 30)**: Jadwal Visit

---

## 🛠️ Google Apps Script (v5.4 - Final Production)

### Fitur Terbaru v5.4:
1. **Sync Jadwal Visit**: Otomatis mengambil data dari Kolom AD (30) untuk dimasukkan ke dokumen Master.
2. **Placeholder Baru**: Gunakan `[jadwal_visit]` di Google Docs Master untuk menampilkan tanggal visit klien.
3. **Format Tanggal Otomatis**: Menghasilkan format `dd mm yyyy` (Contoh: 28 04 2026) pada dokumen.
4. **Stable Body POST**: Mendukung pengiriman narasi sangat panjang melalui `URLSearchParams`.

---

## 🚀 Admin Dashboard (Deep Linking v3.5)

**URL:** `/admin` | **PIN:** `mekarhub2026` | **Deep Link:** `/admin/klien/[slug-nama]`

### Prosedur Update Dokumen Master:
1. Di Google Docs Master Creative Brief, ubah label **Target Produksi** menjadi **Jadwal Visit**.
2. Ganti placeholder `[deadline_shooting]` menjadi `[jadwal_visit]`.
3. Klik **Update Data Produksi** di Dashboard Admin untuk memproses ulang dokumen klien.

---

## 🚀 Cara Update / Deploy

1. Salin kode dari file `apps_script_sheet.js`.
2. Buka Google Apps Script Editor.
3. Klik **Deploy** > **Manage Deployments**.
4. Pilih **Version: New Version**, lalu klik **Deploy**.
5. Pastikan URL Script sama dengan variabel `GAS_ENDPOINT` di frontend.
