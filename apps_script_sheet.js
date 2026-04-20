/**
 * Google Apps Script - Form Kisah Mekarhub
 * Paste script ini ke: Extensions > Apps Script > Code.gs
 * Lalu Deploy sebagai Web App (Execute as: Me, Access: Anyone)
 *
 * Kolom Sheet (baris 1 = header):
 * A: Tanggal
 * B: Nama Lengkap
 * C: Jabatan/Posisi
 * D: Nama Brand/Usaha
 * E: Media Sosial
 * F: Lokasi
 * G: Q1 - Rintisan Bawah
 * H: Q2 - Keunikan Produk
 * I: Q3 - Ekspansi/Pindah Lokasi
 * J: Q4 - Standar Operasional
 * K: Q5 - Dampak Sosial
 * L: Pencapaian
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
        "Jabatan/Posisi",
        "Nama Brand/Usaha",
        "Media Sosial",
        "Lokasi",
        "Q1 - Rintisan",
        "Q2 - Keunikan",
        "Q3 - Ekspansi",
        "Q4 - Standar Op.",
        "Q5 - Dampak Sosial",
        "Pencapaian/Kebanggaan",
      ]);
    }

    var timestamp = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Makassar",
    });

    sheet.appendRow([
      timestamp,                        // A: Tanggal
      params.nama || "",               // B: Nama Lengkap
      params.jabatan || "",            // C: Jabatan/Posisi
      params.namaBrand || "",          // D: Nama Brand/Usaha
      params.mediaSosial || "",        // E: Media Sosial
      params.lokasi || "",             // F: Lokasi
      params.q1_rintisan || "",        // G: Q1
      params.q2_keunikan || "",        // H: Q2
      params.q3_ekspansi || "",        // I: Q3
      params.q4_standarOp || "",       // J: Q4
      params.q5_dampakSosial || "",    // K: Q5
      params.pencapaian || "",         // L: Pencapaian
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
