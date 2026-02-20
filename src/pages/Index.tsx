import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PhilosophySection from "@/components/PhilosophySection";
import ArchiveSection from "@/components/ArchiveSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <PhilosophySection />
      <ArchiveSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
