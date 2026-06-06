import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
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

const AppRoutes = () => {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const kisahDetailMatch = normalizedPath.match(/^\/kisah\/([^/]+)$/);

  if (pathname === "/kisah/") {
    return <Navigate to="/kisah" replace />;
  }

  if (pathname.startsWith("/kisah/") && pathname.endsWith("/") && kisahDetailMatch) {
    return <Navigate to={normalizedPath} replace />;
  }

  if (normalizedPath === "/kisah") {
    return <KisahArchive />;
  }

  if (kisahDetailMatch) {
    return <FigureArticle slugOverride={decodeURIComponent(kisahDetailMatch[1])} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/kolaborasi-kisah" element={<FormCalonFigur />} />
      {import.meta.env.DEV && <Route path="/test-notification" element={<TestNotification />} />}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/klien/:clientSlug" element={<AdminDashboard />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
