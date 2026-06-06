import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ArchiveSection from "../components/ArchiveSection";
import FigureArticle from "../pages/FigureArticle";

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
}

const renderArchive = () =>
  render(
    <MemoryRouter>
      <ArchiveSection />
    </MemoryRouter>,
  );

const renderArticleRoute = (route: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/kisah/:slug" element={<FigureArticle />} />
          <Route path="/kisah/:slug/" element={<FigureArticle />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe("kisah routes", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it.each(["/kisah", "/kisah/"])("renders archive for %s", async () => {
    renderArchive();

    expect(await screen.findByText("The Archive")).toBeInTheDocument();
    expect(screen.getByLabelText("Cari kisah mereka")).toBeInTheDocument();
  });

  it.each(["/kisah/didiet-rasmana", "/kisah/didiet-rasmana/"])("renders detail for %s", async (route) => {
    renderArticleRoute(route);

    expect(await screen.findByRole("heading", { name: "Didiet Rasmana" })).toBeInTheDocument();
    expect(screen.getAllByText(/Toko Buku Singosari/i).length).toBeGreaterThan(0);
  });

  it("renders a graceful empty state for an unknown kisah slug", async () => {
    renderArticleRoute("/kisah/slug-tidak-ada");

    expect(await screen.findByRole("heading", { name: "Artikel tidak ditemukan" })).toBeInTheDocument();
    expect(screen.getByText(/Kisah yang Anda cari belum tersedia/i)).toBeInTheDocument();
  });
});
