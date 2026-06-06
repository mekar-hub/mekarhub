import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import FigureArticle from "./pages/FigureArticle";
import FormCalonFigur from "./pages/FormCalonFigur";
import TestNotification from "./pages/TestNotification";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import ArchiveSection from "./components/ArchiveSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const KisahArchive = () => (
  <main className="min-h-screen">
    <Navbar />
    <ArchiveSection />
    <CTASection />
    <Footer />
  </main>
);

const KisahDetailTrailingSlashRedirect = () => {
  const { slug } = useParams<{ slug: string }>();

  return <Navigate to={slug ? `/kisah/${encodeURIComponent(slug)}` : "/kisah"} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/kisah" element={<KisahArchive />} />
            <Route path="/kisah/" element={<Navigate to="/kisah" replace />} />
            <Route path="/kisah/:slug" element={<FigureArticle />} />
            <Route path="/kisah/:slug/" element={<KisahDetailTrailingSlashRedirect />} />
            <Route path="/kolaborasi-kisah" element={<FormCalonFigur />} />
            {import.meta.env.DEV && <Route path="/test-notification" element={<TestNotification />} />}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/klien/:clientSlug" element={<AdminDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
