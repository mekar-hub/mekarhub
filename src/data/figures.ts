export interface Figure {
  id: number;
  name: string;
  title: string;
  category: "Entrepreneur" | "Social Leader" | "Educator";
  socialLink: string;
  featured: boolean;
}

export const figures: Figure[] = [
  // Featured 6
  { id: 1, name: "Didiet Rasmana", title: "Owner Toko Buku Singosari", category: "Entrepreneur", socialLink: "https://instagram.com", featured: true },
  { id: 2, name: "Yanti Dhaniaty", title: "Owner Sambel Shamila", category: "Entrepreneur", socialLink: "https://instagram.com", featured: true },
  { id: 3, name: "Firman", title: "Pengelola Warung Gratis Azzahra", category: "Social Leader", socialLink: "https://instagram.com", featured: true },
  { id: 4, name: "Eko", title: "Walking Enthusiast", category: "Social Leader", socialLink: "https://instagram.com", featured: true },
  { id: 5, name: "Pak Bekti", title: "Empu Pisau Batu", category: "Entrepreneur", socialLink: "https://instagram.com", featured: true },
  { id: 6, name: "Jahfal & Kalis", title: "Owner Cungkup Batik and Craft", category: "Entrepreneur", socialLink: "https://instagram.com", featured: true },
  // Remaining 14
  { id: 7, name: "Itus Ariyadi", title: "Community Builder", category: "Social Leader", socialLink: "https://instagram.com", featured: false },
  { id: 8, name: "Rian", title: "Creative Educator", category: "Educator", socialLink: "https://instagram.com", featured: false },
  { id: 9, name: "Kenny", title: "Youth Mentor", category: "Educator", socialLink: "https://instagram.com", featured: false },
  { id: 10, name: "Sari Wulandari", title: "Social Activist", category: "Social Leader", socialLink: "https://instagram.com", featured: false },
  { id: 11, name: "Bambang Susilo", title: "Local Artisan", category: "Entrepreneur", socialLink: "https://instagram.com", featured: false },
  { id: 12, name: "Dewi Lestari", title: "Cultural Preservationist", category: "Educator", socialLink: "https://instagram.com", featured: false },
  { id: 13, name: "Andi Pratama", title: "Tech Innovator", category: "Entrepreneur", socialLink: "https://instagram.com", featured: false },
  { id: 14, name: "Nadia Putri", title: "Women Empowerment Advocate", category: "Social Leader", socialLink: "https://instagram.com", featured: false },
  { id: 15, name: "Hendra Wijaya", title: "Environmental Champion", category: "Social Leader", socialLink: "https://instagram.com", featured: false },
  { id: 16, name: "Lina Marlina", title: "Traditional Craft Teacher", category: "Educator", socialLink: "https://instagram.com", featured: false },
  { id: 17, name: "Agus Setiawan", title: "Rural Entrepreneur", category: "Entrepreneur", socialLink: "https://instagram.com", featured: false },
  { id: 18, name: "Ratna Sari", title: "Literacy Advocate", category: "Educator", socialLink: "https://instagram.com", featured: false },
  { id: 19, name: "Fajar Nugroho", title: "Community Health Worker", category: "Social Leader", socialLink: "https://instagram.com", featured: false },
  { id: 20, name: "Maya Indah", title: "Heritage Storyteller", category: "Educator", socialLink: "https://instagram.com", featured: false },
];
