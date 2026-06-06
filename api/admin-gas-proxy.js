import { isAuthenticatedAdmin } from "./_utils/admin-session.js";

const ALLOWED_ACTIONS = new Set([
  "getKlien",
  "getFigur",
  "updateKlien",
  "deleteKlien",
  "updateFigur",
  "deleteFigur",
]);

function normalizeBody(body) {
  if (!body) return {};
  if (typeof body === "string") return Object.fromEntries(new URLSearchParams(body));
  return body;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!isAuthenticatedAdmin(req)) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const endpoint = process.env.GAS_ENDPOINT;
  const sharedSecret = process.env.GAS_SHARED_SECRET;
  if (!endpoint || !sharedSecret) {
    return res.status(500).json({ success: false, error: "Admin GAS proxy is not configured" });
  }

  const payload = normalizeBody(req.body);
  const action = String(payload.action || "").trim();
  if (!ALLOWED_ACTIONS.has(action)) {
    return res.status(400).json({ success: false, error: "Unsupported admin action" });
  }

  const forwardedPayload = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (key !== "gasSharedSecret") forwardedPayload.append(key, String(value ?? ""));
  });
  forwardedPayload.set("gasSharedSecret", sharedSecret);
  forwardedPayload.set("t", String(Date.now()));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: forwardedPayload.toString(),
    });

    const text = await response.text();
    res.status(response.ok ? 200 : response.status);
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
    return res.send(text);
  } catch (error) {
    console.error("Admin GAS proxy error:", error instanceof Error ? error.message : "Unknown error");
    return res.status(502).json({ success: false, error: "Upstream admin service unavailable" });
  }
}
