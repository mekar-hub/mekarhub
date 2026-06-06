import Papa from "papaparse";
import { escapeHtml, safeText, safeUrl } from "./_utils/security.js";

export default async function handler(req, res) {
  const { slug } = req.query;
  const CSV_URL = process.env.SHEET_CSV_URL || process.env.VITE_SHEET_CSV_URL || "";
  const SITE_BASE_URL = process.env.SITE_BASE_URL || "https://mekarhub.id";
  const cleanSlug = Array.isArray(slug) ? slug[0] : slug;

  if (!cleanSlug || typeof cleanSlug !== "string") {
    res.setHeader("Cache-Control", "no-store");
    return res.status(400).send("Missing article slug");
  }

  if (!CSV_URL) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(500).send("Article metadata is not configured");
  }

  try {
    const response = await fetch(`${CSV_URL}&t=${Date.now()}`);
    if (!response.ok) {
      console.error("OG Proxy upstream fetch failed:", response.status);
      res.setHeader("Cache-Control", "no-store");
      return res.status(502).send("Article metadata is temporarily unavailable");
    }

    const csvData = await response.text();
    const results = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    if (results.errors && results.errors.length > 0) {
      console.error("OG Proxy CSV parse failed:", results.errors[0]?.message || "Unknown parse error");
      res.setHeader("Cache-Control", "no-store");
      return res.status(502).send("Article metadata is temporarily unavailable");
    }

    const figure = results.data.find((item) => item.slug === cleanSlug);
    if (!figure) {
      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
      return res.status(404).send("Article metadata not found");
    }

    let imageUrl = safeText(figure.imageUrl, 2000);
    if (imageUrl.includes("drive.google.com")) {
      const driveIdMatch = imageUrl.match(/(?:\/file\/d\/|id=)([^\/\?\&]+)/);
      if (driveIdMatch) {
        imageUrl = `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}=s1000`;
      }
    }

    const safeBaseUrl = safeUrl(SITE_BASE_URL, { allowHttp: false }) || "https://mekarhub.id/";
    const fallbackImageUrl = safeUrl(new URL("/placeholder.svg", safeBaseUrl).toString(), {
      allowHttp: false,
    });
    imageUrl = safeUrl(imageUrl, { allowHttp: false }) || fallbackImageUrl;

    const figureName = escapeHtml(figure.name || "Mekarhub");
    const figureStory = safeText(figure.story, 10000);
    const escapedStory = escapeHtml(figureStory);
    const metaDescription = escapeHtml(figureStory.substring(0, 160));
    const escapedImageUrl = escapeHtml(imageUrl);
    const escapedArticleUrl = escapeHtml(
      new URL(`/kisah/${encodeURIComponent(cleanSlug)}`, safeBaseUrl).toString(),
    );
    const escapedRedirectUrl = escapeHtml(`/kisah/${encodeURIComponent(cleanSlug)}`);

    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>${figureName} - Mekarhub</title>
    <meta name="description" content="${metaDescription}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${figureName} - Mekarhub">
    <meta property="og:description" content="${metaDescription}">
    <meta property="og:image" content="${escapedImageUrl}">
    <meta property="og:url" content="${escapedArticleUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${figureName} - Mekarhub">
    <meta name="twitter:description" content="${metaDescription}">
    <meta name="twitter:image" content="${escapedImageUrl}">
    <meta http-equiv="refresh" content="0;url=${escapedRedirectUrl}">
</head>
<body>
    <h1>${figureName}</h1>
    <p>${escapedStory}</p>
    <img src="${escapedImageUrl}" alt="${figureName}">
</body>
</html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(200).send(html);
  } catch (error) {
    console.error("OG Proxy Error:", error instanceof Error ? error.message : "Unknown error");
    res.setHeader("Cache-Control", "no-store");
    return res.status(500).send("Article metadata is temporarily unavailable");
  }
}
