/**
 * Google Apps Script - Form Kisah Mekarhub
 * Paste script ini ke: Extensions > Apps Script > Code.gs
 * Lalu Deploy sebagai Web App (Execute as: Me, Access: Anyone)
 *
 * Kolom Sheet (baris 1 = header):
 * A: Tanggal
 * B: Nama Lengkap
 * C: Jabatan atau Posisi
 * D: WhatsApp / HP
 * E: Media Sosial
 * F: Lokasi
 * G: Identitas dan Spirit
 * H: Momen Titik Balik
 * I: Keunikan Autentik
 * J: Filosofi Pelayanan
 * K: Dinamika Terkini
 * L: Sisi Kemanusiaan
 * M: Harapan
 * N: Status (Default: Nominee)
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var params = e.parameter;

    // Pastikan header ada di baris pertama
    var lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      sheet.appendRow([
        "Tanggal",
        "Nama Lengkap",
        "Jabatan atau Posisi",
        "WhatsApp / HP",
        "Media Sosial",
        "Lokasi",
        "Identitas dan Spirit",
        "Momen Titik Balik",
        "Keunikan Autentik",
        "Filosofi Pelayanan",
        "Dinamika Terkini",
        "Sisi Kemanusiaan",
        "Harapan",
        "Status",
      ]);
    }

    var timestamp = new Date();
    
    // Status awal: Nominee (bisa diubah admin nanti)
    var status = "Nominee";

    sheet.appendRow([
      timestamp,                        // A: Tanggal
      (params.nama || "").trim(),      // B: Nama Lengkap
      (params.jabatan || "").trim(),   // C: Jabatan atau Posisi
      (params.whatsapp || "").trim(),  // D: WhatsApp / HP
      (params.mediaSosial || "").trim(), // E: Media Sosial
      (params.lokasi || "").trim(),    // F: Lokasi
      (params.identitasSpirit || "").trim(), // G: Identitas dan Spirit
      (params.titikBalik || "").trim(),      // H: Momen Titik Balik
      (params.keunikanAutentik || "").trim(), // I: Keunikan Autentik
      (params.filosofiPelayanan || "").trim(), // J: Filosofi Pelayanan
      (params.dinamikaTerkini || "").trim(),   // K: Dinamika Terkini
      (params.sisiKemanusiaan || "").trim(),   // L: Sisi Kemanusiaan
      (params.harapan || "").trim(),            // M: Harapan
      status                            // N: Status
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ result: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Form Kisah Mekarhub - OK").setMimeType(
    ContentService.MimeType.TEXT
  );
}
