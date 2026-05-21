import { safeJson, verifyAdminSession } from '../_security.js';

const GAS_ENDPOINT = process.env.GAS_ENDPOINT || process.env.VITE_GAS_ENDPOINT || 'https://script.google.com/macros/s/AKfycbxWKKBQxnUg3FHtwWw2H56fGp3JyHS3bNlHBj006v3yFvYu4cN5JD_TeIJBf52VMUJI0g/exec';
const GAS_ADMIN_TOKEN = process.env.GAS_ADMIN_TOKEN || '';
const READ_ACTIONS = new Set(['getKlien', 'getFigur']);
const WRITE_ACTIONS = new Set(['updateKlien', 'updateFigur', 'deleteKlien', 'deleteFigur']);

const appendAdminToken = (params) => {
  if (GAS_ADMIN_TOKEN) params.append('adminToken', GAS_ADMIN_TOKEN);
};

const forwardGasGet = async (action, extraParams = {}) => {
  const params = new URLSearchParams();
  params.append('action', action);
  params.append('t', Date.now().toString());
  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.append(key, String(value));
  });
  appendAdminToken(params);

  const response = await fetch(`${GAS_ENDPOINT}?${params.toString()}`, { method: 'GET' });
  const text = await response.text();
  return { response, text };
};

const forwardGasPost = async (payload) => {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.append(key, String(value));
  });
  appendAdminToken(params);

  const response = await fetch(GAS_ENDPOINT, { method: 'POST', body: params });
  const text = await response.text();
  return { response, text };
};

const parseGasJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  if (!verifyAdminSession(req)) {
    return safeJson(res, 401, { ok: false, message: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const action = String(req.query.action || '');
      if (!READ_ACTIONS.has(action)) {
        return safeJson(res, 400, { ok: false, message: 'Invalid admin action' });
      }

      const { response, text } = await forwardGasGet(action);
      const data = parseGasJson(text);
      if (!response.ok || !data || data.error) {
        return safeJson(res, 502, { ok: false, message: 'Gagal mengambil data admin' });
      }
      return safeJson(res, 200, data);
    }

    if (req.method === 'POST') {
      const payload = req.body || {};
      const action = String(payload.action || '');
      if (!WRITE_ACTIONS.has(action)) {
        return safeJson(res, 400, { ok: false, message: 'Invalid admin action' });
      }

      const { response, text } = await (action.startsWith('delete')
        ? forwardGasGet(action, { idBaris: payload.idBaris })
        : forwardGasPost(payload));
      const data = parseGasJson(text);
      if (!response.ok || !data || data.error) {
        return safeJson(res, 502, { ok: false, message: 'Gagal menyimpan data admin' });
      }
      return safeJson(res, 200, { ok: true, ...data });
    }

    return safeJson(res, 405, { ok: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Admin GAS proxy error:', error instanceof Error ? error.message : 'Unknown error');
    return safeJson(res, 500, { ok: false, message: 'Admin service unavailable' });
  }
}

