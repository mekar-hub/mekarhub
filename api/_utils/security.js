const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function safeText(value, maxLength = 5000) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, maxLength);
}

export function escapeHtml(value) {
  return safeText(value).replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}

export function safeUrl(value, { allowHttp = process.env.NODE_ENV !== "production" } = {}) {
  const raw = safeText(value, 2000);
  if (!raw) return "";

  try {
    const url = new URL(raw);
    if (url.protocol === "https:") return url.toString();
    if (allowHttp && url.protocol === "http:") return url.toString();
    return "";
  } catch {
    return "";
  }
}

export function validateNotifyPayload(payload = {}) {
  const data = {
    nama: safeText(payload.nama, 100),
    jabatan: safeText(payload.jabatan, 100),
    whatsapp: safeText(payload.whatsapp, 30),
    mediaSosial: safeText(payload.mediaSosial, 150),
    lokasi: safeText(payload.lokasi, 300),
    deskripsiUsaha: safeText(payload.deskripsiUsaha, 3000),
    momenBerkesan: safeText(payload.momenBerkesan, 3000),
    harapan: safeText(payload.harapan, 2000),
  };

  const missingFields = [
    "nama",
    "jabatan",
    "whatsapp",
    "lokasi",
    "deskripsiUsaha",
    "momenBerkesan",
    "harapan",
  ].filter((field) => !data[field]);

  return {
    data,
    valid: missingFields.length === 0,
    missingFields,
  };
}
