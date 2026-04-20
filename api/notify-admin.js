export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    nama,
    jabatan,
    namaBrand,
    mediaSosial,
    lokasi,
    q1,
    q2,
    q3,
    q4,
    q5,
    pencapaian,
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
        subject: `[BARU] Form Kisah Mekarhub: ${nama}`,
        html: `
          <h2 style="color:#c0392b;">Form Kisah Mekarhub — Pengajuan Baru</h2>

          <h3>I. Biodata Singkat</h3>
          <p><strong>Nama Lengkap:</strong> ${nama}</p>
          <p><strong>Jabatan / Posisi:</strong> ${jabatan}</p>
          <p><strong>Nama Brand / Usaha:</strong> ${namaBrand || '-'}</p>
          <p><strong>Media Sosial:</strong> ${mediaSosial || '-'}</p>
          <p><strong>Lokasi:</strong> ${lokasi}</p>

          <hr />

          <h3>II. Profil Kisah</h3>
          <table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse;font-size:14px;">
            <thead>
              <tr style="background:#f4f4f4;">
                <th align="left" style="min-width:360px;">Pertanyaan</th>
                <th align="center">Jawaban</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bisnis bermula dari rintisan bawah / punya cerita perjuangan?</td>
                <td align="center">${q1}</td>
              </tr>
              <tr>
                <td>Ada keunikan produk/layanan yang tidak dimiliki kompetitor?</td>
                <td align="center">${q2}</td>
              </tr>
              <tr>
                <td>Sedang dalam fase ekspansi atau perpindahan lokasi?</td>
                <td align="center">${q3}</td>
              </tr>
              <tr>
                <td>Standar operasional / kualitas layanan jadi nilai jual utama?</td>
                <td align="center">${q4}</td>
              </tr>
              <tr>
                <td>Bisnis memiliki dampak sosial / kepedulian terhadap lingkungan?</td>
                <td align="center">${q5}</td>
              </tr>
            </tbody>
          </table>

          <hr />

          <h3>III. Penutup</h3>
          <p><strong>Momen / Pencapaian Kebanggaan:</strong></p>
          <p style="background:#fef9f0;padding:12px;border-left:4px solid #c0392b;">${(pencapaian || '').replace(/\n/g, '<br>')}</p>
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
