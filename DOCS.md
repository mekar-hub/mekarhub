# Mekarhub - Project Documentation & Visual Updates

Dokumen ini merangkum perubahan visual, interaksi, dan fitur SEO terbaru yang telah diterapkan pada website Mekarhub.

## 🚀 Fitur & Pembaruan Visual

### 1. Sticky Navbar & Dynamic Logo
- **Transisi Navbar**: Navbar berubah dari transparan menjadi putih solid dengan efek blur dan bayangan halus saat user melakukan scroll.
- **Logo Dinamis**: 
  - **Logo Putih**: Otomatis muncul di Homepage saat di posisi teratas (navbar transparan).
  - **Logo Merah (Original)**: Muncul saat scroll atau saat berada di halaman artikel.
- **Cross-Fade Transition**: Perpindahan antar logo sangat halus tanpa lonjakan tata letak (*layout shift*).
- **Slim Profile**: Navbar tetap ramping dengan tinggi `h-12`, namun mendukung logo masif (hingga `h-36`) untuk identitas visual yang kuat.

### 2. Tipografi & Keterbacaan Artikel
- **Rata Kanan-Kiri (Justified)**: Seluruh isi paragraf artikel diatur menggunakan `text-justify` dan `hyphens-auto` agar tetap rapi tanpa spasi yang berantakan.
- **Tipografi Premium**: Ukuran font ditingkatkan ke `text-lg` (minimal 18px) dengan warna abu-abu gelap (`text-foreground/80`) yang nyaman di mata.
- **Custom Blockquote**: Kutipan figur memiliki gaya khusus dengan garis tepi primer, latar belakang tipis, dan font miring (*italic*).

### 3. Interaksi & Efek Visual
- **Hero Parallax**: Gambar latar belakang Hero Section bergerak lebih lambat dibanding konten depan saat di-scroll.
- **Entrance Animations**: Elemen utama (teks hero, card kisah, filosofi) muncul secara halus (*fade-in up*) saat masuk ke dalam viewport menggunakan custom hook `useScrollReveal`.
- **Responsive Symmetry**: Penyesuaian padding mobile dan desktop untuk memastikan tampilan elegan di semua perangkat.

### 4. SEO & Social Media Preview (Open Graph)
- **Dynamic Meta Tags**: Menggunakan `react-helmet-async` untuk memperbarui judul, deskripsi, dan gambar preview secara otomatis berdasarkan data figur.
- **Social Sharing**: Mendukung tampilan preview yang menarik di WhatsApp, Twitter (X), dan Facebook.
- **Fallback Image**: Jika figur tidak memiliki foto, sistem akan otomatis menggunakan logo Mekarhub sebagai thumbnail preview.

### 5. Notification & Robust Data
- **Email Notifications**: Notifikasi otomatis setiap ada pengajuan baru melalui Resend API.
- **Direct Image Resolution**: Konversi otomatis link Google Drive & ImgBB menjadi link gambar langsung.
- **Testing Page**: Halaman khusus di `/test-notification` untuk uji coba sistem.

## 🛠️ Tech Stack & Konfigurasi Utama
- **Styling**: Tailwind CSS + `@tailwindcss/typography` & `shadcn-ui`.
- **Data Parsing**: `PapaParse` untuk Google Sheets CSV Integration.
- **Notification**: Resend API & Vercel Serverless Functions.
- **IDE Support**: `.vscode/settings.json` untuk optimasi Tailwind linting.

## 📄 File Kunci Terkait Perubahan
- `src/pages/FormCalonFigur.tsx`: Formulir kolaborasi & Sinkronisasi Notifikasi.
- `api/notify-admin.js`: Serverless handler untuk notifikasi email.
- `src/data/figures.ts`: Logika resolusi gambar & sync CSV.
- `src/pages/TestNotification.tsx`: Halaman pengujian manual.

---
*Terakhir diperbarui: 13 Maret 2026 (v1.2)*
