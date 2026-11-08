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
  const rateMetrics = [
    ['Milk rate (INR per litre)', 10],
    ['Paneer rate (INR per kg)', 11],
    ['Ghee rate (INR per kg)', 12],
    ['Curd rate (INR per kg)', 13]
  ];
  rateMetrics.forEach(function ([label, row]) {
    if (!sheet.getRange(row, 1).getValue()) sheet.getRange(row, 1, 1, 2).setValues([[label, 0]]);
    else if (sheet.getRange(row, 2).getValue() === '') sheet.getRange(row, 2).setValue(0);
  });
  return sheet;
}

function readInventory(sheet) {
  return {
    milkLitres: Number(sheet.getRange(2, 2).getValue()) || 0,
    milkCapacity: Number(sheet.getRange(3, 2).getValue()) || 1000,
    cows: Number(sheet.getRange(4, 2).getValue()) || 0,
    buffaloes: Number(sheet.getRange(5, 2).getValue()) || 0,
    goats: Number(sheet.getRange(6, 2).getValue()) || 0,
    paneerKg: Number(sheet.getRange(7, 2).getValue()) || 0,
    gheeKg: Number(sheet.getRange(8, 2).getValue()) || 0,
    curdKg: Number(sheet.getRange(9, 2).getValue()) || 0,
    milkRate: Number(sheet.getRange(10, 2).getValue()) || 0,
    paneerRate: Number(sheet.getRange(11, 2).getValue()) || 0,
    gheeRate: Number(sheet.getRange(12, 2).getValue()) || 0,
    curdRate: Number(sheet.getRange(13, 2).getValue()) || 0
  };
}

function ordersSheet(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Orders') || spreadsheet.insertSheet('Orders');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Order time (UTC)', 'Customer name', 'Phone', 'Product / items', 'Quantity summary', 'Status', 'Total amount (INR)', 'Delivery address', 'Payment method']);
    sheet.setFrozenRows(1);
  } else if (!sheet.getRange(1, 7).getValue()) {
    sheet.getRange(1, 7, 1, 3).setValues([['Total amount (INR)', 'Delivery address', 'Payment method']]);
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
      return jsonOutput(Object.assign({ ok: true }, readInventory(sheet)));
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
      return jsonOutput(Object.assign({ ok: true }, readInventory(sheet)));
    }

    if (action === 'updatePrices') {
      const milkRate = Number(body.milkRate);
      const paneerRate = Number(body.paneerRate);
      const gheeRate = Number(body.gheeRate);
      const curdRate = Number(body.curdRate);
      if (![milkRate, paneerRate, gheeRate, curdRate].every(function (value) { return Number.isFinite(value) && value > 0 && value <= 10000000; })) {
        return jsonOutput({ ok: false, error: 'Invalid product prices' });
      }
      if (!lock.tryLock(10000)) return jsonOutput({ ok: false, error: 'Busy; try again' });
      const sheet = inventorySheet(spreadsheet);
      sheet.getRange(10, 2).setValue(milkRate);
      sheet.getRange(11, 2).setValue(paneerRate);
      sheet.getRange(12, 2).setValue(gheeRate);
      sheet.getRange(13, 2).setValue(curdRate);
      return jsonOutput(Object.assign({ ok: true }, readInventory(sheet)));
    }

    if (action === 'createOrder') {
      const name = String(body.name || '').trim();
      const phone = String(body.phone || '').trim();
      const address = String(body.address || '').trim();
      const paymentMethod = String(body.paymentMethod || '');
      const items = Array.isArray(body.items) ? body.items : [];
      const phoneDigits = phone.replace(/\D/g, '');
      const productRows = {
        Milk: { stockRow: 2, rateRow: 10, unit: 'L' },
        Paneer: { stockRow: 7, rateRow: 11, unit: 'kg' },
        Ghee: { stockRow: 8, rateRow: 12, unit: 'kg' },
        Curd: { stockRow: 9, rateRow: 13, unit: 'kg' }
      };
      const validItems = items.length > 0 && items.length <= 4 && items.every(function (item) {
        return item && productRows[item.product] && Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0 && Number(item.quantity) <= 10000 && Math.abs(Number(item.quantity) * 10 - Math.round(Number(item.quantity) * 10)) < 0.000001;
      }) && new Set(items.map(function (item) { return item.product; })).size === items.length;
      if (name.length < 2 || name.length > 80 || phoneDigits.length < 10 || phoneDigits.length > 15 || address.length < 8 || address.length > 300 || !['Cash on delivery', 'UPI on delivery'].includes(paymentMethod) || !validItems) {
        return jsonOutput({ ok: false, error: 'Invalid order details' });
      }
      if (!lock.tryLock(10000)) return jsonOutput({ ok: false, error: 'Busy; try again' });
      const stockSheet = inventorySheet(spreadsheet);
      let total = 0;
      let orderError = '';
      const lines = [];
      const quantitySummary = [];
      items.forEach(function (item) {
        const product = productRows[item.product];
        const quantity = Number(item.quantity);
        const stock = Number(stockSheet.getRange(product.stockRow, 2).getValue()) || 0;
        const rate = Number(stockSheet.getRange(product.rateRow, 2).getValue()) || 0;
        if (rate <= 0) { orderError = 'PRICE_NOT_SET'; return; }
        if (quantity > stock) { orderError = 'OUT_OF_STOCK'; return; }
        total += quantity * rate;
        lines.push({ product: item.product, quantity: quantity, unit: product.unit, rate: rate });
        quantitySummary.push(quantity + ' ' + product.unit);
      });
      if (orderError) return jsonOutput({ ok: false, error: orderError });
      total = Math.round((total + Number.EPSILON) * 100) / 100;
      lines.forEach(function (line) {
        const product = productRows[line.product];
        stockSheet.getRange(product.stockRow, 2).setValue((Number(stockSheet.getRange(product.stockRow, 2).getValue()) || 0) - line.quantity);
      });
      const sheet = ordersSheet(spreadsheet);
      const itemSummary = lines.map(function (line) { return line.product + ' × ' + line.quantity + ' ' + line.unit; }).join(', ');
      sheet.appendRow([new Date().toISOString(), asPlainText(name), asPlainText(phone), asPlainText(itemSummary), quantitySummary.join(' + '), 'New', total, asPlainText(address), paymentMethod]);
      sheet.getRange(sheet.getLastRow(), 3).setNumberFormat('@');
      return jsonOutput({ ok: true, total: total, inventory: readInventory(stockSheet) });
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
