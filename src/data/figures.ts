import Papa from "papaparse";

// URL CSV dari Google Sheets (Ganti dengan URL Publish to Web Anda)
// Contoh format: "https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=0&single=true&output=csv"
export const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRGUQncFJ_ZU-dyfIeIuE1UZUbeLD_xozDKMLdFHjHE78lMsCPuUk20t7VoUhPIb5PzCiHXy0aFsAvo/pub?output=csv";

export interface Figure {
  id: number;
  name: string;
  title: string;
  category: "Entrepreneur" | "Social Leader" | "Educator" | string;
  socialLink: string;
  featured: boolean;
  slug: string;
  story: string;
  publishedDate: string;
  imageUrl?: string;
}

// Helper: sync conversion for Google Drive links
const convertDriveLink = (url: string): string => {
  const driveIdMatch = url.match(/(?:\/file\/d\/|id=)([^\/\?\&]+)/);
  if (url.includes("drive.google.com") && driveIdMatch) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}=s1000`;
  }
  return url.trim();
};

// Helper: async resolver for ImgBB viewer links (e.g. https://ibb.co.com/XXXX)
// It fetches the page via a CORS proxy and extracts the og:image direct link
const resolveImgBBLink = async (url: string): Promise<string> => {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    const data = await res.json();
    const html: string = data.contents || "";
    // Extract og:image from the HTML
    const match = html.match(/property="og:image"\s+content="([^"]+)"/);
    if (match && match[1]) {
      return match[1];
    }
    // Fallback: try image src from viewer container
    const imgMatch = html.match(/id="image-viewer-container"[^>]*>.*?<img src="([^"]+)"/s);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  } catch (e) {
    console.warn("Gagal resolve ImgBB link:", url, e);
  }
  return url.trim(); // Return as-is if resolution fails
};

// Async helper: converts any share/viewer URL to a direct image URL
export const resolveImageUrl = async (url: string = ""): Promise<string> => {
  if (!url || typeof url !== 'string' || url.trim() === "") return "";
  const trimmed = url.trim();
  
  // Handle protocol-relative URLs
  const fullUrl = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;

  // Google Drive – sync conversion
  if (fullUrl.includes("drive.google.com")) {
    return convertDriveLink(fullUrl);
  }

  // ImgBB viewer link – needs async resolution
  if (fullUrl.includes("ibb.co") && !fullUrl.includes("i.ibb.co")) {
    return resolveImgBBLink(fullUrl);
  }

  // Already a direct image link or other URL – use as-is
  return fullUrl;
};

// Function to fetch and parse from Google Sheets CSV
export const fetchFiguresFromSheet = async (csvUrl: string): Promise<Figure[]> => {
  const dynamicUrl = csvUrl.includes("?") ? `${csvUrl}&t=${Date.now()}` : `${csvUrl}?t=${Date.now()}`;
  
  return new Promise((resolve, reject) => {
    Papa.parse<any>(dynamicUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        try {
          const rawFigures: Figure[] = results.data.map((row: any) => ({
            id: Number(row.id),
            name: row.name || "",
            title: row.title || "",
            category: row.category || "Entrepreneur",
            socialLink: row.socialLink || "",
            featured: String(row.featured).toLowerCase() === "true",
            slug: row.slug || "",
            story: row.story || "",
            publishedDate: row.publishedDate || "",
            imageUrl: row.imageUrl || "",
          }));

          console.log("Data teks berhasil diambil dari Google Sheets:", rawFigures);
          resolve(rawFigures);
        } catch (error) {
          reject(error);
        }
      },
      error: (error: any) => {
        reject(error);
      },
    });
  });
};

export const defaultFigures: Figure[] = [
  // --- DEFAULT DATA (Fallback) ---
  // Featured 6
  { id: 1, name: "Didiet Rasmana", title: "Owner Toko Buku Singosari", category: "Entrepreneur", socialLink: "https://instagram.com", featured: true, slug: "didiet-rasmana", story: "Didiet Rasmana membangun Toko Buku Singosari dari nol, menjadikannya ruang literasi yang hidup di tengah komunitas. Dengan dedikasi tinggi, ia membuktikan bahwa bisnis buku masih relevan di era digital. Toko ini bukan sekadar tempat jual beli, melainkan pusat diskusi dan pertukaran ide bagi warga sekitar.", publishedDate: "2025-01-15" },
  { id: 2, name: "Yanti Dhaniaty", title: "Owner Sambel Shamila", category: "Entrepreneur", socialLink: "https://instagram.com", featured: true, slug: "yanti-dhaniaty", story: "Yanti Dhaniaty mengubah resep sambal warisan keluarga menjadi brand Sambel Shamila yang dikenal luas. Perjalanannya dimulai dari dapur rumah, kini produknya menjangkau berbagai kota. Ia membuktikan bahwa ketekunan dan cinta terhadap kuliner lokal bisa menjadi fondasi bisnis yang berkelanjutan.", publishedDate: "2025-02-10" },
  { id: 3, name: "Firman", title: "Pengelola Warung Gratis Azzahra", category: "Social Leader", socialLink: "https://instagram.com", featured: true, slug: "firman", story: "Firman mendirikan Warung Gratis Azzahra sebagai wujud kepeduliannya terhadap sesama. Setiap hari, warung ini menyajikan makanan gratis bagi siapa saja yang membutuhkan. Gerakan ini menginspirasi banyak orang untuk turut berbagi dan membangun solidaritas sosial di lingkungan sekitar.", publishedDate: "2025-03-05" },
  { id: 4, name: "Eko", title: "Walking Enthusiast", category: "Social Leader", socialLink: "https://instagram.com", featured: true, slug: "eko", story: "Eko mengajak masyarakat untuk kembali menghargai aktivitas berjalan kaki sebagai gaya hidup sehat dan ramah lingkungan. Melalui komunitas jalan kakinya, ia membangun koneksi antarwarga sambil mempromosikan kesehatan fisik dan mental. Langkah kecilnya membawa dampak besar bagi komunitasnya.", publishedDate: "2025-03-20" },
  { id: 5, name: "Pak Bekti", title: "Empu Pisau Batu", category: "Entrepreneur", socialLink: "https://instagram.com", featured: true, slug: "pak-bekti", story: "Pak Bekti adalah maestro pembuat pisau batu yang melestarikan tradisi kerajinan nenek moyang. Setiap pisau yang dibuatnya adalah karya seni yang menggabungkan teknik kuno dengan kebutuhan modern. Dedikasinya menjaga warisan budaya ini menjadikannya sosok yang dihormati di kalangan pengrajin tradisional.", publishedDate: "2025-04-01" },
  { id: 6, name: "Jahfal & Kalis", title: "Owner Cungkup Batik and Craft", category: "Entrepreneur", socialLink: "https://instagram.com", featured: true, slug: "jahfal-kalis", story: "Jahfal dan Kalis bersama-sama membangun Cungkup Batik and Craft, sebuah usaha yang mengangkat batik lokal ke panggung yang lebih luas. Mereka menggabungkan motif tradisional dengan desain kontemporer, menciptakan produk yang diminati generasi muda tanpa kehilangan esensi budayanya.", publishedDate: "2025-04-15" },
  // Remaining 14
  { id: 7, name: "Itus Ariyadi", title: "Community Builder", category: "Social Leader", socialLink: "https://instagram.com", featured: false, slug: "itus-ariyadi", story: "Itus Ariyadi dikenal sebagai pembangun komunitas yang aktif menghubungkan berbagai elemen masyarakat. Melalui berbagai program sosial, ia menciptakan ruang kolaborasi yang inklusif dan berdampak nyata bagi lingkungan sekitarnya.", publishedDate: "2025-05-01" },
  { id: 8, name: "Rian", title: "Creative Educator", category: "Educator", socialLink: "https://instagram.com", featured: false, slug: "rian", story: "Rian membawa pendekatan kreatif dalam dunia pendidikan, menjadikan proses belajar lebih menarik dan bermakna bagi para muridnya.", publishedDate: "2025-05-10" },
  { id: 9, name: "Kenny", title: "Youth Mentor", category: "Educator", socialLink: "https://instagram.com", featured: false, slug: "kenny", story: "Kenny mendedikasikan waktunya untuk membimbing generasi muda, membantu mereka menemukan potensi terbaik dan arah hidup yang bermakna.", publishedDate: "2025-05-15" },
  { id: 10, name: "Sari Wulandari", title: "Social Activist", category: "Social Leader", socialLink: "https://instagram.com", featured: false, slug: "sari-wulandari", story: "Sari Wulandari adalah aktivis sosial yang gigih memperjuangkan keadilan dan kesejahteraan masyarakat marjinal.", publishedDate: "2025-05-20" },
  { id: 11, name: "Bambang Susilo", title: "Local Artisan", category: "Entrepreneur", socialLink: "https://instagram.com", featured: false, slug: "bambang-susilo", story: "Bambang Susilo mengangkat kerajinan lokal menjadi produk bernilai tinggi yang diapresiasi pasar nasional.", publishedDate: "2025-06-01" },
  { id: 12, name: "Dewi Lestari", title: "Cultural Preservationist", category: "Educator", socialLink: "https://instagram.com", featured: false, slug: "dewi-lestari", story: "Dewi Lestari berkomitmen melestarikan budaya lokal melalui pendidikan dan dokumentasi tradisi yang hampir punah.", publishedDate: "2025-06-10" },
  { id: 13, name: "Andi Pratama", title: "Tech Innovator", category: "Entrepreneur", socialLink: "https://instagram.com", featured: false, slug: "andi-pratama", story: "Andi Pratama memanfaatkan teknologi untuk menciptakan solusi inovatif bagi permasalahan di komunitasnya.", publishedDate: "2025-06-15" },
  { id: 14, name: "Nadia Putri", title: "Women Empowerment Advocate", category: "Social Leader", socialLink: "https://instagram.com", featured: false, slug: "nadia-putri", story: "Nadia Putri aktif memperjuangkan pemberdayaan perempuan melalui pelatihan keterampilan dan pendampingan usaha.", publishedDate: "2025-06-20" },
  { id: 15, name: "Hendra Wijaya", title: "Environmental Champion", category: "Social Leader", socialLink: "https://instagram.com", featured: false, slug: "hendra-wijaya", story: "Hendra Wijaya memimpin gerakan lingkungan yang mengajak masyarakat untuk hidup lebih berkelanjutan.", publishedDate: "2025-07-01" },
  { id: 16, name: "Lina Marlina", title: "Traditional Craft Teacher", category: "Educator", socialLink: "https://instagram.com", featured: false, slug: "lina-marlina", story: "Lina Marlina mengajarkan kerajinan tradisional kepada generasi muda agar warisan budaya tetap lestari.", publishedDate: "2025-07-10" },
  { id: 17, name: "Agus Setiawan", title: "Rural Entrepreneur", category: "Entrepreneur", socialLink: "https://instagram.com", featured: false, slug: "agus-setiawan", story: "Agus Setiawan membuktikan bahwa pedesaan bisa menjadi pusat inovasi bisnis yang kompetitif.", publishedDate: "2025-07-15" },
  { id: 18, name: "Ratna Sari", title: "Literacy Advocate", category: "Educator", socialLink: "https://instagram.com", featured: false, slug: "ratna-sari", story: "Ratna Sari mendorong budaya literasi di kalangan anak-anak melalui perpustakaan keliling dan program baca.", publishedDate: "2025-07-20" },
  { id: 19, name: "Fajar Nugroho", title: "Community Health Worker", category: "Social Leader", socialLink: "https://instagram.com", featured: false, slug: "fajar-nugroho", story: "Fajar Nugroho bekerja tanpa lelah untuk meningkatkan akses kesehatan bagi masyarakat di daerah terpencil.", publishedDate: "2025-08-01" },
  { id: 20, name: "Maya Indah", title: "Heritage Storyteller", category: "Educator", socialLink: "https://instagram.com", featured: false, slug: "maya-indah", story: "Maya Indah melestarikan cerita rakyat dan warisan budaya melalui narasi yang menarik dan edukatif.", publishedDate: "2025-08-10" },
];
