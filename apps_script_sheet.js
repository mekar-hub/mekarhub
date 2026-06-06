/**
 * Google Apps Script - Mekarhub Integrated (v6.0 - Unified Production & Highly Optimized)
 *
 * Fungsi:
 * - Register Klien dari form publik (dengan Lock & Validasi)
 * - CRUD Klien untuk Admin Dashboard (dengan Lock, Validasi, Bulk Read/Write)
 * - CRUD Figur/Artikel dengan mapping v5.5 (dengan Lock, Validasi, Bulk Read/Write)
 * - Generate Brief & MoU (dioptimalkan tanpa redundant sheet read)
 * - Sinkronisasi Jadwal Visit ke dokumen Master
 * - Menyimpan dan membaca Status Pelunasan / Keuangan Klien
 * - CacheService Terintegrasi untuk membaca Klien dan Figur secara instan
 *
 * Optimasi:
 * - Menggunakan LockService pada semua write/delete/update action.
 * - Menggunakan CacheService (Script Cache) untuk getKlien dan getFigur.
 * - Invalidate cache secara otomatis ketika ada write/delete/update action.
 * - Menggunakan getValues dan setValues untuk operasi bulk read & write.
 * - Validasi tipe data masukan secara ketat sebelum disimpan.
 * - Error handling yang mengembalikan format balasan JSON dengan pesan kesalahan yang spesifik.
 */

var SS_KLIEN_ID = "1dGrwqokk3jXgpZChfvRQhA8Ht75L_XdqWOdxNN2w92Q";
var SS_FIGUR_ID = "18iGYoxGPp6A0CuAtw0L8qMj9Tth4XzBglA-sU4WkyxE";
var FOLDER_ID = "1D4fLm-jDvpIUjtZAIZ7CVrPrUlSRzaGd";
var MOU_TEMPLATE_ID = "1CMQpLqKrMTnUp88RAMPYiIZzQk3QZjkuLRAxtXW0W54";
var BRIEF_TEMPLATE_ID = "1GXSrTrczsJfn39McHk7aUoG5Bizx2vihzUJeRqpRuOQ";

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function isAdminAction_(action) {
  return [
    "getKlien",
    "getFigur",
    "updateKlien",
    "deleteKlien",
    "updateFigur",
    "deleteFigur"
  ].indexOf(String(action || "")) !== -1;
}

function isAuthorizedAdminRequest_(params) {
  var expectedSecret = PropertiesService.getScriptProperties().getProperty("GAS_SHARED_SECRET");
  if (!expectedSecret) return false;
  var providedSecret = String((params && params.gasSharedSecret) || "");
  return providedSecret && providedSecret === expectedSecret;
}

// --- UTILITY VALIDASI DATA ---
function validateString(val, fieldName, maxLength, isRequired) {
  var str = String(val || "").trim();
  if (isRequired && !str) {
    throw new Error("Field '" + fieldName + "' wajib diisi.");
  }
  if (maxLength && str.length > maxLength) {
    str = str.substring(0, maxLength);
  }
  return str;
}

function validateWhatsApp(val, isRequired) {
  var str = String(val || "").trim();
  if (isRequired && !str) {
    throw new Error("Nomor WhatsApp wajib diisi.");
  }
  if (!str) return "";
  var clean = str.replace(/[^0-9]/g, "");
  if (clean.length < 8 || clean.length > 15) {
    throw new Error("Nomor WhatsApp harus berupa angka dengan panjang antara 8-15 digit.");
  }
  return clean;
}

function validateRowId(val, lastRow, fieldName) {
  var num = parseInt(val, 10);
  if (isNaN(num) || num <= 1 || num > lastRow) {
    throw new Error("ID Baris '" + fieldName + "' tidak valid (" + val + "). Harus berupa baris yang valid di spreadsheet.");
  }
  return num;
}

function handleRequest(e) {
  var cache = CacheService.getScriptCache();
  try {
    var params = e.parameter || {};
    if (e.postData && e.postData.contents) {
      try {
        var jsonPayload = JSON.parse(e.postData.contents);
        for (var key in jsonPayload) { params[key] = jsonPayload[key]; }
      } catch (i) {
        var parts = e.postData.contents.split('&');
        parts.forEach(function(p) {
          var separatorIndex = p.indexOf('=');
          if (separatorIndex >= 0) {
            var key = p.substring(0, separatorIndex);
            var value = p.substring(separatorIndex + 1);
            params[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, " "));
          }
        });
      }
    }
    
    var safe = function(val) { return String(val || "").trim(); };
    var action = safe(params.action || params.formType);

    if (isAdminAction_(action) && !isAuthorizedAdminRequest_(params)) {
      return createJsonResponse({ success: false, error: "Unauthorized" });
    }
    
    var ssKlien = SpreadsheetApp.openById(SS_KLIEN_ID);
    var sheetKlien = ssKlien.getSheetByName("Sheet1") || ssKlien.getSheets()[0];
    
    // --- READ OPERATIONS (TIDAK BUTUH LOCK) ---
    
    if (action === "getKlien") {
      var cachedKlien = cache.get("klien_data");
      if (cachedKlien) {
        return ContentService.createTextOutput(cachedKlien).setMimeType(ContentService.MimeType.JSON);
      }
      
      var dataK = sheetKlien.getDataRange().getValues();
      var resK = [];
      for (var i = 1; i < dataK.length; i++) {
        if (dataK[i][1]) {
          resK.push({
            idBaris: i + 1,
            nama: dataK[i][1],
            jabatan: dataK[i][2],
            whatsapp: dataK[i][3],
            mediaSosial: dataK[i][4],
            lokasi: dataK[i][5],
            deskripsiUsaha: dataK[i][6],
            momenBerkesan: dataK[i][7],
            harapan: dataK[i][12],
            kategori: dataK[i][13],
            linkBrief: dataK[i][15],
            ideBesar: dataK[i][16],
            visualTone: dataK[i][17], 
            hook: dataK[i][18],
            catatanTeknis: dataK[i][19],
            linkMoU: dataK[i][21],
            nilaiKontrak: dataK[i][22],
            nomorRekening: dataK[i][23],
            targetProduksi: dataK[i][24],
            statusPelunasan: dataK[i][25],
            namaLead: dataK[i][26],
            namaVideografer: dataK[i][27],
            namaEditor: dataK[i][28],
            jadwalVisit: dataK[i][29],
            statusProduksi: dataK[i][30],
            linkHasilFinal: dataK[i][31]
          });
        }
      }
      var resKString = JSON.stringify({ data: resK });
      try { cache.put("klien_data", resKString, 600); } catch(cErr) {} // Max 10 minutes cache
      return createJsonResponse({ data: resK });
    }

    if (action === "getFigur") {
      var cachedFigur = cache.get("figur_data");
      if (cachedFigur) {
        return ContentService.createTextOutput(cachedFigur).setMimeType(ContentService.MimeType.JSON);
      }
      
      var ssFigur = SpreadsheetApp.openById(SS_FIGUR_ID);
      var sheetFigur = ssFigur.getSheetByName("Sheet1") || ssFigur.getSheets()[0];
      var dataF = sheetFigur.getDataRange().getValues();
      var resF = [];
      for (var j = 1; j < dataF.length; j++) {
        if (dataF[j][1]) {
          resF.push({
            idBaris: j + 1,
            nama: dataF[j][1],
            judul: dataF[j][2],
            kategori: dataF[j][3],
            slug: dataF[j][6],
            narasi: dataF[j][7],
            image: dataF[j][9],
            idRelasiKlien: dataF[j][10]
          });
        }
      }
      var resFString = JSON.stringify({ data: resF });
      try { cache.put("figur_data", resFString, 600); } catch(cErr) {}
      return createJsonResponse({ data: resF });
    }

    // --- WRITE OPERATIONS (DILINDUNGI LOCK SERVICE UNTUK MENCEGAH EROR CONCURRENCY) ---
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) {
      return createJsonResponse({ error: "Sistem sibuk. Permintaan transaksi Anda melebihi batas waktu tunggu kunci (timeout). Silakan coba lagi." });
    }

    try {
      if (!action || action === "register") {
        // Validasi data form calon klien
        var vNama = validateString(params.nama, "Nama", 100, true);
        var vJabatan = validateString(params.jabatan, "Jabatan", 100, true);
        var vWhatsapp = validateWhatsApp(params.whatsapp, true);
        var vMedsos = validateString(params.mediaSosial, "Media Sosial", 150, false);
        var vLokasi = validateString(params.lokasi, "Lokasi", 150, true);
        var vDeskripsi = validateString(params.deskripsiUsaha, "Deskripsi Usaha", 3000, true);
        var vMomen = validateString(params.momenBerkesan, "Momen Berkesan", 3000, true);
        var vHarapan = validateString(params.harapan, "Harapan", 2000, true);

        sheetKlien.appendRow([
          new Date(),
          vNama,
          vJabatan,
          vWhatsapp,
          vMedsos,
          vLokasi,
          vDeskripsi,
          vMomen,
          "", "", "", "",
          vHarapan,
          "Klien"
        ]);

        // Invalidate cache
        cache.remove("klien_data");
        return createJsonResponse({ result: "success" });
      }

      if (action === "updateKlien") {
        var rawBaris = validateString(params.idBaris, "idBaris", 10, true);
        var baris = validateRowId(rawBaris, sheetKlien.getLastRow(), "Klien (Update)");
        
        var range = sheetKlien.getRange(baris, 1, 1, 32);
        var values = range.getValues()[0];

        // Validasi input parameter sebelum update massal
        if (params.nama !== undefined) values[1] = validateString(params.nama, "Nama", 100, false);
        if (params.jabatan !== undefined) values[2] = validateString(params.jabatan, "Jabatan", 100, false);
        if (params.whatsapp !== undefined) values[3] = validateWhatsApp(params.whatsapp, false);
        if (params.mediaSosial !== undefined) values[4] = validateString(params.mediaSosial, "Media Sosial", 150, false);
        if (params.lokasi !== undefined) values[5] = validateString(params.lokasi, "Lokasi", 150, false);
        if (params.deskripsiUsaha !== undefined) values[6] = validateString(params.deskripsiUsaha, "Deskripsi Usaha", 3000, false);
        if (params.momenBerkesan !== undefined) values[7] = validateString(params.momenBerkesan, "Momen Berkesan", 3000, false);
        if (params.harapan !== undefined) values[12] = validateString(params.harapan, "Harapan", 2000, false);
        
        if (params.ideBesar !== undefined) values[16] = validateString(params.ideBesar, "Ide Besar", 300, false);
        if (params.visualTone !== undefined) values[17] = validateString(params.visualTone, "Visual Tone", 300, false);
        if (params.hook !== undefined) values[18] = validateString(params.hook, "Hook", 300, false);
        if (params.catatanTeknis !== undefined) values[19] = validateString(params.catatanTeknis, "Catatan Teknis", 2000, false);
        
        if (params.nilaiKontrak !== undefined) {
          var cleanNilai = validateString(params.nilaiKontrak, "Nilai Kontrak", 20, false).replace(/[^0-9]/g, '');
          values[22] = cleanNilai ? parseInt(cleanNilai, 10) : "";
        }
        if (params.nomorRekening !== undefined) values[23] = validateString(params.nomorRekening, "Nomor Rekening", 50, false);
        if (params.targetProduksi !== undefined) values[24] = validateString(params.targetProduksi, "Target Produksi", 100, false);
        
        if (params.statusPelunasan !== undefined) {
          var sp = validateString(params.statusPelunasan, "Status Pelunasan", 20, false).toLowerCase();
          values[25] = (sp === 'lunas') ? 'Lunas' : 'Belum';
        }
        
        if (params.namaLead !== undefined) values[26] = validateString(params.namaLead, "Nama Lead", 100, false);
        if (params.namaVideografer !== undefined) values[27] = validateString(params.namaVideografer, "Nama Videografer", 100, false);
        if (params.namaEditor !== undefined) values[28] = validateString(params.namaEditor, "Nama Editor", 100, false);
        if (params.jadwalVisit !== undefined) values[29] = validateString(params.jadwalVisit, "Jadwal Visit", 100, false);
        if (params.statusProduksi !== undefined) {
          var prodVal = validateString(params.statusProduksi, "Status Produksi", 20, false);
          // Standardisasi status
          if (prodVal === "Selesai" || prodVal === "Tunda" || prodVal === "Proses") {
            values[30] = prodVal;
          } else {
            values[30] = "Proses";
          }
        }
        if (params.linkHasilFinal !== undefined) values[31] = validateString(params.linkHasilFinal, "Link Hasil Final", 500, false);

        // Buat objek data dari memory array values untuk diserahkan ke generator dokumen
        var dataObj = {
          idBaris: baris, nama: values[1], jabatan: values[2], whatsapp: values[3], medsos: values[4],
          lokasi: values[5], usaha: values[6], titikBalik: values[7], harapan: values[12],
          ideBesar: values[16], visualTone: values[17], hook: values[18], catatan: values[19],
          rekening: values[23], target: values[24], lead: values[26], video: values[27], editor: values[28],
          visit: values[29]
        };

        // Otomatisasi generate Brief & MoU di Google Drive
        var briefUrl = generateDocument(BRIEF_TEMPLATE_ID, "BRIEF - " + dataObj.nama, dataObj);
        var mouUrl = generateDocument(MOU_TEMPLATE_ID, "MoU - " + dataObj.nama, dataObj);
        
        if (briefUrl) values[15] = briefUrl;
        if (mouUrl) values[21] = mouUrl;

        // Tulis semua update ke sheet klien secara sekaligus
        range.setValues([values]);

        // Invalidate cache
        cache.remove("klien_data");
        return createJsonResponse({ result: "success", brief: briefUrl, mou: mouUrl });
      }

      if (action === "deleteKlien") {
        var rawBarisDel = validateString(params.idBaris, "idBaris", 10, true);
        var row = validateRowId(rawBarisDel, sheetKlien.getLastRow(), "Klien (Delete)");
        
        sheetKlien.deleteRow(row);
        
        // Invalidate cache
        cache.remove("klien_data");
        return createJsonResponse({ result: "success" });
      }

      // --- MANAJEMEN DATA FIGUR ---
      var ssFigur = SpreadsheetApp.openById(SS_FIGUR_ID);
      var sheetFigur = ssFigur.getSheetByName("Sheet1") || ssFigur.getSheets()[0];

      if (action === "updateFigur") {
        var bf = parseInt(params.idBaris || 0, 10);
        if (isNaN(bf)) bf = 0;

        var vNamaF = validateString(params.nama, "Nama Figur", 100, true);
        var vJudulF = validateString(params.judul, "Judul Kisah", 300, true);
        var vKatF = validateString(params.kategori, "Kategori Figur", 50, true);
        var vSlugF = validateString(params.slug, "Slug", 150, true);
        var vNarasiF = validateString(params.narasi, "Narasi", 10000, true);
        var vImgF = validateString(params.image, "Link Gambar", 500, false);
        var vRelasiF = validateString(params.idRelasiKlien, "Relasi Klien ID", 20, false);

        if (vSlugF.match(/[^a-zA-Z0-9_-]/)) {
          throw new Error("Format Slug tidak valid. Hanya diperbolehkan huruf, angka, tanda strip (-), atau underscore (_).");
        }

        if (bf > 0) {
          bf = validateRowId(bf, sheetFigur.getLastRow(), "Figur (Update)");
          var rangeF = sheetFigur.getRange(bf, 1, 1, 11);
          var valuesF = rangeF.getValues()[0];

          valuesF[1] = vNamaF;
          valuesF[2] = vJudulF;
          valuesF[3] = vKatF;
          valuesF[6] = vSlugF;
          valuesF[7] = vNarasiF;
          valuesF[9] = vImgF;
          valuesF[10] = vRelasiF;

          rangeF.setValues([valuesF]);
        } else {
          // Tambah baris baru jika bf <= 0
          var nextId = sheetFigur.getLastRow();
          sheetFigur.appendRow([
            nextId,
            vNamaF,
            vJudulF,
            vKatF,
            "",
            false,
            vSlugF,
            vNarasiF,
            new Date(),
            vImgF,
            vRelasiF
          ]);
        }

        // Invalidate cache
        cache.remove("figur_data");
        return createJsonResponse({ result: "success" });
      }

      if (action === "deleteFigur") {
        var rawBarisFDel = validateString(params.idBaris, "idBaris", 10, true);
        var rowF = validateRowId(rawBarisFDel, sheetFigur.getLastRow(), "Figur (Delete)");
        
        sheetFigur.deleteRow(rowF);
        
        // Invalidate cache
        cache.remove("figur_data");
        return createJsonResponse({ result: "success" });
      }

      return createJsonResponse({ status: "Mekarhub Online" });

    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    console.error("Server API Error: " + err.toString());
    return createJsonResponse({ error: err.toString(), message: err.message || "Terjadi kesalahan internal pada server Apps Script." });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function formatTanggalIndonesia(dateInput) {
  var date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput || "-");

  var hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  var bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return hari[date.getDay()] + ", " + date.getDate() + " " + bulan[date.getMonth()] + " " + date.getFullYear();
}

function generateDocument(templateId, fileName, data) {
  try {
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var copy = DriveApp.getFileById(templateId).makeCopy(fileName, folder);
    var doc = DocumentApp.openById(copy.getId());
    var repl = function(s) {
      if (!s) return;
      s.replaceText("\\[nama\\]", data.nama || "-");
      s.replaceText("\\[jabatan\\]", data.jabatan || "-");
      s.replaceText("\\[whatsapp\\]", data.whatsapp || "-");
      s.replaceText("\\[mediaSosial\\]", data.medsos || "-");
      s.replaceText("\\[lokasi\\]", data.lokasi || "-");
      s.replaceText("\\[identitasSpirit\\]", data.usaha || "-");
      s.replaceText("\\[titikBalik\\]", data.titikBalik || "-");
      s.replaceText("\\[harapan\\]", data.harapan || "-");
      s.replaceText("\\[ideBesar\\]", data.ideBesar || "-");
      s.replaceText("\\[visualTone\\]", data.visualTone || "-");
      s.replaceText("\\[hook\\]", data.hook || "-");
      s.replaceText("\\[catatanTeknis\\]", data.catatan || "-");
      s.replaceText("\\[nama_lead\\]", data.lead || "-");
      s.replaceText("\\[nama_videografer\\]", data.video || "-");
      s.replaceText("\\[nama_editor\\]", data.editor || "-");
      
      var visitDate = "-";
      if (data.visit) {
        try { visitDate = formatTanggalIndonesia(data.visit); }
        catch(e) { visitDate = data.visit; }
      }
      s.replaceText("\\[jadwal_visit\\]", visitDate);
      
      s.replaceText("\\[NOMOR_REKENING\\]", data.rekening || "-");
      var now = new Date(), seq = String(data.idBaris).padStart(3, '0'), rom = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
      s.replaceText("\\[nomorSurat\\]", "B.038-" + seq + "/MEKARHUB/" + rom[now.getMonth()] + "/" + now.getFullYear());
      s.replaceText("\\[001\\]", seq);
      s.replaceText("\\[IV\\]", rom[now.getMonth()]);
      s.replaceText("\\[2026\\]", now.getFullYear().toString());
      s.replaceText("\\[tanggal\\]", Utilities.formatDate(now, "GMT+7", "dd MMMM yyyy"));
    };
    repl(doc.getBody()); repl(doc.getHeader()); repl(doc.getFooter());
    doc.saveAndClose();
    return copy.getUrl();
  } catch (e) {
    console.error("Document Generation Failed: " + e.toString());
    return null;
  }
}
