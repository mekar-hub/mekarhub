import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { defaultFigures, fetchFiguresFromSheet, type Figure, SHEET_CSV_URL } from "@/data/figures";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const FigureArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const [figure, setFigure] = useState<Figure | null>(
    defaultFigures.find((f) => f.slug === slug) || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!SHEET_CSV_URL) return;
    
    setIsLoading(true);
    fetchFiguresFromSheet(SHEET_CSV_URL)
      .then((data) => {
        const found = data.find((f) => f.slug === slug);
        if (found) {
          setFigure(found);
          setImgError(false); // Reset error if we get new data
        }
      })
      .catch((err) => console.error("Gagal mengambil data dari Google Sheets:", err))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading && !figure) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-24 text-center max-w-4xl mx-auto px-6">
          <p className="text-muted-foreground animate-pulse">Memuat artikel...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!figure) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-24 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-foreground mb-4">Artikel tidak ditemukan</h1>
          <Link to="/#archive" className="text-primary font-semibold hover:underline">
            ← Kembali ke Kisah Mereka
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const initials = figure.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Image — full photo, no crop */}
      <section className="relative pt-20">
        <div className="relative w-full min-h-[50vh] md:min-h-[70vh] lg:min-h-[80vh] bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
          {figure.imageUrl && !imgError ? (
            <img 
              src={figure.imageUrl} 
              alt={figure.name} 
              onError={() => setImgError(true)}
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain grayscale hover:grayscale-0 transition-all duration-700 z-10"
            />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-muted/20 flex items-center justify-center z-10">
              <span className="text-4xl md:text-5xl font-bold text-white/60">{initials}</span>
            </div>
          )}

          {/* Gradient overlay at the bottom for name overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20 pointer-events-none" />

          {/* Name & title overlay at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-30 px-6 pb-8 md:pb-12 lg:pb-16">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                {figure.name}
              </h1>
              <p className="text-sm md:text-lg text-white/80 mt-1 md:mt-2 drop-shadow-md">
                {figure.title}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* Back button */}
        <Link
          to="/#archive"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Kembali ke Kisah Mereka
        </Link>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
            {figure.category}
          </span>
          <span className="text-sm text-muted-foreground">
            {format(new Date(figure.publishedDate), "d MMMM yyyy", { locale: id })}
          </span>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed">
          <p>{figure.story}</p>
        </div>

        {/* Social link */}
        <div className="mt-12 pt-8 border-t">
          <a
            href={figure.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Kunjungi Profil
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </article>

      <Footer />
    </main>
  );
};

export default FigureArticle;
