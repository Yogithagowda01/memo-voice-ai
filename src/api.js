// ═══════════════════════════════════════════════════════════════
//  MemoVoice AI — Frontend API Client  (src/api.js)
//
//  Place this file at:  src/api.js
//  It maps every React action to the correct backend endpoint.
//
//  Backend must be running at http://localhost:5000
//  Set REACT_APP_BACKEND_URL in frontend/.env to override.
// ═══════════════════════════════════════════════════════════════

const BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// ── Core fetch wrapper ─────────────────────────────────────────
async function api(path, options = {}) {
  const url = `${BASE}${path}`;

  let res;
  try {
    res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
  } catch (networkErr) {
    // Server is completely unreachable (not running / wrong port)
    throw new Error(
      `Cannot reach backend at ${BASE}. ` +
      `Make sure you ran: cd backend && node server.js`
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.detail || `HTTP ${res.status} on ${path}`);
  }

  return data;
}

// ── Helper for JSON POST / DELETE bodies ──────────────────────
const post   = (path, body) => api(path, { method: "POST",   body: JSON.stringify(body) });
const del    = (path)       => api(path, { method: "DELETE" });
const patch  = (path, body) => api(path, { method: "PATCH",  body: JSON.stringify(body) });

// ═══════════════════════════════════════════════════════════════
//  AI CHAT
// ═══════════════════════════════════════════════════════════════

/**
 * Send a message to the Gemini-powered AI.
 * Called by: HomePage > sendMessage()
 *
 * @param {string} message  - What the patient said
 * @param {string} context  - Optional extra context (unused — backend builds it from DB)
 * @returns {{ reply: string, model: string, latency_ms: number }}
 */
export async function askAI(message, context = "") {
  return post("/ask-ai", { message, context });
}

// ═══════════════════════════════════════════════════════════════
//  MEMORIES
// ═══════════════════════════════════════════════════════════════

/**
 * Load all memories from backend storage.
 * Called by: App root useEffect on mount
 *
 * @returns {{ count: number, memories: Memory[] }}
 */
export async function getMemories() {
  return api("/memories");
}

/**
 * Save a new family memory to the backend.
 * Called by: CaregiverDashboard > saveMemory()
 *
 * @param {{ text: string, person: string, category: string }} payload
 * @returns {{ success: true, memory: Memory }}
 */
export async function saveMemory({ text, person, category }) {
  return post("/memories", { text, person, category });
}

/**
 * Delete a memory by ID.
 * Called by: CaregiverDashboard > deleteMemory()
 *
 * @param {string} id
 * @returns {{ success: true, deleted_id: string }}
 */
export async function deleteMemory(id) {
  return del(`/memories/${id}`);
}

// ═══════════════════════════════════════════════════════════════
//  MEDICATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Load all medication reminders from backend storage.
 * Called by: App root useEffect on mount
 *
 * @returns {{ count: number, medications: Medication[] }}
 */
export async function getMedications() {
  return api("/medications");
}

/**
 * Save a new medication reminder to the backend.
 * Called by: CaregiverDashboard > saveMed()
 *
 * @param {{ name: string, dosage: string, time: string, frequency: string }} payload
 * @returns {{ success: true, medication: Medication }}
 */
export async function saveMedication({ name, dosage, time, frequency }) {
  return post("/medications", { name, dosage, time, frequency });
}

/**
 * Delete a medication reminder by ID.
 * Called by: CaregiverDashboard > deleteMed()
 *
 * @param {string} id
 * @returns {{ success: true, deleted_id: string }}
 */
export async function deleteMedication(id) {
  return del(`/medications/${id}`);
}

// ═══════════════════════════════════════════════════════════════
//  SOS / EMERGENCY
// ═══════════════════════════════════════════════════════════════

/**
 * Trigger an emergency SOS event.
 * Called by: HomePage > handleSOS()
 *
 * @param {string} patientNote - Optional description of what happened
 * @returns {{ success: true, sos_event: SosEvent, message: string }}
 */
export async function triggerSOS(patientNote = "SOS button pressed by patient") {
  return post("/sos", { patientNote });
}

/**
 * Load SOS event history.
 * Called by: AlertsPanel on mount
 *
 * @returns {{ count: number, sos_log: SosEvent[] }}
 */
export async function getSosLog() {
  return api("/sos/log");
}

/**
 * Mark an SOS event as resolved.
 * Called by: AlertsPanel > resolve button
 *
 * @param {string} id
 * @returns {{ success: true, sos_event: SosEvent }}
 */
export async function resolveSOS(id) {
  return patch(`/sos/${id}/resolve`);
}

// ═══════════════════════════════════════════════════════════════
//  HEALTH CHECK
// ═══════════════════════════════════════════════════════════════

/**
 * Ping the backend to check if it's reachable.
 * Called by: App root useEffect — sets backendOnline state
 *
 * @returns {{ status: "ok", model: string, uptime: string, ... }}
 */
export async function checkHealth() {
  return api("/health");
}

const apiClient = {
  askAI,
  getMemories, saveMemory, deleteMemory,
  getMedications, saveMedication, deleteMedication,
  triggerSOS, getSosLog, resolveSOS,
  checkHealth,
};

export default apiClient;
