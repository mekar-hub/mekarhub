import Papa from "papaparse";

// URL CSV dari Google Sheets. Set lewat VITE_SHEET_CSV_URL agar tidak hardcode deployment URL.
export const SHEET_CSV_URL = import.meta.env.VITE_SHEET_CSV_URL || "";

export interface Figure {
  id: number;
  name: string;
  title: string;
  category: "Entrepreneur" | "Social Leader" | "Educator" | string;
  socialLink: string;
  featured: boolean;
  slug: string;
  story: string; // Keep for backward compatibility
  excerpt?: string;
  content?: string;
  publishedDate: string;
  imageUrl?: string;
  // New structured fields
  identitasSpirit?: string;
  titikBalik?: string;
  keunikanAutentik?: string;
  filosofiPelayanan?: string;
  dinamikaTerkini?: string;
  sisiKemanusiaan?: string;
  harapan?: string;
}

type FigureCsvRow = Record<string, string | undefined>;
type FigureInput = Omit<Partial<Figure>, "featured" | "id"> & {
  featured?: unknown;
  id?: unknown;
  image?: unknown;
};

const debugCsvError = (message: string, error: unknown) => {
  if (import.meta.env.DEV && import.meta.env.MODE !== "test") {
    console.error(message, error);
  }
};

const debugCsvInfo = (message: string, data: unknown) => {
  if (import.meta.env.DEV && import.meta.env.MODE !== "test") {
    console.info(message, data);
  }
};

const debugCsvWarning = (message: string, data: unknown) => {
  if (import.meta.env.DEV && import.meta.env.MODE !== "test") {
    console.warn(message, data);
  }
};

export const safeText = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
};

export const createSlug = (value: unknown): string =>
  safeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const safeNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const safeBoolean = (value: unknown): boolean => {
  const normalized = safeText(value).toLowerCase();
  return ["true", "1", "yes", "y"].includes(normalized);
};

const normalizeHeader = (value: string): string =>
  safeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");

const getAliasedValue = (row: FigureCsvRow, aliases: string[]): string => {
  const lookup = new Map<string, string>();

  Object.entries(row).forEach(([key, value]) => {
    const normalizedKey = normalizeHeader(key);
    if (normalizedKey && !lookup.has(normalizedKey)) {
      lookup.set(normalizedKey, safeText(value));
    }
  });

  for (const alias of aliases) {
    const value = lookup.get(normalizeHeader(alias));
    if (value) return value;
  }

  return "";
};

const joinNonEmpty = (values: string[]): string => values.map((value) => safeText(value)).filter(Boolean).join(" - ");
const hasCsvRowContent = (row: FigureCsvRow): boolean => Object.values(row).some((value) => !!safeText(value));

export const normalizeFigure = (figure: FigureInput, index = 0): Figure => {
  const name = safeText(figure.name, "Kisah Mekarhub");
  const title = safeText(figure.title);
  const story = safeText(figure.story || figure.content || figure.excerpt, "Kisah ini sedang disiapkan oleh tim Mekarhub.");
  const excerpt = safeText(figure.excerpt, story.slice(0, 160));
  const slug = createSlug(figure.slug) || createSlug(name) || `kisah-${index + 1}`;

  return {
    id: safeNumber(figure.id, index + 1),
    name,
    title,
    category: safeText(figure.category, "Entrepreneur"),
    socialLink: safeText(figure.socialLink),
    featured: typeof figure.featured === "boolean" ? figure.featured : safeBoolean(figure.featured),
    slug,
    story,
    excerpt,
    content: safeText(figure.content, story),
    publishedDate: safeText(figure.publishedDate),
    imageUrl: safeText(figure.imageUrl || figure.image),
    identitasSpirit: safeText(figure.identitasSpirit),
    titikBalik: safeText(figure.titikBalik),
    keunikanAutentik: safeText(figure.keunikanAutentik),
    filosofiPelayanan: safeText(figure.filosofiPelayanan),
    dinamikaTerkini: safeText(figure.dinamikaTerkini),
    sisiKemanusiaan: safeText(figure.sisiKemanusiaan),
    harapan: safeText(figure.harapan),
  };
};

export const mapFigureRow = (row: FigureCsvRow, index: number): Figure => {
  const rowValues = Object.values(row).map((value) => safeText(value)).filter(Boolean);
  const rowHasContent = rowValues.length > 0;
  const role = getAliasedValue(row, ["jabatan", "role", "posisi"]);
  const business = getAliasedValue(row, ["usaha", "brand", "bisnis"]);
  const mappedTitle = getAliasedValue(row, ["judul", "title"]) || joinNonEmpty([role, business]);
  const mappedStory = getAliasedValue(row, ["narasi", "content", "cerita", "story"]);
  const mappedImage = getAliasedValue(row, ["image_url", "imageUrl", "image", "foto", "gambar", "Image URL"]);

  const mappedInput: FigureInput = {
    id: getAliasedValue(row, ["id", "ID", "no", "nomor"]),
    name: getAliasedValue(row, ["nama", "name"]) || (rowHasContent ? rowValues[0] : ""),
    title: mappedTitle,
    category: getAliasedValue(row, ["kategori", "category"]),
    socialLink: getAliasedValue(row, ["socialLink", "social_link", "mediaSosial", "media sosial", "instagram", "link"]),
    featured: getAliasedValue(row, ["featured", "unggulan", "highlight"]),
    slug: getAliasedValue(row, ["slug"]),
    story: mappedStory,
    content: mappedStory,
    excerpt: getAliasedValue(row, ["excerpt", "ringkasan", "kutipan"]),
    publishedDate: getAliasedValue(row, ["publishedDate", "published_date", "tanggal", "tanggal terbit", "date"]),
    imageUrl: mappedImage,
    image: mappedImage,
    identitasSpirit: getAliasedValue(row, ["identitasSpirit", "identitas spirit"]),
    titikBalik: getAliasedValue(row, ["titikBalik", "titik balik"]),
    keunikanAutentik: getAliasedValue(row, ["keunikanAutentik", "keunikan autentik"]),
    filosofiPelayanan: getAliasedValue(row, ["filosofiPelayanan", "filosofi pelayanan"]),
    dinamikaTerkini: getAliasedValue(row, ["dinamikaTerkini", "dinamika terkini"]),
    sisiKemanusiaan: getAliasedValue(row, ["sisiKemanusiaan", "sisi kemanusiaan"]),
    harapan: getAliasedValue(row, ["harapan"]),
  };

  if (rowHasContent) {
    const missingFields = [
      mappedInput.name ? "" : "name",
      mappedInput.story ? "" : "story",
      mappedInput.imageUrl ? "" : "imageUrl",
    ].filter(Boolean);

    if (missingFields.length > 0) {
      debugCsvWarning("Kolom CSV figur belum lengkap terpetakan:", {
        row: index + 1,
        missingFields,
        detectedColumns: Object.keys(row),
      });
    }
  }

  return normalizeFigure(mappedInput, index);
};

// Helper: sync conversion for Google Drive links
export const convertDriveLink = (url: string): string => {
  if (!url) return "";
  const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]{25,50})/) || url.match(/id=([a-zA-Z0-9_-]{25,50})/);
  if ((url.includes("drive.google.com") || url.includes("docs.google.com")) && idMatch) {
    const id = idMatch[1];
    // Format lh3/d/ID=s1200 adalah yang paling tajam dan stabil terhadap pemblokiran refresh browser
    return `https://lh3.googleusercontent.com/d/${id}=s1200`;
  }
  return url.trim();
};

// Helper: async resolver for ImgBB viewer links
const resolveImgBBLink = async (url: string): Promise<string> => {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    const data = await res.json();
    const html: string = data.contents || "";
    const match = html.match(/property="og:image"\s+content="([^"]+)"/);
    if (match && match[1]) return match[1];
    const imgMatch = html.match(/id="image-viewer-container"[^>]*>.*?<img src="([^"]+)"/s);
    if (imgMatch && imgMatch[1]) return imgMatch[1];
  } catch {
    return url.trim();
  }
  return url.trim();
};

export const resolveImageUrl = async (url: string = ""): Promise<string> => {
  if (!url || typeof url !== 'string' || url.trim() === "") return "";
  const trimmed = url.trim();
  const fullUrl = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
  
  if (fullUrl.includes("drive.google.com") || fullUrl.includes("docs.google.com")) {
    const directUrl = convertDriveLink(fullUrl);
    // Kita gunakan proxy untuk membungkus link Drive agar tidak terkena blokir/redirect Google saat di-refresh
    return directUrl;
  }
  
  if (fullUrl.includes("ibb.co") && !fullUrl.includes("i.ibb.co")) return resolveImgBBLink(fullUrl);
  return fullUrl;
};

export const fetchFiguresFromSheet = async (csvUrl: string): Promise<Figure[]> => {
  if (!safeText(csvUrl)) return [];

  const dynamicUrl = csvUrl.includes("?") ? `${csvUrl}&t=${Date.now()}` : `${csvUrl}?t=${Date.now()}`;
  return new Promise((resolve, reject) => {
    Papa.parse<FigureCsvRow>(dynamicUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        try {
          debugCsvInfo("CSV Google Sheets figur terdeteksi:", {
            rows: results.data.length,
            columns: results.meta.fields || [],
          });
          const rawFigures: Figure[] = results.data
            .filter(hasCsvRowContent)
            .map(mapFigureRow)
            .filter((figure) => figure.slug);
          debugCsvInfo("CSV Google Sheets figur hasil mapping:", { figures: rawFigures.length });
          resolve(rawFigures);
        } catch (error) {
          debugCsvError("Gagal parsing CSV Google Sheets:", error);
          reject(error);
        }
      },
      error: (error) => {
        debugCsvError("Gagal mengambil CSV Google Sheets:", error);
        reject(error);
      },
    });
  });
};

export const fetchFiguresLocal = async (): Promise<Figure[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<FigureCsvRow>("/data_awal_mekarhub.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        try {
          debugCsvInfo("CSV lokal figur terdeteksi:", {
            rows: results.data.length,
            columns: results.meta.fields || [],
          });
          const rawFigures: Figure[] = results.data
            .filter(hasCsvRowContent)
            .map(mapFigureRow)
            .filter((figure) => figure.slug);
          debugCsvInfo("CSV lokal figur hasil mapping:", { figures: rawFigures.length });
          resolve(rawFigures);
        } catch (error) {
          debugCsvError("Gagal parsing CSV lokal:", error);
          reject(error);
        }
      },
      error: (error) => {
        debugCsvError("Gagal mengambil CSV lokal:", error);
        reject(error);
      },
    });
  });
};

export const fetchAllFigures = async (): Promise<Figure[]> => {
  if (import.meta.env.MODE === "test") return defaultFigures;

  if (!SHEET_CSV_URL) return defaultFigures;

  try {
    const remoteData = await fetchFiguresFromSheet(SHEET_CSV_URL);
    if (remoteData && remoteData.length > 0) return remoteData;
  } catch {
    // fetchFiguresFromSheet already logs CSV failures in development.
  }

  return defaultFigures;
};

const fallbackFigures: Figure[] = [
  { id: 1, name: "Didiet Rasmana", title: "Owner Toko Buku Singosari", category: "Entrepreneur", socialLink: "https://instagram.com", featured: true, slug: "didiet-rasmana", story: "Didiet Rasmana membangun Toko Buku Singosari dari nol, menjadikannya ruang literasi yang hidup di tengah komunitas. Dengan dedikasi tinggi, ia membuktikan bahwa bisnis buku masih relevan di era digital. Toko ini bukan sekadar tempat jual beli, melainkan pusat diskusi dan pertukaran ide bagi warga sekitar.", publishedDate: "2025-01-15" },
  { id: 2, name: "Yanti Dhaniaty", title: "Owner Sambel Shamila", category: "Entrepreneur", socialLink: "https://instagram.com", featured: true, slug: "yanti-dhaniaty", story: "Yanti Dhaniaty mengubah resep sambal warisan keluarga menjadi brand Sambel Shamila yang dikenal luas. Perjalanannya dimulai dari dapur rumah, kini produknya menjangkau berbagai kota. Ia membuktikan bahwa ketekunan dan cinta terhadap kuliner lokal bisa menjadi fondasi bisnis yang berkelanjutan.", publishedDate: "2025-02-10" },
  { id: 3, name: "Firman", title: "Pengelola Warung Gratis Azzahra", category: "Social Leader", socialLink: "https://instagram.com", featured: true, slug: "firman", story: "Firman mendirikan Warung Gratis Azzahra sebagai wujud kepeduliannya terhadap sesama. Setiap hari, warung ini menyajikan makanan gratis bagi siapa saja yang membutuhkan. Gerakan ini menginspirasi banyak orang untuk turut berbagi dan membangun solidaritas sosial di lingkungan sekitar.", publishedDate: "2025-03-05" },
  { id: 4, name: "Eko", title: "Walking Enthusiast", category: "Social Leader", socialLink: "https://instagram.com", featured: true, slug: "eko", story: "Eko mengajak masyarakat untuk kembali menghargai aktivitas berjalan kaki sebagai gaya hidup sehat and ramah lingkungan. Melalui komunitas jalan kakinya, ia membangun koneksi antarwarga sambil mempromosikan kesehatan fisik dan mental. Langkah kecilnya membawa dampak besar bagi komunitasnya.", publishedDate: "2025-03-20" },
  { id: 5, name: "Pak Bekti", title: "Empu Pisau Batu", category: "Entrepreneur", socialLink: "https://instagram.com", featured: true, slug: "pak-bekti", story: "Pak Bekti adalah maestro pembuat pisau batu yang melestarikan tradisi kerajinan nenek moyang. Setiap pisau yang dibuatnya adalah karya seni yang menggabungkan teknik kuno dengan kebutuhan modern. Dedikasinya menjaga warisan budaya ini menjadikannya sosok yang dihormati di kalangan pengrajin tradisional.", publishedDate: "2025-04-01" },
  { id: 6, name: "Jahfal & Kalis", title: "Owner Cungkup Batik and Craft", category: "Entrepreneur", socialLink: "https://instagram.com", featured: true, slug: "jahfal-kalis", story: "Jahfal dan Kalis bersama-sama membangun Cungkup Batik and Craft, sebuah usaha yang mengangkat batik lokal ke panggung yang lebih luas. Mereka menggabungkan motif tradisional dengan desain kontemporer, menciptakan produk yang diminati generasi muda tanpa kehilangan esensi budayanya.", publishedDate: "2025-04-15" },
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

export const defaultFigures: Figure[] = fallbackFigures.map((figure, index) => normalizeFigure(figure, index));
