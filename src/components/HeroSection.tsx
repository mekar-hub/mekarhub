import heroBg from "@/assets/hero-bg.jpg";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.pageYOffset);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with Parallax */}
      <div 
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${offsetY * 0.5}px)` }}
      >
        <img src={heroBg} alt="" className="w-full h-full object-cover scale-110" />
        <div className="absolute inset-0 bg-foreground/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-32 text-center pointer-events-none">
        <div className="reveal-on-scroll">
          <p className="text-primary-foreground/70 text-sm font-medium tracking-[0.3em] uppercase mb-4">
            Digital Legacy Hub
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground leading-[1.1] mb-6">
            tumbuh &<br />terhubung
          </h1>
          <p className="text-primary-foreground/80 text-lg md:text-xl max-w-xl mx-auto mb-10 font-light leading-relaxed">
            Ruang narasi bagi manusia yang tumbuh dengan integritas
          </p>
          <a
            href="/kolaborasi-kisah"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-md font-semibold text-base hover:bg-primary/90 transition-all pointer-events-auto shadow-xl hover:shadow-primary/20 active:scale-95"
          >
            Kolaborasi Kisah
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
