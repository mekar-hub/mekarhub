import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2,
  Lock,
  Users,
  Lightbulb,
  BadgeDollarSign,
  Send,
  LogOut,
  UserCheck,
  ChevronDown,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";
import logoRed from "@/assets/Logo_Mekar_Hub_1.png";

// ─── Konstanta ──────────────────────────────────────────────────────────────
const ADMIN_PIN = "mekarhub2026";
const GAS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyI0lzKRhO5OrJtUrQIBmxgdL3pRkM-DA_EpTlzBMHEaMRulGLwVOl0UKm4CdwdgnsD/exec";

// ─── Tipe Data ───────────────────────────────────────────────────────────────
interface KlienItem {
  idBaris: number;
  nama: string;
  jabatan?: string;
  whatsapp?: string;
  savedRekening?: string;
}
interface AdminForm {
  // Tim Produksi
  namaLead: string;
  namaVideografer: string;
  namaEditor: string;
  deadlineShooting: string;
  // Konsep Kreatif
  ideBesar: string;
  visualTone: string;
  hook: string;
  catatanTeknis: string;
  // Administrasi & Keuangan
  nilaiKontrak: string;
  nomorRekening: string;
}

const emptyForm: AdminForm = {
  namaLead: "",
  namaVideografer: "",
  namaEditor: "",
  deadlineShooting: "",
  ideBesar: "",
  visualTone: "",
  hook: "",
  catatanTeknis: "",
  nilaiKontrak: "",
  nomorRekening: "",
};

// ─── Sub-komponen: Layar Login ────────────────────────────────────────────────
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      onLogin();
    } else {
      setError(true);
      setPin("");
      toast({
        title: "Akses Ditolak",
        description: "PIN yang Anda masukkan salah.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logoRed} alt="Mekarhub" className="h-20 w-auto object-contain" />
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-5">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground text-center mb-1">
            Admin Mekarhub
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Masukkan PIN untuk mengakses Dashboard Produksi.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-pin">PIN Admin</Label>
              <Input
                id="admin-pin"
                type="password"
                placeholder="••••••••••••"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                autoComplete="current-password"
                required
              />
              {error && (
                <p className="text-xs text-destructive">PIN salah, coba lagi.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold text-sm hover:bg-primary/90 active:scale-95 transition-all"
            >
              Masuk
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Halaman ini hanya untuk tim internal Mekarhub.
        </p>
      </div>
    </div>
  );
};

// ─── Sub-komponen: Header Section ────────────────────────────────────────────
const SectionHeader = ({
  icon,
  label,
  title,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
}) => (
  <div className="flex gap-4 items-start mb-6">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <span className="text-primary">{icon}</span>
    </div>
    <div>
      <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-0.5">
        {label}
      </p>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  </div>
);

// ─── Halaman Utama: Dashboard ─────────────────────────────────────────────────
const AdminDashboard = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [form, setForm] = useState<AdminForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // ── State: Pilih Klien ──
  const [klienList, setKlienList] = useState<KlienItem[]>([]);
  const [klienLoading, setKlienLoading] = useState(false);
  const [klienError, setKlienError] = useState(false);
  const [selectedKlien, setSelectedKlien] = useState<KlienItem | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Kalkulasi DP & Pelunasan ──
  const nilaiAngka = parseFloat(form.nilaiKontrak) || 0;
  const dpKontrak = nilaiAngka * 0.5;
  const pelunasan = nilaiAngka * 0.5;
  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  // Ambil daftar klien dari GAS doGet saat login
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchKlien = async () => {
      setKlienLoading(true);
      setKlienError(false);
      try {
        const res = await fetch(`${GAS_ENDPOINT}?action=getKlien`);
        const json = await res.json();
        if (Array.isArray(json.data)) {
          // json.data item boleh mengandung savedRekening dari Apps Script
          setKlienList(json.data);
        } else {
          throw new Error("Format tidak valid");
        }
      } catch {
        setKlienError(true);
        toast({
          title: "Gagal memuat daftar klien",
          description: "Periksa koneksi atau endpoint Apps Script.",
          variant: "destructive",
        });
      } finally {
        setKlienLoading(false);
      }
    };
    fetchKlien();
  }, [isLoggedIn]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredKlien = klienList.filter((k) =>
    k.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const set = (key: keyof AdminForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi: klien harus dipilih
    if (!selectedKlien) {
      toast({
        title: "Klien belum dipilih",
        description: "Pilih klien terlebih dahulu sebelum menyimpan.",
        variant: "destructive",
      });
      return;
    }

    // Validasi wajib
    const required: (keyof AdminForm)[] = [
      "namaLead",
      "namaVideografer",
      "namaEditor",
      "deadlineShooting",
      "ideBesar",
      "visualTone",
      "hook",
      "nilaiKontrak",
      "nomorRekening",
    ];
    const missing = required.some((k) => !form[k].trim());
    if (missing) {
      toast({
        title: "Data belum lengkap",
        description: "Mohon isi semua field bertanda wajib (*) sebelum menyimpan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = new URLSearchParams();
      (Object.keys(form) as (keyof AdminForm)[]).forEach((key) =>
        payload.append(key, form[key].trim())
      );
      payload.append("formType", "admin_produksi");
      // Sertakan ID baris klien agar Apps Script update baris yang sudah ada
      payload.append("idBaris", String(selectedKlien!.idBaris));
      payload.append("namaKlien", selectedKlien!.nama);

      await fetch(GAS_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: payload,
      });

      setIsSuccessOpen(true);
      setForm(emptyForm);
      setSelectedKlien(null);
      setSearchQuery("");
    } catch {
      toast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan jaringan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoRed} alt="Mekarhub" className="h-9 w-auto object-contain" />
            <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase hidden sm:block">
              Dashboard Admin
            </span>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-3xl mx-auto px-5 py-10">
        {/* Page title */}
        <div className="mb-10">
          <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-1.5">
            Internal · Mekarhub
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 leading-snug">
            Input Data Produksi & Keuangan
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            Lengkapi semua data di bawah sebelum sistem membuat dokumen MoU dan Brief
            secara otomatis via Google Drive.
          </p>
        </div>

        {/* ══ SEKSI 0: Pilih Klien ══ */}
        <section className="bg-card border-2 border-primary/20 rounded-xl p-6 md:p-8 shadow-sm">
          <SectionHeader
            icon={<UserCheck className="w-5 h-5" />}
            label="Langkah Pertama"
            title="Pilih Klien"
            description="Pilih klien dari daftar pendaftar. Data produksi akan ditautkan ke baris klien ini di spreadsheet."
          />

          <div className="space-y-1.5" ref={dropdownRef}>
            <Label htmlFor="pilih-klien">
              Nama Klien <span className="text-primary">*</span>
            </Label>

            {/* Trigger */}
            <button
              id="pilih-klien"
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-md bg-background transition-colors ${
                selectedKlien
                  ? "border-primary/50 text-foreground"
                  : "border-input text-muted-foreground"
              } hover:border-primary/70`}
            >
              <span className="truncate">
                {klienLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memuat daftar klien…
                  </span>
                ) : selectedKlien ? (
                  <span className="font-medium text-foreground">
                    {selectedKlien.nama}
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      (Baris #{selectedKlien.idBaris})
                    </span>
                  </span>
                ) : (
                  "— Pilih klien —"
                )}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="relative z-50">
                <div className="absolute top-1 left-0 right-0 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                  {/* Search */}
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                    <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Cari nama klien…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                  </div>

                  {/* List */}
                  <ul className="max-h-56 overflow-y-auto">
                    {klienError ? (
                      <li className="flex items-center gap-2 px-4 py-3 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" /> Gagal memuat. Refresh halaman.
                      </li>
                    ) : filteredKlien.length === 0 ? (
                      <li className="px-4 py-3 text-sm text-muted-foreground">
                        {searchQuery ? "Klien tidak ditemukan." : "Belum ada data klien."}
                      </li>
                    ) : (
                      filteredKlien.map((k) => (
                        <li key={k.idBaris}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedKlien(k);
                              setDropdownOpen(false);
                              setSearchQuery("");
                              // Auto-fill rekening jika tersedia dari data klien
                              if (k.savedRekening) {
                                set("nomorRekening", k.savedRekening);
                              }
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 transition-colors ${
                              selectedKlien?.idBaris === k.idBaris
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-foreground"
                            }`}
                          >
                            <span className="font-medium">{k.nama}</span>
                            {k.jabatan && (
                              <span className="ml-2 text-xs text-muted-foreground">{k.jabatan}</span>
                            )}
                            <span className="float-right text-xs text-muted-foreground">
                              #{k.idBaris}
                            </span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            )}

            {selectedKlien && (
              <p className="text-xs text-primary flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                Klien dipilih: <strong>{selectedKlien.nama}</strong> — data akan diperbarui di baris #{selectedKlien.idBaris}.
              </p>
            )}
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* ══ SEKSI 1: Tim Produksi ══ */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
            <SectionHeader
              icon={<Users className="w-5 h-5" />}
              label="Seksi 1"
              title="Tim Produksi"
              description="Data SDM yang bertanggung jawab atas proyek ini."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* namaLead */}
              <div className="space-y-1.5">
                <Label htmlFor="namaLead">
                  Nama Creative Lead <span className="text-primary">*</span>
                </Label>
                <Input
                  id="namaLead"
                  placeholder="Cth: Budi Santoso"
                  value={form.namaLead}
                  onChange={(e) => set("namaLead", e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              {/* namaVideografer */}
              <div className="space-y-1.5">
                <Label htmlFor="namaVideografer">
                  Nama Videografer <span className="text-primary">*</span>
                </Label>
                <Input
                  id="namaVideografer"
                  placeholder="Cth: Rina Putri"
                  value={form.namaVideografer}
                  onChange={(e) => set("namaVideografer", e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              {/* namaEditor */}
              <div className="space-y-1.5">
                <Label htmlFor="namaEditor">
                  Nama Editor <span className="text-primary">*</span>
                </Label>
                <Input
                  id="namaEditor"
                  placeholder="Cth: Andi Wijaya"
                  value={form.namaEditor}
                  onChange={(e) => set("namaEditor", e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              {/* deadlineShooting */}
              <div className="space-y-1.5">
                <Label htmlFor="deadlineShooting">
                  Target / Deadline Produksi <span className="text-primary">*</span>
                </Label>
                <Input
                  id="deadlineShooting"
                  type="date"
                  value={form.deadlineShooting}
                  onChange={(e) => set("deadlineShooting", e.target.value)}
                  required
                />
              </div>
            </div>
          </section>

          {/* ══ SEKSI 2: Konsep Kreatif ══ */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
            <SectionHeader
              icon={<Lightbulb className="w-5 h-5" />}
              label="Seksi 2"
              title="Konsep Kreatif"
              description="Fondasi narasi dan arahan visual untuk tim produksi."
            />

            <div className="space-y-5">
              {/* ideBesar */}
              <div className="space-y-1.5">
                <Label htmlFor="ideBesar">
                  Ide Besar <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Narasi utama yang ingin disampaikan melalui konten ini.
                </p>
                <Textarea
                  id="ideBesar"
                  placeholder="Tuliskan ide besar narasi konten..."
                  value={form.ideBesar}
                  onChange={(e) => set("ideBesar", e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>

              {/* visualTone */}
              <div className="space-y-1.5">
                <Label htmlFor="visualTone">
                  Arahan Visual &amp; Tone <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Warna, mood, gaya sinematik, referensi estetika.
                </p>
                <Textarea
                  id="visualTone"
                  placeholder="Cth: hangat, golden hour, VSCO film tone..."
                  value={form.visualTone}
                  onChange={(e) => set("visualTone", e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>

              {/* hook */}
              <div className="space-y-1.5">
                <Label htmlFor="hook">
                  Rencana Hook Konten <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Kalimat / visual pembuka yang akan menarik perhatian dalam 3 detik pertama.
                </p>
                <Input
                  id="hook"
                  placeholder="Cth: 'Satu warung, ribuan kisah...'"
                  value={form.hook}
                  onChange={(e) => set("hook", e.target.value)}
                  maxLength={255}
                  required
                />
              </div>

              {/* catatanTeknis */}
              <div className="space-y-1.5">
                <Label htmlFor="catatanTeknis">Catatan Teknis Produksi</Label>
                <p className="text-xs text-muted-foreground">
                  Peralatan khusus, izin lokasi, kebutuhan talent, dsb. (opsional)
                </p>
                <Textarea
                  id="catatanTeknis"
                  placeholder="Cth: Perlu gimbal, drone ijin perlu diurus H-3..."
                  value={form.catatanTeknis}
                  onChange={(e) => set("catatanTeknis", e.target.value)}
                  className="min-h-[90px]"
                />
              </div>
            </div>
          </section>

          {/* ══ SEKSI 3: Administrasi & Keuangan ══ */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
            <SectionHeader
              icon={<BadgeDollarSign className="w-5 h-5" />}
              label="Seksi 3"
              title="Administrasi &amp; Keuangan"
              description="Data finansial untuk pengisian dokumen MoU otomatis."
            />

            <div className="space-y-5">
              {/* nilaiKontrak */}
              <div className="space-y-1.5">
                <Label htmlFor="nilaiKontrak">
                  Total Nilai Kontrak (Rp) <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">Masukkan angka saja, tanpa titik / koma.</p>
                <Input
                  id="nilaiKontrak"
                  type="number"
                  placeholder="Cth: 3500000"
                  value={form.nilaiKontrak}
                  onChange={(e) => set("nilaiKontrak", e.target.value)}
                  min={0}
                  required
                />
                {/* ── Ringkasan Kalkulasi Otomatis ── */}
                {nilaiAngka > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div className="bg-primary/5 border border-primary/15 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold tracking-widest uppercase text-primary mb-0.5">
                        DP Kontrak (50%)
                      </p>
                      <p className="text-sm font-bold text-foreground">{formatRp(dpKontrak)}</p>
                    </div>
                    <div className="bg-muted/60 border border-border rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-0.5">
                        Pelunasan (50%)
                      </p>
                      <p className="text-sm font-bold text-foreground">{formatRp(pelunasan)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* nomorRekening */}
              <div className="space-y-1.5">
                <Label htmlFor="nomorRekening">
                  Detail Rekening Tujuan <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  {selectedKlien?.savedRekening
                    ? <span className="text-primary font-medium">✓ Auto-fill dari data klien</span>
                    : "Cth: BCA 1234567890 a.n. PT Mekarhub"}
                </p>
                <Input
                  id="nomorRekening"
                  placeholder="Bank · Nomor Rekening · Atas Nama"
                  value={form.nomorRekening}
                  onChange={(e) => set("nomorRekening", e.target.value)}
                  maxLength={255}
                  required
                />
              </div>
            </div>
          </section>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={loading}
            id="btn-simpan-generate"
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-base hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Menyimpan & Memproses…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Simpan dan Generate Dokumen
              </>
            )}
          </button>
        </form>
      </main>

      {/* ── Success Dialog ── */}
      <AlertDialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <AlertDialogContent className="max-w-sm text-center">
          <AlertDialogHeader>
            <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-center">
              Data Berhasil Disimpan!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm mt-1">
              Semua data produksi dan keuangan telah dikirim ke sistem. Dokumen MoU &amp;
              Brief akan dibuat otomatis oleh Google Apps Script.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-2">
            <AlertDialogAction
              onClick={() => setIsSuccessOpen(false)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
            >
              Oke, Selesai
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
