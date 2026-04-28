/**
 * Google Apps Script - Mekarhub Integrated (v5.4 - Final Production)
 * Perbaikan: Mendukung sinkronisasi Jadwal Visit (Kolom AD/30) ke dokumen Master.
 * Placeholder Baru: [jadwal_visit] (format dd mm yyyy)
 */

var SS_KLIEN_ID = "1dGrwqokk3jXgpZChfvRQhA8Ht75L_XdqWOdxNN2w92Q";
var SS_FIGUR_ID = "18iGYoxGPp6A0CuAtw0L8qMj9Tth4XzBglA-sU4WkyxE";
var FOLDER_ID = "1D4fLm-jDvpIUjtZAIZ7CVrPrUlSRzaGd";
var MOU_TEMPLATE_ID = "1CMQpLqKrMTnUp88RAMPYiIZzQk3QZjkuLRAxtXW0W54";
var BRIEF_TEMPLATE_ID = "1GXSrTrczsJfn39McHk7aUoG5Bizx2vihzUJeRqpRuOQ";

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
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
    
    var action = params.action;
    var safe = function(val) { return String(val || "").trim(); };
    var ssKlien = SpreadsheetApp.openById(SS_KLIEN_ID);
    var sheetKlien = ssKlien.getSheetByName("Sheet1") || ssKlien.getSheets()[0];

    if (!action || action === "register") {
      sheetKlien.appendRow([new Date(), safe(params.nama), safe(params.jabatan), safe(params.whatsapp), safe(params.mediaSosial), safe(params.lokasi), safe(params.deskripsiUsaha), safe(params.momenBerkesan), "", "", "", "", safe(params.harapan), "Klien"]);
      return createJsonResponse({ result: "success" });
    }

    if (action === "updateKlien") {
      var baris = parseInt(params.idBaris);
      if (isNaN(baris)) throw new Error("ID Baris tidak valid");
      
      if (params.nama) sheetKlien.getRange(baris, 2).setValue(safe(params.nama));
      if (params.jabatan) sheetKlien.getRange(baris, 3).setValue(safe(params.jabatan));
      if (params.whatsapp) sheetKlien.getRange(baris, 4).setValue(safe(params.whatsapp));
      if (params.mediaSosial) sheetKlien.getRange(baris, 5).setValue(safe(params.mediaSosial));
      if (params.lokasi) sheetKlien.getRange(baris, 6).setValue(safe(params.lokasi));
      if (params.deskripsiUsaha) sheetKlien.getRange(baris, 7).setValue(safe(params.deskripsiUsaha));
      if (params.momenBerkesan) sheetKlien.getRange(baris, 8).setValue(safe(params.momenBerkesan));
      if (params.harapan) sheetKlien.getRange(baris, 13).setValue(safe(params.harapan));
      if (params.ideBesar) sheetKlien.getRange(baris, 17).setValue(safe(params.ideBesar));
      if (params.visualTone) sheetKlien.getRange(baris, 18).setValue(safe(params.visualTone));
      if (params.hook) sheetKlien.getRange(baris, 19).setValue(safe(params.hook));
      if (params.catatanTeknis) sheetKlien.getRange(baris, 20).setValue(safe(params.catatanTeknis));
      if (params.nilaiKontrak) sheetKlien.getRange(baris, 23).setValue(safe(params.nilaiKontrak).replace(/[^0-9]/g, ''));
      if (params.nomorRekening) sheetKlien.getRange(baris, 24).setValue(safe(params.nomorRekening));
      if (params.targetProduksi) sheetKlien.getRange(baris, 25).setValue(safe(params.targetProduksi));
      if (params.namaLead) sheetKlien.getRange(baris, 27).setValue(safe(params.namaLead));
      if (params.namaVideografer) sheetKlien.getRange(baris, 28).setValue(safe(params.namaVideografer));
      if (params.namaEditor) sheetKlien.getRange(baris, 29).setValue(safe(params.namaEditor));
      if (params.jadwalVisit) sheetKlien.getRange(baris, 30).setValue(safe(params.jadwalVisit));
      if (params.statusProduksi) sheetKlien.getRange(baris, 31).setValue(safe(params.statusProduksi));

      SpreadsheetApp.flush();
      var d = sheetKlien.getRange(baris, 1, 1, 32).getValues()[0];
      var dataObj = {
        idBaris: baris, nama: d[1], jabatan: d[2], whatsapp: d[3], medsos: d[4],
        lokasi: d[5], usaha: d[6], titikBalik: d[7], harapan: d[12],
        ideBesar: d[16], visualTone: d[17], hook: d[18], catatan: d[19],
        rekening: d[23], target: d[24], lead: d[26], video: d[27], editor: d[28],
        visit: d[29]
      };

      var briefUrl = generateDocument(BRIEF_TEMPLATE_ID, "BRIEF - " + dataObj.nama, dataObj);
      var mouUrl = generateDocument(MOU_TEMPLATE_ID, "MoU - " + dataObj.nama, dataObj);
      if (briefUrl) sheetKlien.getRange(baris, 16).setValue(briefUrl);
      if (mouUrl) sheetKlien.getRange(baris, 22).setValue(mouUrl);
      return createJsonResponse({ result: "success", brief: briefUrl, mou: mouUrl });
    }

    if (action === "deleteKlien") {
      var row = parseInt(params.idBaris);
      if (row > 1) { sheetKlien.deleteRow(row); return createJsonResponse({ result: "success" }); }
    }

    if (action === "getKlien") {
      var dataK = sheetKlien.getDataRange().getValues();
      var resK = [];
      for (var i = 1; i < dataK.length; i++) {
        if (dataK[i][1]) {
          resK.push({
            idBaris: i + 1, nama: dataK[i][1], jabatan: dataK[i][2], whatsapp: dataK[i][3],
            mediaSosial: dataK[i][4], lokasi: dataK[i][5], deskripsiUsaha: dataK[i][6],
            momenBerkesan: dataK[i][7], harapan: dataK[i][12], kategori: dataK[i][13],
            linkBrief: dataK[i][15], ideBesar: dataK[i][16], visualTone: dataK[i][17], 
            hook: dataK[i][18], catatanTeknis: dataK[i][19], linkMoU: dataK[i][21],
            nilaiKontrak: dataK[i][22], nomorRekening: dataK[i][23], targetProduksi: dataK[i][24],
            namaLead: dataK[i][26], namaVideografer: dataK[i][27],
            namaEditor: dataK[i][28], jadwalVisit: dataK[i][29], statusProduksi: dataK[i][30]
          });
        }
      }
      return createJsonResponse({ data: resK });
    }

    var ssFigur = SpreadsheetApp.openById(SS_FIGUR_ID);
    var sheetFigur = ssFigur.getSheetByName("Sheet1") || ssFigur.getSheets()[0];
    if (action === "getFigur") {
      var dataF = sheetFigur.getDataRange().getValues();
      var resF = [];
      for (var j = 1; j < dataF.length; j++) resF.push({ idBaris: j+1, nama: dataF[j][1], judul: dataF[j][2], kategori: dataF[j][3], slug: dataF[j][4], narasi: dataF[j][5], image: dataF[j][6], idRelasiKlien: dataF[j][7] });
      return createJsonResponse({ data: resF });
    }
    if (action === "updateFigur") {
      var bf = parseInt(params.idBaris);
      var vf = [[safe(params.nama), safe(params.judul), safe(params.kategori), safe(params.slug), safe(params.narasi), safe(params.image), safe(params.idRelasiKlien)]];
      if (bf > 0) sheetFigur.getRange(bf, 2, 1, 7).setValues(vf); else sheetFigur.appendRow(["", safe(params.nama), safe(params.judul), safe(params.kategori), safe(params.slug), safe(params.narasi), safe(params.image), safe(params.idRelasiKlien)]);
      return createJsonResponse({ result: "success" });
    }
    if (action === "deleteFigur") {
      var rowF = parseInt(params.idBaris);
      if (rowF > 1) { sheetFigur.deleteRow(rowF); return createJsonResponse({ result: "success" }); }
    }

    return createJsonResponse({ status: "Mekarhub Online" });
  } catch (err) { return createJsonResponse({ error: err.toString() }); }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
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
        try { visitDate = Utilities.formatDate(new Date(data.visit), "GMT+7", "dd MM yyyy"); } 
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
  } catch (e) { return null; }
}
