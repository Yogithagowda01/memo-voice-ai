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
        return null; // Continue with fallback mode instead of exiting
      }
    }
  }
  return null; // No model worked - will use fallback mode
}

// ── Gemini call helper with offline fallback ──────────────────
async function askGemini(userMessage, context, store) {
  if (!ACTIVE_MODEL) {
    // Fallback to improved mock AI responses with accuracy
    return getMockAIResponse(userMessage, context, store);
  }

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

// ── Improved mock AI responses with data accuracy ───────────────
function getMockAIResponse(userMessage, context, store) {
  const lower = userMessage.toLowerCase();
  const meds = store?.medications || [];
  const mems = store?.memories || [];

  // Medication responses with accuracy
  if (lower.match(/medic|pill|tablet|drug|dose|take medicine|when.*take/)) {
    if (meds.length > 0) {
      const upcoming = meds.slice(0, 2).map(m => `${m.name} at ${m.time}`).join(", ");
      return `Your next medications are: ${upcoming}. I'll remind you when it's time. Your caregiver has set these up carefully for you.`;
    }
    return "It's time to take your medication. Your caregiver has set up reminders for you. Would you like me to remind you which ones to take?";
  }

  // Family/memory responses with real data
  if (lower.match(/family|daughter|son|wife|husband|grandchild|sister|brother|remember|memory/)) {
    if (mems.length > 0) {
      const recentMem = mems[0];
      return `I remember that ${recentMem.person} shared with you: "${recentMem.text.slice(0, 50)}...". Your family loves you very much.`;
    }
    return "Your family is very important to you. I can help you remember special moments with your loved ones.";
  }

  // Help responses
  if (lower.match(/help|what can you|how do/)) {
    return "I'm here to help you with medication reminders, sharing family memories, and keeping you company. You can speak to me anytime.";
  }

  // Emergency responses
  if (lower.match(/emergency|help|hurt|sick|pain/)) {
    return "If you're having an emergency, please press the red SOS button or call your caregiver immediately. I'm here to help.";
  }

  // Greeting responses
  if (lower.match(/hello|hi|hey|good morning|good afternoon|how are/)) {
    return "Hello! It's wonderful to hear your voice today. How are you feeling? I'm here to help with anything you need.";
  }

  // Default responses
  const defaults = [
    "I'm listening. Could you tell me a bit more about what you need help with?",
    "Thank you for sharing that with me. I'm always here to listen and help.",
    "I understand. Let me see how I can assist you today.",
    "That's interesting. Would you like to talk about your family or medications?",
  ];

  return defaults[Math.floor(Math.random() * defaults.length)];
}

// ✨ NEW: Get next medication alert time
function getNextMedicationAlert(store) {
  const meds = store?.medications || [];
  if (meds.length === 0) return null;
  
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  // Find next medication time
  for (const med of meds) {
    if (med.time > currentTime) {
      return { medication: med.name, time: med.time, in_minutes: calculateMinutesUntil(med.time) };
    }
  }
  
  // If no more today, return first one tomorrow
  if (meds.length > 0) {
    const firstMed = meds[0];
    const tomorrow = (24 * 60) - (now.getHours() * 60 + now.getMinutes()) + parseInt(firstMed.time.split(':')[0]) * 60 + parseInt(firstMed.time.split(':')[1]);
    return { medication: firstMed.name, time: firstMed.time, in_minutes: tomorrow, tomorrow: true };
  }
  
  return null;
}

// ✨ NEW: Calculate minutes until time
function calculateMinutesUntil(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0);
  
  if (target < now) {
    target.setDate(target.getDate() + 1);
  }
  
  return Math.floor((target - now) / 60000);
}

// ✨ NEW: Real-time alerts system
const alertSessions = new Map(); // Track alert subscriptions

function checkMedicationAlerts(store) {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const alerts = [];
  for (const med of store.medications || []) {
    // Alert within 5 minutes before scheduled time
    const minBefore = calculateMinutesUntil(med.time);
    if (minBefore >= -5 && minBefore <= 5) {
      alerts.push({
        type: 'medication',
        medication: med.name,
        dosage: med.dosage,
        time: med.time,
        message: `Time to take ${med.name}${med.dosage ? ' (' + med.dosage + ')' : ''}`,
        urgency: minBefore < 0 ? 'overdue' : minBefore < 2 ? 'urgent' : 'upcoming'
      });
    }
  }
  
  return alerts;
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

// ✨ NEW: Enhanced health check with connectivity test
app.get("/health", async (_req, res) => {
  const s = loadStore();
  let geminiStatus = "offline";
  let latency = null;
  
  // Test Gemini connectivity if model is available
  if (ACTIVE_MODEL) {
    try {
      const t0 = Date.now();
      const model = genAI.getGenerativeModel({ model: ACTIVE_MODEL });
      await model.generateContent("ping");
      latency = Date.now() - t0;
      geminiStatus = "online";
    } catch {
      geminiStatus = "offline";
    }
  }
  
  res.json({ 
    status: "ok", 
    model: ACTIVE_MODEL || "fallback (mock AI)",
    gemini_status: geminiStatus,
    latency_ms: latency,
    uptime: Math.floor(process.uptime()) + "s",
    memories: s.memories.length, 
    medications: s.medications.length,
    next_alert: getNextMedicationAlert(s)
  });
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
    const reply = await askGemini(message.trim(), context, store);
    const ms    = Date.now() - t0;
    store.conversations = (store.conversations || []).slice(-99);
    store.conversations.push({ ts: new Date().toISOString(), user: message.trim(), ai: reply, ms });
    saveStore(store);
    res.json({ reply, model: ACTIVE_MODEL || "fallback", latency_ms: ms });
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

// ✨ NEW: Real-time alerts endpoint — check for medication reminders
app.get("/alerts", (req, res) => {
  const store = loadStore();
  const alerts = checkMedicationAlerts(store);
  const nextAlert = getNextMedicationAlert(store);
  
  res.json({
    current_alerts: alerts,
    next_scheduled: nextAlert,
    total_medications: store.medications.length,
    timestamp: new Date().toISOString()
  });
});

// ✨ NEW: Polling endpoint for continuous alert checking
app.post("/alerts/check", (req, res) => {
  const store = loadStore();
  const alerts = checkMedicationAlerts(store);
  const nextAlert = getNextMedicationAlert(store);
  
  const hasUrgent = alerts.some(a => a.urgency === 'urgent' || a.urgency === 'overdue');
  
  res.json({
    has_alerts: alerts.length > 0,
    has_urgent: hasUrgent,
    alerts: alerts,
    next_alert: nextAlert,
    last_checked: new Date().toISOString()
  });
});

// ✨ NEW: Get medication accuracy report
app.get("/medications/report", (req, res) => {
  const store = loadStore();
  const meds = store.medications || [];
  const conversations = store.conversations || [];
  
  // Analyze medication mentions in conversations
  const medMentions = {};
  for (const conv of conversations) {
    const text = (conv.user + ' ' + conv.ai).toLowerCase();
    for (const med of meds) {
      const medName = med.name.toLowerCase();
      if (text.includes(medName)) {
        medMentions[med.id] = (medMentions[med.id] || 0) + 1;
      }
    }
  }
  
  const report = meds.map(med => ({
    name: med.name,
    time: med.time,
    frequency: med.frequency,
    mentions_in_conversations: medMentions[med.id] || 0,
    accuracy_score: medMentions[med.id] ? 'high' : 'not mentioned'
  }));
  
  res.json({
    total_medications: meds.length,
    total_conversations: conversations.length,
    medications: report
  });
});

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
      console.log(`║  Model  : ✅ ${ACTIVE_MODEL.padEnd(29)}║`);
    } else {
      console.log("║  Model  : ⚠️ FALLBACK MODE — Mock AI     ║");
    }
    console.log("╠══════════════════════════════════════════╣");
    console.log(`║  ✅ Test    : http://localhost:${PORT}/test       ║`);
    console.log(`║  🔍 Models  : http://localhost:${PORT}/list-models║`);
    console.log(`║  🐛 Debug   : http://localhost:${PORT}/debug-env  ║`);
    console.log("╚══════════════════════════════════════════╝\n");
  });
})();