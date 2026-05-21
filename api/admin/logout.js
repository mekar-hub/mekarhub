import { clearAdminSessionCookie, safeJson } from '../_security.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return safeJson(res, 405, { ok: false, message: 'Method not allowed' });
  }

  clearAdminSessionCookie(res);
  return safeJson(res, 200, { ok: true });
}

