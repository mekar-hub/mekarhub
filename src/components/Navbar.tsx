import logoRed from "@/assets/Logo_Mekar_Hub_1.png";
import logoPutih from "@/assets/Logo_Mekar_Hub_1_Putih.png";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomepage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showWhiteLogo = isHomepage && !isScrolled;

  const scrollToTop = (e: React.MouseEvent) => {
    if (isHomepage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md border-b shadow-sm py-2" 
          : isHomepage ? "bg-transparent border-transparent py-4" : "bg-white border-b py-2"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <Link 
          to="/" 
          onClick={scrollToTop}
          className="relative transition-transform duration-500 hover:scale-105 flex items-center"
        >
          <div className={`relative ${isScrolled || !isHomepage ? "h-20 md:h-28" : "h-24 md:h-36"} aspect-auto transition-all duration-500`}>
            {/* White Logo (Cross-fade) */}
            <img 
              src={logoPutih} 
              alt="Mekarhub" 
              className={`absolute inset-0 h-full w-auto object-contain transition-opacity duration-500 ${
                showWhiteLogo ? "opacity-100" : "opacity-0 invisible"
              }`} 
            />
            {/* Red Logo (Original / Solid) */}
            <img 
              src={logoRed} 
              alt="Mekarhub" 
              className={`h-full w-auto object-contain transition-opacity duration-500 ${
                showWhiteLogo ? "opacity-0 invisible" : "opacity-100"
              }`} 
            />
          </div>
        </Link>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="/#philosophy" className={`${isScrolled || !isHomepage ? "text-muted-foreground" : "text-white/90"} hover:text-primary transition-colors`}>Filosofi</a>
          <a href="/#archive" className={`${isScrolled || !isHomepage ? "text-muted-foreground" : "text-white/90"} hover:text-primary transition-colors`}>Kisah Mereka</a>
          <a
            href="https://wa.me/6281334841094?text=Halo%20Mekarhub%2C%20saya%20tertarik%20untuk%20mengetahui%20lebih%20lanjut%20tentang%20layanan%20Anda.%20Boleh%20dibantu%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Hubungi Kami
          </a>
        </div>
        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className={`${isScrolled || !isHomepage ? "text-foreground" : "text-white"} md:hidden transition-colors`} aria-label="Toggle menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="4" y1="8" x2="20" y2="8" /><line x1="4" y1="16" x2="20" y2="16" /></>}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-background border-t px-6 py-4 flex flex-col gap-4 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300">
          <a href="/#philosophy" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">Filosofi</a>
          <a href="/#archive" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">Kisah Mereka</a>
          <a
            href="https://wa.me/6281334841094?text=Halo%20Mekarhub%2C%20saya%20tertarik%20untuk%20mengetahui%20lebih%20lanjut%20tentang%20layanan%20Anda.%20Boleh%20dibantu%3F"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-semibold text-center"
          >
            Hubungi Kami
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
