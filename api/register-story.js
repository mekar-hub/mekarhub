import { normalizeText, requireFields, safeJson } from './_sanitize.js';

const GAS_ENDPOINT = process.env.GAS_ENDPOINT || process.env.VITE_GAS_ENDPOINT || 'https://script.google.com/macros/s/AKfycbxWKKBQxnUg3FHtwWw2H56fGp3JyHS3bNlHBj006v3yFvYu4cN5JD_TeIJBf52VMUJI0g/exec';
const REQUIRED_FIELDS = ['nama', 'jabatan', 'whatsapp', 'lokasi', 'deskripsiUsaha', 'momenBerkesan', 'harapan'];

const postToGas = async (form) => {
  const params = new URLSearchParams();
  params.append('action', 'register');
  params.append('formType', 'register');
  params.append('nama', normalizeText(form.nama, 200));
  params.append('jabatan', normalizeText(form.jabatan, 200));
  params.append('whatsapp', normalizeText(form.whatsapp, 80));
  params.append('mediaSosial', normalizeText(form.mediaSosial, 200));
  params.append('lokasi', normalizeText(form.lokasi, 500));
  params.append('deskripsiUsaha', normalizeText(form.deskripsiUsaha, 3000));
  params.append('momenBerkesan', normalizeText(form.momenBerkesan, 3000));
  params.append('harapan', normalizeText(form.harapan, 3000));

  return fetch(GAS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: params.toString(),
  });
};

const notifyAdmin = async (req, form) => {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  if (!host) return false;

  const response = await fetch(`${protocol}://${host}/api/notify-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.NOTIFY_INTERNAL_TOKEN ? { 'x-mekarhub-internal-token': process.env.NOTIFY_INTERNAL_TOKEN } : {}),
    },
    body: JSON.stringify(form),
  });
  return response.ok;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return safeJson(res, 405, { ok: false, message: 'Method not allowed' });
  }

  const form = req.body || {};
  if (normalizeText(form.website, 200)) {
    return safeJson(res, 400, { ok: false, message: 'Submission rejected' });
  }

  const missing = requireFields(form, REQUIRED_FIELDS);
  if (missing.length > 0) {
    return safeJson(res, 400, { ok: false, message: 'Data wajib belum lengkap' });
  }

  try {
    const gasResponse = await postToGas(form);
    if (!gasResponse.ok) {
      return safeJson(res, 502, { ok: false, message: 'Kisah belum berhasil dikirim' });
    }

    let notificationOk = false;
    try {
      notificationOk = await notifyAdmin(req, form);
    } catch (error) {
      console.error('Register notification error:', error instanceof Error ? error.message : 'Unknown error');
    }

    return safeJson(res, 200, {
      ok: true,
      notificationOk,
      message: notificationOk ? 'Kisah berhasil dikirim' : 'Kisah terkirim, notifikasi admin perlu dicek manual',
    });
  } catch (error) {
    console.error('Register story error:', error instanceof Error ? error.message : 'Unknown error');
    return safeJson(res, 500, { ok: false, message: 'Kisah belum berhasil dikirim' });
  }
}
