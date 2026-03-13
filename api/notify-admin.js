export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { nama, noWa, kategori, linkProfil, cerita } = req.body;
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
        from: 'Mekarhub <onboarding@resend.dev>', // Resend verified domain or default playground
        to: 'mekarhub@gmail.com',
        subject: `[BARU] Pengajuan Kolaborasi Kisah: ${nama}`,
        html: `
          <h2>Pengajuan Kolaborasi Kisah Baru</h2>
          <p><strong>Nama:</strong> ${nama}</p>
          <p><strong>WhatsApp:</strong> ${noWa}</p>
          <p><strong>Kategori:</strong> ${kategori}</p>
          <p><strong>Link Profil:</strong> ${linkProfil || '-'}</p>
          <hr />
          <h3>Cerita Singkat:</h3>
          <p>${cerita.replace(/\n/g, '<br>')}</p>
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
