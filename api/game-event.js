const DEFAULT_MODEL = "qwen/qwen3-235b-a22b-instruct-2507";
const MAX_BODY_BYTES = 12000;

function clean(value, max) {
  return String(value ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
}

function normalize(body = {}) {
  const market = body.market || {}; const portfolio = body.portfolio || {};
  return {
    turn: Math.max(1, Math.min(20, Number(body.turn) || 1)),
    language: body.language === "zh" ? "zh" : "en",
    origin: clean(body.origin, 30), action: clean(body.action, 120), deal: clean(body.deal, 120), localEvent: clean(body.localEvent, 160),
    market: { regime: clean(market.regime, 30), baseRate: Math.max(0, Math.min(30, Number(market.baseRate) || 0)), credit: clean(market.credit, 20) },
    portfolio: {
      netWorth: Number(portfolio.netWorth) || 0, cash: Math.max(0, Number(portfolio.cash) || 0), debt: Math.max(0, Number(portfolio.debt) || 0),
      control: Math.max(0, Math.min(100, Number(portfolio.control) || 0)), reputation: Math.max(0, Math.min(100, Number(portfolio.reputation) || 0)),
      fragility: Math.max(0, Math.min(100, Number(portfolio.fragility) || 0))
    }
  };
}

function promptFor(context) {
  const language = context.language === "zh" ? "Simplified Chinese" : "English";
  return `You are Ralph, the fictional deal-desk broker in an educational retro finance game.
React to the completed decision below. This is fictional narration, never an investment prediction or recommendation.

${JSON.stringify(context)}

Return only valid JSON with exactly these string fields:
{"speaker":"Ralph","dialogue":"2 short sentences maximum","complication":"a concise consequence or tension","lesson":"one institutional-finance lesson"}

Write in ${language}. Refer to the supplied action and state. Do not invent prices, percentages, returns, laws, or portfolio values. Do not recommend buying, selling, or holding a real security. No Markdown.`;
}

function parseOutput(output) {
  const raw = Array.isArray(output) ? output.join("") : String(output ?? "");
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON returned");
  const value = JSON.parse(match[0]);
  const result = { speaker: clean(value.speaker || "Ralph", 40), dialogue: clean(value.dialogue, 420), complication: clean(value.complication, 220), lesson: clean(value.lesson, 220) };
  if (!result.dialogue || !result.lesson) throw new Error("Incomplete narration");
  return result;
}

function modelInput(model, prompt) {
  const common = { prompt, temperature: 0.65, top_p: 0.9 };
  return model.startsWith("meta/meta-llama") ? { ...common, max_new_tokens: 260 } : { ...common, max_tokens: 260 };
}

async function readPrediction(token, url, signal) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal });
  if (!response.ok) throw new Error(`Prediction status failed (${response.status})`);
  return response.json();
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const origin = req.headers.origin; const host = req.headers.host;
  if (origin && host) {
    try { if (new URL(origin).host !== host) return res.status(403).json({ error: "Cross-origin request denied" }); }
    catch (_) { return res.status(403).json({ error: "Invalid origin" }); }
  }
  const bodySize = Math.max(Number(req.headers["content-length"] || 0), JSON.stringify(req.body || {}).length);
  if (bodySize > MAX_BODY_BYTES) return res.status(413).json({ error: "Request too large" });

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return res.status(503).json({ error: "AI narrator is not configured", fallback: true });
  const context = normalize(req.body);
  if (!context.action || !context.deal) return res.status(400).json({ error: "Missing action or deal" });

  const model = process.env.REPLICATE_MODEL || DEFAULT_MODEL;
  if (!/^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i.test(model)) return res.status(500).json({ error: "Invalid model configuration" });
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 28000);

  try {
    const response = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: "POST", signal: controller.signal,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "wait=20" },
      body: JSON.stringify({ input: modelInput(model, promptFor(context)) })
    });
    if (!response.ok) throw new Error(`Replicate request failed (${response.status}): ${clean(await response.text(), 200)}`);
    let prediction = await response.json();
    for (let i = 0; !["succeeded", "failed", "canceled"].includes(prediction.status) && i < 4; i += 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      prediction = await readPrediction(token, prediction.urls.get, controller.signal);
    }
    if (prediction.status !== "succeeded") throw new Error(`Prediction ended with ${prediction.status}`);
    return res.status(200).json({ narration: parseOutput(prediction.output), source: "replicate", model });
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    console.error("game-event", timedOut ? "timeout" : error?.message);
    return res.status(timedOut ? 504 : 502).json({ error: timedOut ? "AI narrator timed out" : "AI narrator unavailable", fallback: true });
  } finally { clearTimeout(timeout); }
};
