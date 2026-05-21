import { createAdminSessionToken, safeJson, setAdminSessionCookie, verifyAdminPin } from '../_security.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return safeJson(res, 405, { ok: false, message: 'Method not allowed' });
  }

  const { pin } = req.body || {};
  if (!verifyAdminPin(pin)) {
    return safeJson(res, 401, { ok: false, message: 'PIN salah' });
  }

  const token = createAdminSessionToken();
  if (!token) {
    return safeJson(res, 500, { ok: false, message: 'Admin session is not configured' });
  }

  setAdminSessionCookie(res, token);
  return safeJson(res, 200, { ok: true });
}

