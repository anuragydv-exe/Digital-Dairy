function jsonOutput(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function asPlainText(value) {
  const text = String(value);
  return /^[=+@-]/.test(text) ? "'" + text : text;
}

function inventorySheet(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Inventory') || spreadsheet.insertSheet('Inventory');
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 6, 2).setValues([
      ['Metric', 'Value'],
      ['Milk available (litres)', 0],
      ['Milk tank capacity (litres)', 1000],
      ['Cows', 0],
      ['Buffaloes', 0],
      ['Goats', 0]
    ]);
    sheet.setFrozenRows(1);
  }
  const productMetrics = [
    ['Paneer available (kg)', 7],
    ['Ghee available (kg)', 8],
    ['Curd available (kg)', 9]
  ];
  productMetrics.forEach(function ([label, row]) {
    if (!sheet.getRange(row, 1).getValue()) sheet.getRange(row, 1, 1, 2).setValues([[label, 0]]);
    else if (sheet.getRange(row, 2).getValue() === '') sheet.getRange(row, 2).setValue(0);
  });
  return sheet;
}

function ordersSheet(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Orders') || spreadsheet.insertSheet('Orders');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Order time (UTC)', 'Customer name', 'Phone', 'Product', 'Quantity', 'Status']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const props = PropertiesService.getScriptProperties();
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const expectedSecret = props.getProperty('SHARED_SECRET');
    if (!expectedSecret || body.secret !== expectedSecret) {
      return jsonOutput({ ok: false, error: 'Unauthorized' });
    }

    const spreadsheetId = props.getProperty('SHEET_ID');
    if (!spreadsheetId) return jsonOutput({ ok: false, error: 'Sheet ID is not configured' });
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const action = String(body.action || 'customerSignIn');

    if (action === 'getInventory') {
      const sheet = inventorySheet(spreadsheet);
      return jsonOutput({
        ok: true,
        milkLitres: Number(sheet.getRange(2, 2).getValue()) || 0,
        milkCapacity: Number(sheet.getRange(3, 2).getValue()) || 1000,
        cows: Number(sheet.getRange(4, 2).getValue()) || 0,
        buffaloes: Number(sheet.getRange(5, 2).getValue()) || 0,
        goats: Number(sheet.getRange(6, 2).getValue()) || 0,
        paneerKg: Number(sheet.getRange(7, 2).getValue()) || 0,
        gheeKg: Number(sheet.getRange(8, 2).getValue()) || 0,
        curdKg: Number(sheet.getRange(9, 2).getValue()) || 0
      });
    }

    if (action === 'updateInventory') {
      const milkLitres = Number(body.milkLitres);
      const milkCapacity = Number(body.milkCapacity);
      const cows = Number(body.cows);
      const buffaloes = Number(body.buffaloes);
      const goats = Number(body.goats);
      const paneerKg = Number(body.paneerKg);
      const gheeKg = Number(body.gheeKg);
      const curdKg = Number(body.curdKg);
      if (!Number.isFinite(milkLitres) || milkLitres < 0 || milkLitres > 10000000 || !Number.isFinite(milkCapacity) || milkCapacity <= 0 || milkCapacity > 10000000 || milkLitres > milkCapacity || ![paneerKg, gheeKg, curdKg].every(function (value) { return Number.isFinite(value) && value >= 0 && value <= 10000000; }) || !Number.isInteger(cows) || cows < 0 || cows > 1000000 || !Number.isInteger(buffaloes) || buffaloes < 0 || buffaloes > 1000000 || !Number.isInteger(goats) || goats < 0 || goats > 1000000) {
        return jsonOutput({ ok: false, error: 'Invalid inventory values' });
      }
      if (!lock.tryLock(10000)) return jsonOutput({ ok: false, error: 'Busy; try again' });
      const sheet = inventorySheet(spreadsheet);
      sheet.getRange(2, 2).setValue(milkLitres);
      sheet.getRange(3, 2).setValue(milkCapacity);
      sheet.getRange(4, 2).setValue(cows);
      sheet.getRange(5, 2).setValue(buffaloes);
      sheet.getRange(6, 2).setValue(goats);
      sheet.getRange(7, 2).setValue(paneerKg);
      sheet.getRange(8, 2).setValue(gheeKg);
      sheet.getRange(9, 2).setValue(curdKg);
      return jsonOutput({ ok: true, milkLitres: milkLitres, milkCapacity: milkCapacity, cows: cows, buffaloes: buffaloes, goats: goats, paneerKg: paneerKg, gheeKg: gheeKg, curdKg: curdKg });
    }

    if (action === 'createOrder') {
      const name = String(body.name || '').trim();
      const phone = String(body.phone || '').trim();
      const product = String(body.product || '').trim();
      const quantity = Number(body.quantity);
      const phoneDigits = phone.replace(/\D/g, '');
      const allowedProducts = ['Milk', 'Paneer', 'Ghee', 'Curd'];
      if (name.length < 2 || name.length > 80 || phoneDigits.length < 10 || phoneDigits.length > 15 || !allowedProducts.includes(product) || !Number.isFinite(quantity) || quantity <= 0 || quantity > 10000) {
        return jsonOutput({ ok: false, error: 'Invalid order details' });
      }
      if (!lock.tryLock(10000)) return jsonOutput({ ok: false, error: 'Busy; try again' });
      const sheet = ordersSheet(spreadsheet);
      sheet.appendRow([new Date().toISOString(), asPlainText(name), asPlainText(phone), product, quantity, 'New']);
      sheet.getRange(sheet.getLastRow(), 3).setNumberFormat('@');
      return jsonOutput({ ok: true });
    }

    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const phoneDigits = phone.replace(/\D/g, '');
    if (name.length < 2 || name.length > 80 || phoneDigits.length < 10 || phoneDigits.length > 15) {
      return jsonOutput({ ok: false, error: 'Invalid name or phone number' });
    }

    if (!lock.tryLock(10000)) return jsonOutput({ ok: false, error: 'Busy; try again' });
    const sheet = spreadsheet.getSheetByName('Customers') || spreadsheet.insertSheet('Customers');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Sign-in time (UTC)', 'Name', 'Phone']);
      sheet.setFrozenRows(1);
    }

    const signedInAt = String(body.signedInAt || new Date().toISOString());
    const row = sheet.getLastRow() + 1;
    sheet.getRange(row, 1, 1, 3).setValues([[signedInAt, asPlainText(name), asPlainText(phone)]]);
    sheet.getRange(row, 3).setNumberFormat('@');
    sheet.getRange(row, 3).setValue(asPlainText(phone));
    return jsonOutput({ ok: true, name: name });
  } catch (error) {
    return jsonOutput({ ok: false, error: 'Could not save customer record' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}
