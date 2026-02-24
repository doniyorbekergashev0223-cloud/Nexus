/**
 * Vercel Serverless: loyiha matnini Gemini orqali baholaydi.
 * So‘rov: POST, body: { title, problem, solution }
 * Javob: { totalScore, problemValidity, innovation, impact, market, feasibility }
 * Muhit: GEMINI_API_KEY (Vercel Environment Variables)
 * Eslatma: Kalit serverless dan ishlatiladi — Google Cloud/AI Studio da API key da
 * "Application restrictions" = None qiling (HTTP referrer qo‘ymang), aks holda 403/502.
 */

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

function parseScores(text) {
  const fallback = { totalScore: 70, problemValidity: 18, innovation: 14, impact: 14, market: 12, feasibility: 12 };
  try {
    const json = typeof text === 'string' ? JSON.parse(text.replace(/```json?\s*|\s*```/g, '').trim()) : text;
    const total = Number(json.totalScore) ?? (Number(json.problemValidity) + Number(json.innovation) + Number(json.impact) + Number(json.market) + Number(json.feasibility));
    return {
      totalScore: Math.min(100, Math.max(0, Math.round(Number(json.totalScore) || total))),
      problemValidity: Math.min(25, Math.max(0, Math.round(Number(json.problemValidity) || 0))),
      innovation: Math.min(20, Math.max(0, Math.round(Number(json.innovation) || 0))),
      impact: Math.min(20, Math.max(0, Math.round(Number(json.impact) || 0))),
      market: Math.min(20, Math.max(0, Math.round(Number(json.market) || 0))),
      feasibility: Math.min(15, Math.max(0, Math.round(Number(json.feasibility) || 0))),
    };
  } catch (_) {
    return fallback;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_API_KEY not configured', fallback: true });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch (_) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { title = '', problem = '', solution = '' } = body;
  const text = `Loyiha nomi: ${title}\n\nMuammo: ${problem}\n\nYechim (MVP): ${solution}`.slice(0, 15000);

  const prompt = `Quyida berilgan startap loyiha matnini baholang. Javobni FAQAT quyidagi JSON formatida bering, boshqa matn yozmang:
{"problemValidity": 0-25, "innovation": 0-20, "impact": 0-20, "market": 0-20, "feasibility": 0-15, "totalScore": 0-100}
Qoidalar: problemValidity - muammoning dolzarbligi (max 25), innovation - innovatsionlik (max 20), impact - ijtimoiy ta'sir (max 20), market - bozor salohiyati (max 20), feasibility - texnik amalga oshirish (max 15). totalScore - jami ball (0-100). Faqat raqamlar, vergul va jingalak qavs.`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt + '\n\n---\n\n' + text }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
          maxOutputTokens: 256,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error', response.status, errText);
      let detail = errText;
      try {
        const errJson = JSON.parse(errText);
        detail = errJson?.error?.message || errJson?.message || errText;
      } catch (_) {}
      return res.status(502).json({
        error: 'Gemini request failed',
        fallback: true,
        detail: detail.slice(0, 300),
        status: response.status,
      });
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) {
      return res.status(502).json({ error: 'No content in Gemini response', fallback: true });
    }

    const scores = parseScores(raw);
    return res.status(200).json(scores);
  } catch (err) {
    console.error('analyze error', err);
    return res.status(500).json({ error: err.message || 'Server error', fallback: true });
  }
}
