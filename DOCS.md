# 📖 Dokumentasi Mekarhub

> Website profil figur komunitas berbasis React + Vite + TypeScript, dengan data dinamis dari Google Sheets.

---

## 🚀 Tech Stack

| Teknologi | Detail |
|---|---|
| **Framework** | React 18 + Vite |
| **Bahasa** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Routing** | React Router DOM |
| **Data Source** | Google Sheets (CSV) + PapaParse |
| **Deploy** | Vercel (`mekarhub.my.id`) |

---

## 📁 Struktur Folder Utama

```
src/
├── components/
│   ├── ArchiveSection.tsx   # Grid semua figur + filter kategori
│   ├── Navbar.tsx
│   └── Footer.tsx
├── pages/
│   ├── FigureArticle.tsx    # Halaman detail /kisah/[slug]
│   └── FormCalonFigur.tsx   # Form kirim kisah (/kolaborasi-kisah)
└── data/
    └── figures.ts           # Data figur + fetch Google Sheets
```

---

## 🗄️ Manajemen Data — Google Sheets

### Koneksi ke Google Sheets

Data figur diambil secara realtime dari Google Sheets yang dipublish sebagai CSV. URL-nya diatur di:

```typescript
// src/data/figures.ts
export const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/PACX-.../pub?output=csv";
```

### Struktur Kolom Sheet

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | Number | ID unik figur |
| `name` | String | Nama lengkap |
| `title` | String | Jabatan / profesi |
| `category` | String | `Entrepreneur` / `Social Leader` / `Educator` |
| `socialLink` | String | Link Instagram/sosial media |
| `featured` | Boolean | `TRUE` / `FALSE` — tampil di halaman utama |
| `slug` | String | URL slug (huruf kecil, pakai `-`) |
| `story` | String | Cerita singkat figur |
| `publishedDate` | String | Format `YYYY-MM-DD` (contoh: `2025-01-15`) |
| `imageUrl` | String | Link foto (lihat panduan di bawah) |

---

## 🖼️ Cara Menambahkan Foto Figur

Sistem secara **otomatis** mengkonversi berbagai format link gambar. Cukup tempel link-nya di kolom `imageUrl`.

### Format Link yang Didukung

#### ✅ 1. Google Drive (Link Share Biasa)
Klik kanan foto di Drive → **Share** → pastikan **"Anyone with the link"** → Copy link.

```
https://drive.google.com/file/d/1ABC.../view?usp=sharing
```

> ⚠️ Pastikan akses file di Drive diset ke **"Anyone with the link"**!

#### ✅ 2. ImgBB (Link Viewer)
Upload foto ke [imgbb.com](https://imgbb.com/) → Copy link halaman biasa.

```
https://ibb.co.com/F4XVMk7s
```

Sistem akan otomatis mengambil link foto `.png`-nya.

#### ✅ 3. Link Langsung (.png / .jpg)
Jika sudah punya link langsung ke file gambar, langsung tempel saja.

```
https://i.ibb.co.com/LX0f8LnT/foto.png
```

---

## 📝 Form Kolaborasi Kisah

Halaman `/kolaborasi-kisah` berisi form untuk mengusulkan kisah figur baru. Data dikirim ke **Google Apps Script** dan disimpan ke Google Sheets terpisah.

- **URL Apps Script**: diatur di `FormCalonFigur.tsx`
- **Field**: Nama, Profesi, Nomor WA, Kategori, Kisah Singkat
- **Fitur**: Pop-up sukses setelah form berhasil dikirim (menggunakan `AlertDialog` dari shadcn/ui)

---

## 🌐 Deploy ke Vercel

```bash
# Preview
npx vercel

# Production
npx vercel --prod
```

Domain production: `mekarhub.my.id`

---

## 🛠️ Menjalankan Lokal

```bash
# Install dependencies
npm install

# Jalankan development server (http://localhost:8080)
npm run dev
```

> ⚠️ Jika ada error `running scripts is disabled`, jalankan dulu di PowerShell:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
> ```

---

## 🔧 Menambah Figur Baru

1. Buka Google Sheets database.
2. Tambah baris baru di bawah.
3. Isi semua kolom sesuai struktur di atas.
4. Upload foto ke ImgBB / Drive, lalu tempel link-nya di kolom `imageUrl`.
5. Website otomatis update (tanpa perlu deploy ulang).

---

## 📋 Catatan Penting

- Kolom `slug` harus **unik** dan **huruf kecil semua**, spasi diganti `-`. Contoh: `pak-bekti`.
- Kolom `featured: TRUE` berarti figur tampil langsung di halaman archiveutama. `FALSE` berarti tersembunyi hingga tombol "Lihat Seluruh Kisah" diklik.
- Kolom `publishedDate` harus format **ISO** (`YYYY-MM-DD`), misalnya `2025-03-05`.
