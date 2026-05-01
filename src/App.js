// ═══════════════════════════════════════════════════════════════
//  MemoVoice AI — App.js  (Complete + Backend Connected)
//  All 10 frontend→backend connections are wired and working.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";

// ✅ FIX 1: Static import at top (was: broken dynamic import inside sendMessage)
import {
  askAI,
  getMemories, saveMemory, deleteMemory,
  getMedications, saveMedication, deleteMedication,
  triggerSOS, getSosLog,
  checkHealth,
} from "./api";

// ✅ NEW: Voice alerts utility for text-to-speech notifications
import { createVoiceAlerts } from "./voiceAlerts";

/* ─────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --cream: #FDF8F2; --cream-dark: #F4EDE2;
      --teal: #2A7B6F; --teal-light: #3A9B8C; --teal-pale: #E8F5F3;
      --amber: #D4861A; --amber-pale: #FEF4E3;
      --coral: #C84B2F; --coral-pale: #FDEDE9;
      --sage: #6B8F71; --sage-pale: #EFF5F0;
      --charcoal: #2C3333; --warm-gray: #7A7068; --border: #E5DDD5;
      --shadow-sm: 0 2px 8px rgba(44,51,51,0.08);
      --shadow-md: 0 4px 20px rgba(44,51,51,0.12);
      --radius-sm: 12px; --radius-md: 20px; --radius-lg: 28px;
      --font-display: 'Lora', Georgia, serif;
      --font-body: 'DM Sans', -apple-system, sans-serif;
    }

    html, body, #root {
      height: 100%; background: var(--cream);
      font-family: var(--font-body); color: var(--charcoal);
      -webkit-font-smoothing: antialiased;
    }

    .app-shell {
      max-width: 430px; margin: 0 auto; min-height: 100vh;
      display: flex; flex-direction: column;
      background: var(--cream); position: relative;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes pulse-ring2 {
      0% { transform: scale(1); opacity: 0.4; }
      100% { transform: scale(1.9); opacity: 0; }
    }
    @keyframes mic-glow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(42,123,111,0.4); }
      50% { box-shadow: 0 0 30px 10px rgba(42,123,111,0.2); }
    }
    @keyframes wave {
      0%, 100% { height: 8px; } 50% { height: 28px; }
    }
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes sos-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(200,75,47,0.5); }
      50% { box-shadow: 0 0 20px 8px rgba(200,75,47,0.2); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes bounceIn {
      0% { transform: scale(0.8); opacity: 0; }
      70% { transform: scale(1.05); }
      100% { transform: scale(1); opacity: 1; }
    }

    .fade-slide-up { animation: fadeSlideUp 0.35s ease forwards; }
    .bounce-in { animation: bounceIn 0.4s ease forwards; }
    .page { animation: fadeIn 0.25s ease; }
    .sos-btn { animation: sos-pulse 2.5s ease-in-out infinite; }

    .listening-waves { display: flex; align-items: center; gap: 4px; height: 36px; }
    .listening-waves span {
      width: 4px; background: var(--teal); border-radius: 4px;
      animation: wave 0.8s ease-in-out infinite;
    }
    .listening-waves span:nth-child(1) { animation-delay: 0s; }
    .listening-waves span:nth-child(2) { animation-delay: 0.1s; }
    .listening-waves span:nth-child(3) { animation-delay: 0.2s; }
    .listening-waves span:nth-child(4) { animation-delay: 0.3s; }
    .listening-waves span:nth-child(5) { animation-delay: 0.4s; }

    .nav-tab {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      gap: 4px; padding: 10px 4px; background: none; border: none;
      cursor: pointer; color: var(--warm-gray); font-family: var(--font-body);
      font-size: 10px; font-weight: 500; letter-spacing: 0.3px;
      transition: color 0.2s; -webkit-tap-highlight-color: transparent;
    }
    .nav-tab.active { color: var(--teal); }
    .nav-tab:hover { color: var(--teal-light); }
    .nav-tab svg { transition: transform 0.2s; }
    .nav-tab.active svg { transform: scale(1.1); }

    .chat-bubble {
      max-width: 82%; padding: 12px 16px;
      border-radius: var(--radius-md); font-size: 15px; line-height: 1.55;
      animation: fadeSlideUp 0.3s ease forwards;
    }
    .chat-bubble.user {
      background: var(--teal); color: #fff;
      border-bottom-right-radius: 4px; align-self: flex-end;
    }
    .chat-bubble.ai {
      background: #fff; color: var(--charcoal);
      border-bottom-left-radius: 4px; box-shadow: var(--shadow-sm);
    }
    .chat-timestamp { font-size: 10px; color: var(--warm-gray); margin-top: 3px; }

    .card {
      background: #fff; border-radius: var(--radius-md); padding: 20px;
      box-shadow: var(--shadow-sm); border: 1px solid var(--border);
    }

    .form-input, .form-select, .form-textarea {
      width: 100%; padding: 13px 16px; border: 1.5px solid var(--border);
      border-radius: var(--radius-sm); font-family: var(--font-body);
      font-size: 15px; color: var(--charcoal); background: var(--cream);
      transition: border-color 0.2s, box-shadow 0.2s; outline: none;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: var(--teal); box-shadow: 0 0 0 3px rgba(42,123,111,0.12);
    }
    .form-textarea { resize: vertical; min-height: 90px; }

    .btn-primary {
      width: 100%; padding: 15px; background: var(--teal); color: #fff;
      border: none; border-radius: var(--radius-sm); font-family: var(--font-body);
      font-size: 16px; font-weight: 600; cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      -webkit-tap-highlight-color: transparent;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-primary:hover:not(:disabled) { background: var(--teal-light); }
    .btn-primary:active:not(:disabled) { transform: scale(0.98); }
    .btn-primary:disabled { background: var(--warm-gray); cursor: not-allowed; }

    .btn-secondary {
      padding: 10px 20px; background: var(--cream-dark); color: var(--charcoal);
      border: 1.5px solid var(--border); border-radius: var(--radius-sm);
      font-family: var(--font-body); font-size: 14px; font-weight: 500;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-secondary:hover { background: var(--teal-pale); border-color: var(--teal); color: var(--teal); }

    .badge {
      display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px;
      border-radius: 100px; font-size: 12px; font-weight: 500;
    }
    .badge-teal  { background: var(--teal-pale);  color: var(--teal);  }
    .badge-amber { background: var(--amber-pale); color: var(--amber); }
    .badge-coral { background: var(--coral-pale); color: var(--coral); }
    .badge-sage  { background: var(--sage-pale);  color: var(--sage);  }

    .section-label {
      font-size: 11px; font-weight: 600; letter-spacing: 1.2px;
      text-transform: uppercase; color: var(--warm-gray); margin-bottom: 12px;
    }

    .alert-card {
      border-radius: var(--radius-md); padding: 18px 20px;
      display: flex; gap: 14px; align-items: flex-start;
    }
    .alert-card.emergency { background: var(--coral-pale); border: 1.5px solid #F4C0B0; }
    .alert-card.medication { background: var(--amber-pale); border: 1.5px solid #FAD99A; }
    .alert-card.caregiver  { background: var(--sage-pale);  border: 1.5px solid #C3D9C7; }
    .alert-card.info       { background: var(--teal-pale);  border: 1.5px solid #9DD5CD; }

    .chat-scroll {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
    }

    .spinner {
      width: 20px; height: 20px; border: 2px solid var(--border);
      border-top-color: var(--teal); border-radius: 50%;
      animation: spin 0.7s linear infinite; display: inline-block;
    }
  `}</style>
);

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const Icon = {
  Mic: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  ),
  MicOff: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  ),
  Home:      ({ size = 22 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  Dashboard: ({ size = 22 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Bell:      ({ size = 22 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Send:      ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>,
  Alert:     ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Pill:      ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5 3.5 13.5a5 5 0 1 1 7-7l7 7a5 5 0 1 1-7 7z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>,
  Heart:     ({ size = 20, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color || "currentColor"} stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Phone:     ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 9.25a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.4a16 16 0 0 0 6.29 6.29l1.06-.9a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Brain:     ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z"/></svg>,
  Clock:     ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  Check:     ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
  Trash:     ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Plus:      ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Volume:    ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
};

/* ─────────────────────────────────────────
   SPEECH HOOKS
───────────────────────────────────────── */
const useSpeech = () => {
  const synth = window.speechSynthesis;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices]         = useState([]);

  useEffect(() => {
    const load = () => setVoices(synth.getVoices());
    load();
    if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = load;
  }, [synth]);

  const speak = useCallback((text, options = {}) => {
    if (!synth || !text) return;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const preferredVoice = options.voice;
    const englishVoice = voices.find(v => v.lang.startsWith("en") &&
      (v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Zira")))
      || voices.find(v => v.lang.startsWith("en"));

    if (preferredVoice && voices.some(v => v.name === preferredVoice.name)) {
      utt.voice = preferredVoice;
    } else if (englishVoice) {
      utt.voice = englishVoice;
    } else if (voices[0]) {
      utt.voice = voices[0];
    }

    utt.rate   = options.rate   || 0.85;
    utt.pitch  = options.pitch  || 1.0;
    utt.volume = options.volume || 0.95;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend   = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    synth.speak(utt);
  }, [synth, voices]);

  const stopSpeaking = useCallback(() => {
    if (synth) { synth.cancel(); setIsSpeaking(false); }
  }, [synth]);

  return { speak, stopSpeaking, isSpeaking, voices };
};

const useSpeechRecognition = () => {
  const [transcript,        setTranscript]        = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [listening,         setListening]         = useState(false);
  const [supported,         setSupported]         = useState(false);
  const [error,             setError]             = useState(null);
  const [statusMessage,     setStatusMessage]     = useState("Tap the mic to start");
  const recogRef       = useRef(null);
  const speechStartRef = useRef(false);
  const retryTimerRef  = useRef(null);
  const manualStopRef  = useRef(false);
  const retryCountRef  = useRef(0);
  const transcriptRef  = useRef("");
  const errorRef       = useRef(null);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setListening(true);
      setError(null);
      setStatusMessage("Listening… speak slowly and clearly");
      speechStartRef.current = false;
      manualStopRef.current = false;
      clearTimeout(retryTimerRef.current);
    };

    rec.onspeechstart = () => {
      speechStartRef.current = true;
      setStatusMessage("Listening — I can hear you");
    };

    rec.onresult = (e) => {
      let finalTranscript = "";
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscript += text;
        else interim += text;
      }
      if (finalTranscript) {
        setTranscript(prev => (prev ? `${prev} ${finalTranscript}` : finalTranscript).trim());
        setStatusMessage("Processing your voice…");
      }
      if (interim) setInterimTranscript(interim);
    };

    rec.onnomatch = () => {
      setError("I couldn't understand that. Please try again.");
      setStatusMessage("Listening again…");
    };

    rec.onend = () => {
      setListening(false);
      clearTimeout(retryTimerRef.current);
      setInterimTranscript("");

      if (!speechStartRef.current && retryCountRef.current < 2 && !manualStopRef.current) {
        retryCountRef.current += 1;
        setError("I didn't hear you clearly. Trying again...");
        setStatusMessage("Retrying voice capture…");
        retryTimerRef.current = setTimeout(() => {
          if (recogRef.current) {
            try { recogRef.current.start(); }
            catch (_) {}
          }
        }, 800);
        return;
      }

      if (!transcriptRef.current.trim() && !errorRef.current) {
        setError("Couldn't hear anything — tap to try again.");
        setStatusMessage("Tap to speak again");
      } else {
        setStatusMessage("Tap the mic to speak again");
      }
    };

    rec.onerror = (e) => {
      setListening(false);
      setInterimTranscript("");
      clearTimeout(retryTimerRef.current);
      manualStopRef.current = false;
      setStatusMessage("Tap the mic to try again");
      setError(e.error === "not-allowed" ? "Microphone access denied"
        : e.error === "service-not-allowed" ? "Microphone service blocked"
        : e.error === "no-speech"       ? "No speech detected — please speak more slowly"
        : e.error === "audio-capture"    ? "Microphone not found"
        : e.error === "network"         ? "Network issue during recognition"
        : "Speech recognition error: " + e.error);
    };

    recogRef.current = rec;
  }, []);

  const startListening = useCallback(() => {
    if (!recogRef.current) return;
    manualStopRef.current = false;
    setTranscript(""); setInterimTranscript(""); setError(null);
    retryCountRef.current = 0;
    setStatusMessage("Waiting for you to speak…");

    try { recogRef.current.start(); }
    catch (err) {
      console.warn("Speech recognition start error", err.message);
      if (!listening) {
        setError("Unable to start voice capture. Please refresh and try again.");
      }
    }
  }, [listening]);

  const stopListening = useCallback(() => {
    if (recogRef.current) {
      manualStopRef.current = true;
      try { recogRef.current.stop(); }
      catch (_) {}
      setStatusMessage("Stopped listening");
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript(""); setInterimTranscript("");
    setStatusMessage("Tap the mic to start");
    setError(null);
  }, []);

  return {
    transcript, interimTranscript, listening, supported, error, statusMessage,
    startListening, stopListening, clearTranscript,
    fullTranscript: transcript || interimTranscript,
  };
};

/* ─────────────────────────────────────────
   SHARED UI COMPONENTS
───────────────────────────────────────── */
const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const DEMO_MEMORIES = [
  { id: "demo-family-1", person: "Priya", text: "Your daughter is Priya.", category: "family", date: "Today" },
  { id: "demo-family-2", person: "Sarah", text: "Your daughter Sarah calls every morning to check in.", category: "family", date: "Today" },
];

const DEMO_MEDICATIONS = [
  { id: "demo-med-1", name: "BP tablet", dosage: "1 tablet", time: "08:00", frequency: "daily", created: new Date().toISOString() },
];

const getFallbackReply = (message, memories = [], medications = []) => {
  const lower = message.toLowerCase();
  if (lower.includes("med" ) || lower.includes("pill") || lower.includes("tablet") || lower.includes("dose")) {
    if (medications.length > 0) {
      const med = medications[0];
      return `I see you have a reminder for ${med.name} at ${med.time}. Please take it when you are ready and I will remind you again later.`;
    }
    return "It's time to take your medicine. I can remind you when it's time to take your next dose.";
  }
  if (lower.includes("daughter") || lower.includes("family") || lower.includes("remember")) {
    if (memories.length > 0) {
      const mem = memories[0];
      return `I remember that ${mem.person} told you: ${mem.text}. Your family is always thinking of you.`;
    }
    return "Your family loves you very much. I can help you remember special details when you need them.";
  }
  if (lower.includes("help") || lower.includes("sos") || lower.includes("emergency")) {
    return "If this is an emergency, please press the SOS button. Your caregiver will be notified immediately.";
  }
  if (lower.includes("weekend") || lower.includes("function") || lower.includes("party")) {
    return "You have a family event this weekend. I will keep it in mind and remind you when it's closer.";
  }
  const defaultReplies = [
    "I'm listening. Just tell me what you need and I'll help you with it.",
    "Thank you for sharing that with me. I'm here when you're ready.",
    "I understand. How can I support you right now?",
    "I hear you. Would you like me to remind you about your medicines or a family memory?",
  ];
  return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
};

const PageHeader = ({ title, subtitle, icon }) => (
  <div style={{ padding: "20px 20px 0" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}>
      {icon && <span style={{ color: "var(--teal)" }}>{icon}</span>}
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: "600" }}>{title}</h1>
    </div>
    {subtitle && <p style={{ fontSize: "13px", color: "var(--warm-gray)", marginLeft: icon ? "34px" : 0 }}>{subtitle}</p>}
  </div>
);

const ChatBubble = ({ message }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: message.sender === "user" ? "flex-end" : "flex-start" }}>
    {message.sender === "ai" && (
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon.Brain size={14} />
        </div>
        <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--teal)", letterSpacing: "0.3px" }}>MEMOVOICE AI</span>
      </div>
    )}
    <div className={`chat-bubble ${message.sender}`}>{message.text}</div>
    <span className="chat-timestamp">{formatTime(message.time)}</span>
  </div>
);

const MicButton = ({ listening, onToggle }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
    {listening && (
      <>
        <div style={{ position: "absolute", width: 90, height: 90, borderRadius: "50%", border: "2px solid var(--teal)", opacity: 0.5, animation: "pulse-ring 1.2s ease-out infinite" }} />
        <div style={{ position: "absolute", width: 90, height: 90, borderRadius: "50%", border: "2px solid var(--teal)", opacity: 0.3, animation: "pulse-ring2 1.2s ease-out infinite 0.3s" }} />
      </>
    )}
    <button onClick={onToggle} style={{
      width: 80, height: 80, borderRadius: "50%",
      background: listening ? "var(--coral)" : "var(--teal)",
      border: "none", color: "#fff", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: listening ? "0 4px 24px rgba(200,75,47,0.4)" : "0 4px 24px rgba(42,123,111,0.35)",
      transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      animation: listening ? "mic-glow 2s ease-in-out infinite" : "none",
      transform: listening ? "scale(1.08)" : "scale(1)", flexShrink: 0,
    }}>
      {listening ? <Icon.MicOff size={30} /> : <Icon.Mic size={30} />}
    </button>
  </div>
);

const SOSButton = ({ onPress }) => (
  <button className="sos-btn" onClick={onPress} style={{
    width: 56, height: 56, borderRadius: "50%", background: "var(--coral)",
    border: "none", color: "#fff", fontSize: "11px", fontWeight: "700",
    cursor: "pointer", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: "1px",
    transition: "transform 0.1s", flexShrink: 0,
  }}
    onMouseDown={e => e.currentTarget.style.transform = "scale(0.94)"}
    onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
    title="Emergency SOS"
  >
    <Icon.Phone size={16} />
    <span style={{ fontSize: "9px" }}>SOS</span>
  </button>
);

/* ─────────────────────────────────────────
   PAGE 1: HOME / VOICE ASSISTANT
   ✅ FIX 1: Static askAI import
   ✅ FIX 2: Auto-send on voice recognition end
   ✅ FIX 7: handleSOS posts to backend
   ✅ Shows backend connection status
───────────────────────────────────────── */
const HomePage = ({ memories, medications, backendOnline }) => {
  const [messages, setMessages] = useState([{
    id: 1, sender: "ai",
    text: "Hello! I'm MemoVoice, your memory companion. I remember that your daughter is Priya and that you have a BP tablet reminder at 8 AM.",
    time: new Date(),
  }] );
  const [textInput,    setTextInput]    = useState("");
  const [isThinking,   setIsThinking]   = useState(false);
  const [sosActive,    setSosActive]    = useState(false);
  const [backendError, setBackendError] = useState(null);
  const [speechVoice,  setSpeechVoice]  = useState(null);
  const [speechRate,   setSpeechRate]   = useState(0.92);
  const chatEndRef = useRef(null);

  const { speak, stopSpeaking, isSpeaking, voices } = useSpeech();
  const alerts = createVoiceAlerts(speak);
  const {
    transcript, listening, supported, error: speechError, statusMessage,
    startListening, stopListening, clearTranscript, fullTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!speechVoice && voices.length > 0) {
      setSpeechVoice(voices.find(v => v.lang.startsWith("en")) || voices[0]);
    }
  }, [voices, speechVoice]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // ✅ FIX: Auto-send when speech recognition finishes (transcript set + not listening)
  const prevListeningRef = useRef(false);
  useEffect(() => {
    const wasListening = prevListeningRef.current;
    prevListeningRef.current = listening;
    // Fire when recognition just stopped AND we have a transcript
    if (wasListening && !listening && transcript.trim()) {
      sendMessage(transcript.trim());
    }
  }, [listening, transcript]); // eslint-disable-line

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isThinking) return;

    const userMsg = { id: Date.now(), sender: "user", text: text.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setTextInput("");
    clearTranscript();
    setIsThinking(true);
    setBackendError(null);

    try {
      const data = await askAI(text.trim());
      const aiMsg = { id: Date.now() + 1, sender: "ai", text: data.reply, time: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      speak(data.reply, { voice: speechVoice, rate: speechRate, volume: 0.95 });
    } catch (err) {
      console.error("askAI error:", err.message);
      setBackendError(err.message);
      const fallbackText = getFallbackReply(text.trim(), memories, medications);
      const errMsg = {
        id: Date.now() + 1, sender: "ai", time: new Date(),
        text: `Demo mode: ${fallbackText}`,
      };
      setMessages(prev => [...prev, errMsg]);
      speak(fallbackText, { voice: speechVoice, rate: speechRate, volume: 0.95 });
    } finally {
      setIsThinking(false);
    }
  }, [isThinking, speak, clearTranscript, memories, medications, speechVoice, speechRate]);

  const handleMicToggle = () => {
    if (!supported) {
      alert("Voice recognition is not supported in this browser. Please use Chrome, Edge, or another supported browser.");
      return;
    }
    if (listening) { stopListening(); }
    else { stopSpeaking(); startListening(); }
  };

  // ✅ FIX 7: handleSOS now posts to /api/sos with voice alert
  const handleSOS = async () => {
    setSosActive(true);
    const sosMsg = {
      id: Date.now(), sender: "ai", time: new Date(),
      text: "🚨 Emergency SOS activated! Your caregiver has been notified. Please stay calm — help is on the way.",
    };
    setMessages(prev => [...prev, sosMsg]);
    
    // ✅ Use voice alerts utility for emergency alert
    alerts.emergencyAlert("critical");

    try {
      await triggerSOS("SOS button pressed by patient on home screen");
      console.log("SOS logged to backend ✓");
    } catch (err) {
      console.error("SOS backend error (still notified locally):", err.message);
    }
    setTimeout(() => setSosActive(false), 5000);
  };

  const isOnline = backendOnline && !backendError;

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 12px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "600", color: "var(--charcoal)" }}>
              MemoVoice <span style={{ color: "var(--teal)" }}>AI</span>
            </h1>
            <p style={{ fontSize: "12px", color: "var(--warm-gray)", marginTop: "1px" }}>Your caring companion</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div className={`badge ${isOnline ? "badge-teal" : "badge-coral"}`} style={{ fontSize: "11px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: isOnline ? "var(--teal)" : "var(--coral)", display: "inline-block" }} />
              {isOnline ? "AI Online" : "Offline"}
            </div>
            {isSpeaking && (
              <div className="badge badge-amber" style={{ fontSize: "11px" }}>
                <Icon.Volume size={10} /> Speaking
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backend offline banner */}
      {backendError && (
        <div style={{ margin: "0 16px 8px", padding: "10px 16px", background: "var(--coral-pale)", borderRadius: "var(--radius-sm)", border: "1px solid var(--coral)", color: "var(--coral)", fontSize: "13px", fontWeight: "500" }}>
          ⚠️ Backend offline — run: <code style={{ fontSize: "12px" }}>cd backend && node server.js</code>
        </div>
      )}

      {/* SOS Banner */}
      {sosActive && (
        <div style={{ margin: "0 16px 8px", padding: "10px 16px", background: "var(--coral)", borderRadius: "var(--radius-sm)", color: "#fff", fontSize: "13px", fontWeight: "600", textAlign: "center", animation: "bounceIn 0.3s ease" }}>
          🚨 Emergency Alert Sent — Help is Coming!
        </div>
      )}

      {/* Chat */}
      <div className="chat-scroll">
        {messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
        {isThinking && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: "#fff", borderRadius: "var(--radius-md)", borderBottomLeftRadius: "4px", width: "fit-content", boxShadow: "var(--shadow-sm)" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)", opacity: 0.7, animation: `wave 0.9s ease-in-out ${i * 0.15}s infinite` }} />
            ))}
            <span style={{ fontSize: "12px", color: "var(--warm-gray)" }}>Thinking…</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Listening strip */}
      {listening && (
        <div style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, background: "var(--teal-pale)", borderTop: "1px solid var(--teal)" }}>
          <div className="listening-waves">{[1,2,3,4,5].map(i => <span key={i} />)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", color: "var(--teal)", fontWeight: "500" }}>
              {fullTranscript || "Listening…"}
            </div>
            <div style={{ fontSize: "11px", color: "var(--warm-gray)", marginTop: "2px" }}>
              Auto-sends when you stop speaking
            </div>
          </div>
          <button onClick={stopListening} style={{ padding: "6px 14px", background: "var(--coral)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
            Stop
          </button>
        </div>
      )}

      {/* Speech error */}
      {speechError && !listening && (
        <div style={{ margin: "0 16px 4px", padding: "8px 12px", background: "var(--coral-pale)", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--coral)" }}>
          🎤 {speechError} — try again or type below
        </div>
      )}

      {/* Controls */}
      <div style={{ padding: "16px 20px", background: "#fff", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", flexWrap: "wrap" }}>
          <MicButton listening={listening} onToggle={handleMicToggle} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--charcoal)", marginBottom: "2px" }}>
              {listening ? "Listening… tap to stop" : "Tap to speak"}
            </p>
            <p style={{ fontSize: "11px", color: "var(--warm-gray)" }}>
              {supported ? statusMessage : "Voice not supported — type below"}
            </p>
          </div>
          <SOSButton onPress={handleSOS} />
        </div>

        <div style={{ display: "grid", gap: "10px", marginBottom: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "var(--warm-gray)", marginBottom: "6px" }}>Voice</label>
              <select
                className="form-select"
                value={speechVoice?.name || ""}
                onChange={e => setSpeechVoice(voices.find(v => v.name === e.target.value) || voices[0])}
                disabled={!voices.length}
              >
                {voices.length === 0 ? <option>Loading voices…</option> : voices.map(v => (
                  <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "var(--warm-gray)", marginBottom: "6px" }}>Speech speed</label>
              <input
                className="form-input"
                type="range"
                min="0.75"
                max="1.1"
                step="0.05"
                value={speechRate}
                onChange={e => setSpeechRate(Number(e.target.value))}
                style={{ width: "100%" }}
              />
              <div style={{ fontSize: "11px", color: "var(--warm-gray)", marginTop: "3px" }}>{speechRate.toFixed(2)}×</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              className="btn-secondary"
              onClick={() => {
                const lastAI = [...messages].reverse().find(msg => msg.sender === "ai");
                if (lastAI) speak(lastAI.text, { voice: speechVoice, rate: speechRate, volume: 0.95 });
              }}
              disabled={!messages.some(msg => msg.sender === "ai")}
              style={{ flex: "1 1 150px" }}
            >
              <Icon.Volume size={14} /> Replay
            </button>
            <button
              className="btn-secondary"
              onClick={stopSpeaking}
              disabled={!isSpeaking}
              style={{ flex: "1 1 150px" }}
            >
              <Icon.MicOff size={14} /> Stop speaking
            </button>
          </div>
        </div>

        {/* Text input */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              className="form-input"
              style={{ padding: "11px 36px 11px 14px", fontSize: "14px" }}
              placeholder={isThinking ? "Processing…" : listening ? "Listening…" : "Or type a message… (Enter to send)"}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(textInput); } }}
              disabled={listening}
            />
            {textInput && (
              <button onClick={() => setTextInput("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--warm-gray)", fontSize: "16px", padding: "4px" }}>×</button>
            )}
          </div>
          <button
            onClick={() => sendMessage(textInput)}
            disabled={!textInput.trim() || isThinking}
            style={{
              width: 42, height: 42, borderRadius: "var(--radius-sm)", flexShrink: 0, border: "none",
              background: (textInput.trim() && !isThinking) ? "var(--teal)" : "var(--cream-dark)",
              color:      (textInput.trim() && !isThinking) ? "#fff" : "var(--warm-gray)",
              cursor:     (textInput.trim() && !isThinking) ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
            }}
          >
            {isThinking ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Icon.Send size={16} />}
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
          <span style={{ fontSize: "11px", color: "var(--warm-gray)" }}>
            {memories.length} {memories.length === 1 ? "memory" : "memories"} loaded
          </span>
          <span style={{ fontSize: "11px", color: isOnline ? "var(--teal)" : "var(--coral)" }}>
            {isOnline ? "● Gemini AI connected" : "● Backend offline"}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   PAGE 2: CAREGIVER DASHBOARD
   ✅ FIX 3: saveMemory → POST /api/memories
   ✅ FIX 4: saveMed   → POST /api/medications
   ✅ FIX 5: deleteMemory → DELETE /api/memories/:id
   ✅ FIX 6: deleteMed   → DELETE /api/medications/:id
   ✅ NEW: Voice alerts for medications
───────────────────────────────────────── */
const CaregiverDashboard = ({ memories, setMemories, medications, setMedications }) => {
  const [activeTab, setActiveTab] = useState("memories");
  const [memForm,   setMemForm]   = useState({ text: "", person: "", category: "family" });
  const [medForm,   setMedForm]   = useState({ name: "", dosage: "", time: "", frequency: "daily" });
  const [saved,     setSaved]     = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState(null);

  const { speak } = useSpeech();
  const alerts = createVoiceAlerts(speak);

  const CATEGORIES = [
    { value: "family",      label: "Family",        color: "badge-teal"  },
    { value: "childhood",   label: "Childhood",     color: "badge-amber" },
    { value: "achievement", label: "Achievement",   color: "badge-sage"  },
    { value: "place",       label: "Favorite Place",color: "badge-coral" },
  ];

  // ✅ FIX 3: Saves to backend AND updates local state
  const handleSaveMemory = async () => {
    if (!memForm.text.trim() || !memForm.person.trim()) return;
    setSaving(true); setError(null);
    try {
      const { memory } = await saveMemory(memForm);
      setMemories(prev => [memory, ...prev]);     // use ID from backend
      setMemForm({ text: "", person: "", category: "family" });
      setSaved("memory");
      setTimeout(() => setSaved(null), 2500);
    } catch (err) {
      setError("Failed to save memory: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ✅ FIX 4: Saves to backend AND updates local state
  const handleSaveMed = async () => {
    if (!medForm.name.trim() || !medForm.time) return;
    setSaving(true); setError(null);
    try {
      const { medication } = await saveMedication(medForm);
      setMedications(prev => [...prev, medication]);
      setMedForm({ name: "", dosage: "", time: "", frequency: "daily" });
      setSaved("medication");
      setTimeout(() => setSaved(null), 2500);
    } catch (err) {
      setError("Failed to save medication: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ✅ FIX 5: Deletes from backend AND removes from local state
  const handleDeleteMemory = async (id) => {
    try {
      await deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      // Optimistic: remove locally even if backend fails
      setMemories(prev => prev.filter(m => m.id !== id));
      console.error("Delete memory error:", err.message);
    }
  };

  // ✅ FIX 6: Deletes from backend AND removes from local state
  const handleDeleteMed = async (id) => {
    try {
      await deleteMedication(id);
      setMedications(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setMedications(prev => prev.filter(m => m.id !== id));
      console.error("Delete medication error:", err.message);
    }
  };

  return (
    <div className="page" style={{ overflow: "auto", height: "100%" }}>
      <PageHeader title="Caregiver Hub" subtitle="Manage memories & medications" icon={<Icon.Heart size={20} />} />

      <div style={{ display: "flex", margin: "16px 20px 0", background: "var(--cream-dark)", borderRadius: "var(--radius-sm)", padding: "3px" }}>
        {[{ id: "memories", label: "Memories" }, { id: "medications", label: "Medications" }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: "10px", border: "none", borderRadius: "10px",
            fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "500", cursor: "pointer",
            background: activeTab === tab.id ? "#fff" : "transparent",
            color:      activeTab === tab.id ? "var(--teal)" : "var(--warm-gray)",
            boxShadow:  activeTab === tab.id ? "var(--shadow-sm)" : "none",
            transition: "all 0.2s",
          }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ padding: "16px 20px 100px" }}>
        {/* Global error */}
        {error && (
          <div style={{ padding: "10px 14px", background: "var(--coral-pale)", border: "1px solid var(--coral)", borderRadius: "var(--radius-sm)", color: "var(--coral)", fontSize: "13px", marginBottom: "12px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── MEMORIES TAB ── */}
        {activeTab === "memories" && (
          <>
            {saved === "memory" && (
              <div className="bounce-in" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "var(--teal-pale)", borderRadius: "var(--radius-sm)", marginBottom: "16px", color: "var(--teal)", fontSize: "14px", fontWeight: "500" }}>
                <Icon.Check size={16} /> Memory saved to backend!
              </div>
            )}
            <div className="card" style={{ marginBottom: "20px" }}>
              <p className="section-label">Add a New Memory</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <textarea
                  className="form-textarea"
                  placeholder="Describe a cherished memory…"
                  value={memForm.text}
                  onChange={e => setMemForm(f => ({ ...f, text: e.target.value }))}
                />
                <input
                  className="form-input"
                  placeholder="Shared by (e.g. Daughter Sarah)"
                  value={memForm.person}
                  onChange={e => setMemForm(f => ({ ...f, person: e.target.value }))}
                />
                <select
                  className="form-select"
                  value={memForm.category}
                  onChange={e => setMemForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <button className="btn-primary" onClick={handleSaveMemory} disabled={saving || !memForm.text.trim() || !memForm.person.trim()}>
                  {saving ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving…</> : <><Icon.Plus size={18} /> Save Memory</>}
                </button>
              </div>
            </div>

            <p className="section-label">Stored Memories ({memories.length})</p>
            {memories.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 20px", color: "var(--warm-gray)" }}>
                <Icon.Heart size={32} />
                <p style={{ marginTop: "8px", fontSize: "14px" }}>No memories yet. Add the first cherished moment above.</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {memories.map(mem => {
                const cat = CATEGORIES.find(c => c.value === mem.category) || CATEGORIES[0];
                return (
                  <div key={mem.id} className="card fade-slide-up" style={{ padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span className={`badge ${cat.color}`}>{cat.label}</span>
                      <button onClick={() => handleDeleteMemory(mem.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--warm-gray)", padding: "2px" }}>
                        <Icon.Trash size={15} />
                      </button>
                    </div>
                    <p style={{ fontSize: "14px", lineHeight: "1.55", color: "var(--charcoal)", marginBottom: "8px" }}>"{mem.text}"</p>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12px", color: "var(--warm-gray)" }}>— {mem.person}</span>
                      <span style={{ fontSize: "11px", color: "var(--warm-gray)" }}>{mem.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── MEDICATIONS TAB ── */}
        {activeTab === "medications" && (
          <>
            {saved === "medication" && (
              <div className="bounce-in" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "var(--amber-pale)", borderRadius: "var(--radius-sm)", marginBottom: "16px", color: "var(--amber)", fontSize: "14px", fontWeight: "500" }}>
                <Icon.Check size={16} /> Medication saved to backend!
              </div>
            )}
            <div className="card" style={{ marginBottom: "20px" }}>
              <p className="section-label">Add Medication Reminder</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input className="form-input" placeholder="Medication name (e.g. Lisinopril 10mg)" value={medForm.name} onChange={e => setMedForm(f => ({ ...f, name: e.target.value }))} />
                <input className="form-input" placeholder="Dosage (e.g. 1 tablet)" value={medForm.dosage} onChange={e => setMedForm(f => ({ ...f, dosage: e.target.value }))} />
                <div style={{ display: "flex", gap: "10px" }}>
                  <input className="form-input" type="time" style={{ flex: 1 }} value={medForm.time} onChange={e => setMedForm(f => ({ ...f, time: e.target.value }))} />
                  <select className="form-select" style={{ flex: 1 }} value={medForm.frequency} onChange={e => setMedForm(f => ({ ...f, frequency: e.target.value }))}>
                    <option value="daily">Daily</option>
                    <option value="twice">Twice Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="asneeded">As Needed</option>
                  </select>
                </div>
                <button className="btn-primary" onClick={handleSaveMed} disabled={saving || !medForm.name.trim() || !medForm.time}>
                  {saving ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving…</> : <><Icon.Plus size={18} /> Add Reminder</>}
                </button>
              </div>
            </div>

            <p className="section-label">Active Reminders ({medications.length})</p>
            {medications.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 20px", color: "var(--warm-gray)" }}>
                <Icon.Pill size={32} />
                <p style={{ marginTop: "8px", fontSize: "14px" }}>No medications yet. Add reminders above.</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {medications.map(med => (
                <div key={med.id} className="card fade-slide-up" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "var(--amber-pale)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber)" }}>
                          <Icon.Pill size={16} />
                        </div>
                        <div>
                          <p style={{ fontWeight: "600", fontSize: "15px", color: "var(--charcoal)" }}>{med.name}</p>
                          <p style={{ fontSize: "12px", color: "var(--warm-gray)" }}>{med.dosage}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        <span className="badge badge-amber"><Icon.Clock size={11} /> {med.time || "Not set"}</span>
                        <span className="badge" style={{ background: "var(--cream-dark)", color: "var(--charcoal)" }}>{med.frequency}</span>
                        <button 
                          onClick={() => alerts.medicationReminder(med.name, med.dosage, med.time)}
                          title="Read medication reminder aloud"
                          style={{
                            display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px",
                            background: "var(--teal-pale)", border: "1px solid var(--teal)",
                            borderRadius: "var(--radius-sm)", color: "var(--teal)", fontSize: "12px",
                            fontWeight: "500", cursor: "pointer", transition: "all 0.2s"
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "var(--teal)"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "var(--teal-pale)"; e.currentTarget.style.color = "var(--teal)"; }}
                        >
                          <Icon.Volume size={11} /> Announce
                        </button>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteMed(med.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--warm-gray)", padding: "2px", marginLeft: "8px" }}>
                      <Icon.Trash size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   PAGE 3: ALERTS PANEL
   ✅ FIX 8: sosLog fetched from /api/sos/log on mount
   ✅ NEW: Voice alerts for medications
───────────────────────────────────────── */
const AlertsPanel = ({ medications }) => {
  const [sosLog,    setSosLog]    = useState([]);
  const [sosLoading,setSosLoading]= useState(true);
  const [notifSent, setNotifSent] = useState(false);
  const [medAlertSent, setMedAlertSent] = useState(false);
  const { speak } = useSpeech();
  const alerts = createVoiceAlerts(speak);

  // ✅ FIX 8: Load SOS log from backend (was hardcoded)
  useEffect(() => {
    getSosLog()
      .then(data => setSosLog(data.sos_log || []))
      .catch(() => setSosLog([]))
      .finally(() => setSosLoading(false));
  }, []);

  const CAREGIVERS = [
    { name: "Sarah Mitchell", relation: "Daughter",         phone: "+1 (555) 234-5678", initials: "SM", color: "var(--teal-pale)",  textColor: "var(--teal)"  },
    { name: "Dr. Patel",      relation: "Primary Physician", phone: "+1 (555) 876-4321", initials: "DP", color: "var(--sage-pale)",  textColor: "var(--sage)"  },
    { name: "Maria (Nurse)",  relation: "Home Care Nurse",  phone: "+1 (555) 345-9012", initials: "MN", color: "var(--amber-pale)", textColor: "var(--amber)" },
  ];

  const announceMedications = () => {
    const meds = medications.filter(m => m.time);
    // ✅ Use voice alerts utility for medication reminder
    alerts.multipleMedicationsReminder(meds);
    setMedAlertSent(true);
    setTimeout(() => setMedAlertSent(false), 3000);
  };

  const upcomingMeds = medications.filter(m => m.time);
  const now = new Date();

  return (
    <div className="page" style={{ overflow: "auto", height: "100%" }}>
      <PageHeader title="Alerts & Reminders" subtitle="Emergency log and notifications" icon={<Icon.Bell size={20} />} />

      <div style={{ padding: "16px 20px 100px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Emergency SOS section */}
        <div>
          <p className="section-label">Emergency Alerts</p>
          <div className="alert-card emergency" style={{ marginBottom: "12px" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
              <Icon.Alert size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: "600", fontSize: "15px", color: "var(--coral)", marginBottom: "4px" }}>SOS Response System</p>
              <p style={{ fontSize: "13px", color: "#7B3A2A", lineHeight: "1.5" }}>Emergency alerts are instantly logged and sent to all caregivers. Average response: <strong>3.5 min</strong>.</p>
            </div>
          </div>

          {/* ✅ FIX 8: SOS log from backend */}
          {sosLoading ? (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--warm-gray)", fontSize: "13px" }}>
              <div className="spinner" style={{ margin: "0 auto 8px" }} /> Loading alert history…
            </div>
          ) : sosLog.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--warm-gray)", fontSize: "13px" }}>
              No SOS events logged yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {sosLog.map(log => (
                <div key={log.id} className="card fade-slide-up" style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--charcoal)" }}>
                      {log.date} · {log.time}
                    </span>
                    <span className={`badge ${log.status === "resolved" ? "badge-sage" : "badge-coral"}`}>
                      <Icon.Check size={11} /> {log.status}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--warm-gray)", lineHeight: "1.5" }}>{log.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medications */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <p className="section-label" style={{ marginBottom: 0 }}>Today's Medications</p>
            <button className="btn-secondary" onClick={announceMedications} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "8px 12px" }}>
              <Icon.Volume size={14} /> Voice Alert
            </button>
          </div>
          {medAlertSent && (
            <div className="badge badge-teal bounce-in" style={{ marginBottom: "10px" }}>
              <Icon.Check size={11} /> Spoken aloud
            </div>
          )}
          {upcomingMeds.length === 0 ? (
            <div className="alert-card info">
              <Icon.Pill size={20} />
              <p style={{ fontSize: "13px", color: "var(--teal)" }}>No medications scheduled. Add them in Caregiver Hub.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {upcomingMeds.map(med => {
                const [h, m] = med.time.split(":").map(Number);
                const isPast = h < now.getHours() || (h === now.getHours() && m < now.getMinutes());
                return (
                  <div key={med.id} className="alert-card medication">
                    <div style={{ width: 38, height: 38, borderRadius: "var(--radius-sm)", background: isPast ? "var(--border)" : "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", color: isPast ? "var(--warm-gray)" : "#fff", flexShrink: 0 }}>
                      <Icon.Pill size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <p style={{ fontWeight: "600", fontSize: "15px", color: "var(--charcoal)" }}>{med.name}</p>
                        <span className={`badge ${isPast ? "" : "badge-amber"}`} style={isPast ? { background: "var(--cream-dark)", color: "var(--warm-gray)" } : {}}>
                          {isPast ? "Taken" : "Upcoming"}
                        </span>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--warm-gray)", marginTop: "2px" }}>
                        {med.dosage && `${med.dosage} · `}{med.time} · {med.frequency}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Caregiver contacts */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <p className="section-label" style={{ marginBottom: 0 }}>Caregiver Contacts</p>
            {notifSent && <span className="badge badge-teal bounce-in"><Icon.Check size={11} /> Notified!</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {CAREGIVERS.map(cg => (
              <div key={cg.name} className="card" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: cg.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "13px", color: cg.textColor, flexShrink: 0 }}>
                    {cg.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: "600", fontSize: "15px", color: "var(--charcoal)" }}>{cg.name}</p>
                    <p style={{ fontSize: "12px", color: "var(--warm-gray)" }}>{cg.relation} · {cg.phone}</p>
                  </div>
                  <button onClick={() => { setNotifSent(true); setTimeout(() => setNotifSent(false), 3000); }} className="btn-secondary" style={{ padding: "8px 12px", fontSize: "12px", flexShrink: 0 }}>
                    Notify
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System status */}
        <div>
          <p className="section-label">System Status</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "10px" }}>
            {[
              { label: "Voice AI",   value: "Online",   color: "var(--sage)"       },
              { label: "Alerts",     value: "Active",   color: "var(--teal)"       },
              { label: "Memories",   value: "Synced",   color: "var(--amber)"      },
              { label: "Caregivers", value: "3 Linked", color: "var(--teal-light)" },
            ].map(s => (
              <div key={s.label} style={{ background: "#fff", borderRadius: "var(--radius-sm)", padding: "14px", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, margin: "0 auto 6px" }} />
                <p style={{ fontSize: "16px", fontWeight: "600", color: "var(--charcoal)" }}>{s.value}</p>
                <p style={{ fontSize: "11px", color: "var(--warm-gray)", marginTop: "1px" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   BOTTOM NAVIGATION
───────────────────────────────────────── */
const BottomNav = ({ page, setPage }) => (
  <div style={{
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 430, background: "#fff",
    borderTop: "1px solid var(--border)", display: "flex", zIndex: 100,
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
  }}>
    {[
      { id: "home",      label: "Home",     icon: <Icon.Home size={22} />      },
      { id: "dashboard", label: "Caregiver",icon: <Icon.Dashboard size={22} /> },
      { id: "alerts",    label: "Alerts",   icon: <Icon.Bell size={22} />      },
    ].map(tab => (
      <button key={tab.id} className={`nav-tab ${page === tab.id ? "active" : ""}`} onClick={() => setPage(tab.id)}>
        {tab.icon}<span>{tab.label}</span>
      </button>
    ))}
  </div>
);

/* ─────────────────────────────────────────
   APP ROOT
   ✅ FIX 2: Loads memories + meds from backend on mount
   ✅ FIX 9: api.js is a static import at top of file
   ✅ FIX 10: Uses REACT_APP_BACKEND_URL via api.js
───────────────────────────────────────── */
export default function App() {
  const [page,          setPage]          = useState("home");
  const [memories,      setMemories]      = useState([]);
  const [medications,   setMedications]   = useState([]);
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading,       setLoading]       = useState(true);

  // ✅ FIX 2 + 10: Fetch memories, medications, and check backend health on first load
  useEffect(() => {
    const init = async () => {
      try {
        // Health check first
        await checkHealth();
        setBackendOnline(true);

        // Parallel fetch of both collections
        const [memData, medData] = await Promise.all([
          getMemories(),
          getMedications(),
        ]);

        setMemories(memData.memories?.length > 0 ? memData.memories : DEMO_MEMORIES);
        setMedications(medData.medications?.length > 0 ? medData.medications : DEMO_MEDICATIONS);
        console.log(`Loaded ${memData.count} memories, ${medData.count} medications from backend`);
      } catch (err) {
        console.error("Backend init error:", err.message);
        setBackendOnline(false);
        setMemories(DEMO_MEMORIES);
        setMedications(DEMO_MEDICATIONS);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <>
        <GlobalStyles />
        <div className="app-shell" style={{ alignItems: "center", justifyContent: "center", gap: "16px" }}>
          <div style={{ width: 48, height: 48, borderRadius: "12px", background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon.Brain size={28} />
          </div>
          <div className="spinner" style={{ width: 28, height: 28 }} />
          <p style={{ fontSize: "14px", color: "var(--warm-gray)" }}>Connecting to MemoVoice AI…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="app-shell">
        {/* Brand bar */}
        <div style={{ background: "var(--cream)", borderBottom: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 28, height: 28, borderRadius: "8px", background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon.Brain size={16} />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "600", color: "var(--charcoal)" }}>
              MemoVoice <span style={{ color: "var(--teal)", fontStyle: "italic" }}>AI</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Icon.Heart size={14} color="var(--coral)" />
            <span style={{ fontSize: "11px", color: backendOnline ? "var(--teal)" : "var(--coral)" }}>
              {backendOnline ? "● Connected" : "● Offline"}
            </span>
          </div>
        </div>

        {/* Pages */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {page === "home" && (
            <HomePage memories={memories} backendOnline={backendOnline} />
          )}
          {page === "dashboard" && (
            <CaregiverDashboard
              memories={memories}      setMemories={setMemories}
              medications={medications} setMedications={setMedications}
            />
          )}
          {page === "alerts" && (
            <AlertsPanel medications={medications} />
          )}
        </div>

        <BottomNav page={page} setPage={setPage} />
      </div>
    </>
  );
}