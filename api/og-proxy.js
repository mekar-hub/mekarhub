import Papa from 'papaparse';
import { escapeHtml } from './_sanitize.js';

export default async function handler(req, res) {
  const { slug } = req.query;
  const CSV_URL = process.env.SHEET_CSV_URL || process.env.VITE_SHEET_CSV_URL || "https://docs.google.com/spreadsheets/d/e/2PACX-1vRGUQncFJ_ZU-dyfIeIuE1UZUbeLD_xozDKMLdFHjHE78lMsCPuUk20t7VoUhPIb5PzCiHXy0aFsAvo/pub?output=csv";
  const SITE_BASE_URL = process.env.SITE_BASE_URL || "https://mekarhub.id";
  const cleanSlug = Array.isArray(slug) ? slug[0] : slug;

  if (!cleanSlug || typeof cleanSlug !== 'string') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(400).send('Missing article slug');
  }

  try {
    // 1. Fetch CSV from Google Sheets
    const response = await fetch(`${CSV_URL}&t=${Date.now()}`);
    if (!response.ok) {
      console.error('OG Proxy upstream fetch failed:', response.status);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(502).send('Article metadata is temporarily unavailable');
    }

    const csvData = await response.text();

    // 2. Parse CSV
    const results = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    if (results.errors && results.errors.length > 0) {
      console.error('OG Proxy CSV parse failed:', results.errors[0]?.message || 'Unknown parse error');
      res.setHeader('Cache-Control', 'no-store');
      return res.status(502).send('Article metadata is temporarily unavailable');
    }

    const figure = results.data.find(f => f.slug === cleanSlug);

    if (!figure) {
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
      return res.status(404).send('Article metadata not found');
    }

    // 3. Resolve Image URL (Direct link for bots)
    let imageUrl = figure.imageUrl || '';
    if (imageUrl.includes("drive.google.com")) {
      const driveIdMatch = imageUrl.match(/(?:\/file\/d\/|id=)([^\/\?\&]+)/);
      if (driveIdMatch) {
        imageUrl = `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}=s1000`;
      }
    }
    // Fallback if empty
    if (!imageUrl) {
        imageUrl = `${SITE_BASE_URL}/Logo_Mekar_Hub_1.png`; // Fallback to logo on domain
    }

    // 4. Generate Static HTML for Bots
    const safeTitle = escapeHtml(`${figure.name || 'Mekarhub'} - Mekarhub`);
    const safeDescription = escapeHtml(figure.story ? figure.story.substring(0, 160) : '');
    const safeImageUrl = escapeHtml(imageUrl);
    const safeSlug = encodeURIComponent(cleanSlug);
    const safeBodyTitle = escapeHtml(figure.name || 'Mekarhub');
    const safeBodyStory = escapeHtml(figure.story || '');
    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:image" content="${safeImageUrl}">
    <meta property="og:url" content="${SITE_BASE_URL}/kisah/${safeSlug}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDescription}">
    <meta name="twitter:image" content="${safeImageUrl}">
    
    <!-- Redirect for real users just in case -->
    <meta http-equiv="refresh" content="0;url=/kisah/${safeSlug}">
</head>
<body>
    <h1>${safeBodyTitle}</h1>
    <p>${safeBodyStory}</p>
    <img src="${safeImageUrl}" alt="${safeBodyTitle}">
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(html);

  } catch (error) {
    console.error('OG Proxy Error:', error instanceof Error ? error.message : 'Unknown error');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).send('Article metadata is temporarily unavailable');
  }
}
