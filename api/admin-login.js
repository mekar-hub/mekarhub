import crypto from "node:crypto";
import { buildSessionCookie, createAdminSession } from "./_utils/admin-session.js";

function isValidPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || typeof password !== "string") return false;

  const providedBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

function normalizeBody(body) {
  if (!body || typeof body !== "string") return body || {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return res.status(500).json({ message: "Admin authentication is not configured" });
  }

  const body = normalizeBody(req.body);
  const password = body?.password;
  if (!isValidPassword(password)) {
    return res.status(401).json({ authenticated: false, message: "Invalid credentials" });
  }

  const session = createAdminSession();
  res.setHeader("Set-Cookie", buildSessionCookie(session));
  return res.status(200).json({ authenticated: true });
}
