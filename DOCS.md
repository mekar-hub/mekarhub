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

### 5. Revamped Collaboration Form (Kisah Mekarhub)
- **Struktur Baru**: Mengubah dari model Q&A (Ya/Tidak) menjadi narasi terstruktur (Identitas Spirit, Titik Balik, Keunikan, Filosofi, Dinamika, Sisi Kemanusiaan, Harapan).
- **Textarea Narrative**: Seluruh input menggunakan Textarea untuk memberikan ruang bercerita bagi pengirim kisah.
- **Success Modal & Auto-Redirect**: 
  - Pesan keberhasilan: "Berhasil Terkirim!".
  - **Logic**: Auto-redirect ke WhatsApp Admin dalam 3 detik setelah pengiriman berhasil.
- **Improved Field Mapping**: Sinkronisasi penuh antara Frontend, Serverless Function, dan Google Sheets (Kolom A-N).

### 7. Internal Admin Dashboard (Production & Finance)
- **PIN-Protected Access**: Sistem keamanan berbasis PIN (`mekarhub2026`) untuk membatasi akses tim internal.
- **Client Selection Logic**: 
  - Admin dapat memilih klien yang sudah mendaftar melalui pencarian dinamis (fetch dari Google Apps Script).
  - Data produksi akan diperbarui pada baris yang sama di Spreadsheet (`idBaris`).
- **Production & Creative Management**: Input khusus untuk nama tim produksi (Lead, Videografer, Editor) dan detail konsep kreatif (Ide Besar, Visual Tone, Hook).
- **Financial Auto-Calculation**: 
  - Input "Total Nilai Kontrak" otomatis memicu kalkulasi real-time.
  - Menampilkan ringkasan **DP Kontrak (50%)** dan **Pelunasan (50%)** secara visual.
- **Smart Auto-Fill**: Sistem otomatis mengisi detail rekening tujuan jika data `savedRekening` tersedia di profil klien.

## 🛠️ Tech Stack & Konfigurasi Utama
- **Styling**: Tailwind CSS + `@tailwindcss/typography` & `shadcn-ui`.
- **Data Parsing**: `PapaParse` untuk Google Sheets CSV Integration.
- **Notification**: Resend API & Vercel Serverless Functions.
- **Backend Sync**: Google Apps Script (GAS) Web App (POST/GET).

## 📄 File Kunci Terkait Perubahan
- `src/pages/AdminDashboard.tsx`: Dashboard manajemen produksi & keuangan tim internal.
- `src/pages/FormCalonFigur.tsx`: Formulir kolaborasi & Logika Success Modal.
- `api/notify-admin.js`: Serverless handler untuk notifikasi email.
- `apps_script_sheet.js`: Script backend untuk Google Sheets (Kolom A-N).
- `src/data/figures.ts`: Logika resolusi gambar & sync CSV.
- `src/App.tsx`: Konfigurasi routing utama.

---
*Terakhir diperbarui: 21 April 2026 (v1.6)*
