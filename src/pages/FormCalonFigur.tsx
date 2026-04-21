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
import { CheckCircle2 } from "lucide-react";

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
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccessModalOpen, submittedName]);

  const [form, setForm] = useState({
    // I. Biodata
    nama: "",
    jabatan: "",
    whatsapp: "",
    mediaSosial: "",
    lokasi: "",
    // II. Profil
    identitasSpirit: "",
    titikBalik: "",
    keunikanAutentik: "",
    filosofiPelayanan: "",
    dinamikaTerkini: "",
    sisiKemanusiaan: "",
    // III. Penutup
    harapan: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.nama.trim() ||
      !form.jabatan.trim() ||
      !form.whatsapp.trim() ||
      !form.lokasi.trim() ||
      !form.identitasSpirit.trim() ||
      !form.titikBalik.trim() ||
      !form.keunikanAutentik.trim() ||
      !form.filosofiPelayanan.trim() ||
      !form.dinamikaTerkini.trim() ||
      !form.sisiKemanusiaan.trim() ||
      !form.harapan.trim()
    ) {
      toast({
        title: "Data belum lengkap",
        description: "Mohon isi semua field wajib agar kami dapat memproses kisah Anda.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("nama", form.nama.trim());
      formData.append("jabatan", form.jabatan.trim());
      formData.append("whatsapp", form.whatsapp.trim());
      formData.append("mediaSosial", form.mediaSosial.trim());
      formData.append("lokasi", form.lokasi.trim());
      formData.append("identitasSpirit", form.identitasSpirit.trim());
      formData.append("titikBalik", form.titikBalik.trim());
      formData.append("keunikanAutentik", form.keunikanAutentik.trim());
      formData.append("filosofiPelayanan", form.filosofiPelayanan.trim());
      formData.append("dinamikaTerkini", form.dinamikaTerkini.trim());
      formData.append("sisiKemanusiaan", form.sisiKemanusiaan.trim());
      formData.append("harapan", form.harapan.trim());

      const gsPromise = fetch(
        "https://script.google.com/macros/s/AKfycbyI0lzKRhO5OrJtUrQIBmxgdL3pRkM-DA_EpTlzBMHEaMRulGLwVOl0UKm4CdwdgnsD/exec",
        {
          method: "POST",
          mode: "no-cors",
          body: formData,
        }
      );

      const notifyPromise = fetch("/api/notify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      await Promise.allSettled([gsPromise, notifyPromise]);

      setSubmittedName(form.nama.trim());
      setIsSuccessModalOpen(true);
      setForm({
        nama: "",
        jabatan: "",
        whatsapp: "",
        mediaSosial: "",
        lokasi: "",
        identitasSpirit: "",
        titikBalik: "",
        keunikanAutentik: "",
        filosofiPelayanan: "",
        dinamikaTerkini: "",
        sisiKemanusiaan: "",
        harapan: "",
      });
    } catch {
      toast({
        title: "Gagal Mengirim",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-28 pb-24 bg-background">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase mb-4">
            Kolaborasi
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Tumbuh dan Terhubung <br /> Bersama Mekarhub
          </h1>
          <p className="text-muted-foreground mb-12 text-lg leading-relaxed">
            Punya cerita inspiratif yang ingin diceritakan? Isi formulir di bawah. Tim Mekarhub akan mewujudkan keinginan Anda.
          </p>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* ─── Seksi I: Biodata ─── */}
            <fieldset className="space-y-6">
              <legend className="text-lg font-bold text-foreground border-b border-border pb-2 w-full mb-4">
                I. Biodata
              </legend>

              <div className="space-y-2">
                <Label htmlFor="nama">
                  Nama Lengkap <span className="text-primary">*</span>
                </Label>
                <Input
                  id="nama"
                  placeholder="Masukkan nama lengkap"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jabatan">
                  Jabatan atau Posisi <span className="text-primary">*</span>
                </Label>
                <Input
                  id="jabatan"
                  placeholder="Contoh: Owner, Founder, dsb."
                  value={form.jabatan}
                  onChange={(e) =>
                    setForm({ ...form, jabatan: e.target.value })
                  }
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">
                  No. WhatsApp atau HP Aktif <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">Digunakan untuk koordinasi jadwal liputan.</p>
                <Input
                  id="whatsapp"
                  placeholder="Contoh: 081234567890"
                  value={form.whatsapp}
                  onChange={(e) =>
                    setForm({ ...form, whatsapp: e.target.value })
                  }
                  maxLength={20}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mediaSosial">Media Sosial</Label>
                <p className="text-xs text-muted-foreground">Cantumkan Username Instagram atau TikTok.</p>
                <Input
                  id="mediaSosial"
                  placeholder="Contoh: @username"
                  value={form.mediaSosial}
                  onChange={(e) =>
                    setForm({ ...form, mediaSosial: e.target.value })
                  }
                  maxLength={255}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lokasi">
                  Lokasi <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">Cantumkan tempat visit atau link Google Maps.</p>
                <Input
                  id="lokasi"
                  placeholder="Masukkan lokasi atau link Maps"
                  value={form.lokasi}
                  onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                  maxLength={255}
                  required
                />
              </div>
            </fieldset>

            {/* ─── Seksi II: Profil ─── */}
            <fieldset className="space-y-8">
              <div className="border-b border-border pb-2 mb-2">
                <legend className="text-lg font-bold text-foreground">
                  II. Profil
                </legend>
                <p className="text-sm text-muted-foreground mt-1">
                  Isian ini menjadi fondasi bagi tim kreatif dalam menyusun narasi liputan Anda.
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="identitasSpirit">
                  Identitas dan Spirit <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">Tuliskan nama usaha Anda. Sertakan satu kata yang mewakili nyawa atau semangat utama usaha Anda.</p>
                <Textarea
                  id="identitasSpirit"
                  value={form.identitasSpirit}
                  onChange={(e) => setForm({ ...form, identitasSpirit: e.target.value })}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="titikBalik">
                  Momen Titik Balik <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">Selain cerita awal merintis, momen kunci apa yang paling mengubah arah usaha hingga menjadi seperti sekarang?</p>
                <Textarea
                  id="titikBalik"
                  value={form.titikBalik}
                  onChange={(e) => setForm({ ...form, titikBalik: e.target.value })}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="keunikanAutentik">
                  Keunikan Autentik <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">Sebutkan satu hal istimewa yang hanya ada di tempat Anda dan tidak ditemukan di kompetitor lain.</p>
                <Textarea
                  id="keunikanAutentik"
                  value={form.keunikanAutentik}
                  onChange={(e) => setForm({ ...form, keunikanAutentik: e.target.value })}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="filosofiPelayanan">
                  Filosofi Pelayanan <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">Nilai dasar apa yang Anda tekankan kepada tim dalam melayani customer?</p>
                <Textarea
                  id="filosofiPelayanan"
                  value={form.filosofiPelayanan}
                  onChange={(e) => setForm({ ...form, filosofiPelayanan: e.target.value })}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="dinamikaTerkini">
                  Dinamika Terkini <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">Apa rencana besar yang Anda siapkan dalam waktu dekat? Contohnya ekspansi, menu baru, atau lokasi baru.</p>
                <Textarea
                  id="dinamikaTerkini"
                  value={form.dinamikaTerkini}
                  onChange={(e) => setForm({ ...form, dinamikaTerkini: e.target.value })}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="sisiKemanusiaan">
                  Sisi Kemanusiaan <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">Bagaimana kehadiran usaha ini berdampak bagi kehidupan tim atau orang di sekitar Anda?</p>
                <Textarea
                  id="sisiKemanusiaan"
                  value={form.sisiKemanusiaan}
                  onChange={(e) => setForm({ ...form, sisiKemanusiaan: e.target.value })}
                  className="min-h-[100px]"
                  required
                />
              </div>
            </fieldset>

            {/* ─── Seksi III: Penutup ─── */}
            <fieldset className="space-y-6">
              <legend className="text-lg font-bold text-foreground border-b border-border pb-2 w-full mb-4">
                III. Penutup
              </legend>

              <div className="space-y-2">
                <Label htmlFor="harapan">
                  Harapan <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Sampaikan pesan utama Anda melalui konten ini. Pastikan pesan tersebut membuat masyarakat mengenal sekaligus merasa terhubung dengan kisah Anda.
                </p>
                <Textarea
                  id="harapan"
                  placeholder="Tulis harapan Anda di sini..."
                  value={form.harapan}
                  onChange={(e) =>
                    setForm({ ...form, harapan: e.target.value })
                  }
                  maxLength={1000}
                  className="min-h-[150px]"
                  required
                />
                <p className="text-xs text-muted-foreground text-right">
                  {form.harapan.length}/1000
                </p>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-md font-semibold text-base hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Mengirim..." : "Kirim Kisah"}
            </button>
          </form>
        </div>
      </section>

      {/* Pop Up Success Modal */}
      <AlertDialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <AlertDialogContent className="max-w-md text-center">
          <AlertDialogHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#25D366]" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-center">
              Berhasil Terkirim!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base mt-2">
              Terima kasih telah bergabung dalam profil sosok Mekarhub. Data Anda telah kami terima dengan baik.
              <br /><br />
              Anda akan diarahkan otomatis ke WhatsApp Admin dalam 3 detik untuk mempercepat proses verifikasi. Jika halaman tidak berpindah, silakan klik tombol di bawah ini.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* WhatsApp CTA */}
          <div className="mt-6 px-2">
            <a
              href={`https://wa.me/6281333277361?text=${encodeURIComponent(
                `Halo Mekarhub! Saya ${submittedName} baru saja mengisi Form Kisah Mekarhub. Mohon ditindaklanjuti ya 🙏`
              )}`}
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold px-6 py-3 rounded-md transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.114 1.534 5.836L.057 23.5l5.797-1.52A11.93 11.93 0 0 0 12 24c6.628 0 12-5.372 12-12S18.628 0 12 0zm0 21.818a9.796 9.796 0 0 1-5.006-1.375l-.36-.214-3.717.975.99-3.617-.234-.373A9.777 9.777 0 0 1 2.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z" />
              </svg>
              Hubungi Admin Mekarhub
            </a>
          </div>

          <AlertDialogFooter className="sm:justify-center mt-4">
            <AlertDialogAction
              onClick={() => setIsSuccessModalOpen(false)}
              className="bg-muted hover:bg-muted/80 text-foreground font-medium px-8 py-2"
            >
              Kembali
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </main>
  );
};

export default FormCalonFigur;
