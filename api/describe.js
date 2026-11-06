/* Redactor de descripciones con IA (Vercel Serverless Function).
   Solo funciona con la sesión del administrador de Supabase.
   Usa Google Gemini (gratis): variable GEMINI_API_KEY en Vercel > Settings > Environment Variables.
   Opcional: si no hay clave de Gemini pero sí ANTHROPIC_API_KEY, usa Claude. */
global.window = global.window || {};
require('../config.js');
const CFG = global.window.SDV_CONFIG || {};

const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
const GEMINI_MODELS = [process.env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash'].filter(Boolean);

const SYSTEM = `Sos redactor de avisos de una corredora inmobiliaria de San Martín, Mendoza (Argentina).
Escribí la descripción de una propiedad en español rioplatense, con voz natural y cercana, como la escribiría una persona del rubro y no un robot.
Reglas:
- Usá únicamente los datos que te paso. No inventes características, medidas, estado de conservación, vistas, cercanías ni terminaciones. Si un dato no está, no lo menciones.
- No menciones el precio ni la dirección exacta.
- Si hay notas de la corredora, respetalas e incorporalas con tus palabras.
- Entre 90 y 150 palabras, en 2 o 3 párrafos cortos.
- Sin emojis, sin listas, sin títulos, sin signos de exclamación y sin frases hechas como "oportunidad única", "imperdible" o "en el corazón de".
- Hablá de lo concreto: distribución, superficie, servicios y para quién puede ser una buena opción.
Devolvé solo el texto de la descripción.`;

const str = (v, n = 200) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
const num = v => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : 0);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const geminiKey = process.env.GEMINI_API_KEY, claudeKey = process.env.ANTHROPIC_API_KEY;
  if (!(geminiKey || claudeKey) || !CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY) return res.status(503).json({ error: 'not_configured' });

  /* Solo el administrador puede usarlo */
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  let user;
  try {
    const r = await fetch(`${CFG.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: CFG.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
    if (!r.ok) return res.status(401).json({ error: 'unauthorized' });
    user = await r.json();
  } catch (e) { return res.status(502).json({ error: 'auth_unreachable' }); }
  if (CFG.ADMIN_EMAIL && String(user.email || '').toLowerCase() !== String(CFG.ADMIN_EMAIL).toLowerCase()) return res.status(403).json({ error: 'forbidden' });

  const b = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch (e) { return {}; } })() : (req.body || {});
  const sv = b.services || {};
  const data = {
    tipo: str(b.type, 40), operacion: str(b.operation, 20), titulo: str(b.title, 140),
    barrio: str(b.neighborhood, 80), ciudad: str(b.city, 80),
    superficie_total_m2: num(b.totalArea), superficie_cubierta_m2: num(b.coveredArea),
    antiguedad_anios: b.age === '' || b.age == null ? null : Number(b.age),
    ambientes: num(b.rooms), dormitorios: num(b.bedrooms), banios: num(b.bathrooms), cocheras: num(b.garages),
    servicios: ['electricity:luz', 'water:agua', 'gas:gas natural', 'sewer:cloacas', 'asphalt:calle asfaltada'].filter(s => sv[s.split(':')[0]]).map(s => s.split(':')[1]),
    apto_credito: !!b.creditEligible, apto_mascotas: !!b.petFriendly,
    notas_de_la_corredora: str(b.notes, 1500)
  };

  const userMsg = 'Datos de la propiedad (JSON):\n' + JSON.stringify(data, null, 2);
  try {
    let text = '', lastErr = '';
    if (geminiKey) {
      for (const m of GEMINI_MODELS) {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
          method: 'POST',
          headers: { 'x-goog-api-key': geminiKey, 'content-type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM }] },
            contents: [{ role: 'user', parts: [{ text: userMsg }] }],
            generationConfig: { maxOutputTokens: 2048, temperature: 0.8 }
          })
        });
        const j = await r.json().catch(() => ({}));
        if (r.ok) {
          text = ((j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || []).map(x => x.text || '').join('').trim();
          if (text) break;
          lastErr = 'empty';
          continue;
        }
        lastErr = str(j.error && j.error.message, 200);
        if (r.status === 429) return res.status(429).json({ error: 'rate_limited' });
        if (r.status === 400 || r.status === 401 || r.status === 403) { if (/api key/i.test(lastErr)) break; }
      }
    } else {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': claudeKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 700, system: SYSTEM, messages: [{ role: 'user', content: userMsg }] })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) lastErr = str(j.error && j.error.message, 200);
      else text = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n').trim();
    }
    if (!text) return res.status(502).json({ error: 'ai_error', detail: lastErr });
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: 'ai_unreachable' });
  }
};
