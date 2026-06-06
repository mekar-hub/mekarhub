import Papa from 'papaparse';

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
    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>${figure.name} - Mekarhub</title>
    <meta name="description" content="${figure.story ? figure.story.substring(0, 160) : ''}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${figure.name} - Mekarhub">
    <meta property="og:description" content="${figure.story ? figure.story.substring(0, 160) : ''}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${SITE_BASE_URL}/kisah/${cleanSlug}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${figure.name} - Mekarhub">
    <meta name="twitter:description" content="${figure.story ? figure.story.substring(0, 160) : ''}">
    <meta name="twitter:image" content="${imageUrl}">
    
    <!-- Redirect for real users just in case -->
    <meta http-equiv="refresh" content="0;url=/kisah/${cleanSlug}">
</head>
<body>
    <h1>${figure.name}</h1>
    <p>${figure.story}</p>
    <img src="${imageUrl}" alt="${figure.name}">
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
