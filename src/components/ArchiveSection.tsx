import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { defaultFigures, fetchAllFigures, type Figure, resolveImageUrl, safeText } from "@/data/figures";
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
  const imageUrl = safeText(figure.imageUrl);
  const name = safeText(figure.name, "Kisah Mekarhub");
  const title = safeText(figure.title);
  const category = safeText(figure.category, "Kisah");
  const slug = safeText(figure.slug);
  const [isResolving, setIsResolving] = useState(!!imageUrl);
  const [error, setError] = useState(false);

  useEffect(() => {
    setResolvedUrl(undefined);
    setError(false);

    if (imageUrl) {
      setIsResolving(true);
      resolveImageUrl(imageUrl).then(url => {
        setResolvedUrl(url);
        setIsResolving(false);
      }).catch(() => {
        setIsResolving(false);
        setError(true);
      });
    } else {
      setIsResolving(false);
    }
  }, [imageUrl]);

  return (
    <Link
      to={slug ? `/kisah/${encodeURIComponent(slug)}` : "/kisah"}
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
            alt={name} 
            onError={() => setError(true)}
            referrerPolicy="no-referrer"
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
            {category}
          </span>
        </div>
      </div>
      {/* Info - High Priority Text */}
      <div className="p-4 border-t">
        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 font-light">{title || "Kisah Mekarhub"}</p>
      </div>
    </Link>
  );
};

const ArchiveSection = () => {
  const [activeFilter, setActiveFilter] = useState<string>("All Figures");
  const [searchQuery, setSearchQuery] = useState("");
  // showAll false by default to limit initial display to 6 figures
  const [showAll, setShowAll] = useState(false);
  const [figures, setFigures] = useState<Figure[]>(defaultFigures);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Re-scan for reveal-on-scroll elements whenever figures or filter changes
  useScrollReveal([figures, activeFilter, searchQuery, showAll]);

  useEffect(() => {
    setIsLoading(true);
    setFetchError(null);
    fetchAllFigures()
      .then((data) => {
        if (data && data.length > 0) {
          setFigures(data);
        } else {
          setFigures(defaultFigures);
          setFetchError("Arsip terbaru sedang tidak tersedia. Menampilkan kisah tersimpan.");
        }
      })
      .catch(() => {
        setFigures(defaultFigures);
        setFetchError("Arsip terbaru sedang tidak tersedia. Menampilkan kisah tersimpan.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const normalizedSearch = safeText(searchQuery).toLowerCase();
  const matchesSearch = (figure: Figure) => {
    if (!normalizedSearch) return true;
    const searchableText = [
      figure.name,
      figure.title,
      figure.category,
      figure.story,
      figure.slug,
      figure.identitasSpirit,
      figure.titikBalik,
      figure.keunikanAutentik,
      figure.filosofiPelayanan,
      figure.dinamikaTerkini,
      figure.sisiKemanusiaan,
      figure.harapan,
    ].map((value) => safeText(value)).filter(Boolean).join(" ").toLowerCase();

    return searchableText.includes(normalizedSearch);
  };

  // Case-insensitive filtering and sorting (Featured first)
  const filtered = (activeFilter === "All Figures"
    ? figures
    : figures.filter((f) => safeText(f.category).toLowerCase() === activeFilter.toLowerCase())
  ).filter(matchesSearch).sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));

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

        {fetchError && (
          <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-muted-foreground">
            {fetchError}
          </div>
        )}

        {/* Filters */}
        <div className="mb-12 reveal-on-scroll flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-xl md:flex-1">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowAll(false); }}
              placeholder="Cari kisah mereka..."
              aria-label="Cari kisah mereka"
              className="w-full rounded-full border border-border bg-card px-5 py-3.5 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <div className="relative w-full md:w-64">
            <select
              value={activeFilter}
              onChange={(e) => { setActiveFilter(e.target.value); setShowAll(false); }}
              aria-label="Filter kategori kisah"
              className="w-full appearance-none rounded-full border border-border bg-card px-5 py-3.5 pr-10 text-sm font-medium text-foreground shadow-sm outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <FigureSkeleton key={i} />)
          ) : displayFigures.length > 0 ? (
            displayFigures.map((figure, index) => (
              <FigureCard key={`${figure.id}-${safeText(figure.slug, String(index))}`} figure={figure} index={index} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted-foreground italic">
                {normalizedSearch ? "Tidak ada kisah yang sesuai dengan pencarian." : "Tidak ada kisah ditemukan untuk kategori ini."}
              </p>
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
