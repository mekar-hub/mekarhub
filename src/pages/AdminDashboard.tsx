import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard,
  Users,
  FileText,
  Search,
  Plus,
  Edit,
  Eye,
  Star,
  LogOut,
  X,
  Loader2,
  Activity,
  Briefcase,
  User,
  Type,
  DollarSign,
  CheckCircle2,
  MessageSquare,
  ScrollText,
  Trash2,
  Menu,
  Save,
} from "lucide-react";
import logoRed from "@/assets/Logo_Mekar_Hub_1.png";

// ─── Konstanta ──────────────────────────────────────────────────────────────
const ADMIN_PIN = "mekarhub2026";
const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbyI0lzKRhO5OrJtUrQIBmxgdL3pRkM-DA_EpTlzBMHEaMRulGLwVOl0UKm4CdwdgnsD/exec";

// ─── Tipe Data ───────────────────────────────────────────────────────────────
interface KlienData {
  idBaris: number;
  nama: string;
  jabatan: string;
  whatsapp: string;
  mediaSosial: string;
  lokasi: string;
  deskripsiUsaha: string;
  momenBerkesan: string;
  harapan: string;
  kategori: string;
  linkBrief: string;
  ideBesar: string;
  visualTone: string;
  hook: string;
  catatanTeknis: string;
  linkMoU: string;
  nilaiKontrak: string;
  nomorRekening: string;
  targetProduksi: string;
  statusPelunasan: string;
  namaLead: string;
  namaVideografer: string;
  namaEditor: string;
  jadwalVisit: string;
  statusProduksi: string;
  linkHasilFinal: string;
  savedRekening: string;
}

interface AdminForm {
  nama: string;
  jabatan: string;
  whatsapp: string;
  mediaSosial: string;
  lokasi: string;
  deskripsiUsaha: string;
  momenBerkesan: string;
  harapan: string;
  kategori: string;
  namaLead: string;
  namaVideografer: string;
  namaEditor: string;
  ideBesar: string;
  visualTone: string;
  hook: string;
  catatanTeknis: string;
  nilaiKontrak: string;
  nomorRekening: string;
  statusPelunasan: string;
  targetProduksiStart: string;
  targetProduksiEnd: string;
  jadwalVisit: string;
  statusProduksi: string;
  linkHasilFinal: string;
}

interface FigurData {
  idBaris: number;
  nama: string;
  judul: string;
  kategori: string;
  slug: string;
  narasi: string;
  image: string;
  idRelasiKlien: string;
}

// ─── Helper: Slugify ─────────────────────────────────────────────────────────
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Ganti spasi dengan -
    .replace(/[^\w-]+/g, '')  // Hapus karakter non-word
    .replace(/--+/g, '-');    // Ganti multiple - dengan satu -
};

// ─── Sub-komponen: Layar Login ────────────────────────────────────────────────
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [pin, setPin] = useState("");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      onLogin();
    } else {
      toast({ title: "PIN Salah", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
      <div className="w-full max-w-sm p-8 bg-white border border-gray-100 rounded-3xl shadow-2xl shadow-gray-200/40">
        <img src={logoRed} alt="Logo" className="h-16 mx-auto mb-10" />
        <h1 className="text-2xl font-serif font-bold text-center mb-2">Admin Access</h1>
        <p className="text-gray-400 text-sm text-center mb-10 italic tracking-wide">Mekarhub Editorial System</p>
        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            type="password" 
            placeholder="••••••" 
            value={pin} 
            onChange={(e) => setPin(e.target.value)}
            className="text-center tracking-[0.5em] text-xl py-7 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all shadow-inner"
          />
          <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20">
            Masuk Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Komponen Utama ─────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("admin_auth") === "true");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"beranda" | "klien" | "figur">("beranda");
  const [klienList, setKlienList] = useState<KlienData[]>([]);
  const [figurList, setFigurList] = useState<FigurData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { clientSlug } = useParams();
  const navigate = useNavigate();

  const [editingKlien, setEditingKlien] = useState<KlienData | null>(null);
  const [editingFigur, setEditingFigur] = useState<FigurData | null>(null);
  const [previewArticle, setPreviewArticle] = useState<FigurData | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ id: number, type: 'klien' | 'figur' } | null>(null);

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  useEffect(() => {
    setSearch("");
  }, [activeMenu]);

  // Efek untuk Deep Linking Klien
  useEffect(() => {
    if (clientSlug && klienList.length > 0 && isLoggedIn) {
      const found = klienList.find(k => slugify(k.nama) === clientSlug);
      if (found) {
        setActiveMenu("klien");
        setEditingKlien(found);
      }
    }
  }, [clientSlug, klienList, isLoggedIn]);

  const handleEditKlien = (klien: KlienData) => {
    setEditingKlien(klien);
    navigate(`/admin/klien/${slugify(klien.nama)}`);
  };

  const handleCloseKlienModal = () => {
    setEditingKlien(null);
    navigate("/admin");
  };

  // Efek untuk Deep Linking Klien
  useEffect(() => {
    if (clientSlug && klienList.length > 0 && isLoggedIn) {
      const found = klienList.find(k => slugify(k.nama) === clientSlug);
      if (found) {
        setActiveMenu("klien");
        setEditingKlien(found);
      }
    }
  }, [clientSlug, klienList, isLoggedIn]);

  const handlePreview = (url: string) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kRes, fRes] = await Promise.all([
        fetch(`${GAS_ENDPOINT}?action=getKlien&t=${Date.now()}`),
        fetch(`${GAS_ENDPOINT}?action=getFigur&t=${Date.now()}`)
      ]);
      const kData = await kRes.json();
      const fData = await fRes.json();
      if (!kData.data || !fData.data) throw new Error("Data tidak lengkap");
      setKlienList(kData.data || []);
      setFigurList(fData.data || []);
    } catch (e: any) {
      console.error("Fetch Error:", e);
      toast({ title: "Gagal Mengambil Data", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleWA = (whatsapp: any, name: string) => {
    if (!whatsapp) return;
    let cleanNumber = String(whatsapp).replace(/[^0-9]/g, "");
    if (cleanNumber.startsWith("0")) cleanNumber = "62" + cleanNumber.substring(1);
    
    const message = encodeURIComponent(`Halo ${name}, salam hangat dari Mekarhub. Kami telah menerima kiriman kisah Anda dan sangat tertarik untuk berkolaborasi. Mohon izin untuk menindaklanjuti detail kurasi dan jadwal liputannya ya. Apakah ada waktu luang untuk berdiskusi singkat? Terima kasih.`);
    
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
  };

  const handleDeleteKlien = async (idBaris: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("action", "deleteKlien");
      params.append("idBaris", idBaris.toString());
      params.append("t", Date.now().toString());
      const finalUrl = `${GAS_ENDPOINT}?${params.toString()}`;
      
      // Menggunakan fetch biasa tanpa no-cors agar redirect diikuti
      await fetch(finalUrl, { method: "GET" }).catch(() => {
        // Abaikan CORS error karena request tetap sampai ke server GAS
      });
      
      toast({ title: "Klien Berhasil Dihapus" });
      setDeletingItem(null);
      await fetchData();
    } catch (e) {
      toast({ title: "Gagal Hapus", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFigur = async (idBaris: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("action", "deleteFigur");
      params.append("idBaris", idBaris.toString());
      params.append("t", Date.now().toString());
      const finalUrl = `${GAS_ENDPOINT}?${params.toString()}`;
      
      await fetch(finalUrl, { method: "GET" }).catch(() => {});
      
      toast({ title: "Artikel Berhasil Dihapus" });
      setDeletingItem(null);
      await fetchData();
    } catch (e) {
      toast({ title: "Gagal Hapus", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = (klien: KlienData) => {
    setActiveMenu("figur");
    setEditingFigur({
      idBaris: 0,
      nama: klien.nama,
      judul: klien.ideBesar || "",
      kategori: "Profil Bisnis",
      slug: (klien.nama || "").toLowerCase().replace(/\s+/g, "-"),
      narasi: "",
      image: "",
      idRelasiKlien: klien.idBaris.toString()
    });
  };

  if (!isLoggedIn) return (
    <LoginScreen 
      onLogin={() => {
        localStorage.setItem("admin_auth", "true");
        setIsLoggedIn(true);
      }} 
    />
  );

  const handleSignOut = () => {
    localStorage.removeItem("admin_auth");
    setIsLoggedIn(false);
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-[#2D3436]">
      {/* MOBILE SIDEBAR OVERLAY */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <aside className={`absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-8 border-b flex items-center justify-between">
            <img src={logoRed} alt="Logo" className="h-14" />
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
          </div>
          <nav className="p-6 space-y-4">
            <SidebarItem icon={<LayoutDashboard size={20} />} label="Beranda" active={activeMenu === "beranda"} onClick={() => {setActiveMenu("beranda"); setIsSidebarOpen(false);}} />
            <SidebarItem icon={<Users size={20} />} label="Klien" active={activeMenu === "klien"} onClick={() => {setActiveMenu("klien"); setIsSidebarOpen(false);}} />
            <SidebarItem icon={<Star size={20} />} label="Figur" active={activeMenu === "figur"} onClick={() => {setActiveMenu("figur"); setIsSidebarOpen(false);}} />
            <div className="pt-10 border-t mt-10">
              <button onClick={handleSignOut} className="flex items-center gap-4 text-gray-400 px-6 py-4 w-full">
                <LogOut size={20} /> <span className="font-bold text-sm">Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col sticky top-0 h-screen">
        <div className="p-10 border-b border-gray-50 flex justify-center">
          <img src={logoRed} alt="Logo" className="h-14" />
        </div>
        <nav className="flex-1 px-6 py-10 space-y-3">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Beranda" active={activeMenu === "beranda"} onClick={() => setActiveMenu("beranda")} />
          <SidebarItem icon={<Users size={20} />} label="Klien" active={activeMenu === "klien"} onClick={() => setActiveMenu("klien")} />
          <SidebarItem icon={<Star size={20} />} label="Figur" active={activeMenu === "figur"} onClick={() => setActiveMenu("figur")} />
        </nav>
        <div className="p-8 border-t border-gray-50">
          <button onClick={handleSignOut} className="flex items-center gap-3 text-gray-400 hover:text-red-500 w-full px-4 py-3 rounded-xl transition-all">
            <LogOut size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-50 p-6 lg:p-10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all"><Menu /></button>
            <div>
              <h1 className="text-xl lg:text-3xl font-serif font-bold text-gray-900 capitalize">{activeMenu}</h1>
              <p className="hidden md:block text-gray-400 text-sm mt-1 tracking-wide uppercase font-bold text-[10px]">Mekarhub System</p>
            </div>
          </div>
          {(activeMenu === "klien" || activeMenu === "figur") && (
            <div className="relative w-40 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input 
                type="text" placeholder="Cari..." 
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/10 transition-all"
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </header>

        <div className="p-6 lg:p-10 overflow-y-auto flex-1">
          {activeMenu === "beranda" && (
            <BerandaView 
              klien={klienList.length} figur={figurList.length} 
              selesai={klienList.filter(k => k.statusProduksi === "Selesai").length} 
              onNavigate={setActiveMenu}
            />
          )}
          {activeMenu === "klien" && (
            <KlienView 
              data={klienList.filter(k => String(k.nama || "").toLowerCase().includes(search.toLowerCase()))} 
              onEdit={handleEditKlien} onPromote={handlePromote} onPreview={handlePreview} onDelete={(id: number) => setDeletingItem({ id, type: 'klien' })} onWA={(num: any, name: string) => handleWA(num, name)} 
            />
          )}
          {activeMenu === "figur" && (
            <FigurView 
              data={figurList.filter(f => String(f.nama || "").toLowerCase().includes(search.toLowerCase()))} 
              onEdit={setEditingFigur} onAdd={() => setEditingFigur({ idBaris: 0, nama: "", judul: "", kategori: "", slug: "", narasi: "", image: "", idRelasiKlien: "" })} 
              onPreview={setPreviewArticle}
              onDelete={(id: number) => setDeletingItem({ id, type: 'figur' })}
            />
          )}
        </div>
      </main>

      {editingKlien && <EditKlienModal klien={editingKlien} onClose={handleCloseKlienModal} onSave={fetchData} />}
      {editingFigur && <EditFigurModal figur={editingFigur} onClose={() => setEditingFigur(null)} onSave={fetchData} />}
      
      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-center mb-2">Hapus Data?</h3>
            <p className="text-gray-400 text-sm text-center mb-8">Tindakan ini permanen dan akan menghapus baris data dari Google Sheets.</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setDeletingItem(null)} 
                className="py-4 bg-gray-50 text-gray-800 rounded-2xl font-bold text-xs hover:bg-gray-100 transition-all"
              >
                Batal
              </button>
              <button 
                onClick={() => deletingItem.type === 'klien' ? handleDeleteKlien(deletingItem.id) : handleDeleteFigur(deletingItem.id)} 
                disabled={loading}
                className="py-4 bg-red-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-red-200 hover:bg-red-600 transition-all flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewArticle && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col font-serif overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-[#FDFDFD]">
            <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary font-bold">Live Article Simulation</span>
            <button onClick={() => setPreviewArticle(null)} className="p-3 hover:bg-gray-100 rounded-full font-sans transition-all"><X size={24} /></button>
          </div>
          <div className="flex-1 overflow-y-auto max-w-3xl mx-auto py-16 px-6">
            <h1 className="text-3xl md:text-5xl font-bold mb-10 leading-[1.1]">{previewArticle.judul}</h1>
            <div className="flex items-center gap-4 mb-14 font-sans text-xs text-gray-400 uppercase tracking-widest font-bold">
              <span>{previewArticle.kategori}</span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span>{previewArticle.nama}</span>
            </div>
            {previewArticle.image && <img src={previewArticle.image} className="w-full aspect-[16/9] object-cover rounded-[2rem] mb-14 shadow-2xl" alt="Cover" />}
            <div className="prose prose-lg md:prose-xl prose-serif max-w-none text-gray-800 space-y-10 text-xl leading-relaxed">
              {(previewArticle.narasi || "").split("\n").map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-komponen View ──────────────────────────────────────────────────────

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"}`}>
    {icon} <span className="font-bold text-sm tracking-tight">{label}</span>
  </button>
);

const BerandaView = ({ klien, figur, selesai, onNavigate }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <StatCard icon={<Users size={28} />} label="Total Klien" value={klien} color="text-blue-600 bg-blue-50" onClick={() => onNavigate("klien")} />
    <StatCard icon={<Star size={28} />} label="Artikel Figur" value={figur} color="text-amber-600 bg-amber-50" onClick={() => onNavigate("figur")} />
    <StatCard icon={<CheckCircle2 size={28} />} label="Produksi Selesai" value={selesai} color="text-green-600 bg-green-50" />
    <div className="col-span-full bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="max-w-xl text-center md:text-left">
        <h3 className="text-2xl font-serif font-bold mb-4">Mekarhub Editorial System</h3>
        <p className="text-gray-400 italic text-lg leading-relaxed">"Membangun narasi autentik dimulai dari ketelitian setiap baris data."</p>
      </div>
      <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center text-primary opacity-20"><Activity size={48} /></div>
    </div>
  </div>
);

const StatCard = ({ icon, label, value, color, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all ${onClick ? "cursor-pointer active:scale-95" : ""}`}
  >
    <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>{icon}</div>
    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
    <p className="text-4xl font-serif font-bold">{value}</p>
  </div>
);

const KlienView = ({ data, onEdit, onPromote, onPreview, onDelete, onWA }: any) => (
  <div className="space-y-4">
    {/* DESKTOP TABLE */}
    <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 border-b border-gray-50">
          <tr>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Nama / Brand</th>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Status</th>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Keuangan</th>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 text-right">Opsi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.length === 0 ? (
            <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">Tidak ada klien ditemukan.</td></tr>
          ) : data.map((k: KlienData) => (
            <tr key={k.idBaris} className="hover:bg-gray-50/30 transition-all group">
              <td className="px-8 py-6">
                <p className="font-bold text-gray-800">{k.nama}</p>
                <p className="text-[10px] text-gray-400 font-medium">{k.jabatan} · {k.lokasi}</p>
              </td>
              <td className="px-8 py-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${k.statusProduksi === "Selesai" ? "bg-green-50 text-green-600" : k.statusProduksi === "Tunda" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                  {k.statusProduksi || "Proses"}
                </span>
              </td>
              <td className="px-8 py-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${k.statusPelunasan === "Lunas" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                  {k.statusPelunasan || "Belum"}
                </span>
              </td>
              <td className="px-8 py-6 text-right space-x-1">
                <ActionBtn onClick={() => onWA(k.whatsapp, k.nama)} icon={<MessageSquare size={14} />} color="hover:text-green-500" />
                <ActionBtn onClick={() => onPreview(k.linkBrief)} icon={<ScrollText size={14} />} color="hover:text-blue-500" />
                <ActionBtn onClick={() => onPreview(k.linkMoU)} icon={<FileText size={14} />} color="hover:text-primary" />
                <ActionBtn onClick={() => onEdit(k)} icon={<Edit size={14} />} color="hover:text-blue-500" />
                <ActionBtn onClick={() => onPromote(k)} icon={<Star size={14} />} color="hover:text-amber-500" />
                <ActionBtn onClick={() => onDelete(k.idBaris)} icon={<Trash2 size={14} />} color="hover:text-red-500" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* MOBILE CARD VIEW */}
    <div className="grid grid-cols-1 md:hidden gap-6">
       {data.map((k: KlienData) => (
         <div key={k.idBaris} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold">{k.nama}</h3>
                <p className="text-xs text-gray-400 italic">{k.jabatan}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${k.statusProduksi === "Selesai" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
                  {k.statusProduksi || "Proses"}
                </span>
                <button onClick={() => onDelete(k.idBaris)} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-all active:scale-90">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={() => onEdit(k)} className="py-4 bg-gray-50 text-gray-800 rounded-2xl font-bold text-xs active:scale-95 transition-all">Edit Data</button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onPreview(k.linkBrief)} className="py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold text-[9px] active:scale-95 transition-all">Brief</button>
                <button onClick={() => onPreview(k.linkMoU)} className="py-4 bg-primary text-white rounded-2xl font-bold text-[9px] shadow-lg shadow-primary/20 active:scale-95 transition-all">MoU</button>
              </div>
              <button onClick={() => onWA(k.whatsapp, k.nama)} className="col-span-2 py-4 border border-green-100 text-green-600 rounded-2xl font-bold text-xs active:scale-95 transition-all">WhatsApp Klien</button>
            </div>
         </div>
       ))}
    </div>
  </div>
);

const FigurView = ({ data, onEdit, onAdd, onPreview, onDelete }: any) => (
  <div className="space-y-6">
    <button onClick={onAdd} className="w-full md:w-auto flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-black/10 hover:bg-gray-800 transition-all active:scale-[0.98]">
      <Plus size={18} /> <span className="text-sm">Tambah Figur Baru</span>
    </button>
    
    {/* DESKTOP TABLE */}
    <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 border-b border-gray-50">
          <tr>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Figur</th>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Kategori</th>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Slug</th>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 text-right">Opsi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.length === 0 ? (
            <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">Tidak ada artikel figur ditemukan.</td></tr>
          ) : data.map((f: FigurData) => (
            <tr key={f.idBaris} className="hover:bg-gray-50/30 transition-all">
              <td className="px-8 py-6">
                <p className="font-bold">{f.nama}</p>
                <p className="text-[10px] text-gray-400 line-clamp-1 italic">"{f.judul}"</p>
              </td>
              <td className="px-8 py-6 text-xs text-gray-500 font-bold uppercase">{f.kategori}</td>
              <td className="px-8 py-6 font-mono text-[10px] text-gray-300">/{f.slug}</td>
              <td className="px-8 py-6 text-right space-x-1">
                <ActionBtn onClick={() => onPreview(f)} icon={<Eye size={14} />} color="hover:text-primary" />
                <ActionBtn onClick={() => onEdit(f)} icon={<Edit size={14} />} color="hover:text-blue-500" />
                <ActionBtn onClick={() => onDelete(f.idBaris)} icon={<Trash2 size={14} />} color="hover:text-red-500" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* MOBILE CARDS */}
    <div className="grid grid-cols-1 md:hidden gap-6">
      {data.map((f: FigurData) => (
        <div key={f.idBaris} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-md">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-serif font-bold text-lg mb-1">{f.nama}</h3>
              <p className="text-xs text-gray-400 italic line-clamp-1">"{f.judul}"</p>
            </div>
            <button onClick={() => onDelete(f.idBaris)} className="p-3 text-red-400 hover:bg-red-50 rounded-full transition-all active:scale-90">
              <Trash2 size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => onPreview(f)} className="py-4 bg-gray-50 text-gray-800 rounded-2xl font-bold text-xs active:scale-95 transition-all">Lihat</button>
             <button onClick={() => onEdit(f)} className="py-4 bg-primary text-white rounded-2xl font-bold text-xs active:scale-95 transition-all">Edit</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ActionBtn = ({ onClick, icon, color }: any) => (
  <button onClick={onClick} className={`p-3 text-gray-300 ${color} bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100 transition-all`}>
    {icon}
  </button>
);

// ─── Modals ────────────────────────────────────────────────────────────────

const EditKlienModal = ({ klien, onClose, onSave }: any) => {
  const [activeTab, setActiveTab] = useState<'produksi' | 'biodata'>('produksi');
  const [form, setForm] = useState<AdminForm>(() => {
    const [start, end] = (klien.targetProduksi || "").split(" - ");
    return {
      nama: klien.nama || "",
      jabatan: klien.jabatan || "",
      whatsapp: klien.whatsapp || "",
      mediaSosial: klien.mediaSosial || "",
      lokasi: klien.lokasi || "",
      deskripsiUsaha: klien.deskripsiUsaha || "",
      momenBerkesan: klien.momenBerkesan || "",
      harapan: klien.harapan || "",
      kategori: klien.kategori || "Klien",
      namaLead: klien.namaLead || "",
      namaVideografer: klien.namaVideografer || "",
      namaEditor: klien.namaEditor || "",
      ideBesar: klien.ideBesar || "",
      visualTone: klien.visualTone || "",
      hook: klien.hook || "",
      catatanTeknis: klien.catatanTeknis || "",
      nilaiKontrak: klien.nilaiKontrak || "",
      nomorRekening: klien.nomorRekening || klien.savedRekening || "",
      statusPelunasan: klien.statusPelunasan || "Belum",
      targetProduksiStart: start || "",
      targetProduksiEnd: end || "",
      jadwalVisit: klien.jadwalVisit || "",
      statusProduksi: klien.statusProduksi || "Proses",
      linkHasilFinal: klien.linkHasilFinal || "",
    };
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const targetRange = `${form.targetProduksiStart} - ${form.targetProduksiEnd}`;
      
      const bodyParams = new URLSearchParams();
      bodyParams.append("action", "updateKlien");
      bodyParams.append("idBaris", klien.idBaris.toString());
      
      // Bungkus semua data form ke dalam URLSearchParams
      Object.keys(form).forEach(key => {
        if (key !== "targetProduksiStart" && key !== "targetProduksiEnd") {
          bodyParams.append(key, String((form as any)[key] || ""));
        }
      });
      bodyParams.append("targetProduksi", targetRange);

      // Gunakan POST dengan body URLSearchParams (Paling Stabil untuk GAS)
      await fetch(GAS_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: bodyParams
      });

      // Beri waktu 5 detik untuk server generate dokumen
      setTimeout(() => {
        setLoading(false);
        toast({ title: "Data & Dokumen Berhasil Diperbarui" });
        onSave(); 
        onClose();
      }, 5000);
    } catch (error) {
      console.error("Update Error:", error);
      toast({ title: "Gagal Update", variant: "destructive" });
      setLoading(false);
    }
  };

  const curVal = parseFloat(String(form.nilaiKontrak || "0").replace(/[^0-9]/g, "")) || 0;
  const rp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] md:max-h-full rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 md:zoom-in-95 md:duration-200">
        <div className="p-6 md:p-8 border-b flex justify-between items-center bg-[#FDFDFD]">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center text-primary"><Briefcase size={24} /></div>
            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold">Editor Data Klien</h3>
              <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                <button onClick={() => setActiveTab('produksi')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'produksi' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Produksi & Keuangan</button>
                <button onClick={() => setActiveTab('biodata')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'biodata' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Biodata Lengkap</button>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-6 md:p-12">
          {activeTab === 'produksi' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="space-y-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2"><Activity size={14}/> Produksi</h4>
                <div className="space-y-6">
                  <Inp label="Nama Lead" value={form.namaLead} onChange={(v: string) => setForm({...form, namaLead: v})} />
                  <Inp label="Videografer" value={form.namaVideografer} onChange={(v: string) => setForm({...form, namaVideografer: v})} />
                  <Inp label="Editor" value={form.namaEditor} onChange={(v: string) => setForm({...form, namaEditor: v})} />
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-gray-400">Target Range</Label>
                    <div className="flex gap-2">
                      <Input type="date" value={form.targetProduksiStart} onChange={e => setForm({...form, targetProduksiStart: e.target.value})} className="rounded-xl border-gray-100 bg-gray-50/50 text-xs py-5 h-auto" />
                      <Input type="date" value={form.targetProduksiEnd} onChange={e => setForm({...form, targetProduksiEnd: e.target.value})} className="rounded-xl border-gray-100 bg-gray-50/50 text-xs py-5 h-auto" />
                    </div>
                  </div>
                  <Inp label="Jadwal Visit" type="date" value={form.jadwalVisit} onChange={(v: string) => setForm({...form, jadwalVisit: v})} />
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-gray-400">Status</Label>
                    <select value={form.statusProduksi} onChange={e => setForm({...form, statusProduksi: e.target.value})} className="w-full p-4 rounded-xl border border-gray-100 text-xs font-bold focus:ring-2 focus:ring-primary/10">
                      <option value="Proses">🟡 PROSES</option>
                      <option value="Selesai">🟢 SELESAI</option>
                      <option value="Tunda">🔴 TUNDA</option>
                    </select>
                  </div>
                  <Inp label="Link Hasil Final" value={form.linkHasilFinal} onChange={(v: string) => setForm({...form, linkHasilFinal: v})} />
                </div>
              </div>
              <div className="space-y-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2"><Type size={14}/> Kreatif</h4>
                <div className="space-y-6">
                  <Txt label="Ide Besar" value={form.ideBesar} onChange={(v: string) => setForm({...form, ideBesar: v})} />
                  <Txt label="Visual Tone" value={form.visualTone} onChange={(v: string) => setForm({...form, visualTone: v})} />
                  <Inp label="Hook" value={form.hook} onChange={(v: string) => setForm({...form, hook: v})} />
                  <Txt label="Catatan Teknis" value={form.catatanTeknis} onChange={(v: string) => setForm({...form, catatanTeknis: v})} />
                </div>
              </div>
              <div className="space-y-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2"><DollarSign size={14}/> Keuangan</h4>
                <div className="space-y-6">
                  <div className="space-y-2">
                     <Inp label="Nilai Kontrak" type="text" value={form.nilaiKontrak} onChange={(v: string) => setForm({...form, nilaiKontrak: v})} />
                     <p className="text-[9px] font-bold text-primary italic pl-1">Live DP 50%: {rp(curVal * 0.5)}</p>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 shadow-inner">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 italic"><span>DP (Booking)</span> <span>{rp(curVal * 0.5)}</span></div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 italic"><span>Pelunasan</span> <span>{rp(curVal * 0.5)}</span></div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-gray-400">Status Bayar</Label>
                    <select value={form.statusPelunasan} onChange={e => setForm({...form, statusPelunasan: e.target.value})} className="w-full p-4 rounded-xl border border-gray-100 text-xs font-bold">
                      <option value="Belum">🔴 BELUM LUNAS</option>
                      <option value="Lunas">🟢 SUDAH LUNAS</option>
                    </select>
                  </div>
                  <Inp label="Nomor Rekening" value={form.nomorRekening} onChange={(v: string) => setForm({...form, nomorRekening: v})} />
                </div>
                <div className="pt-6 md:pt-10">
                  <button disabled={loading} className="w-full py-5 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 active:scale-95">
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    {loading ? "Updating..." : "Update Data Produksi"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2"><User size={14}/> Profil Dasar</h4>
                <div className="space-y-6">
                  <Inp label="Nama Lengkap / Brand" value={form.nama} onChange={(v: string) => setForm({...form, nama: v})} />
                  <Inp label="Jabatan" value={form.jabatan} onChange={(v: string) => setForm({...form, jabatan: v})} />
                  <Inp label="WhatsApp" value={form.whatsapp} onChange={(v: string) => setForm({...form, whatsapp: v})} />
                  <Inp label="Media Sosial" value={form.mediaSosial} onChange={(v: string) => setForm({...form, mediaSosial: v})} />
                  <Inp label="Lokasi" value={form.lokasi} onChange={(v: string) => setForm({...form, lokasi: v})} />
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">Status Kategori (Kolom N)</Label>
                    <select 
                      value={form.kategori} 
                      onChange={e => setForm({...form, kategori: e.target.value})} 
                      className="w-full p-4 rounded-xl border border-gray-100 text-base md:text-sm font-bold bg-gray-50/50 focus:bg-white transition-all"
                    >
                      <option value="Klien">👤 KLIEN</option>
                      <option value="Figur">🌟 FIGUR</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2"><MessageSquare size={14}/> Cerita & Visi</h4>
                <div className="space-y-6">
                  <Txt label="Deskripsi Usaha" value={form.deskripsiUsaha} onChange={(v: string) => setForm({...form, deskripsiUsaha: v})} />
                  <Txt label="Momen Berkesan" value={form.momenBerkesan} onChange={(v: string) => setForm({...form, momenBerkesan: v})} />
                  <Txt label="Harapan Kolaborasi" value={form.harapan} onChange={(v: string) => setForm({...form, harapan: v})} />
                </div>
                <div className="pt-6 md:pt-10">
                  <button disabled={loading} className="w-full py-5 bg-black text-white rounded-2xl font-bold shadow-xl shadow-black/10 hover:bg-gray-800 transition-all flex items-center justify-center gap-3 active:scale-95">
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    {loading ? "Updating..." : "Update Biodata Klien"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const EditFigurModal = ({ figur, onClose, onSave }: any) => {
  const [form, setForm] = useState<FigurData>(figur);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const bodyParams = new URLSearchParams();
      bodyParams.append("action", "updateFigur");
      Object.keys(form).forEach(key => {
        bodyParams.append(key, String((form as any)[key] || ""));
      });

      await fetch(GAS_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: bodyParams
      });

      setTimeout(() => {
        setLoading(false);
        toast({ title: "Artikel Berhasil Disimpan" });
        onSave(); 
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Save Error:", error);
      toast({ title: "Gagal Simpan", variant: "destructive" });
      setLoading(false);
    }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] md:max-h-full rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 md:p-8 border-b bg-[#FDFDFD] flex justify-between items-center">
          <h3 className="text-xl font-serif font-bold">Artikel Editor</h3>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all"><X size={20} /></button>
        </div>
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Inp label="Nama Figur" value={form.nama} onChange={v => setForm({...form, nama: v})} />
            <Inp label="Kategori" value={form.kategori} onChange={v => setForm({...form, kategori: v})} />
          </div>
          <Inp label="Judul Cerita" value={form.judul} onChange={v => setForm({...form, judul: v})} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Inp label="Slug URL" value={form.slug} onChange={v => setForm({...form, slug: v})} />
            <Inp label="ID Relasi Klien" value={form.idRelasiKlien} onChange={v => setForm({...form, idRelasiKlien: v})} />
          </div>
          <Inp label="Link Gambar Utama" value={form.image} onChange={v => setForm({...form, image: v})} />
          <Txt label="Narasi Cerita" value={form.narasi} onChange={v => setForm({...form, narasi: v})} />
          <button disabled={loading} className="w-full py-5 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" /> : "Simpan Narasi"}
          </button>
        </form>
      </div>
    </div>
  );
};

const Inp = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-2">
    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">{label}</Label>
    <Input type={type} value={value} onChange={e => onChange(e.target.value)} className="rounded-xl border-gray-100 bg-gray-50/50 py-5 text-base md:text-sm h-auto focus:bg-white transition-all w-full" />
  </div>
);

const Txt = ({ label, value, onChange }: any) => (
  <div className="space-y-2">
    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">{label}</Label>
    <Textarea value={value} onChange={e => onChange(e.target.value)} className="rounded-xl border-gray-100 bg-gray-50/50 py-4 text-base md:text-sm focus:bg-white transition-all min-h-[100px] w-full" />
  </div>
);

export default AdminDashboard;
