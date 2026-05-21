import { safeJson, verifyAdminSession } from '../_security.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return safeJson(res, 405, { ok: false, message: 'Method not allowed' });
  }

  if (!verifyAdminSession(req)) {
    return safeJson(res, 401, { ok: false, message: 'Unauthorized' });
  }

  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  if (!host) {
    return safeJson(res, 500, { ok: false, message: 'Host header missing' });
  }

  const response = await fetch(`${protocol}://${host}/api/notify-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.NOTIFY_INTERNAL_TOKEN ? { 'x-mekarhub-internal-token': process.env.NOTIFY_INTERNAL_TOKEN } : {}),
    },
    body: JSON.stringify({
      nama: 'Tester Mekarhub',
      jabatan: 'Testing',
      whatsapp: '081234567890',
      mediaSosial: '-',
      lokasi: 'https://mekarhub.id',
      deskripsiUsaha: 'Ini adalah pesan percobaan dari halaman Testing Notification.',
      momenBerkesan: 'Testing notification flow.',
      harapan: 'Memastikan email admin terkirim.',
    }),
  });

  if (!response.ok) {
    return safeJson(res, 502, { ok: false, message: 'Failed to send notification email' });
  }

  return safeJson(res, 200, { ok: true, message: 'Notification sent successfully' });
}

