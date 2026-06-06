import { escapeHtml, validateNotifyPayload } from "./_utils/security.js";

function normalizeBody(body) {
  if (!body || typeof body !== "string") return body || {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { data, valid, missingFields } = validateNotifyPayload(normalizeBody(req.body));
  if (!valid) {
    return res.status(400).json({
      message: "Invalid notification payload",
      missingFields,
    });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "mekarhub@gmail.com";
  const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Mekarhub <onboarding@resend.dev>";

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not found in environment variables");
    return res.status(500).json({ message: "Internal Server Error: Email configuration missing" });
  }

  const nama = escapeHtml(data.nama);
  const jabatan = escapeHtml(data.jabatan);
  const whatsapp = escapeHtml(data.whatsapp);
  const mediaSosial = escapeHtml(data.mediaSosial || "-");
  const lokasi = escapeHtml(data.lokasi);
  const deskripsiUsaha = escapeHtml(data.deskripsiUsaha).replace(/\n/g, "<br>");
  const momenBerkesan = escapeHtml(data.momenBerkesan).replace(/\n/g, "<br>");
  const harapan = escapeHtml(data.harapan).replace(/\n/g, "<br>");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: ADMIN_NOTIFICATION_EMAIL,
        subject: `[BARU] Form Kolaborasi Mekarhub: ${data.nama}`,
        html: `
          <div style="font-family:serif;max-width:600px;margin:auto;border:1px solid #eee;padding:40px;border-radius:20px;">
            <h2 style="color:#c0392b;font-size:24px;">Form Kolaborasi Mekarhub - Pengajuan Baru</h2>
            <p style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Data Utama Korespondensi</p>

            <table style="width:100%;border-collapse:collapse;margin-top:20px;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;color:#888;font-size:12px;width:150px;">NAMA LENGKAP</td>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;font-weight:bold;">${nama}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;color:#888;font-size:12px;">JABATAN</td>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;">${jabatan}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;color:#888;font-size:12px;">WHATSAPP</td>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;">${whatsapp}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;color:#888;font-size:12px;">MEDIA SOSIAL</td>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;">${mediaSosial}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;color:#888;font-size:12px;">LOKASI</td>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;">${lokasi}</td>
              </tr>
            </table>

            <div style="margin-top:40px;">
              <h3 style="font-size:16px;color:#333;">II. Profil Kisah</h3>
              <p style="color:#888;font-size:11px;margin-bottom:5px;text-transform:uppercase;">Deskripsi Usaha</p>
              <p style="background:#fdfdfd;padding:20px;border-radius:15px;border:1px solid #f0f0f0;line-height:1.6;font-size:15px;color:#444;">${deskripsiUsaha}</p>
              <p style="color:#888;font-size:11px;margin-bottom:5px;margin-top:20px;text-transform:uppercase;">Momen Paling Berkesan</p>
              <p style="background:#fdfdfd;padding:20px;border-radius:15px;border:1px solid #f0f0f0;line-height:1.6;font-size:15px;color:#444;">${momenBerkesan}</p>
              <p style="color:#888;font-size:11px;margin-bottom:5px;margin-top:20px;text-transform:uppercase;">Harapan Kedepan</p>
              <p style="background:#fff5f5;padding:20px;border-radius:15px;border:1px solid #ffebeb;line-height:1.6;font-size:15px;color:#c0392b;font-style:italic;">${harapan}</p>
            </div>

            <div style="margin-top:40px;text-align:center;border-top:1px solid #eee;padding-top:20px;">
              <p style="color:#bbb;font-size:10px;">&copy; 2026 Mekarhub Editorial System</p>
            </div>
          </div>
        `,
      }),
    });

    if (response.ok) {
      return res.status(200).json({ message: "Notification sent successfully" });
    }

    const errorData = await response.json();
    console.error("Resend API Error:", errorData);
    return res.status(500).json({ message: "Failed to send notification email" });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
