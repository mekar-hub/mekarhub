import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { defaultFigures, fetchAllFigures, type Figure, SHEET_CSV_URL, resolveImageUrl } from "@/data/figures";
import logo from "@/assets/Logo_Mekar_Hub_1.png";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const categories = ["All Figures", "Entrepreneur", "Social Leader", "Educator"] as const;

const FigureSkeleton = () => (
  <div className="rounded-lg overflow-hidden bg-card border shadow-sm animate-pulse">
    <div className="aspect-[3/4] bg-muted/40 flex items-center justify-center p-8">
      <img src={logo} className="w-1/2 opacity-10 grayscale" alt="Loading" />
    </div>
    <div className="p-4 space-y-3">
      <div className="h-5 bg-muted/60 rounded w-3/4"></div>
      <div className="h-4 bg-muted/40 rounded w-1/2"></div>
    </div>
  </div>
);

const FigureCard = ({ figure, index }: { figure: Figure, index: number }) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | undefined>(undefined);
  const [isResolving, setIsResolving] = useState(!!figure.imageUrl);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (figure.imageUrl) {
      resolveImageUrl(figure.imageUrl).then(url => {
        setResolvedUrl(url);
        setIsResolving(false);
      }).catch(() => {
        setIsResolving(false);
        setError(true);
      });
    } else {
      setIsResolving(false);
    }
  }, [figure.imageUrl]);

  return (
    <Link
      to={`/kisah/${figure.slug}`}
      className="group block rounded-lg overflow-hidden bg-card border shadow-sm hover:shadow-lg transition-all duration-500 reveal-on-scroll"
      style={{ transitionDelay: `${(index % 3 + 1) * 100}ms` }}
    >
      {/* Portrait container */}
      <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
        {isResolving ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20 animate-pulse">
            <img src={logo} className="w-20 opacity-10 grayscale" alt="Resolving" />
          </div>
        ) : resolvedUrl && !error ? (
          <img 
            src={resolvedUrl} 
            alt={figure.name} 
            onError={() => setError(true)}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-8 bg-muted/20">
            <img 
              src={logo} 
              alt="Mekarhub Logo Fallback" 
              className="w-full h-full object-contain opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-500"
            />
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
            {figure.category}
          </span>
        </div>
      </div>
      {/* Info - High Priority Text */}
      <div className="p-4 border-t">
        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{figure.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 font-light">{figure.title}</p>
      </div>
    </Link>
  );
};

const ArchiveSection = () => {
  const [activeFilter, setActiveFilter] = useState<string>("All Figures");
  // showAll false by default to limit initial display to 6 figures
  const [showAll, setShowAll] = useState(false);
  const [figures, setFigures] = useState<Figure[]>(defaultFigures);
  const [isLoading, setIsLoading] = useState(false);

  // Re-scan for reveal-on-scroll elements whenever figures or filter changes
  useScrollReveal([figures, activeFilter, showAll]);

  useEffect(() => {
    if (!SHEET_CSV_URL) return;

    setIsLoading(true);
    fetchAllFigures()
      .then((data) => {
        if (data && data.length > 0) {
          setFigures(data);
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil data:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Case-insensitive filtering and sorting (Featured first)
  const filtered = (activeFilter === "All Figures"
    ? figures
    : figures.filter((f) => f.category.toLowerCase() === activeFilter.toLowerCase())
  ).sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));

  // Logic: display 6 figures initially if showAll is false, otherwise show everything in the current filter.
  const displayFigures = showAll ? filtered : filtered.slice(0, 6);
  const hasMore = filtered.length > displayFigures.length;

  return (
    <section id="archive" className="py-24 md:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="reveal-on-scroll mb-10">
          <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase mb-4">Kisah Mereka</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">The Archive</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-12 reveal-on-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveFilter(cat); setShowAll(false); }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === cat
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                  : "bg-card text-muted-foreground border hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <FigureSkeleton key={i} />)
          ) : displayFigures.length > 0 ? (
            displayFigures.map((figure, index) => (
              <FigureCard key={`${figure.id}-${figure.slug}`} figure={figure} index={index} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted-foreground italic">Tidak ada kisah ditemukan untuk kategori ini.</p>
            </div>
          )}
        </div>

        {/* Show more button logic */}
        {!isLoading && hasMore && (
          <div className="text-center mt-16 reveal-on-scroll">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 border-2 border-primary text-primary px-10 py-4 rounded-md font-bold text-sm hover:bg-primary hover:text-primary-foreground hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
            >
              Lihat Seluruh Kisah
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce-slow"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ArchiveSection;
