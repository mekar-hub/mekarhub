/**
 * Google Apps Script - Mekarhub Integrated (v2.1 - Additive Update)
 * SPREADSHEET KLIEN (Active): 1dGrwqokk3jXgpZChfvRQhA8Ht75L_XdqWOdxNN2w92Q
 * SPREADSHEET FIGUR: 18iGYoxGPp6A0CuAtw0L8qMj9Tth4XzBglA-sU4WkyxE
 */

var SS_FIGUR_ID = "18iGYoxGPp6A0CuAtw0L8qMj9Tth4XzBglA-sU4WkyxE";
var FOLDER_ID = "1D4fLm-jDvpIUjtZAIZ7CVrPrUlSRzaGd";
var MOU_TEMPLATE_ID = "1CMQpLqKrMTnUp88RAMPYiIZzQk3QZjkuLRAxtXW0W54";
var BRIEF_TEMPLATE_ID = "1GXSrTrczsJfn39McHk7aUoG5Bizx2vihzUJeRqpRuOQ";

function doGet(e) {
  try {
    const action = e.parameter.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet(); // Menggunakan Active SS untuk Klien
    const sheet = ss.getSheetByName("Sheet1") || ss.getSheets()[0];
    const scriptProperties = PropertiesService.getScriptProperties();
    
    if (action === "getKlien") {
      const data = sheet.getDataRange().getValues();
      const result = [];
      for (let i = 1; i < data.length; i++) {
        if (data[i][1]) { // Nama di Kolom B
          result.push({
            idBaris: i + 1,
            nama: data[i][1],
            jabatan: data[i][2],
            whatsapp: data[i][3],
            lokasi: data[i][5],
            linkBrief: data[i][15],     // P
            ideBesar: data[i][16],      // Q
            visualTone: data[i][17],    // R
            hook: data[i][18],          // S
            catatanTeknis: data[i][19], // T
            linkMoU: data[i][21],       // V
            nilaiKontrak: data[i][22],  // W
            nomorRekening: data[i][23], // X
            targetProduksi: data[i][24],// Y
            statusPelunasan: data[i][25],// Z
            namaLead: data[i][26],      // AA
            namaVideografer: data[i][27],// AB
            namaEditor: data[i][28],    // AC
            jadwalVisit: data[i][29],   // AD
            statusProduksi: data[i][30], // AE
            linkHasilFinal: data[i][31],// AF
            savedRekening: scriptProperties.getProperty('SAVED_REKENING') || ""
          });
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ data: result })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "getFigur") {
      const ssFigur = SpreadsheetApp.openById(SS_FIGUR_ID);
      const sheetFigur = ssFigur.getSheetByName("Sheet1") || ssFigur.getSheets()[0];
      const data = sheetFigur.getDataRange().getValues();
      const result = [];
      for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
          result.push({
            idBaris: i + 1,
            nama: String(data[i][1] || ""),     // Col B
            judul: String(data[i][2] || ""),    // Col C
            kategori: String(data[i][3] || ""), // Col D
            slug: String(data[i][6] || ""),     // Col G
            narasi: String(data[i][7] || ""),   // Col H
            image: String(data[i][9] || ""),    // Col J
            idRelasiKlien: String(data[i][10] || "") // Col K
          });
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ data: result })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput("Sistem Mekarhub Aktif");
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Sheet1") || ss.getSheets()[0];
    const params = e.parameter;

    // --- CASE 1: UPDATE DATA PRODUKSI (ADMIN) ---
    if (params.idBaris && params.formType === "admin_produksi") {
      let baris = parseInt(params.idBaris);
      let nama = sheet.getRange(baris, 2).getValue();

      const nilaiKontrak = parseInt(params.nilaiKontrak) || 0;
      const nilaiDP = Math.floor(nilaiKontrak * 0.5);
      const nilaiPelunasan = nilaiKontrak - nilaiDP;

      if (params.nomorRekening) {
        PropertiesService.getScriptProperties().setProperty('SAVED_REKENING', params.nomorRekening);
      }

      const data = {
        nama: nama,
        jabatan: sheet.getRange(baris, 3).getValue(),
        whatsapp: sheet.getRange(baris, 4).getValue(),
        lokasi: sheet.getRange(baris, 6).getValue(),
        deskripsiUsaha: sheet.getRange(baris, 7).getValue(),
        momenBerkesan: sheet.getRange(baris, 8).getValue(),
        ideBesar: (params.ideBesar || "").trim(),
        visualTone: (params.visualTone || "").trim(),
        hook: (params.hook || "").trim(),
        catatanTeknis: (params.catatanTeknis || "").trim(),
        namaLead: (params.namaLead || "").trim(),
        namaVideografer: (params.namaVideografer || "").trim(),
        namaEditor: (params.namaEditor || "").trim(),
        nilaiKontrak: nilaiKontrak.toLocaleString('id-ID'),
        nilaiDP: nilaiDP.toLocaleString('id-ID'),
        nilaiPelunasan: nilaiPelunasan.toLocaleString('id-ID'),
        nomorRekening: params.nomorRekening,
        nomorSurat: "MKH-" + baris,
        tanggal: Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy")
      };

      const folder = DriveApp.getFolderById(FOLDER_ID);
      const fileMoU = buatFile(MOU_TEMPLATE_ID, 'MoU ' + nama, folder, data);
      const fileBrief = buatFile(BRIEF_TEMPLATE_ID, 'Brief ' + nama, folder, data);

      // Mapping Kolom (A-Z, AA-AF)
      sheet.getRange(baris, 1).setValue(new Date());              // A (Update Tanggal)
      sheet.getRange(baris, 14).setValue("Client");               // N (Update Status ke Client)
      sheet.getRange(baris, 16).setValue(fileBrief.getUrl());     // P
      sheet.getRange(baris, 17).setValue(data.ideBesar);          // Q
      sheet.getRange(baris, 18).setValue(data.visualTone);        // R
      sheet.getRange(baris, 19).setValue(data.hook);              // S
      sheet.getRange(baris, 20).setValue(data.catatanTeknis);      // T
      sheet.getRange(baris, 22).setValue(fileMoU.getUrl());       // V
      sheet.getRange(baris, 23).setValue(nilaiKontrak);           // W
      sheet.getRange(baris, 24).setValue(params.nomorRekening);   // X
      sheet.getRange(baris, 25).setValue(params.targetProduksi);  // Y
      sheet.getRange(baris, 26).setValue(params.statusPelunasan); // Z
      sheet.getRange(baris, 27).setValue(data.namaLead);          // AA
      sheet.getRange(baris, 28).setValue(data.namaVideografer);   // AB
      sheet.getRange(baris, 29).setValue(data.namaEditor);        // AC
      sheet.getRange(baris, 30).setValue(params.jadwalVisit);     // AD
      sheet.getRange(baris, 31).setValue(params.statusProduksi);  // AE
      sheet.getRange(baris, 32).setValue(params.linkHasilFinal);  // AF

      return ContentService.createTextOutput(JSON.stringify({result: "success", urlMoU: fileMoU.getUrl()})).setMimeType(ContentService.MimeType.JSON);
    } 
    
    // --- CASE 2: MANAJEMEN FIGUR (SIMPAN/UPDATE) ---
    else if (params.formType === "admin_figur") {
      const ssFigur = SpreadsheetApp.openById(SS_FIGUR_ID);
      const sheetFigur = ssFigur.getSheetByName("Sheet1") || ssFigur.getSheets()[0];
      
      if (params.idBaris) {
        let baris = parseInt(params.idBaris);
        sheetFigur.getRange(baris, 2).setValue(params.nama);      // B
        sheetFigur.getRange(baris, 3).setValue(params.judul);     // C
        sheetFigur.getRange(baris, 4).setValue(params.kategori);  // D
        sheetFigur.getRange(baris, 7).setValue(params.slug);      // G
        sheetFigur.getRange(baris, 8).setValue(params.narasi);    // H
        sheetFigur.getRange(baris, 10).setValue(params.image);    // J
        sheetFigur.getRange(baris, 11).setValue(params.idRelasiKlien); // K
      } else {
        // Append row: id(A), nama(B), judul(C), kategori(D), ...
        sheetFigur.appendRow([
          sheetFigur.getLastRow(), // A (ID sederhana)
          params.nama,             // B
          params.judul,            // C
          params.kategori,         // D
          "",                      // E (socialLink)
          "",                      // F (featured)
          params.slug,             // G
          params.narasi,           // H
          "",                      // I (publishedDate)
          params.image,            // J
          params.idRelasiKlien     // K
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
    }

    // --- CASE 3: DELETE KLIEN ---
    else if (params.action === "deleteKlien" && params.idBaris) {
      const baris = parseInt(params.idBaris);
      sheet.deleteRow(baris);
      return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
    }

    // --- CASE 4: PENDAFTARAN BARU (FORM KLIEN) ---
    else {
      var timestamp = new Date();
      sheet.appendRow([
        timestamp, params.nama, params.jabatan, params.whatsapp, 
        params.mediaSosial, params.lokasi, params.deskripsiUsaha, 
        params.momenBerkesan, "", "", "", "", params.harapan, "Nominee"
      ]);
      return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function buatFile(id, nama, folder, variabel) {
  const salinan = DriveApp.getFileById(id).makeCopy(nama, folder);
  const doc = DocumentApp.openById(salinan.getId());
  const isi = doc.getBody();
  
  // Mapping Tag (Mendukung Tag Lama & Baru)
  const mapping = {
    '\\[nama\\]': variabel.nama, '\\[jabatan\\]': variabel.jabatan, '\\[whatsapp\\]': variabel.whatsapp,
    '\\[lokasi\\]': variabel.lokasi, '\\[identitasSpirit\\]': variabel.deskripsiUsaha, // Mapping ke tag lama
    '\\[titikBalik\\]': variabel.momenBerkesan, // Mapping ke tag lama
    '\\[ideBesar\\]': variabel.ideBesar, '\\[visualTone\\]': variabel.visualTone, '\\[hook\\]': variabel.hook,
    '\\[catatanTeknis\\]': variabel.catatanTeknis, '\\[nama_lead\\]': variabel.namaLead,
    '\\[nama_videografer\\]': variabel.namaVideografer, '\\[nama_editor\\]': variabel.namaEditor,
    '\\[NILAI_KONTRAK\\]': variabel.nilaiKontrak, '\\[NILAI_DP\\]': variabel.nilaiDP,
    '\\[NILAI_PELUNASAN\\]': variabel.nilaiPelunasan, '\\[NOMOR_REKENING\\]': variabel.nomorRekening,
    '\\[nomorSurat\\]': variabel.nomorSurat, '\\[tanggal\\]': variabel.tanggal
  };

  for (let tag in mapping) { isi.replaceText(tag, mapping[tag] || ""); }
  doc.saveAndClose();
  return salinan;
}

function pemicuIzinAkses() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const testFile = DriveApp.createFile('Test Izin', 'Cek Izin Drive');
  testFile.makeCopy('Salinan Test', folder);
  testFile.setTrashed(true);
  console.log("Izin Drive Berhasil Diperbarui!");
}
