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

var KLIEN_COLS = {
  NAMA: 2,
  JABATAN: 3,
  WHATSAPP: 4,
  MEDIA_SOSIAL: 5,
  LOKASI: 6,
  DESKRIPSI_USAHA: 7,
  MOMEN_BERKESAN: 8,
  HARAPAN: 13,
  KATEGORI: 14,
  LINK_BRIEF: 16,
  IDE_BESAR: 17,
  VISUAL_TONE: 18,
  HOOK: 19,
  CATATAN_TEKNIS: 20,
  LINK_MOU: 22,
  NILAI_KONTRAK: 23,
  NOMOR_REKENING: 24,
  TARGET_PRODUKSI: 25,
  STATUS_PELUNASAN: 26,
  CREATIVE_LEAD: 27,
  VIDEOGRAFER: 28,
  EDITOR: 29,
  JADWAL_VISIT: 30,
  STATUS_PRODUKSI: 31,
  LINK_HASIL_FINAL: 32
};

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

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

function colIndex(colNumber) {
  return colNumber - 1;
}

function firstDefinedParam(params, keys) {
  for (var i = 0; i < keys.length; i++) {
    if (params[keys[i]] !== undefined) return params[keys[i]];
  }
  return undefined;
}

function normalizeStatusPelunasanValue(value) {
  var raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw === "lunas" || raw === "sudah lunas" || raw === "paid" || raw === "sudah bayar") return "Lunas";
  if (raw === "belum" || raw === "belum lunas" || raw === "unpaid" || raw === "belum bayar") return "Belum";
  if (raw === "tidak berbayar" || raw === "non paid" || raw === "non-paid" || raw === "gratis" || raw === "free" || raw === "barter" || raw === "kolaborasi" || raw === "collab") return "Tidak Berbayar";
  return "Belum";
}

function normalizeStatusProduksiValue(value) {
  var raw = String(value || "").trim();
  if (raw === "Selesai" || raw === "Tunda" || raw === "Proses") return raw;
  return "Proses";
}

function isPaymentStatusValue(value) {
  var raw = String(value || "").trim().toLowerCase();
  return raw === "lunas" || raw === "belum" || raw === "sudah lunas" || raw === "belum lunas" || raw === "paid" || raw === "unpaid" || raw === "sudah bayar" || raw === "belum bayar" || raw === "tidak berbayar" || raw === "non paid" || raw === "non-paid" || raw === "gratis" || raw === "free" || raw === "barter" || raw === "kolaborasi" || raw === "collab";
}

function isProductionStatusValue(value) {
  var raw = String(value || "").trim().toLowerCase();
  return raw === "proses" || raw === "selesai" || raw === "tunda";
}

function normalizeFinalLinkValue(value) {
  var raw = String(value || "").trim();
  if (isPaymentStatusValue(raw) || isProductionStatusValue(raw)) return "";
  return raw;
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
          var pair = p.split('=');
          if (pair.length === 2) {
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1].replace(/\+/g, " "));
          }
        });
      }
    }
    
    var safe = function(val) { return String(val || "").trim(); };
    var action = safe(params.action || params.formType);
    
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
            nama: dataK[i][colIndex(KLIEN_COLS.NAMA)],
            jabatan: dataK[i][colIndex(KLIEN_COLS.JABATAN)],
            whatsapp: dataK[i][colIndex(KLIEN_COLS.WHATSAPP)],
            mediaSosial: dataK[i][colIndex(KLIEN_COLS.MEDIA_SOSIAL)],
            lokasi: dataK[i][colIndex(KLIEN_COLS.LOKASI)],
            deskripsiUsaha: dataK[i][colIndex(KLIEN_COLS.DESKRIPSI_USAHA)],
            momenBerkesan: dataK[i][colIndex(KLIEN_COLS.MOMEN_BERKESAN)],
            harapan: dataK[i][colIndex(KLIEN_COLS.HARAPAN)],
            kategori: dataK[i][colIndex(KLIEN_COLS.KATEGORI)],
            linkBrief: dataK[i][colIndex(KLIEN_COLS.LINK_BRIEF)],
            ideBesar: dataK[i][colIndex(KLIEN_COLS.IDE_BESAR)],
            visualTone: dataK[i][colIndex(KLIEN_COLS.VISUAL_TONE)],
            hook: dataK[i][colIndex(KLIEN_COLS.HOOK)],
            catatanTeknis: dataK[i][colIndex(KLIEN_COLS.CATATAN_TEKNIS)],
            linkMoU: dataK[i][colIndex(KLIEN_COLS.LINK_MOU)],
            nilaiKontrak: dataK[i][colIndex(KLIEN_COLS.NILAI_KONTRAK)],
            nomorRekening: dataK[i][colIndex(KLIEN_COLS.NOMOR_REKENING)],
            targetProduksi: dataK[i][colIndex(KLIEN_COLS.TARGET_PRODUKSI)],
            statusPelunasan: normalizeStatusPelunasanValue(dataK[i][colIndex(KLIEN_COLS.STATUS_PELUNASAN)]),
            creativeLead: dataK[i][colIndex(KLIEN_COLS.CREATIVE_LEAD)],
            videografer: dataK[i][colIndex(KLIEN_COLS.VIDEOGRAFER)],
            editor: dataK[i][colIndex(KLIEN_COLS.EDITOR)],
            namaLead: dataK[i][colIndex(KLIEN_COLS.CREATIVE_LEAD)],
            namaVideografer: dataK[i][colIndex(KLIEN_COLS.VIDEOGRAFER)],
            namaEditor: dataK[i][colIndex(KLIEN_COLS.EDITOR)],
            jadwalVisit: dataK[i][colIndex(KLIEN_COLS.JADWAL_VISIT)],
            statusProduksi: normalizeStatusProduksiValue(dataK[i][colIndex(KLIEN_COLS.STATUS_PRODUKSI)]),
            linkHasilFinal: normalizeFinalLinkValue(dataK[i][colIndex(KLIEN_COLS.LINK_HASIL_FINAL)])
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
        if (params.nama !== undefined) values[colIndex(KLIEN_COLS.NAMA)] = validateString(params.nama, "Nama", 100, false);
        if (params.jabatan !== undefined) values[colIndex(KLIEN_COLS.JABATAN)] = validateString(params.jabatan, "Jabatan", 100, false);
        if (params.whatsapp !== undefined) values[colIndex(KLIEN_COLS.WHATSAPP)] = validateWhatsApp(params.whatsapp, false);
        if (params.mediaSosial !== undefined) values[colIndex(KLIEN_COLS.MEDIA_SOSIAL)] = validateString(params.mediaSosial, "Media Sosial", 150, false);
        if (params.lokasi !== undefined) values[colIndex(KLIEN_COLS.LOKASI)] = validateString(params.lokasi, "Lokasi", 150, false);
        if (params.deskripsiUsaha !== undefined) values[colIndex(KLIEN_COLS.DESKRIPSI_USAHA)] = validateString(params.deskripsiUsaha, "Deskripsi Usaha", 3000, false);
        if (params.momenBerkesan !== undefined) values[colIndex(KLIEN_COLS.MOMEN_BERKESAN)] = validateString(params.momenBerkesan, "Momen Berkesan", 3000, false);
        if (params.harapan !== undefined) values[colIndex(KLIEN_COLS.HARAPAN)] = validateString(params.harapan, "Harapan", 2000, false);
        if (params.kategori !== undefined) values[colIndex(KLIEN_COLS.KATEGORI)] = validateString(params.kategori, "Kategori", 50, false);
        
        if (params.ideBesar !== undefined) values[colIndex(KLIEN_COLS.IDE_BESAR)] = validateString(params.ideBesar, "Ide Besar", 300, false);
        if (params.visualTone !== undefined) values[colIndex(KLIEN_COLS.VISUAL_TONE)] = validateString(params.visualTone, "Visual Tone", 300, false);
        if (params.hook !== undefined) values[colIndex(KLIEN_COLS.HOOK)] = validateString(params.hook, "Hook", 300, false);
        if (params.catatanTeknis !== undefined) values[colIndex(KLIEN_COLS.CATATAN_TEKNIS)] = validateString(params.catatanTeknis, "Catatan Teknis", 2000, false);
        
        if (params.nilaiKontrak !== undefined) {
          var cleanNilai = validateString(params.nilaiKontrak, "Nilai Kontrak", 20, false).replace(/[^0-9]/g, '');
          values[colIndex(KLIEN_COLS.NILAI_KONTRAK)] = cleanNilai ? parseInt(cleanNilai, 10) : "";
        }
        if (params.nomorRekening !== undefined) values[colIndex(KLIEN_COLS.NOMOR_REKENING)] = validateString(params.nomorRekening, "Nomor Rekening", 50, false);
        if (params.targetProduksi !== undefined) values[colIndex(KLIEN_COLS.TARGET_PRODUKSI)] = validateString(params.targetProduksi, "Target Produksi", 100, false);
        
        if (params.statusPelunasan !== undefined) {
          values[colIndex(KLIEN_COLS.STATUS_PELUNASAN)] = normalizeStatusPelunasanValue(params.statusPelunasan);
        }
        
        var creativeLeadParam = firstDefinedParam(params, ["creativeLead", "namaLead"]);
        if (creativeLeadParam !== undefined) values[colIndex(KLIEN_COLS.CREATIVE_LEAD)] = validateString(creativeLeadParam, "Creative Lead", 100, false);
        var videograferParam = firstDefinedParam(params, ["videografer", "namaVideografer"]);
        if (videograferParam !== undefined) values[colIndex(KLIEN_COLS.VIDEOGRAFER)] = validateString(videograferParam, "Videografer", 100, false);
        var editorParam = firstDefinedParam(params, ["editor", "namaEditor"]);
        if (editorParam !== undefined) values[colIndex(KLIEN_COLS.EDITOR)] = validateString(editorParam, "Editor", 100, false);
        if (params.jadwalVisit !== undefined) values[colIndex(KLIEN_COLS.JADWAL_VISIT)] = validateString(params.jadwalVisit, "Jadwal Visit", 100, false);
        if (params.statusProduksi !== undefined) {
          values[colIndex(KLIEN_COLS.STATUS_PRODUKSI)] = normalizeStatusProduksiValue(params.statusProduksi);
        }
        if (params.linkHasilFinal !== undefined) {
          if (isPaymentStatusValue(params.linkHasilFinal) && !values[colIndex(KLIEN_COLS.STATUS_PELUNASAN)]) {
            values[colIndex(KLIEN_COLS.STATUS_PELUNASAN)] = normalizeStatusPelunasanValue(params.linkHasilFinal);
          }
          values[colIndex(KLIEN_COLS.LINK_HASIL_FINAL)] = normalizeFinalLinkValue(validateString(params.linkHasilFinal, "Link Hasil Final", 500, false));
        }

        var briefUrl = values[colIndex(KLIEN_COLS.LINK_BRIEF)];
        var mouUrl = values[colIndex(KLIEN_COLS.LINK_MOU)];
        var shouldRegenerateDocs = String(params.regenerateDocs || "").toLowerCase() === "true";
        if (shouldRegenerateDocs) {
          // Generate dokumen hanya saat diminta eksplisit agar update produksi tidak timeout.
          var dataObj = {
            idBaris: baris,
            nama: values[colIndex(KLIEN_COLS.NAMA)],
            jabatan: values[colIndex(KLIEN_COLS.JABATAN)],
            whatsapp: values[colIndex(KLIEN_COLS.WHATSAPP)],
            medsos: values[colIndex(KLIEN_COLS.MEDIA_SOSIAL)],
            lokasi: values[colIndex(KLIEN_COLS.LOKASI)],
            usaha: values[colIndex(KLIEN_COLS.DESKRIPSI_USAHA)],
            titikBalik: values[colIndex(KLIEN_COLS.MOMEN_BERKESAN)],
            harapan: values[colIndex(KLIEN_COLS.HARAPAN)],
            ideBesar: values[colIndex(KLIEN_COLS.IDE_BESAR)],
            visualTone: values[colIndex(KLIEN_COLS.VISUAL_TONE)],
            hook: values[colIndex(KLIEN_COLS.HOOK)],
            catatan: values[colIndex(KLIEN_COLS.CATATAN_TEKNIS)],
            rekening: values[colIndex(KLIEN_COLS.NOMOR_REKENING)],
            target: values[colIndex(KLIEN_COLS.TARGET_PRODUKSI)],
            lead: values[colIndex(KLIEN_COLS.CREATIVE_LEAD)],
            video: values[colIndex(KLIEN_COLS.VIDEOGRAFER)],
            editor: values[colIndex(KLIEN_COLS.EDITOR)],
            visit: values[colIndex(KLIEN_COLS.JADWAL_VISIT)]
          };

          briefUrl = generateDocument(BRIEF_TEMPLATE_ID, "BRIEF - " + dataObj.nama, dataObj);
          mouUrl = generateDocument(MOU_TEMPLATE_ID, "MoU - " + dataObj.nama, dataObj);
          
          if (briefUrl) values[colIndex(KLIEN_COLS.LINK_BRIEF)] = briefUrl;
          if (mouUrl) values[colIndex(KLIEN_COLS.LINK_MOU)] = mouUrl;
        }

        var currentAF = values[colIndex(KLIEN_COLS.LINK_HASIL_FINAL)];
        var currentZ = values[colIndex(KLIEN_COLS.STATUS_PELUNASAN)];

        if (isPaymentStatusValue(currentAF)) {
          if (!String(currentZ || "").trim()) {
            values[colIndex(KLIEN_COLS.STATUS_PELUNASAN)] = normalizeStatusPelunasanValue(currentAF);
          }
          values[colIndex(KLIEN_COLS.LINK_HASIL_FINAL)] = "";
        } else if (isProductionStatusValue(currentAF)) {
          values[colIndex(KLIEN_COLS.LINK_HASIL_FINAL)] = "";
        }

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

function cleanupMekarhubProduksiMapping() {
  var ssKlien = SpreadsheetApp.openById(SS_KLIEN_ID);
  var sheetKlien = ssKlien.getSheetByName("Sheet1") || ssKlien.getSheets()[0];
  var lastRow = sheetKlien.getLastRow();
  if (lastRow <= 1) return { updated: 0 };

  var numRows = lastRow - 1;
  var statusRange = sheetKlien.getRange(2, KLIEN_COLS.STATUS_PELUNASAN, numRows, 1);
  var linkRange = sheetKlien.getRange(2, KLIEN_COLS.LINK_HASIL_FINAL, numRows, 1);
  var statusValues = statusRange.getValues();
  var linkValues = linkRange.getValues();
  var updated = 0;

  for (var i = 0; i < numRows; i++) {
    var linkValue = linkValues[i][0];
    if (!isPaymentStatusValue(linkValue)) continue;

    var currentStatus = String(statusValues[i][0] || "").trim();
    if (!currentStatus) {
      statusValues[i][0] = normalizeStatusPelunasanValue(linkValue);
    }

    linkValues[i][0] = "";
    updated++;
  }

  if (updated > 0) {
    statusRange.setValues(statusValues);
    linkRange.setValues(linkValues);
    try { CacheService.getScriptCache().remove("klien_data"); } catch (cacheErr) {}
  }

  return { updated: updated };
}
