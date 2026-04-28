/**
 * Google Apps Script - Mekarhub Integrated (v3.9.1 - Final Production)
 * Mendukung: Landing Page (POST) & Admin Dashboard (GET)
 */

var SS_KLIEN_ID = "1dGrwqokk3jXgpZChfvRQhA8Ht75L_XdqWOdxNN2w92Q";
var SS_FIGUR_ID = "18iGYoxGPp6A0CuAtw0L8qMj9Tth4XzBglA-sU4WkyxE";
var FOLDER_ID = "1D4fLm-jDvpIUjtZAIZ7CVrPrUlSRzaGd";
var MOU_TEMPLATE_ID = "1CMQpLqKrMTnUp88RAMPYiIZzQk3QZjkuLRAxtXW0W54";
var BRIEF_TEMPLATE_ID = "1GXSrTrczsJfn39McHk7aUoG5Bizx2vihzUJeRqpRuOQ";

// --- HANDLE DATA DARI WEBSITE (LANDING PAGE) ---
function doPost(e) {
  try {
    const ssKlien = SpreadsheetApp.openById(SS_KLIEN_ID);
    const sheet = ssKlien.getSheetByName("Sheet1") || ssKlien.getSheets()[0];
    
    // Tangkap data dari body request
    var params = e.parameter;
    if (Object.keys(params).length === 0 && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (i) {
        const parts = e.postData.contents.split('&');
        params = {};
        parts.forEach(p => {
          const pair = p.split('=');
          if (pair.length === 2) params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        });
      }
    }

    const safeString = function(val) { return String(val || "").trim(); };

    // Masukkan ke Spreadsheet Klien
    sheet.appendRow([
      new Date(),
      safeString(params.nama),
      safeString(params.jabatan),
      safeString(params.whatsapp),
      safeString(params.mediaSosial),
      safeString(params.lokasi),
      safeString(params.deskripsiUsaha),
      safeString(params.momenBerkesan),
      "", "", "", "", // Kolom I, J, K, L (Kosong)
      safeString(params.harapan),
      "Klien" // Kolom N: Otomatis terisi "Klien" agar muncul di Dashboard
    ]);

    return createJsonResponse({ result: "success" });
  } catch (err) {
    return createJsonResponse({ error: err.toString() });
  }
}

// --- HANDLE DATA DARI ADMIN DASHBOARD ---
function doGet(e) {
  try {
    const action = e.parameter.action;
    const ssKlien = SpreadsheetApp.openById(SS_KLIEN_ID);
    const sheet = ssKlien.getSheetByName("Sheet1") || ssKlien.getSheets()[0];
    const scriptProperties = PropertiesService.getScriptProperties();
    
    // --- AMBIL DATA KLIEN ---
    if (action === "getKlien") {
      const data = sheet.getDataRange().getValues();
      const result = [];
      for (let i = 1; i < data.length; i++) {
        if (data[i][1]) {
          result.push({
            idBaris: i + 1,
            nama: data[i][1],
            jabatan: data[i][2],
            whatsapp: data[i][3],
            mediaSosial: data[i][4],
            lokasi: data[i][5],
            deskripsiUsaha: data[i][6],
            momenBerkesan: data[i][7],
            harapan: data[i][12],
            kategori: data[i][13],
            linkBrief: data[i][15],
            ideBesar: data[i][16],
            visualTone: data[i][17],
            hook: data[i][18],
            catatanTeknis: data[i][19],
            linkMoU: data[i][21],
            nilaiKontrak: data[i][22],
            nomorRekening: data[i][23],
            targetProduksi: data[i][24],
            statusPelunasan: data[i][25],
            namaLead: data[i][26],
            namaVideografer: data[i][27],
            namaEditor: data[i][28],
            jadwalVisit: data[i][29],
            statusProduksi: data[i][30],
            linkHasilFinal: data[i][31],
            savedRekening: scriptProperties.getProperty('SAVED_REKENING') || ""
          });
        }
      }
      return createJsonResponse({ data: result });
    }
    
    // --- UPDATE DATA KLIEN ---
    if (action === "updateKlien") {
      const params = e.parameter;
      let baris = parseInt(params.idBaris);
      const safeString = function(val) { return String(val || "").trim(); };
      
      if (params.nama) sheet.getRange(baris, 2).setValue(safeString(params.nama));
      if (params.jabatan) sheet.getRange(baris, 3).setValue(safeString(params.jabatan));
      if (params.whatsapp) sheet.getRange(baris, 4).setValue(safeString(params.whatsapp));
      if (params.mediaSosial) sheet.getRange(baris, 5).setValue(safeString(params.mediaSosial));
      if (params.lokasi) sheet.getRange(baris, 6).setValue(safeString(params.lokasi));
      if (params.deskripsiUsaha) sheet.getRange(baris, 7).setValue(safeString(params.deskripsiUsaha));
      if (params.momenBerkesan) sheet.getRange(baris, 8).setValue(safeString(params.momenBerkesan));
      if (params.harapan) sheet.getRange(baris, 13).setValue(safeString(params.harapan));
      if (params.kategori) sheet.getRange(baris, 14).setValue(safeString(params.kategori));
      
      sheet.getRange(baris, 1).setValue(new Date()); 
      if (params.ideBesar) sheet.getRange(baris, 17).setValue(safeString(params.ideBesar));
      if (params.visualTone) sheet.getRange(baris, 18).setValue(safeString(params.visualTone));
      if (params.hook) sheet.getRange(baris, 19).setValue(safeString(params.hook));
      if (params.catatanTeknis) sheet.getRange(baris, 20).setValue(safeString(params.catatanTeknis));
      
      if (params.nilaiKontrak) {
        const cleanNilai = String(params.nilaiKontrak).replace(/[^0-9]/g, '');
        sheet.getRange(baris, 23).setValue(parseInt(cleanNilai) || 0);
      }
      if (params.nomorRekening) sheet.getRange(baris, 24).setValue(safeString(params.nomorRekening));
      if (params.targetProduksi) sheet.getRange(baris, 25).setValue(safeString(params.targetProduksi));
      if (params.statusPelunasan) sheet.getRange(baris, 26).setValue(safeString(params.statusPelunasan));
      if (params.namaLead) sheet.getRange(baris, 27).setValue(safeString(params.namaLead));
      if (params.namaVideografer) sheet.getRange(baris, 28).setValue(safeString(params.namaVideografer));
      if (params.namaEditor) sheet.getRange(baris, 29).setValue(safeString(params.namaEditor));
      if (params.jadwalVisit) sheet.getRange(baris, 30).setValue(safeString(params.jadwalVisit));
      if (params.statusProduksi) sheet.getRange(baris, 31).setValue(safeString(params.statusProduksi));
      if (params.linkHasilFinal) sheet.getRange(baris, 32).setValue(safeString(params.linkHasilFinal));

      const updatedData = sheet.getRange(baris, 1, 1, 32).getValues()[0];
      const dataObj = {
        idBaris: baris, nama: updatedData[1], jabatan: updatedData[2],
        whatsapp: updatedData[3], mediaSosial: updatedData[4], lokasi: updatedData[5],
        deskripsiUsaha: updatedData[6], momenBerkesan: updatedData[7], harapan: updatedData[12],
        ideBesar: updatedData[16], visualTone: updatedData[17], hook: updatedData[18],
        catatanTeknis: updatedData[19], namaLead: updatedData[26], namaVideografer: updatedData[27],
        namaEditor: updatedData[28], targetProduksi: updatedData[24]
      };

      const briefUrl = generateDocument(BRIEF_TEMPLATE_ID, "BRIEF - " + dataObj.nama, dataObj);
      const mouUrl = generateDocument(MOU_TEMPLATE_ID, "MoU - " + dataObj.nama, dataObj);

      if (briefUrl) sheet.getRange(baris, 16).setValue(briefUrl);
      if (mouUrl) sheet.getRange(baris, 22).setValue(mouUrl);

      return createJsonResponse({ result: "success", brief: briefUrl, mou: mouUrl });
    }

    // --- HAPUS KLIEN ---
    if (action === "deleteKlien") {
      const baris = parseInt(e.parameter.idBaris);
      if (!isNaN(baris) && baris > 1) {
        sheet.deleteRow(baris);
        return createJsonResponse({ result: "success" });
      }
      throw new Error("ID Baris tidak valid");
    }

    // --- UPDATE/TAMBAH FIGUR ---
    if (action === "updateFigur") {
      const ssFigur = SpreadsheetApp.openById(SS_FIGUR_ID);
      const sheetFigur = ssFigur.getSheetByName("Sheet1") || ssFigur.getSheets()[0];
      const params = e.parameter;
      let baris = parseInt(params.idBaris);
      const safeString = function(val) { return String(val || "").trim(); };

      if (!baris || baris < 1) {
        sheetFigur.appendRow([new Date(), safeString(params.nama), safeString(params.judul), safeString(params.kategori), "", "", safeString(params.slug), safeString(params.narasi), "", safeString(params.image), safeString(params.idRelasiKlien)]);
      } else {
        if (params.nama) sheetFigur.getRange(baris, 2).setValue(safeString(params.nama));
        if (params.judul) sheetFigur.getRange(baris, 3).setValue(safeString(params.judul));
        if (params.kategori) sheetFigur.getRange(baris, 4).setValue(safeString(params.kategori));
        if (params.slug) sheetFigur.getRange(baris, 7).setValue(safeString(params.slug));
        if (params.narasi) sheetFigur.getRange(baris, 8).setValue(safeString(params.narasi));
        if (params.image) sheetFigur.getRange(baris, 10).setValue(safeString(params.image));
        if (params.idRelasiKlien) sheetFigur.getRange(baris, 11).setValue(safeString(params.idRelasiKlien));
      }
      return createJsonResponse({ result: "success" });
    }

    // --- AMBIL DATA FIGUR ---
    if (action === "getFigur") {
      const ssFigur = SpreadsheetApp.openById(SS_FIGUR_ID);
      const sheetFigur = ssFigur.getSheetByName("Sheet1") || ssFigur.getSheets()[0];
      const data = sheetFigur.getDataRange().getValues();
      const result = [];
      for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
          result.push({
            idBaris: i + 1, nama: String(data[i][1] || ""), judul: String(data[i][2] || ""),
            kategori: String(data[i][3] || ""), slug: String(data[i][6] || ""),
            narasi: String(data[i][7] || ""), image: String(data[i][9] || ""),
            idRelasiKlien: String(data[i][10] || "")
          });
        }
      }
      return createJsonResponse({ data: result });
    }

    // --- HAPUS FIGUR ---
    if (action === "deleteFigur") {
      const ssFigur = SpreadsheetApp.openById(SS_FIGUR_ID);
      const sheetFigur = ssFigur.getSheetByName("Sheet1") || ssFigur.getSheets()[0];
      const baris = parseInt(e.parameter.idBaris);
      if (!isNaN(baris) && baris > 1) {
        sheetFigur.deleteRow(baris);
        return createJsonResponse({ result: "success" });
      }
      throw new Error("ID Baris tidak valid");
    }

    return ContentService.createTextOutput("Mekarhub Integrated Aktif");
  } catch (err) {
    return createJsonResponse({ error: err.toString() });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
         .setMimeType(ContentService.MimeType.JSON);
}

// --- FUNGSI HELPER: GENERATE DOKUMEN DARI TEMPLATE ---
function generateDocument(templateId, fileName, data) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const copy = DriveApp.getFileById(templateId).makeCopy(fileName, folder);
    const docId = copy.getId();
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();

    body.replaceText("\\[nama\\]", data.nama || "-");
    body.replaceText("\\[jabatan\\]", data.jabatan || "-");
    body.replaceText("\\[whatsapp\\]", data.whatsapp || "-");
    body.replaceText("\\[mediaSosial\\]", data.mediaSosial || "-");
    body.replaceText("\\[lokasi\\]", data.lokasi || "-");
    body.replaceText("\\[identitasSpirit\\]", data.deskripsiUsaha || "-");
    body.replaceText("\\[titikBalik\\]", data.momenBerkesan || "-");
    body.replaceText("\\[harapan\\]", data.harapan || "-");
    body.replaceText("\\[ideBesar\\]", data.ideBesar || "-");
    body.replaceText("\\[visualTone\\]", data.visualTone || "-");
    body.replaceText("\\[hook\\]", data.hook || "-");
    body.replaceText("\\[catatanTeknis\\]", data.catatanTeknis || "-");
    body.replaceText("\\[nama_lead\\]", data.namaLead || "-");
    body.replaceText("\\[nama_videografer\\]", data.namaVideografer || "-");
    body.replaceText("\\[nama_editor\\]", data.namaEditor || "-");
    body.replaceText("\\[deadline_shooting\\]", data.targetProduksi || "-");
    
    const tgl = Utilities.formatDate(new Date(), "GMT+7", "dd MMMM yyyy");
    body.replaceText("\\[nomorSurat\\]", "MKH/" + data.idBaris + "/" + Utilities.formatDate(new Date(), "GMT+7", "MM/yyyy"));
    body.replaceText("\\[tanggal\\]", tgl);

    doc.saveAndClose();
    return copy.getUrl();
  } catch (e) {
    return null;
  }
}
