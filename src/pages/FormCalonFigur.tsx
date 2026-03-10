import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const kategoriOptions = ["UMKM", "Komunitas", "Profesional", "Pendidikan", "Sosial", "Lainnya"];

const FormCalonFigur = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    kategori: "",
    linkProfil: "",
    cerita: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.kategori || !form.cerita.trim()) {
      toast({ title: "Data belum lengkap", description: "Mohon isi semua field yang wajib.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxWKKBQxnUg3FHtwWw2H56fGp3JyHS3bNlHBj006v3yFvYu4cN5JD_TeIJBf52VMUJI0g/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: form.nama.trim(),
            kategori: form.kategori,
            linkProfil: form.linkProfil.trim(),
            cerita: form.cerita.trim(),
          }),
        }
      );
      toast({ title: "Kisah Terkirim! 🎉", description: "Terima kasih, kisahmu sudah kami terima!" });
      setForm({ nama: "", kategori: "", linkProfil: "", cerita: "" });
    } catch {
      toast({ title: "Gagal Mengirim", description: "Terjadi kesalahan. Silakan coba lagi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-28 pb-24 bg-background">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase mb-4">Bergabung</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Kolaborasi Kisah</h1>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Punya kisah inspiratif yang layak diceritakan? Isi formulir di bawah dan tim Mekarhub akan menghubungi Anda.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap *</Label>
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
              <Label htmlFor="kategori">Kategori *</Label>
              <Select value={form.kategori} onValueChange={(val) => setForm({ ...form, kategori: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {kategoriOptions.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link Profil / Media Sosial</Label>
              <Input
                id="link"
                placeholder="https://instagram.com/username"
                value={form.linkProfil}
                onChange={(e) => setForm({ ...form, linkProfil: e.target.value })}
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cerita">Cerita Singkat / Alasan Ingin Diliput *</Label>
              <Textarea
                id="cerita"
                placeholder="Ceritakan kisah Anda atau alasan mengapa Anda ingin diliput oleh Mekarhub..."
                value={form.cerita}
                onChange={(e) => setForm({ ...form, cerita: e.target.value })}
                maxLength={1000}
                className="min-h-[150px]"
                required
              />
              <p className="text-xs text-muted-foreground text-right">{form.cerita.length}/1000</p>
            </div>

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
      <Footer />
    </main>
  );
};

export default FormCalonFigur;
