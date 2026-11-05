import express from 'express';
import OpenAI from 'openai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const here = path.dirname(fileURLToPath(import.meta.url));
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
app.use(express.json({ limit: '11mb' }));
app.use(express.static(here));
app.use((req, res, next) => {
  const allowedOrigin = process.env.FRONTEND_ORIGIN;
  if (allowedOrigin && req.headers.origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.post('/api/animal-health', async (req, res) => {
  const { animal, notes = '', image } = req.body ?? {};
  if (!['cow', 'goat', 'buffalo'].includes(animal)) {
    return res.status(400).json({ error: 'Choose cow, goat or buffalo.' });
  }
  if (typeof notes !== 'string' || notes.length > 1200) {
    return res.status(400).json({ error: 'Keep symptom notes under 1,200 characters.' });
  }
  if (typeof image !== 'string' || image.length > 10_800_000) {
    return res.status(400).json({ error: 'Choose an image smaller than 8 MB.' });
  }
  const match = image.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match || !imageTypes.has(match[1])) {
    return res.status(400).json({ error: 'Upload a JPEG, PNG or WebP image.' });
  }
  try {
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      instructions: `You provide cautious, educational livestock health triage, not veterinary diagnosis. The animal is a ${animal}. Inspect the image only for visible observations and say when it is unclear. Never claim certainty from a photo, prescribe a drug, dose, or home cure, or advise delaying veterinary care. Give: (1) visible observations, (2) a few possible causes explicitly labeled possibilities, (3) safe immediate care such as clean water, shade, isolation if contagious disease is possible, and hygiene, (4) signs that need urgent veterinary attention, and (5) what details to give a veterinarian. For emergency signs (breathing difficulty, collapse, severe bleeding, inability to stand, bloat, seizures, difficult birth, severe dehydration), clearly direct the user to contact a veterinarian immediately. Use plain language and concise headings.`,
      input: [{
        role: 'user',
        content: [
          { type: 'input_text', text: `Please review this ${animal} photo. Symptoms or changes reported by the keeper: ${notes.trim() || 'No additional symptoms supplied.'}` },
          { type: 'input_image', image_url: image, detail: 'low' },
        ],
      }],
      max_output_tokens: 600,
    });
    res.json({ guidance: response.output_text || 'I could not produce guidance. Please contact a veterinarian.' });
  } catch (error) {
    console.error('Animal health request failed:', error.message);
    res.status(502).json({ error: 'The AI service could not review this photo. Try again later or contact a veterinarian.' });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Digital Dairy running at http://localhost:${port}`));
