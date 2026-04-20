import { useState } from "react";
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

type YaTidak = "Ya" | "Tidak" | "";

const profilKisahQuestions = [
  {
    key: "q1",
    label:
      "Apakah bisnis/usaha Anda bermula dari rintisan bawah dan punya cerita perjuangan yang berkesan?",
  },
  {
    key: "q2",
    label:
      "Apakah ada keunikan khusus pada produk/layanan Anda yang tidak dimiliki kompetitor?",
  },
  {
    key: "q3",
    label:
      "Apakah saat ini Anda sedang dalam fase ekspansi atau perpindahan lokasi (misal: dari kabupaten ke kota)?",
  },
  {
    key: "q4",
    label:
      "Apakah standar operasional atau kualitas layanan Anda menjadi nilai jual utama yang ingin ditonjolkan?",
  },
  {
    key: "q5",
    label:
      "Apakah bisnis Anda memiliki dampak sosial atau kepedulian khusus terhadap tim dan lingkungan sekitar?",
  },
] as const;

type ProfilKeys = (typeof profilKisahQuestions)[number]["key"];

const FormCalonFigur = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const [form, setForm] = useState({
    // I. Biodata Singkat
    nama: "",
    jabatan: "",
    namaBrand: "",
    mediaSosial: "",
    lokasi: "",
    // II. Profil Kisah
    q1: "" as YaTidak,
    q2: "" as YaTidak,
    q3: "" as YaTidak,
    q4: "" as YaTidak,
    q5: "" as YaTidak,
    // III. Penutup
    pencapaian: "",
  });

  const setAnswer = (key: ProfilKeys, val: YaTidak) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const unanswered = profilKisahQuestions.some((q) => !form[q.key]);
    if (
      !form.nama.trim() ||
      !form.jabatan.trim() ||
      !form.lokasi.trim() ||
      unanswered ||
      !form.pencapaian.trim()
    ) {
      toast({
        title: "Data belum lengkap",
        description:
          "Mohon isi semua field wajib, termasuk semua pertanyaan Ya/Tidak.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("nama", form.nama.trim());
      formData.append("jabatan", form.jabatan.trim());
      formData.append("namaBrand", form.namaBrand.trim());
      formData.append("mediaSosial", form.mediaSosial.trim());
      formData.append("lokasi", form.lokasi.trim());
      formData.append("q1_rintisan", form.q1);
      formData.append("q2_keunikan", form.q2);
      formData.append("q3_ekspansi", form.q3);
      formData.append("q4_standarOp", form.q4);
      formData.append("q5_dampakSosial", form.q5);
      formData.append("pencapaian", form.pencapaian.trim());

      const gsPromise = fetch(
        "https://script.google.com/macros/s/AKfycbyMx0n8F1q8HGJZ_nVzL9XjBxaCtcj2jXI35c6B9VpgwO6-nD2DIbvmkXZZL5-MbDE/exec",
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
        namaBrand: "",
        mediaSosial: "",
        lokasi: "",
        q1: "",
        q2: "",
        q3: "",
        q4: "",
        q5: "",
        pencapaian: "",
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
            Bergabung
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Form Kisah Mekarhub
          </h1>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Punya kisah inspiratif yang layak diceritakan? Isi formulir di
            bawah dan tim Mekarhub akan menghubungi Anda.
          </p>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* ─── Seksi I: Biodata Singkat ─── */}
            <fieldset className="space-y-5">
              <legend className="text-lg font-bold text-foreground border-b border-border pb-2 w-full mb-4">
                I. Biodata Singkat
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
                  Jabatan / Posisi <span className="text-primary">*</span>
                </Label>
                <Input
                  id="jabatan"
                  placeholder="Contoh: Owner, Founder, Direktur, dsb."
                  value={form.jabatan}
                  onChange={(e) =>
                    setForm({ ...form, jabatan: e.target.value })
                  }
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="namaBrand">Nama Brand / Usaha</Label>
                <Input
                  id="namaBrand"
                  placeholder="Nama brand atau usaha Anda"
                  value={form.namaBrand}
                  onChange={(e) =>
                    setForm({ ...form, namaBrand: e.target.value })
                  }
                  maxLength={150}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mediaSosial">Media Sosial</Label>
                <Input
                  id="mediaSosial"
                  placeholder="Contoh: @username atau https://instagram.com/username"
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
                <Input
                  id="lokasi"
                  placeholder="Kota / Kabupaten tempat usaha Anda berada"
                  value={form.lokasi}
                  onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                  maxLength={100}
                  required
                />
              </div>
            </fieldset>

            {/* ─── Seksi II: Profil Kisah ─── */}
            <fieldset className="space-y-6">
              <div className="border-b border-border pb-2 mb-2">
                <legend className="text-lg font-bold text-foreground">
                  II. Profil Kisah
                </legend>
                <p className="text-sm text-muted-foreground mt-1">
                  Pilih jawaban yang paling sesuai dengan kondisi Anda saat ini:
                </p>
              </div>

              {profilKisahQuestions.map((q, idx) => (
                <div
                  key={q.key}
                  className="rounded-lg border border-border bg-muted/30 p-4 space-y-3"
                >
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {idx + 1}. {q.label}{" "}
                    <span className="text-primary">*</span>
                  </p>
                  <div className="flex gap-6">
                    {(["Ya", "Tidak"] as const).map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <input
                          type="radio"
                          name={q.key}
                          value={opt}
                          checked={form[q.key] === opt}
                          onChange={() => setAnswer(q.key, opt)}
                          className="accent-primary w-4 h-4"
                          required
                        />
                        <span
                          className={`text-sm font-medium ${
                            form[q.key] === opt
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </fieldset>

            {/* ─── Seksi III: Penutup ─── */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-bold text-foreground border-b border-border pb-2 w-full mb-4">
                III. Penutup
              </legend>

              <div className="space-y-2">
                <Label htmlFor="pencapaian">
                  Ceritakan sedikit tentang momen atau pencapaian yang paling
                  membuat Anda bangga sejauh ini:{" "}
                  <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Isian singkat sebagai bahan dasar narasi kisah di Mekarhub.
                </p>
                <Textarea
                  id="pencapaian"
                  placeholder="Tulis momen atau pencapaian kebanggaan Anda di sini..."
                  value={form.pencapaian}
                  onChange={(e) =>
                    setForm({ ...form, pencapaian: e.target.value })
                  }
                  maxLength={1000}
                  className="min-h-[150px]"
                  required
                />
                <p className="text-xs text-muted-foreground text-right">
                  {form.pencapaian.length}/1000
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
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-center">
              Kisah Terkirim! 🎉
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base mt-2">
              Terima kasih telah berbagi kisah inspiratif dengan Mekarhub!
              Perjalanan Anda sangat berarti dan tim kami akan segera memproses
              informasi yang telah Anda berikan.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* WhatsApp CTA */}
          <div className="mt-6 px-2">
            <p className="text-sm text-muted-foreground mb-3">
              Informasikan juga ke admin kami melalui WhatsApp agar kisah Anda segera diproses:
            </p>
            <a
              href={`https://wa.me/6281333277361?text=${encodeURIComponent(
                `Halo Mekarhub! Saya ${submittedName} baru saja mengisi Form Kisah Mekarhub. Mohon ditindaklanjuti ya 🙏`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold px-6 py-3 rounded-md transition-colors text-sm"
            >
              {/* WhatsApp icon (inline SVG) */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.114 1.534 5.836L.057 23.5l5.797-1.52A11.93 11.93 0 0 0 12 24c6.628 0 12-5.372 12-12S18.628 0 12 0zm0 21.818a9.796 9.796 0 0 1-5.006-1.375l-.36-.214-3.717.975.99-3.617-.234-.373A9.777 9.777 0 0 1 2.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/>
              </svg>
              Hubungi Admin via WhatsApp
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
