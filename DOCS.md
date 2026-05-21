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
- URL Apps Script frontend sudah diganti ke:
  - `https://script.google.com/macros/s/AKfycbxWKKBQxnUg3FHtwWw2H56fGp3JyHS3bNlHBj006v3yFvYu4cN5JD_TeIJBf52VMUJI0g/exec`

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
**PIN:** `mekarhub2026`
**Deep Link:** `/admin/klien/[slug-nama]`

### Catatan Update
1. Figur editor memakai mapping objek baru dari Apps Script v3.0.
2. Deep link klien tetap aktif untuk membuka data klien tertentu langsung dari route.
3. `GAS_ENDPOINT` serverless sudah diarahkan ke deployment Apps Script terbaru.

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
5. Pastikan URL Script sama dengan variabel serverless `GAS_ENDPOINT`.

## Environment Variables

Salin `.env.example` menjadi `.env.local` untuk development lokal. Jangan commit `.env` atau `.env.local` karena dapat berisi secret.

### Frontend

Variabel Vite harus memakai prefix `VITE_` karena nilainya akan ikut masuk ke bundle browser.

- `VITE_SHEET_CSV_URL`: URL published CSV Google Sheets untuk arsip figur.

### Serverless API

Variabel ini dipakai oleh function di folder `api/` dan tidak perlu prefix `VITE_`, kecuali memang perlu dibaca browser.

- `SITE_BASE_URL`: domain publik, dipakai oleh OG proxy untuk metadata share artikel. Default aman: `https://mekarhub.id`.
- `RESEND_API_KEY`: API key Resend untuk `/api/notify-admin`. Wajib di Vercel agar email terkirim.
- `ADMIN_NOTIFICATION_EMAIL`: email tujuan notifikasi form. Default: `mekarhub@gmail.com`.
- `RESEND_FROM_EMAIL`: sender email Resend. Default: `Mekarhub <onboarding@resend.dev>`.
- `GAS_ENDPOINT`: URL Google Apps Script yang dipakai serverless proxy.
- `GAS_ADMIN_TOKEN`: token rahasia yang dikirim proxy admin ke Apps Script untuk action admin.
- `ADMIN_PIN`: PIN admin server-side. Gunakan salah satu dari `ADMIN_PIN` atau `ADMIN_PIN_HASH`.
- `ADMIN_PIN_HASH`: SHA-256 hex dari PIN admin. Lebih disarankan daripada menyimpan PIN plaintext.
- `ADMIN_SESSION_SECRET`: secret acak panjang untuk menandatangani cookie session admin.
- `NOTIFY_INTERNAL_TOKEN`: token internal opsional untuk membatasi akses langsung ke `/api/notify-admin`.

### Google Apps Script Properties

Jika `GAS_ADMIN_TOKEN` dipakai di Vercel, tambahkan nilai yang sama di Google Apps Script `Project Settings` > `Script Properties` dengan nama:

- `ADMIN_TOKEN`

### Setup Lokal

1. Jalankan `npm install` jika dependency belum terpasang.
2. Salin `.env.example` ke `.env.local`.
3. Isi `RESEND_API_KEY` jika ingin mengetes email notification.
4. Isi `ADMIN_SESSION_SECRET` dan `ADMIN_PIN` untuk mengetes dashboard admin via serverless API.
5. Jalankan `npm.cmd run dev` di Windows jika PowerShell memblokir `npm.ps1`; selain itu `npm run dev` tetap valid.

### Setup Vercel

1. Buka Vercel Project Settings > Environment Variables.
2. Tambahkan `VITE_SHEET_CSV_URL`, `SITE_BASE_URL`, `RESEND_API_KEY`, `ADMIN_NOTIFICATION_EMAIL`, `RESEND_FROM_EMAIL`, `GAS_ENDPOINT`, `GAS_ADMIN_TOKEN`, `ADMIN_PIN` atau `ADMIN_PIN_HASH`, `ADMIN_SESSION_SECRET`, dan `NOTIFY_INTERNAL_TOKEN`.
3. Terapkan ke environment Production dan Preview sesuai kebutuhan.
4. Redeploy setelah mengubah environment variable.
