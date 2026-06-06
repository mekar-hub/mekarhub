# Dokumentasi Mekarhub Integrated System

## Update Log Terbaru - 2026-05-05

### 1. Sinkronisasi Figur Editor
- Struktur data figur di `AdminDashboard.tsx` sudah disesuaikan ke kontrak Apps Script v3.0.
- Field yang dipakai sekarang:
  - `idBaris`
  - `nama`
  - `judul`
  - `kategori`
  - `slug`
  - `narasi`
  - `image`
  - `idRelasiKlien`
- State editor figur sudah dinormalisasi agar `slug`, `narasi`, dan `image` tidak tertukar dengan field lama.
- Submit figur sekarang mengirim payload POST dengan nama field yang eksplisit dan konsisten.

### 2. Endpoint API Baru
- URL Apps Script tidak di-hardcode di source. Isi melalui `VITE_GAS_ENDPOINT` untuk form publik dan `GAS_ENDPOINT` untuk proxy admin server-side.

### 3. Sinkronisasi Form Publik
- `FormCalonFigur.tsx` sekarang mengirim:
  - `action=register`
  - `formType=register`
- Body submit dikirim sebagai `application/x-www-form-urlencoded` agar lebih stabil dibaca Apps Script.
- Backend Apps Script menerima `formType` sebagai alias `action`, sehingga submit lama dan baru sama-sama diproses.

### 4. Verifikasi
- Build frontend sudah lolos setelah perubahan.
- Dev server aktif di `http://localhost:8080`.

## Struktur Database

### 1. Spreadsheet Klien
**ID:** `1dGrwqokk3jXgpZChfvRQhA8Ht75L_XdqWOdxNN2w92Q`

**Pemetaan Kolom Utama:**
- `AD` (Kolom 30): Jadwal Visit

## Google Apps Script

### Fitur Utama
1. Sync Jadwal Visit dari Kolom AD (30) ke dokumen Master.
2. Placeholder `[jadwal_visit]` untuk menampilkan tanggal visit klien.
3. Format tanggal otomatis `dd mm yyyy`.
4. Parser POST mendukung body panjang dengan `URLSearchParams` atau encoded form body.
5. `formType` dan `action` kini sama-sama diterima sebagai penanda aksi.

## Admin Dashboard

**URL:** `/admin`
**Deep Link:** `/admin/klien/[slug-nama]`

### Catatan Update
1. Admin login sekarang diproses server-side melalui `/api/admin-login`.
2. Session admin disimpan di cookie `HttpOnly`; frontend tidak lagi menyimpan bukti login di `localStorage`.
3. Operasi dashboard admin harus lewat `/api/admin-gas-proxy`, bukan langsung dari browser ke Apps Script.
4. Figur editor memakai mapping objek baru dari Apps Script v3.0.
5. Deep link klien tetap aktif untuk membuka data klien tertentu langsung dari route.

## Form Publik

### Alur Submit
1. User mengisi form calon figur.
2. Frontend mengirim `action=register` dan `formType=register`.
3. Apps Script membaca payload dan menulis data ke sheet klien.
4. Notifikasi admin tetap berjalan melalui endpoint lokal `/api/notify-admin`.

## Cara Deploy

1. Salin kode dari file `apps_script_sheet.js`.
2. Buka Google Apps Script Editor.
3. Klik `Deploy` > `Manage Deployments`.
4. Pilih `Version: New Version`, lalu klik `Deploy`.
5. Set Script Property `GAS_SHARED_SECRET` di Apps Script agar sama dengan environment `GAS_SHARED_SECRET` di Vercel.
6. Pastikan URL Script sama dengan variabel `GAS_ENDPOINT` untuk admin proxy dan `VITE_GAS_ENDPOINT` untuk form publik.

## Environment Variables

Salin `.env.example` menjadi `.env.local` untuk development lokal. Jangan commit `.env` atau `.env.local` karena dapat berisi secret.

### Frontend

Variabel Vite harus memakai prefix `VITE_` karena nilainya akan ikut masuk ke bundle browser.

- `VITE_GAS_ENDPOINT`: URL deployment Google Apps Script untuk form publik `register`.
- `VITE_SHEET_CSV_URL`: URL published CSV Google Sheets untuk arsip figur.

### Serverless API

Variabel ini dipakai oleh function di folder `api/` dan tidak perlu prefix `VITE_`, kecuali memang perlu dibaca browser.

- `SITE_BASE_URL`: domain publik, dipakai oleh OG proxy untuk metadata share artikel. Default aman: `https://mekarhub.id`.
- `ADMIN_PASSWORD`: password admin untuk login server-side. Jangan gunakan prefix `VITE_`.
- `ADMIN_SESSION_SECRET`: secret acak panjang untuk signed admin session cookie. Jangan gunakan prefix `VITE_`.
- `GAS_ENDPOINT`: URL deployment Google Apps Script untuk proxy admin server-side. Jangan gunakan prefix `VITE_`.
- `GAS_SHARED_SECRET`: shared secret antara serverless proxy dan Apps Script. Nilainya harus sama dengan Script Property `GAS_SHARED_SECRET` di Apps Script.
- `RESEND_API_KEY`: API key Resend untuk `/api/notify-admin`. Wajib di Vercel agar email terkirim.
- `ADMIN_NOTIFICATION_EMAIL`: email tujuan notifikasi form. Default: `mekarhub@gmail.com`.
- `RESEND_FROM_EMAIL`: sender email Resend. Default: `Mekarhub <onboarding@resend.dev>`.

### Setup Lokal

1. Jalankan `npm install` jika dependency belum terpasang.
2. Salin `.env.example` ke `.env.local`.
3. Isi `RESEND_API_KEY` jika ingin mengetes email notification.
4. Jalankan `npm.cmd run dev` di Windows jika PowerShell memblokir `npm.ps1`; selain itu `npm run dev` tetap valid.

### Setup Vercel

1. Buka Vercel Project Settings > Environment Variables.
2. Tambahkan `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `GAS_ENDPOINT`, `GAS_SHARED_SECRET`, `VITE_GAS_ENDPOINT`, `VITE_SHEET_CSV_URL`, `SITE_BASE_URL`, `RESEND_API_KEY`, `ADMIN_NOTIFICATION_EMAIL`, dan `RESEND_FROM_EMAIL`.
3. Terapkan ke environment Production dan Preview sesuai kebutuhan.
4. Redeploy setelah mengubah environment variable.

## Production Deploy Checklist

### Vercel Environment

Pastikan environment berikut tersedia di Vercel sebelum deploy. Jangan gunakan prefix `VITE_` untuk secret atau konfigurasi server-side.

- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `GAS_ENDPOINT`
- `GAS_SHARED_SECRET`
- `SITE_BASE_URL`
- `RESEND_API_KEY`
- `ADMIN_NOTIFICATION_EMAIL`
- `RESEND_FROM_EMAIL`

Environment publik yang memang masuk browser:

- `VITE_GAS_ENDPOINT`: hanya untuk submit form publik `register`.
- `VITE_SHEET_CSV_URL`: hanya untuk arsip publik.

### Google Apps Script

1. Buka Apps Script project Mekarhub.
2. Buka `Project Settings` > `Script Properties`.
3. Tambahkan atau perbarui `GAS_SHARED_SECRET`.
4. Nilai `GAS_SHARED_SECRET` harus sama persis dengan environment `GAS_SHARED_SECRET` di Vercel.
5. Jangan menulis secret di source code atau log.

### Redeploy Apps Script

1. Salin isi terbaru `apps_script_sheet.js` ke editor Apps Script.
2. Klik `Deploy`.
3. Klik `Manage deployments`.
4. Pilih deployment aktif, lalu klik edit.
5. Pilih `Version: New version`.
6. Klik `Deploy`.
7. Pastikan URL deployment sama dengan `GAS_ENDPOINT` dan `VITE_GAS_ENDPOINT` yang digunakan.

### Redeploy Vercel

1. Pastikan semua environment di Production sudah terisi.
2. Trigger redeploy dari Vercel dashboard atau push commit baru.
3. Setelah deploy selesai, jalankan smoke test production di bawah.

## Post-Deploy Smoke Test

### A. Admin Security Test

- Buka `/admin`.
- Pastikan dashboard tidak bisa diakses tanpa login.
- Login dengan password salah harus ditolak.
- Login dengan password benar harus masuk dashboard.
- Logout harus menghapus session.
- Refresh `/admin` setelah logout harus terkunci lagi.

### B. GAS Protection Test

- Coba panggil action admin tanpa session.
- Expected: unauthorized.
- Pastikan update, delete, dan generate docs tidak bisa jalan tanpa auth.

### C. Public Form Test

- Submit form calon figur/lead.
- Data harus masuk Google Sheets.
- Email notifikasi harus terkirim.
- Field optional kosong tidak boleh menyebabkan error.

### D. Admin Dashboard Test

- Load data klien.
- Update status produksi.
- Update jadwal visit.
- Update status pelunasan.
- Generate Brief.
- Generate MoU.
- Pastikan semua berjalan setelah auth baru.

### E. Production Route Test

- Buka `/test-notification`.
- Di production route ini harus 404, tidak tersedia, atau tidak aktif.
