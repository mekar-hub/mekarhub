import { useParams, Link } from "react-router-dom";
import { figures } from "@/data/figures";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const FigureArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const figure = figures.find((f) => f.slug === slug);

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

      {/* Hero Image */}
      <section className="relative pt-20">
        <div className="w-full h-[50vh] md:h-[60vh] bg-secondary flex items-center justify-center">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-muted flex items-center justify-center">
            <span className="text-4xl md:text-5xl font-bold text-muted-foreground">{initials}</span>
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
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
            {figure.category}
          </span>
          <span className="text-sm text-muted-foreground">
            {format(new Date(figure.publishedDate), "d MMMM yyyy", { locale: id })}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-2">
          {figure.name}
        </h1>
        <p className="text-lg text-muted-foreground mb-10">{figure.title}</p>

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
