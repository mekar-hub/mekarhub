import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ArchiveSection from "../components/ArchiveSection";
import { mapFigureRow } from "../data/figures";
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
    expect(screen.getByRole("button", { name: "All Figures" })).toBeInTheDocument();
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

describe("figure CSV mapping", () => {
  it("maps Indonesian Google Sheet headers without falling back to Kisah Mekarhub", () => {
    const figure = mapFigureRow(
      {
        Nama: "Ayu Pratiwi",
        Judul: "Pendiri Rumah Kreatif",
        Kategori: "Educator",
        Narasi: "Ayu membangun ruang belajar kreatif untuk komunitasnya.",
        "Image URL": "https://example.com/ayu.jpg",
        Slug: "ayu-pratiwi",
      },
      0,
    );

    expect(figure.name).toBe("Ayu Pratiwi");
    expect(figure.title).toBe("Pendiri Rumah Kreatif");
    expect(figure.category).toBe("Educator");
    expect(figure.story).toContain("ruang belajar kreatif");
    expect(figure.imageUrl).toBe("https://example.com/ayu.jpg");
    expect(figure.slug).toBe("ayu-pratiwi");
  });

  it("builds title from jabatan and usaha when judul/title is missing", () => {
    const figure = mapFigureRow(
      {
        nama: "Bima Santoso",
        jabatan: "Founder",
        usaha: "Kopi Tepi Sawah",
        kategori: "Entrepreneur",
        cerita: "Bima mengembangkan usaha kopi berbasis desa.",
        foto: "https://example.com/bima.jpg",
      },
      1,
    );

    expect(figure.name).toBe("Bima Santoso");
    expect(figure.title).toBe("Founder - Kopi Tepi Sawah");
    expect(figure.slug).toBe("bima-santoso");
    expect(figure.story).toContain("usaha kopi");
    expect(figure.imageUrl).toBe("https://example.com/bima.jpg");
  });

  it("does not use Kisah Mekarhub for a non-empty row with unexpected headers", () => {
    const figure = mapFigureRow(
      {
        "Nama Lengkap Figur": "Citra Lestari",
        "Catatan Utama": "Kolom belum standar",
      },
      2,
    );

    expect(figure.name).toBe("Citra Lestari");
    expect(figure.name).not.toBe("Kisah Mekarhub");
    expect(figure.slug).toBe("citra-lestari");
  });
});
