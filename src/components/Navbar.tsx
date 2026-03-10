import logo from "@/assets/Logo_Mekar_Hub_1.png";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        <Link to="/">
          <img src={logo} alt="Mekarhub" className="h-14" />
        </Link>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="/#philosophy" className="text-muted-foreground hover:text-foreground transition-colors">Filosofi</a>
          <a href="/#archive" className="text-muted-foreground hover:text-foreground transition-colors">Kisah Mereka</a>
          <a
            href="https://wa.me/6281334841094?text=Halo%20Mekarhub%2C%20saya%20tertarik%20untuk%20mengetahui%20lebih%20lanjut%20tentang%20layanan%20Anda.%20Boleh%20dibantu%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Hubungi Kami
          </a>
        </div>
        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground" aria-label="Toggle menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="4" y1="8" x2="20" y2="8" /><line x1="4" y1="16" x2="20" y2="16" /></>}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-background border-t px-6 py-4 flex flex-col gap-4 text-sm font-medium">
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
