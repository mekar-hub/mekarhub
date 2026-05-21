import { escapeHtml, escapeWithBreaks, normalizeText, requireFields } from './_sanitize.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const internalToken = process.env.NOTIFY_INTERNAL_TOKEN;
  if (internalToken && req.headers['x-mekarhub-internal-token'] !== internalToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const payload = req.body || {};
  const missing = requireFields(payload, ['nama', 'jabatan', 'whatsapp', 'lokasi', 'deskripsiUsaha', 'momenBerkesan', 'harapan']);
  if (missing.length > 0) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (normalizeText(payload.website, 200)) {
    return res.status(400).json({ message: 'Submission rejected' });
  }

  const nama = normalizeText(payload.nama, 200);
  const jabatan = normalizeText(payload.jabatan, 200);
  const whatsapp = normalizeText(payload.whatsapp, 80);
  const mediaSosial = normalizeText(payload.mediaSosial, 200);
  const lokasi = normalizeText(payload.lokasi, 500);
  const deskripsiUsaha = normalizeText(payload.deskripsiUsaha, 3000);
  const momenBerkesan = normalizeText(payload.momenBerkesan, 3000);
  const harapan = normalizeText(payload.harapan, 3000);

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'mekarhub@gmail.com';
  const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Mekarhub <onboarding@resend.dev>';

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not found in environment variables');
    return res.status(500).json({ message: 'Internal Server Error: Email configuration missing' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: ADMIN_NOTIFICATION_EMAIL,
        subject: `[BARU] Form Kolaborasi Mekarhub: ${nama}`,
        html: `
          <div style="font-family:serif;max-width:600px;margin:auto;border:1px solid #eee;padding:40px;border-radius:20px;">
            <h2 style="color:#c0392b;font-size:24px;">Form Kolaborasi Mekarhub - Pengajuan Baru</h2>
            <p style="color:#999;font-size:12px;text-transform:uppercase;tracking:2px;">Data Utama Korespondensi</p>

            <table style="width:100%;border-collapse:collapse;margin-top:20px;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;color:#888;font-size:12px;width:150px;">NAMA LENGKAP</td>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;font-weight:bold;">${escapeHtml(nama)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;color:#888;font-size:12px;">JABATAN</td>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;">${escapeHtml(jabatan)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;color:#888;font-size:12px;">WHATSAPP</td>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;">${escapeHtml(whatsapp)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;color:#888;font-size:12px;">MEDIA SOSIAL</td>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;">${escapeHtml(mediaSosial || '-')}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;color:#888;font-size:12px;">LOKASI</td>
                <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;">${escapeHtml(lokasi)}</td>
              </tr>
            </table>

            <div style="margin-top:40px;">
              <h3 style="font-size:16px;color:#333;">II. Profil Kisah</h3>

              <p style="color:#888;font-size:11px;margin-bottom:5px;text-transform:uppercase;">Deskripsi Usaha</p>
              <p style="background:#fdfdfd;padding:20px;border-radius:15px;border:1px solid #f0f0f0;line-height:1.6;font-size:15px;color:#444;">${escapeWithBreaks(deskripsiUsaha)}</p>

              <p style="color:#888;font-size:11px;margin-bottom:5px;margin-top:20px;text-transform:uppercase;">Momen Paling Berkesan</p>
              <p style="background:#fdfdfd;padding:20px;border-radius:15px;border:1px solid #f0f0f0;line-height:1.6;font-size:15px;color:#444;">${escapeWithBreaks(momenBerkesan)}</p>

              <p style="color:#888;font-size:11px;margin-bottom:5px;margin-top:20px;text-transform:uppercase;">Harapan Kedepan</p>
              <p style="background:#fff5f5;padding:20px;border-radius:15px;border:1px solid #ffebeb;line-height:1.6;font-size:15px;color:#c0392b;font-style:italic;">${escapeWithBreaks(harapan)}</p>
            </div>

            <div style="margin-top:40px;text-align:center;border-top:1px solid #eee;padding-top:20px;">
              <p style="color:#bbb;font-size:10px;">&copy; 2026 Mekarhub Editorial System</p>
            </div>
          </div>
        `,
      }),
    });

    if (response.ok) {
      return res.status(200).json({ message: 'Notification sent successfully' });
    }

    const errorData = await response.json();
    console.error('Resend API Error:', errorData);
    return res.status(500).json({ message: 'Failed to send notification email' });
  } catch (error) {
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
