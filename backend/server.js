// ═══════════════════════════════════════════════════════════════
//  MemoVoice AI — Backend  (Fixed: model auto-detection)
//  SDK: @google/generative-ai  v0.24.x
// ═══════════════════════════════════════════════════════════════

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// ── Validate API key ───────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("REPLACE")) {
  console.error("\n❌  GEMINI_API_KEY missing or not set in .env");
  console.error("    Get a free key at: https://aistudio.google.com/app/apikey\n");
  process.exit(1);
}
console.log("✅  GEMINI_API_KEY loaded:", GEMINI_API_KEY.slice(0, 8) + "..." + GEMINI_API_KEY.slice(-4));

const express = require("express");
const cors    = require("cors");
const fs      = require("fs");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const app  = express();
const PORT = process.env.PORT || 5000;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ── Model candidates (ordered best → most compatible) ──────────
//
//  WHY THIS LIST EXISTS:
//  Different API keys have different model availability depending on:
//    • When the key was created (newer keys default to v2 models)
//    • Google Cloud project region
//    • Whether Gemini API is enabled in the GCP console
//    • Free tier vs paid tier
//
//  The server auto-detects which model actually works for YOUR key.
//
const MODEL_CANDIDATES = [
  "gemini-2.0-flash",          // newest, available to most keys (2025)
  "gemini-2.0-flash-lite",     // lightest 2.0 model
  "gemini-2.0-flash-exp",      // experimental 2.0
  "gemini-1.5-flash",          // most common, may need older key
  "gemini-1.5-flash-latest",   // alias — sometimes works when base doesn't
  "gemini-1.5-flash-8b",       // smallest 1.5
  "gemini-1.5-pro",            // most capable 1.5
  "gemini-1.5-pro-latest",     // alias
];

// Will be set at startup by autoDetectModel()
let ACTIVE_MODEL = process.env.GEMINI_MODEL || null;

// ── Safety settings ────────────────────────────────────────────
const SAFETY = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const SYSTEM_PROMPT = `You are MemoVoice AI, a warm and caring voice companion for elderly people with early-stage dementia. 
Speak simply and gently. Keep responses to 2-4 sentences. Never use markdown formatting, bullet points, or asterisks. 
Plain conversational speech only. Always end warmly. If medications are mentioned, be clear and reassuring.`;

// ── Auto-detect working model ──────────────────────────────────
async function autoDetectModel() {
  // If a model is set in .env, try it first before probing
  const envModel = process.env.GEMINI_MODEL;
  const tryList = envModel
    ? [envModel, ...MODEL_CANDIDATES.filter(m => m !== envModel)]
    : MODEL_CANDIDATES;

  console.log("\n🔍  Auto-detecting working Gemini model for your API key...");

  for (const modelName of tryList) {
    try {
      process.stdout.write(`    Trying ${modelName.padEnd(28)} `);
      const model  = genAI.getGenerativeModel({ model: modelName, safetySettings: SAFETY });
      const result = await model.generateContent("Reply with only the word: OK");
      const text   = result.response.text().trim();
      if (text) {
        console.log("✅  WORKS");
        return modelName;
      }
    } catch (err) {
      const reason = err.message.includes("not found") ? "not available for your key"
        : err.message.includes("API key")              ? "API key rejected"
        : err.message.includes("quota")                ? "quota exceeded"
        : err.message.slice(0, 40);
      console.log(`❌  ${reason}`);

      // If the API key itself is rejected, stop probing immediately
      if (err.message.toLowerCase().includes("api key") ||
          err.message.toLowerCase().includes("permission") ||
          err.message.toLowerCase().includes("invalid key")) {
        console.error("\n❌  API KEY ERROR — check your key at https://aistudio.google.com/app/apikey\n");
        process.exit(1);
      }
    }
  }
  return null; // No model worked
}

// ── Gemini call helper ─────────────────────────────────────────
async function askGemini(userMessage, context) {
  if (!ACTIVE_MODEL) throw new Error("No working Gemini model found. Check /list-models");

  const model = genAI.getGenerativeModel({
    model: ACTIVE_MODEL,
    systemInstruction: SYSTEM_PROMPT,
    safetySettings: SAFETY,
    generationConfig: { temperature: 0.75, topP: 0.9, maxOutputTokens: 300 },
  });

  const prompt = context
    ? `[Patient context - do not read aloud]\n${context}\n\n[Patient says]: ${userMessage}`
    : userMessage;

  const result   = await model.generateContent(prompt);
  const response = result.response;

  if (response.promptFeedback?.blockReason) {
    throw new Error("Blocked: " + response.promptFeedback.blockReason);
  }
  const text = response.text()?.trim();
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

// ── JSON file memory store ─────────────────────────────────────
const MEMORY_FILE = path.join(__dirname, "memories.json");

function loadStore() {
  try {
    if (!fs.existsSync(MEMORY_FILE)) {
      fs.writeFileSync(MEMORY_FILE, JSON.stringify({ memories: [], medications: [], conversations: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
  } catch { return { memories: [], medications: [], conversations: [] }; }
}

function saveStore(data) {
  try { fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2)); return true; }
  catch { return false; }
}

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000",
           process.env.FRONTEND_URL].filter(Boolean),
  methods: ["GET", "POST", "OPTIONS"],
}));
app.use(express.json({ limit: "10mb" }));
app.use((_req, _res, next) => { console.log(`[${new Date().toISOString().slice(11,19)}] ${_req.method} ${_req.path}`); next(); });

// ═══════════════════════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════════════════════

app.get("/", (_req, res) => res.json({
  service: "MemoVoice AI Backend", status: "running",
  active_model: ACTIVE_MODEL || "none — startup probe failed",
  routes: ["GET /test", "GET /list-models", "GET /health", "GET /debug-env",
           "POST /ask-ai", "GET|POST /memories", "GET|POST /medications"],
}));

app.get("/health", (_req, res) => {
  const s = loadStore();
  res.json({ status: "ok", model: ACTIVE_MODEL, uptime: Math.floor(process.uptime()) + "s",
             memories: s.memories.length, medications: s.medications.length });
});

// ── /list-models — shows every model your API key can reach ────
app.get("/list-models", async (_req, res) => {
  console.log("Probing all model candidates for this API key...");
  const results = [];

  for (const name of MODEL_CANDIDATES) {
    try {
      const model  = genAI.getGenerativeModel({ model: name });
      const result = await model.generateContent("Reply OK");
      const works  = !!result.response.text();
      results.push({ model: name, status: works ? "✅ works" : "⚠️ empty response" });
      console.log(`  ${name}: OK`);
    } catch (err) {
      const reason = err.message.includes("not found")  ? "not available for your key"
        : err.message.includes("quota")                 ? "quota exceeded"
        : err.message.includes("API key")               ? "API key issue"
        : err.message.slice(0, 60);
      results.push({ model: name, status: `❌ ${reason}` });
      console.log(`  ${name}: FAIL — ${reason}`);
    }
  }

  const working = results.filter(r => r.status.startsWith("✅")).map(r => r.model);
  res.json({
    summary: working.length > 0 ? `${working.length} model(s) work with your key` : "No models worked — check your API key",
    recommended: working[0] || null,
    all_results: results,
    fix_instructions: working.length > 0
      ? `Add this to your .env:  GEMINI_MODEL=${working[0]}`
      : "Go to https://aistudio.google.com/app/apikey and create a new API key",
  });
});

// ── /test — browser smoke test ─────────────────────────────────
app.get("/test", async (_req, res) => {
  console.log("Running Gemini smoke test...");
  const t0 = Date.now();
  try {
    const reply = await askGemini("Say hello in one warm sentence as MemoVoice AI.");
    const ms    = Date.now() - t0;
    console.log(`Gemini test OK in ${ms}ms`);
    res.json({ status: "✅ Gemini API is working!", model: ACTIVE_MODEL, response: reply, latency_ms: ms });
  } catch (err) {
    console.error("Gemini test FAILED:", err.message);
    res.status(500).json({
      status:      "❌ Gemini API Error",
      error:       err.message,
      model_tried: ACTIVE_MODEL,
      fix:         "Open http://localhost:5000/list-models to see which models work with your key",
    });
  }
});

// ── /ask-ai — main AI endpoint called by React frontend ────────
app.post("/ask-ai", async (req, res) => {
  const { message, context: bodyContext } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: "message field is required", example: { message: "When do I take my pills?" } });
  }

  const t0    = Date.now();
  const store = loadStore();
  let context = bodyContext || "";
  if (!context) {
    const mems = store.memories.slice(0, 5).map(m => `- ${m.person}: "${m.text}"`).join("\n");
    const meds = store.medications.map(m => `- ${m.name} at ${m.time} (${m.frequency})`).join("\n");
    if (mems) context += "MEMORIES:\n" + mems + "\n\n";
    if (meds) context += "MEDICATIONS:\n" + meds;
  }

  try {
    const reply = await askGemini(message.trim(), context);
    const ms    = Date.now() - t0;
    store.conversations = (store.conversations || []).slice(-99);
    store.conversations.push({ ts: new Date().toISOString(), user: message.trim(), ai: reply, ms });
    saveStore(store);
    res.json({ reply, model: ACTIVE_MODEL, latency_ms: ms });
  } catch (err) {
    console.error("/ask-ai error:", err.message);
    res.status(500).json({ error: "AI response failed", detail: err.message });
  }
});

// ── Memory routes ──────────────────────────────────────────────
app.post("/memories", (req, res) => {
  const { text, person, category } = req.body;
  if (!text || !person) return res.status(400).json({ error: "text and person required" });
  const store = loadStore();
  const entry = { id: Date.now().toString(), text: text.trim(), person: person.trim(), category: category || "family", date: new Date().toLocaleDateString(), created: new Date().toISOString() };
  store.memories.unshift(entry);
  saveStore(store);
  res.status(201).json({ success: true, memory: entry });
});
app.get("/memories", (_req, res) => { const s = loadStore(); res.json({ count: s.memories.length, memories: s.memories }); });

// ── Medication routes ──────────────────────────────────────────
app.post("/medications", (req, res) => {
  const { name, dosage, time, frequency } = req.body;
  if (!name || !time) return res.status(400).json({ error: "name and time required" });
  const store = loadStore();
  const entry = { id: Date.now().toString(), name: name.trim(), dosage: dosage || "", time: time.trim(), frequency: frequency || "daily", created: new Date().toISOString() };
  store.medications.push(entry);
  saveStore(store);
  res.status(201).json({ success: true, medication: entry });
});
app.get("/medications", (_req, res) => { const s = loadStore(); res.json({ count: s.medications.length, medications: s.medications }); });

// ── Debug env ──────────────────────────────────────────────────
app.get("/debug-env", (_req, res) => res.json({
  NODE_ENV: process.env.NODE_ENV || "not set",
  PORT: PORT,
  ACTIVE_MODEL,
  GEMINI_MODEL_ENV: process.env.GEMINI_MODEL || "(not set — using auto-detected)",
  API_KEY_SET: !!GEMINI_API_KEY,
  API_KEY_HINT: GEMINI_API_KEY.slice(0, 8) + "..." + GEMINI_API_KEY.slice(-4),
  DOTENV_EXISTS: fs.existsSync(path.join(__dirname, ".env")),
}));

app.use((req, res) => res.status(404).json({ error: `Not found: ${req.method} ${req.path}`, hint: "Check GET / for all routes" }));
app.use((err, _req, res, _next) => { console.error("Unhandled:", err.message); res.status(500).json({ error: err.message }); });

// ═══════════════════════════════════════════════════════════════
//  STARTUP — auto-detect model THEN start listening
// ═══════════════════════════════════════════════════════════════
(async () => {
  ACTIVE_MODEL = await autoDetectModel();

  if (!ACTIVE_MODEL) {
    console.error("\n❌  No Gemini model worked with your API key.");
    console.error("    Possible causes:");
    console.error("    1. API key is invalid or expired → https://aistudio.google.com/app/apikey");
    console.error("    2. Gemini API not enabled → https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com");
    console.error("    3. Your region restricts Gemini access\n");
    console.error("    The server will still start — open /list-models for diagnostic details.\n");
    // Don't exit — let /list-models help diagnose
  }

  app.listen(PORT, () => {
    console.log("\n╔══════════════════════════════════════════╗");
    console.log("║      MemoVoice AI — Backend Running      ║");
    console.log("╠══════════════════════════════════════════╣");
    console.log(`║  URL    : http://localhost:${PORT}            ║`);
    if (ACTIVE_MODEL) {
      console.log(`║  Model  : ${ACTIVE_MODEL.padEnd(31)}║`);
    } else {
      console.log("║  Model  : ❌ NONE — see /list-models     ║");
    }
    console.log("╠══════════════════════════════════════════╣");
    console.log(`║  ✅ Test    : http://localhost:${PORT}/test       ║`);
    console.log(`║  🔍 Models  : http://localhost:${PORT}/list-models║`);
    console.log(`║  🐛 Debug   : http://localhost:${PORT}/debug-env  ║`);
    console.log("╚══════════════════════════════════════════╝\n");
  });
})();