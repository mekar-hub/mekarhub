import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 md:py-32 bg-foreground text-primary-foreground">
      <div className="max-w-4xl mx-auto px-6 text-left">
        <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase mb-4">The Connection</p>
        <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
          Saling terhubung,<br />tumbuh bersama
        </h2>
        <p className="text-primary-foreground/70 text-lg mb-10 max-w-lg font-light leading-relaxed">
          Mari bergabung dalam ekosistem narasi yang membangun warisan digital bermakna.
        </p>
        <Link
          to="/form-calon-figur"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-md font-semibold text-base hover:bg-primary/90 transition-colors"
        >
          Form Calon Figur
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
