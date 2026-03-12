import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 md:py-32 bg-foreground text-primary-foreground">
      <div className="max-w-4xl mx-auto px-6 text-left reveal-on-scroll">
        <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase mb-4">The Connection</p>
        <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
          Saling terhubung,<br />tumbuh bersama
        </h2>
        <p className="text-primary-foreground/70 text-lg mb-10 max-w-lg font-light leading-relaxed">
          Mari bergabung dalam ekosistem narasi yang membangun warisan digital bermakna.
        </p>
        <a
          href="https://wa.me/6281334841094?text=Halo%20Mekarhub%2C%20saya%20tertarik%20untuk%20mengetahui%20lebih%20lanjut%20tentang%20layanan%20Anda.%20Boleh%20dibantu%3F"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-md font-semibold text-base hover:bg-primary/90 transition-all shadow-xl hover:shadow-primary/20 active:scale-95"
        >
          Hubungi Kami
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    </section>
  );
};

export default CTASection;
