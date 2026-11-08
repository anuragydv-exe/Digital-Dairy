import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));
app.use(express.static(here));

const attemptsByIp = new Map();
const managerSessions = new Map();

function sessionToken(req) {
  const cookie = String(req.headers.cookie || '');
  const match = cookie.match(/(?:^|;\s*)digitalDairyManager=([^;]+)/);
  return match ? match[1] : '';
}

function managerSession(req) {
  const token = sessionToken(req);
  const expiresAt = managerSessions.get(token);
  if (!expiresAt || expiresAt < Date.now()) {
    managerSessions.delete(token);
    return false;
  }
  return true;
}

function clearManagerCookie(res, req) {
  res.setHeader('Set-Cookie', `digitalDairyManager=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${req.secure ? '; Secure' : ''}`);
}

function constantTimeMatch(value, expected) {
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function customerSheetRequest(payload) {
  const webAppUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL;
  const sharedSecret = process.env.GOOGLE_SHEETS_SHARED_SECRET;
  if (!webAppUrl || !sharedSecret) throw new Error('NOT_CONFIGURED');

  const sheetResponse = await fetch(webAppUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: sharedSecret, ...payload }),
    signal: AbortSignal.timeout(15000),
  });
  const sheetText = await sheetResponse.text();
  let sheetResult = {};
  try { sheetResult = sheetText ? JSON.parse(sheetText) : {}; } catch (error) {}
  if (!sheetResponse.ok || sheetResult.ok !== true) {
    throw new Error(sheetResult.error || `HTTP ${sheetResponse.status}`);
  }
  return sheetResult;
}

app.get('/api/inventory', async (req, res) => {
  try {
    const result = await customerSheetRequest({ action: 'getInventory' });
    return res.json({ milkLitres: result.milkLitres, milkCapacity: result.milkCapacity, cows: result.cows, buffaloes: result.buffaloes, goats: result.goats });
  } catch (error) {
    console.error('Inventory request failed:', error.message);
    return res.status(error.message === 'NOT_CONFIGURED' ? 503 : 502).json({ error: 'Could not load milk availability right now.' });
  }
});

app.get('/api/manager/session', (req, res) => {
  return res.json({ manager: managerSession(req) });
});

app.post('/api/manager/login', (req, res) => {
  const configuredPassword = process.env.MANAGER_PASSWORD;
  const { password } = req.body ?? {};
  if (!configuredPassword) return res.status(503).json({ error: 'Manager login is not configured yet.' });
  if (typeof password !== 'string' || !constantTimeMatch(password, configuredPassword)) {
    return res.status(401).json({ error: 'Incorrect manager password.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const maxAge = 8 * 60 * 60 * 1000;
  managerSessions.set(token, Date.now() + maxAge);
  res.setHeader('Set-Cookie', `digitalDairyManager=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge / 1000}${req.secure ? '; Secure' : ''}`);
  return res.json({ ok: true });
});

app.post('/api/manager/logout', (req, res) => {
  managerSessions.delete(sessionToken(req));
  clearManagerCookie(res, req);
  return res.json({ ok: true });
});

app.post('/api/manager/inventory', async (req, res) => {
  if (!managerSession(req)) return res.status(401).json({ error: 'Please log in as manager first.' });
  const { milkLitres, milkCapacity, cows, buffaloes, goats } = req.body ?? {};
  if (!Number.isFinite(milkLitres) || milkLitres < 0 || milkLitres > 10000000) {
    return res.status(400).json({ error: 'Enter a valid available-milk amount.' });
  }
  if (!Number.isFinite(milkCapacity) || milkCapacity <= 0 || milkCapacity > 10000000 || milkLitres > milkCapacity) {
    return res.status(400).json({ error: 'Milk available cannot be more than tank capacity.' });
  }
  if (![cows, buffaloes, goats].every(function (value) { return Number.isInteger(value) && value >= 0 && value <= 1000000; })) {
    return res.status(400).json({ error: 'Enter valid animal counts.' });
  }
  try {
    const result = await customerSheetRequest({ action: 'updateInventory', milkLitres, milkCapacity, cows, buffaloes, goats });
    return res.json({ milkLitres: result.milkLitres, milkCapacity: result.milkCapacity, cows: result.cows, buffaloes: result.buffaloes, goats: result.goats });
  } catch (error) {
    console.error('Inventory update failed:', error.message);
    return res.status(502).json({ error: 'Could not save the milk availability right now.' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { name, phone, product, quantity } = req.body ?? {};
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80 || typeof phone !== 'string' || phone.length > 20 || !['Milk', 'Paneer', 'Ghee', 'Curd'].includes(product) || !Number.isFinite(quantity) || quantity <= 0 || quantity > 10000) {
    return res.status(400).json({ error: 'Enter valid order details.' });
  }
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return res.status(400).json({ error: 'Enter a phone number with 10 to 15 digits.' });
  try {
    await customerSheetRequest({ action: 'createOrder', name: name.trim(), phone: phone.trim(), product, quantity });
    return res.json({ ok: true });
  } catch (error) {
    console.error('Order request failed:', error.message);
    return res.status(error.message === 'NOT_CONFIGURED' ? 503 : 502).json({ error: 'Could not place your order right now. Please try again later.' });
  }
});

app.post('/api/login', async (req, res) => {
  const now = Date.now();
  const ip = req.ip || 'unknown';
  const windowMs = 10 * 60 * 1000;
  let attempts = attemptsByIp.get(ip);
  if (!attempts || now - attempts.startedAt > windowMs) {
    attempts = { startedAt: now, count: 0 };
  }
  if (attempts.count >= 20) {
    attemptsByIp.set(ip, attempts);
    return res.status(429).json({ error: 'Too many sign-in attempts. Please wait a few minutes and try again.' });
  }
  attempts.count += 1;
  attemptsByIp.set(ip, attempts);
  if (attemptsByIp.size > 5000) {
    for (const [key, value] of attemptsByIp) {
      if (now - value.startedAt > windowMs) attemptsByIp.delete(key);
    }
  }

  const { name, phone, consent } = req.body ?? {};
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    return res.status(400).json({ error: 'Enter a name between 2 and 80 characters.' });
  }
  if (typeof phone !== 'string' || phone.length > 20) {
    return res.status(400).json({ error: 'Enter a valid phone number.' });
  }
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) {
    return res.status(400).json({ error: 'Enter a phone number with 10 to 15 digits.' });
  }
  if (consent !== true) {
    return res.status(400).json({ error: 'Please agree to the customer data notice to continue.' });
  }
  try {
    await customerSheetRequest({ name: name.trim(), phone: phone.trim(), phoneDigits: digits, signedInAt: new Date().toISOString() });
    return res.json({ name: name.trim() });
  } catch (error) {
    console.error('Customer sheet request failed:', error.message);
    return res.status(error.message === 'NOT_CONFIGURED' ? 503 : 502).json({ error: 'Could not save your details right now. Please try again later.' });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => console.log(`Digital Dairy running on port ${port}`));
