import { buildClearSessionCookie } from "./_utils/admin-session.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  res.setHeader("Set-Cookie", buildClearSessionCookie());
  return res.status(200).json({ authenticated: false });
}
