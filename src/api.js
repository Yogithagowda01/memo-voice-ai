// ═══════════════════════════════════════════════════════════════
//  MemoVoice AI — Frontend API Helper
//  Place this in: src/api.js  (in your React project)
//
//  Usage:
//    import { askAI, saveMemory, saveMedication, loadAll } from './api';
// ═══════════════════════════════════════════════════════════════

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// ── Core fetch wrapper with error handling ─────────────────────
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.detail || `HTTP ${res.status}`);
    }
    return data;
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Cannot reach backend. Is the server running on port 5000?");
    }
    throw err;
  }
}

// ── Ask AI a question (main voice chat endpoint) ───────────────
// Returns: { reply: string, model: string, latency_ms: number }
export async function askAI(message, context = "") {
  return apiFetch("/ask-ai", {
    method: "POST",
    body: JSON.stringify({ message, context }),
  });
}

// ── Save a family memory ───────────────────────────────────────
// Returns: { success: true, memory: { id, text, person, category, date } }
export async function saveMemory({ text, person, category = "family" }) {
  return apiFetch("/memories", {
    method: "POST",
    body: JSON.stringify({ text, person, category }),
  });
}

// ── Load all memories ──────────────────────────────────────────
// Returns: { count: number, memories: Memory[] }
export async function loadMemories() {
  return apiFetch("/memories");
}

// ── Save a medication reminder ─────────────────────────────────
export async function saveMedication({ name, dosage, time, frequency = "daily" }) {
  return apiFetch("/medications", {
    method: "POST",
    body: JSON.stringify({ name, dosage, time, frequency }),
  });
}

// ── Load all medications ───────────────────────────────────────
export async function loadMedications() {
  return apiFetch("/medications");
}

// ── Health check (test if backend is reachable) ────────────────
export async function checkHealth() {
  return apiFetch("/health");
}

// ── Load everything in one go ──────────────────────────────────
export async function loadAll() {
  const [memories, medications] = await Promise.all([
    loadMemories(),
    loadMedications(),
  ]);
  return {
    memories:    memories.memories,
    medications: medications.medications,
  };
}

export default { askAI, saveMemory, loadMemories, saveMedication, loadMedications, checkHealth, loadAll };
