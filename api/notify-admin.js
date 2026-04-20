export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    nama,
    jabatan,
    whatsapp,
    mediaSosial,
    lokasi,
    identitasSpirit,
    titikBalik,
    keunikanAutentik,
    filosofiPelayanan,
    dinamikaTerkini,
    sisiKemanusiaan,
    harapan,
  } = req.body;

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not found in environment variables");
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
        from: 'Mekarhub <onboarding@resend.dev>',
        to: 'mekarhub@gmail.com',
        subject: `[BARU] Form Kolaborasi Mekarhub: ${nama}`,
        html: `
          <h2 style="color:#c0392b;">Form Kolaborasi Mekarhub — Pengajuan Baru</h2>

          <h3>I. Biodata</h3>
          <p><strong>Nama Lengkap:</strong> ${nama}</p>
          <p><strong>Jabatan / Posisi:</strong> ${jabatan}</p>
          <p><strong>WhatsApp / HP:</strong> ${whatsapp}</p>
          <p><strong>Media Sosial:</strong> ${mediaSosial || '-'}</p>
          <p><strong>Lokasi:</strong> ${lokasi}</p>

          <hr />

          <h3>II. Profil Sederhana</h3>
          <p><strong>Identitas dan Spirit:</strong></p>
          <p style="background:#f9f9f9;padding:10px;border-left:3px solid #ccc;">${identitasSpirit.replace(/\n/g, '<br>')}</p>
          
          <p><strong>Momen Titik Balik:</strong></p>
          <p style="background:#f9f9f9;padding:10px;border-left:3px solid #ccc;">${titikBalik.replace(/\n/g, '<br>')}</p>
          
          <p><strong>Keunikan Autentik:</strong></p>
          <p style="background:#f9f9f9;padding:10px;border-left:3px solid #ccc;">${keunikanAutentik.replace(/\n/g, '<br>')}</p>
          
          <p><strong>Filosofi Pelayanan:</strong></p>
          <p style="background:#f9f9f9;padding:10px;border-left:3px solid #ccc;">${filosofiPelayanan.replace(/\n/g, '<br>')}</p>
          
          <p><strong>Dinamika Terkini:</strong></p>
          <p style="background:#f9f9f9;padding:10px;border-left:3px solid #ccc;">${dinamikaTerkini.replace(/\n/g, '<br>')}</p>
          
          <p><strong>Sisi Kemanusiaan:</strong></p>
          <p style="background:#f9f9f9;padding:10px;border-left:3px solid #ccc;">${sisiKemanusiaan.replace(/\n/g, '<br>')}</p>

          <hr />

          <h3>III. Penutup</h3>
          <p><strong>Harapan:</strong></p>
          <p style="background:#fef9f0;padding:12px;border-left:4px solid #c0392b;">${(harapan || '').replace(/\n/g, '<br>')}</p>
        `,
      }),
    });

    if (response.ok) {
      return res.status(200).json({ message: 'Notification sent successfully' });
    } else {
      const errorData = await response.json();
      console.error('Resend API Error:', errorData);
      return res.status(500).json({ message: 'Failed to send notification email' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
