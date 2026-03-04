// ============================================
// Google Apps Script - Iñaki Birthday RSVP
// ============================================
//
// SETUP INSTRUCTIONS:
// 1. Go to your Google Sheet
// 2. In row 1, add these column headers:
//    A1: Timestamp | B1: Nombre | C1: Adultos | D1: Niños | E1: Notas
// 3. Go to Extensions > Apps Script
// 4. Delete any existing code and paste this entire file
// 5. Click Deploy > New Deployment
//    - Type: Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Click "Deploy" and authorize when prompted
// 7. Copy the Web App URL and paste it in index.html
//
// IMPORTANT: After updating this code, you must create a NEW deployment
// (Deploy > New Deployment), not just save. Then update the URL in index.html.
// ============================================

function doGet(e) {
  try {
    var params = e.parameter;

    // If no params, return status
    if (!params.nombre) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'RSVP service is running' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    sheet.appendRow([
      params.timestamp || new Date().toLocaleString('es-AR'),
      params.nombre || '',
      params.adultos || 0,
      params.ninos || 0,
      params.notas || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('es-AR'),
      data.nombre || '',
      data.adultos || 0,
      data.ninos || 0,
      data.notas || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
