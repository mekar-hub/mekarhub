import crypto from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'mekarhub_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

const getSessionSecret = () => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    return null;
  }
  return 'mekarhub-local-dev-session-secret';
};

const toBase64Url = (value) => Buffer.from(value).toString('base64url');
const fromBase64Url = (value) => Buffer.from(value, 'base64url').toString('utf8');

const sign = (payload, secret) => crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('base64url');

const parseCookies = (req) => {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((cookies, item) => {
    const [rawKey, ...rawValue] = item.trim().split('=');
    if (!rawKey) return cookies;
    cookies[rawKey] = decodeURIComponent(rawValue.join('=') || '');
    return cookies;
  }, {});
};

export const createAdminSessionToken = () => {
  const secret = getSessionSecret();
  if (!secret) return null;
  const payload = toBase64Url(JSON.stringify({
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }));
  return `${payload}.${sign(payload, secret)}`;
};

export const verifyAdminSession = (req) => {
  const secret = getSessionSecret();
  if (!secret) return false;
  const token = parseCookies(req)[ADMIN_SESSION_COOKIE];
  if (!token || !token.includes('.')) return false;

  const [payload, signature] = token.split('.');
  const expected = sign(payload, secret);
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;

  try {
    const parsed = JSON.parse(fromBase64Url(payload));
    return parsed.role === 'admin' && Number(parsed.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

export const setAdminSessionCookie = (res, token) => {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Lax${secure ? '; Secure' : ''}`);
};

export const clearAdminSessionCookie = (res) => {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure ? '; Secure' : ''}`);
};

export const safeJson = (res, status, body) => {
  res.setHeader('Content-Type', 'application/json');
  return res.status(status).json(body);
};

export const verifyAdminPin = (pin) => {
  if (typeof pin !== 'string' || !pin) return false;
  const configuredHash = process.env.ADMIN_PIN_HASH;
  if (configuredHash) {
    const hash = crypto.createHash('sha256').update(pin).digest('hex');
    if (Buffer.byteLength(hash) !== Buffer.byteLength(configuredHash)) return false;
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(configuredHash));
  }
  const configuredPin = process.env.ADMIN_PIN || (
    process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
      ? ''
      : 'mekarhub2026'
  );
  if (!configuredPin) return false;
  if (Buffer.byteLength(pin) !== Buffer.byteLength(configuredPin)) return false;
  return crypto.timingSafeEqual(Buffer.from(pin), Buffer.from(configuredPin));
};
