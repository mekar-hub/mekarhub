import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
import { CheckCircle2, MessageSquare, Send } from "lucide-react";

const FormCalonFigur = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  useEffect(() => {
    if (isSuccessModalOpen) {
      const timer = setTimeout(() => {
        const waUrl = `https://wa.me/6281333277361?text=${encodeURIComponent(
          `Halo Mekarhub! Saya ${submittedName} baru saja mengisi Form Kisah Mekarhub. Mohon ditindaklanjuti ya 🙏`
        )}`;
        window.location.href = waUrl;
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccessModalOpen, submittedName]);

  const [form, setForm] = useState({
    nama: "",
    jabatan: "",
    whatsapp: "",
    mediaSosial: "",
    lokasi: "",
    deskripsiUsaha: "",
    momenBerkesan: "",
    harapan: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.nama.trim() ||
      !form.jabatan.trim() ||
      !form.whatsapp.trim() ||
      !form.lokasi.trim() ||
      !form.deskripsiUsaha.trim() ||
      !form.momenBerkesan.trim() ||
      !form.harapan.trim()
    ) {
      toast({
        title: "Mohon Lengkapi Data",
        description: "Semua tanda bintang (*) wajib diisi agar narasi Anda dapat diproses.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new URLSearchParams();
      // Mengikuti urutan Kolom B - M (dengan I-L kosong di backend)
      formData.append("nama", form.nama.trim());
      formData.append("jabatan", form.jabatan.trim());
      formData.append("whatsapp", form.whatsapp.trim());
      formData.append("mediaSosial", form.mediaSosial.trim());
      formData.append("lokasi", form.lokasi.trim());
      formData.append("deskripsiUsaha", form.deskripsiUsaha.trim());
      formData.append("momenBerkesan", form.momenBerkesan.trim());
      formData.append("harapan", form.harapan.trim());

      // Kirim ke Google Apps Script
      await fetch(
        "https://script.google.com/macros/s/AKfycbxWKKBQxnUg3FHtwWw2H56fGp3JyHS3bNlHBj006v3yFvYu4cN5JD_TeIJBf52VMUJI0g/exec",
        {
          method: "POST",
          mode: "no-cors",
          body: formData,
        }
      );

      setSubmittedName(form.nama.trim());
      setIsSuccessModalOpen(true);
      setForm({
        nama: "",
        jabatan: "",
        whatsapp: "",
        mediaSosial: "",
        lokasi: "",
        deskripsiUsaha: "",
        momenBerkesan: "",
        harapan: "",
      });
    } catch (err) {
      toast({
        title: "Gagal Mengirim",
        description: "Terjadi gangguan koneksi. Silakan coba beberapa saat lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Navbar />
      
      <section className="pt-32 pb-24 lg:pt-40 lg:pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <span className="text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.3em] bg-primary/5 px-6 py-2 rounded-full">
              Kolaborasi Kisah
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 leading-tight">
              Tumbuh dan Terhubung <br /> Bersama Mekarhub
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto italic font-serif">
              "Punya cerita inspiratif yang ingin diceritakan? Tim Mekarhub akan mewujudkan keinginan Anda melalui narasi visual."
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 md:p-16 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 space-y-16">
            
            {/* ─── Seksi I: Identitas Diri ─── */}
            <div className="space-y-10">
              <div className="border-b border-gray-50 pb-4">
                 <h2 className="text-xl font-serif font-bold text-gray-800">I. Identitas Diri</h2>
                 <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Data Utama Korespondensi</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="nama" className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Nama Lengkap *</Label>
                  <Input
                    id="nama"
                    placeholder="Masukkan nama Anda"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    className="h-auto py-5 px-6 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-base"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="jabatan" className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Jabatan / Posisi *</Label>
                  <Input
                    id="jabatan"
                    placeholder="Contoh: Owner, Founder, Pengelola"
                    value={form.jabatan}
                    onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                    className="h-auto py-5 px-6 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-base"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="whatsapp" className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">WhatsApp Aktif *</Label>
                  <Input
                    id="whatsapp"
                    placeholder="Contoh: 08123456789"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="h-auto py-5 px-6 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-base"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="mediaSosial" className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Media Sosial Brand</Label>
                  <Input
                    id="mediaSosial"
                    placeholder="Instagram / TikTok @username"
                    value={form.mediaSosial}
                    onChange={(e) => setForm({ ...form, mediaSosial: e.target.value })}
                    className="h-auto py-5 px-6 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-base"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="lokasi" className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Lokasi Brand *</Label>
                <Input
                  id="lokasi"
                  placeholder="Alamat lengkap atau link Google Maps"
                  value={form.lokasi}
                  onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                  className="h-auto py-5 px-6 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-base"
                  required
                />
              </div>
            </div>

            {/* ─── Seksi II: Profil Kisah ─── */}
            <div className="space-y-10">
              <div className="border-b border-gray-50 pb-4">
                 <h2 className="text-xl font-serif font-bold text-gray-800">II. Profil Kisah</h2>
                 <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Narasi Utama Liputan</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="deskripsiUsaha" className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Deskripsi Usaha *</Label>
                <Textarea
                  id="deskripsiUsaha"
                  placeholder="Ceritakan singkat tentang apa yang Anda jalankan..."
                  value={form.deskripsiUsaha}
                  onChange={(e) => setForm({ ...form, deskripsiUsaha: e.target.value })}
                  className="min-h-[150px] p-6 rounded-3xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-base leading-relaxed"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="momenBerkesan" className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Momen Paling Berkesan *</Label>
                <Textarea
                  id="momenBerkesan"
                  placeholder="Titik balik atau kejadian yang paling mengubah arah langkah Anda..."
                  value={form.momenBerkesan}
                  onChange={(e) => setForm({ ...form, momenBerkesan: e.target.value })}
                  className="min-h-[150px] p-6 rounded-3xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-base leading-relaxed"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="harapan" className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Harapan Kedepan *</Label>
                <Textarea
                  id="harapan"
                  placeholder="Apa yang ingin Anda capai melalui kolaborasi ini?"
                  value={form.harapan}
                  onChange={(e) => setForm({ ...form, harapan: e.target.value })}
                  className="min-h-[150px] p-6 rounded-3xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-base leading-relaxed"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-primary text-white py-6 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Kirim Kisah Sekarang
                  <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* SUCCESS MODAL */}
      <AlertDialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <AlertDialogContent className="max-w-md p-10 rounded-[3rem] border-none shadow-2xl">
          <AlertDialogHeader className="items-center text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-[#25D366]" />
            </div>
            <AlertDialogTitle className="text-3xl font-serif font-bold text-gray-900">
              Kisah Terkirim!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 text-lg leading-relaxed mt-4">
              Terima kasih, <strong>{submittedName}</strong>. <br />
              Kisah Anda sedang kami proses. Dalam 5 detik, Anda akan diarahkan ke WhatsApp Admin untuk verifikasi jadwal liputan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-10 space-y-4">
             <a
              href={`https://wa.me/6281333277361?text=${encodeURIComponent(`Halo Mekarhub! Saya ${submittedName} baru saja mengisi Form Kisah Mekarhub. Mohon ditindaklanjuti ya 🙏`)}`}
              className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-5 rounded-2xl font-bold shadow-lg shadow-green-200 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <MessageSquare size={20} /> Hubungi Admin Sekarang
            </a>
            <AlertDialogAction onClick={() => setIsSuccessModalOpen(false)} className="w-full bg-transparent text-gray-400 hover:bg-gray-50 border-none shadow-none font-bold">
              Tutup
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </main>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default FormCalonFigur;
