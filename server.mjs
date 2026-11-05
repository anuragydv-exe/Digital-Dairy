import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));
app.use(express.static(here));

const attemptsByIp = new Map();
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
  const webAppUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL;
  const sharedSecret = process.env.GOOGLE_SHEETS_SHARED_SECRET;
  if (!webAppUrl || !sharedSecret) {
    return res.status(503).json({ error: 'Customer sign-in is not connected yet. Please try again later.' });
  }

  try {
    const sheetResponse = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: sharedSecret,
        name: name.trim(),
        phone: phone.trim(),
        phoneDigits: digits,
        signedInAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(15000),
    });
    const sheetText = await sheetResponse.text();
    let sheetResult = {};
    try { sheetResult = sheetText ? JSON.parse(sheetText) : {}; } catch (error) {}
    if (!sheetResponse.ok || sheetResult.ok !== true) {
      console.error('Customer sheet rejected a sign-in:', sheetResult.error || `HTTP ${sheetResponse.status}`);
      return res.status(502).json({ error: 'Could not save your details right now. Please try again later.' });
    }
    return res.json({ name: name.trim() });
  } catch (error) {
    console.error('Customer sheet request failed:', error.message);
    return res.status(502).json({ error: 'Could not reach the private customer list. Please try again later.' });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => console.log(`Digital Dairy running on port ${port}`));
