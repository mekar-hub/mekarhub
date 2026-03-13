import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { defaultFigures, fetchFiguresFromSheet, type Figure, SHEET_CSV_URL, resolveImageUrl } from "@/data/figures";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Helmet } from "react-helmet-async";
import logo from "@/assets/Logo_Mekar_Hub_1.png";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useToast } from "@/hooks/use-toast";
import { Facebook, MessageCircle, Copy, Share2 } from "lucide-react";

const FigureArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const [figure, setFigure] = useState<Figure | null>(
    defaultFigures.find((f) => f.slug === slug) || null
  );

  useScrollReveal([figure]);
  const { toast } = useToast();
  const [resolvedHeroUrl, setResolvedHeroUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    if (figure?.imageUrl) {
      resolveImageUrl(figure.imageUrl).then(setResolvedHeroUrl).catch(() => setImgError(true));
    }
  }, [figure?.imageUrl]);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.pageYOffset);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const initials = figure?.name ? figure.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() : "MH";

  // Fallback image logic
  const ogImage = resolvedHeroUrl && !imgError ? resolvedHeroUrl : logo;
  const displayTitle = figure ? `${figure.name} - Mekarhub` : "Mekarhub";
  const metaDescription = figure 
    ? (figure.story.length > 160 ? `${figure.story.substring(0, 157)}...` : figure.story)
    : "Mekarhub menyajikan kisah inspiratif dari berbagai sosok penggerak di Indonesia.";

  const currentUrl = window.location.href;

  const handleShareWA = () => {
    const text = `Baca kisah ${figure?.name} di Mekarhub! Cek selengkapnya di sini: ${currentUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareFB = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      toast({
        title: "Link berhasil disalin!",
        description: "Tautan artikel telah tersimpan di clipboard Anda.",
        duration: 3000,
      });
    });
  };

  return (
    <main className="min-h-screen">
      <Helmet>
        <title>{displayTitle}</title>
        <meta name="description" content={metaDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={displayTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={displayTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <Navbar />

      {isLoading && !figure ? (
        <div className="pt-32 pb-24 text-center max-w-4xl mx-auto px-6">
          <p className="text-muted-foreground animate-pulse">Memuat artikel...</p>
        </div>
      ) : !figure ? (
        <div className="pt-32 pb-24 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-foreground mb-4">Artikel tidak ditemukan</h1>
          <Link to="/#archive" className="text-primary font-semibold hover:underline">
            ← Kembali ke Kisah Mereka
          </Link>
        </div>
      ) : (
        <>

      {/* Hero Image — full photo with Parallax */}
      <section className="relative pt-20 overflow-hidden">
        <div className="relative w-full min-h-[50vh] md:min-h-[70vh] lg:min-h-[80vh] bg-[#1a1a1a] flex items-center justify-center">
          <div 
            className="absolute inset-0 z-0 transition-transform duration-100 ease-out"
            style={{ transform: `translateY(${offsetY * 0.4}px)` }}
          >
            {resolvedHeroUrl && !imgError ? (
              <img 
                src={resolvedHeroUrl} 
                alt={figure.name} 
                onError={() => setImgError(true)}
                className="w-full h-full object-cover grayscale opacity-40 scale-110"
              />
            ) : (
              <div className="w-full h-full bg-muted/10" />
            )}
          </div>

          {/* Featured Portrait (Stays centered, optional slight parallax) */}
          <div 
            className="relative z-10 p-6 flex flex-col items-center reveal-on-scroll"
            style={{ transform: `translateY(${offsetY * -0.1}px)` }}
          >
            {resolvedHeroUrl && !imgError ? (
              <img 
                src={resolvedHeroUrl} 
                alt={figure.name} 
                onError={() => setImgError(true)}
                className="w-auto h-auto max-w-[90%] max-h-[60vh] md:max-h-[70vh] shadow-2xl rounded-sm object-contain grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-muted/20 flex items-center justify-center border border-white/10 shadow-xl backdrop-blur-sm">
                <span className="text-4xl md:text-5xl font-bold text-white/60">{initials}</span>
              </div>
            )}
          </div>

          {/* Gradient overlay at the bottom for name overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none" />

          {/* Name & title overlay at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-30 px-6 pb-12 md:pb-16 lg:pb-20 reveal-on-scroll transition-all duration-1000" style={{ transitionDelay: '300ms' }}>
            <div className="max-w-5xl mx-auto text-center md:text-left">
              <span className="inline-block bg-primary px-3 py-1 rounded-full text-[10px] md:text-xs font-bold text-white uppercase tracking-widest mb-4 shadow-lg">
                {figure.category}
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
                {figure.name}
              </h1>
              <p className="text-base md:text-xl text-white/70 mt-2 md:mt-4 max-w-2xl font-light drop-shadow-lg">
                {figure.title}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 md:px-8 py-20">
        {/* Story Content */}
        <div className="reveal-on-scroll" style={{ transitionDelay: '200ms' }}>
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/60 uppercase tracking-widest mb-10">
            <span className="w-8 h-[1px] bg-muted-foreground/30" />
            <span>
              Dibagikan pada {figure.publishedDate && !isNaN(new Date(figure.publishedDate).getTime()) 
                ? format(new Date(figure.publishedDate), "d MMMM yyyy", { locale: id })
                : "Baru-baru ini"}
            </span>
          </div>

          <div className="prose prose-lg md:prose-xl max-w-none text-foreground/80 leading-relaxed font-light 
            prose-p:text-justify prose-p:hyphens-auto prose-p:mb-6 
            prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:italic prose-blockquote:rounded-r-lg
            first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left">
            {figure.story.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="mt-12 flex justify-center md:justify-start">
            <Link
              to="/#archive"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all hover:-translate-x-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Kembali ke Kisah Mereka
            </Link>
          </div>
        </div>

        {/* Share Story Section */}
        <div className="mt-16 reveal-on-scroll" style={{ transitionDelay: '300ms' }}>
          <div className="flex flex-col items-center md:items-start border-t pt-10">
            <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-primary/80 uppercase tracking-widest">
              <Share2 size={16} />
              <span>Bagikan Kisah Inspiratif Ini</span>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button
                onClick={handleShareWA}
                className="group flex items-center gap-3 px-6 py-3 rounded-full border border-primary/10 bg-primary/5 hover:bg-[#25D366] hover:border-[#25D366] hover:text-white transition-all duration-300 active:scale-95"
                title="Bagikan ke WhatsApp"
              >
                <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">WhatsApp</span>
              </button>
              
              <button
                onClick={handleShareFB}
                className="group flex items-center gap-3 px-6 py-3 rounded-full border border-primary/10 bg-primary/5 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white transition-all duration-300 active:scale-95"
                title="Bagikan ke Facebook"
              >
                <Facebook size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Facebook</span>
              </button>
              
              <button
                onClick={handleCopyLink}
                className="group flex items-center gap-3 px-6 py-3 rounded-full border border-primary/10 bg-primary/5 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 active:scale-95"
                title="Salin Tautan"
              >
                <Copy size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Salin Link</span>
              </button>
            </div>
          </div>
        </div>

        {/* Social link & Conclusion */}
        <div className="mt-20 pt-12 border-t reveal-on-scroll" style={{ transitionDelay: '400ms' }}>
          <p className="text-sm text-muted-foreground mb-6 italic text-center md:text-left">
            Ingin terhubung lebih jauh dengan {figure.name.split(' ')[0]}? 
          </p>
          <div className="flex justify-center md:justify-start">
            <a
              href={figure.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-card border-2 border-primary/20 px-8 py-4 rounded-full text-primary font-bold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-lg hover:shadow-primary/20 active:scale-95"
            >
              Ikuti di Media Sosial
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" height="20" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </div>
      </article>
        </>
      )}

      <Footer />
    </main>
  );
};

export default FigureArticle;
