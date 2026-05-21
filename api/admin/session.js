import { safeJson, verifyAdminSession } from '../_security.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return safeJson(res, 405, { ok: false, message: 'Method not allowed' });
  }

  return safeJson(res, 200, { ok: true, authenticated: verifyAdminSession(req) });
}

