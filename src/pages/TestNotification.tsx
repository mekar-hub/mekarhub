import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, Send, AlertTriangle } from "lucide-react";

const TestNotification = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleTestEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: "Tester Mekarhub",
          noWa: "081234567890",
          kategori: "Testing",
          linkProfil: "https://mekarhub.id",
          cerita: "Ini adalah pesan percobaan dari halaman Testing Notification.",
        }),
      });

      if (response.ok) {
        toast({
          title: "Berhasil!",
          description: "Notifikasi email percobaan telah dikirim ke mekarhub@gmail.com",
        });
      } else {
        const data = await response.json();
        throw new Error(data.message || "Gagal mengirim email");
      }
    } catch (error: any) {
      toast({
        title: "Gagal Mengirim",
        description: error.message || "Pastikan Anda menjalankan dengan 'vercel dev' untuk mengetes API lokal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-24 bg-background">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Test Notification System</h1>
          <p className="text-muted-foreground mb-8">
            Klik tombol di bawah untuk mengirim email percobaan ke <strong>mekarhub@gmail.com</strong>. 
            Ini akan menguji serverless function di <code>api/notify-admin.js</code>.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900">Catatan untuk Local Development:</p>
                <p className="text-xs text-amber-800 mt-1">
                  Karena menggunakan Vercel Serverless Function, tes ini akan berjalan di <strong>Production (Domain)</strong>. 
                  Jika ingin mengetes di local, gunakan perintah <code>vercel dev</code> bukannya <code>npm run dev</code>.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleTestEmail}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Mengirim..." : (
              <>
                <Send size={18} />
                Kirim Email Percobaan
              </>
            )}
          </button>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default TestNotification;
