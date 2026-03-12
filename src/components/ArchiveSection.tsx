import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { defaultFigures, fetchFiguresFromSheet, type Figure, SHEET_CSV_URL } from "@/data/figures";

const categories = ["All Figures", "Entrepreneur", "Social Leader", "Educator"] as const;

const FigureCard = ({ figure, index }: { figure: Figure, index: number }) => {
  const initials = figure.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const [error, setError] = useState(false);

  return (
    <Link
      to={`/kisah/${figure.slug}`}
      className="group block rounded-lg overflow-hidden bg-card border shadow-sm hover:shadow-lg transition-all duration-500 reveal-on-scroll"
      style={{ transitionDelay: `${(index % 3 + 1) * 100}ms` }}
    >
      {/* Portrait placeholder */}
      <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
        {figure.imageUrl && !error ? (
          <img 
            src={figure.imageUrl} 
            alt={figure.name} 
            onError={() => setError(true)}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">{initials}</span>
            </div>
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-primary/90 text-primary-foreground text-xs font-medium px-3 py-1 rounded-full shadow-md">
            {figure.category}
          </span>
        </div>
      </div>
      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{figure.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{figure.title}</p>
      </div>
    </Link>
  );
};

const ArchiveSection = () => {
  const [activeFilter, setActiveFilter] = useState<string>("All Figures");
  const [showAll, setShowAll] = useState(false);
  const [figures, setFigures] = useState<Figure[]>(defaultFigures);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!SHEET_CSV_URL) return;

    setIsLoading(true);
    fetchFiguresFromSheet(SHEET_CSV_URL)
      .then((data) => {
        if (data && data.length > 0) {
          setFigures(data);
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil data dari Google Sheets:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filtered = activeFilter === "All Figures"
    ? figures
    : figures.filter((f) => f.category === activeFilter);

  const featuredFiltered = filtered.filter((f) => f.featured);
  const remainingFiltered = filtered.filter((f) => !f.featured);

  const displayFigures = showAll ? [...featuredFiltered, ...remainingFiltered] : featuredFiltered;

  return (
    <section id="archive" className="py-24 md:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="reveal-on-scroll mb-10">
          <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase mb-4">Kisah Mereka</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">The Archive</h2>
        </div>

        {isLoading && (
          <p className="text-muted-foreground mb-4 animate-pulse">Memuat data dari Google Sheets...</p>
        )}

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
          {displayFigures.map((figure, index) => (
            <FigureCard key={figure.id} figure={figure} index={index} />
          ))}
        </div>

        {/* Show more */}
        {!showAll && remainingFiltered.length > 0 && (
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
