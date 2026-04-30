import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────
   DESIGN TOKENS & GLOBAL STYLES (injected)
───────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --cream: #FDF8F2;
      --cream-dark: #F4EDE2;
      --teal: #2A7B6F;
      --teal-light: #3A9B8C;
      --teal-pale: #E8F5F3;
      --amber: #D4861A;
      --amber-pale: #FEF4E3;
      --coral: #C84B2F;
      --coral-pale: #FDEDE9;
      --sage: #6B8F71;
      --sage-pale: #EFF5F0;
      --charcoal: #2C3333;
      --warm-gray: #7A7068;
      --border: #E5DDD5;
      --shadow-sm: 0 2px 8px rgba(44,51,51,0.08);
      --shadow-md: 0 4px 20px rgba(44,51,51,0.12);
      --radius-sm: 12px;
      --radius-md: 20px;
      --radius-lg: 28px;
      --radius-xl: 40px;
      --font-display: 'Lora', Georgia, serif;
      --font-body: 'DM Sans', -apple-system, sans-serif;
    }

    html, body, #root {
      height: 100%;
      background: var(--cream);
      font-family: var(--font-body);
      color: var(--charcoal);
      -webkit-font-smoothing: antialiased;
    }

    .app-shell {
      max-width: 430px;
      margin: 0 auto;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--cream);
      position: relative;
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

    /* ── Mic pulse animation ── */
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
      0%, 100% { height: 8px; }
      50% { height: 28px; }
    }
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes sos-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(200,75,47,0.5); }
      50% { box-shadow: 0 0 20px 8px rgba(200,75,47,0.2); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes bounceIn {
      0% { transform: scale(0.8); opacity: 0; }
      70% { transform: scale(1.05); }
      100% { transform: scale(1); opacity: 1; }
    }

    .fade-slide-up { animation: fadeSlideUp 0.35s ease forwards; }
    .bounce-in { animation: bounceIn 0.4s ease forwards; }

    /* ── Mic listening indicator ── */
    .listening-waves {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 36px;
    }
    .listening-waves span {
      width: 4px;
      background: var(--teal);
      border-radius: 4px;
      animation: wave 0.8s ease-in-out infinite;
    }
    .listening-waves span:nth-child(1) { animation-delay: 0s; }
    .listening-waves span:nth-child(2) { animation-delay: 0.1s; }
    .listening-waves span:nth-child(3) { animation-delay: 0.2s; }
    .listening-waves span:nth-child(4) { animation-delay: 0.3s; }
    .listening-waves span:nth-child(5) { animation-delay: 0.4s; }

    /* ── Nav tab styles ── */
    .nav-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 4px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--warm-gray);
      font-family: var(--font-body);
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.3px;
      transition: color 0.2s;
      -webkit-tap-highlight-color: transparent;
    }
    .nav-tab.active { color: var(--teal); }
    .nav-tab:hover { color: var(--teal-light); }
    .nav-tab svg { transition: transform 0.2s; }
    .nav-tab.active svg { transform: scale(1.1); }

    /* ── Chat bubble ── */
    .chat-bubble {
      max-width: 82%;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      font-size: 15px;
      line-height: 1.55;
      animation: fadeSlideUp 0.3s ease forwards;
    }
    .chat-bubble.user {
      background: var(--teal);
      color: #fff;
      border-bottom-right-radius: 4px;
      align-self: flex-end;
    }
    .chat-bubble.ai {
      background: #fff;
      color: var(--charcoal);
      border-bottom-left-radius: 4px;
      box-shadow: var(--shadow-sm);
    }
    .chat-timestamp {
      font-size: 10px;
      color: var(--warm-gray);
      margin-top: 3px;
    }

    /* ── Card ── */
    .card {
      background: #fff;
      border-radius: var(--radius-md);
      padding: 20px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
    }

    /* ── Input styles ── */
    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 13px 16px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      font-family: var(--font-body);
      font-size: 15px;
      color: var(--charcoal);
      background: var(--cream);
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: var(--teal);
      box-shadow: 0 0 0 3px rgba(42,123,111,0.12);
    }
    .form-textarea { resize: vertical; min-height: 90px; }

    /* ── Button ── */
    .btn-primary {
      width: 100%;
      padding: 15px;
      background: var(--teal);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-family: var(--font-body);
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      -webkit-tap-highlight-color: transparent;
    }
    .btn-primary:hover { background: var(--teal-light); }
    .btn-primary:active { transform: scale(0.98); }

    .btn-secondary {
      padding: 10px 20px;
      background: var(--cream-dark);
      color: var(--charcoal);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover { background: var(--teal-pale); border-color: var(--teal); color: var(--teal); }

    /* ── Badge ── */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 500;
    }
    .badge-teal { background: var(--teal-pale); color: var(--teal); }
    .badge-amber { background: var(--amber-pale); color: var(--amber); }
    .badge-coral { background: var(--coral-pale); color: var(--coral); }
    .badge-sage { background: var(--sage-pale); color: var(--sage); }

    /* ── Section label ── */
    .section-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: var(--warm-gray);
      margin-bottom: 12px;
    }

    /* ── Memory chip ── */
    .memory-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: var(--cream-dark);
      border: 1px solid var(--border);
      border-radius: 100px;
      font-size: 13px;
      color: var(--charcoal);
      transition: all 0.2s;
    }
    .memory-chip:hover { background: var(--teal-pale); border-color: var(--teal); color: var(--teal); }

    /* ── Alert card ── */
    .alert-card {
      border-radius: var(--radius-md);
      padding: 18px 20px;
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }
    .alert-card.emergency { background: var(--coral-pale); border: 1.5px solid #F4C0B0; }
    .alert-card.medication { background: var(--amber-pale); border: 1.5px solid #FAD99A; }
    .alert-card.caregiver { background: var(--sage-pale); border: 1.5px solid #C3D9C7; }
    .alert-card.info { background: var(--teal-pale); border: 1.5px solid #9DD5CD; }

    /* Scrollable chat */
    .chat-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ── Spinner ── */
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid var(--border);
      border-top-color: var(--teal);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }

    /* ── Page transitions ── */
    .page { animation: fadeIn 0.25s ease; }

    /* ── Enhanced listening indicator ── */
    .listening-indicator {
      background: var(--teal-pale);
      border: 1px solid var(--teal);
      border-radius: var(--radius-md);
      padding: 12px 16px;
      margin: 8px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: fadeIn 0.3s ease;
    }
    .listening-indicator .transcript {
      flex: 1;
      font-size: 14px;
      color: var(--teal);
      font-weight: 500;
    }
    .listening-indicator .interim {
      opacity: 0.7;
      font-style: italic;
    }
    .listening-indicator .confidence {
      font-size: 11px;
      color: var(--warm-gray);
      margin-top: 2px;
    }

    /* ── Error message styling ── */
    .error-message {
      background: var(--coral-pale);
      border: 1px solid var(--coral);
      color: var(--coral);
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      margin: 4px 0;
    }

    /* ── Speaking indicator ── */
    .speaking-indicator {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: var(--teal);
      border-radius: 50%;
      animation: pulse-ring 1.5s ease-in-out infinite;
    }

    /* ── Enhanced chat bubble with metadata ── */
    .chat-bubble.enhanced {
      position: relative;
    }
    .chat-bubble.enhanced .metadata {
      position: absolute;
      top: -20px;
      right: 0;
      font-size: 10px;
      color: var(--warm-gray);
      background: rgba(255, 255, 255, 0.9);
      padding: 2px 6px;
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
    }

    /* ── Connection status ── */
    .connection-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
    }
    .connection-status.online { color: var(--teal); }
    .connection-status.offline { color: var(--coral); }
    .connection-status .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
    }
    .connection-status.online .dot { background: var(--teal); }
    .connection-status.offline .dot { background: var(--coral); }

    /* ── Enhanced input with clear button ── */
    .input-container {
      position: relative;
      flex: 1;
    }
    .input-container .clear-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--warm-gray);
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.2s;
    }
    .input-container .clear-btn:hover {
      background: var(--coral-pale);
      color: var(--coral);
    }

    /* ── Processing indicator ── */
    .processing-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--teal);
      font-size: 12px;
      font-weight: 500;
    }
    .processing-indicator .dots {
      display: flex;
      gap: 2px;
    }
    .processing-indicator .dot {
      width: 4px;
      height: 4px;
      background: var(--teal);
      border-radius: 50%;
      animation: wave 1.2s ease-in-out infinite;
    }
    .processing-indicator .dot:nth-child(1) { animation-delay: 0s; }
    .processing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
    .processing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }
  `}</style>
);

/* ─────────────────────────────────────────
   ICON COMPONENTS
───────────────────────────────────────── */
const Icon = {
  Mic: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  Home: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  Dashboard: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Bell: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Send: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/>
    </svg>
  ),
  Alert: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Pill: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 20.5 3.5 13.5a5 5 0 1 1 7-7l7 7a5 5 0 1 1-7 7z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>
    </svg>
  ),
  Heart: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  User: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Phone: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 9.25a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.4a16 16 0 0 0 6.29 6.29l1.06-.9a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  Brain: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z"/>
    </svg>
  ),
  Clock: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
    </svg>
  ),
  Check: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  Trash: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Plus: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Volume: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  ),
  Star: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  ),
};

/* ─────────────────────────────────────────
   SPEECH UTILITIES - ENHANCED VERSION
───────────────────────────────────────── */
const useSpeech = () => {
  const synth = window.speechSynthesis;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!synth || !text) return;

    // Stop any current speech
    synth.cancel();
    setIsSpeaking(false);

    const utterance = new SpeechSynthesisUtterance(text);

    // Enhanced voice selection
    const preferredVoice = voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Zira'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Configurable speech settings
    utterance.rate = options.rate || 0.85; // Slightly slower for clarity
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.9; // Slightly quieter to be less startling

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  }, [synth, voices]);

  const stopSpeaking = useCallback(() => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, [synth]);

  const pauseSpeaking = useCallback(() => {
    if (synth && isSpeaking) {
      synth.pause();
    }
  }, [synth, isSpeaking]);

  const resumeSpeaking = useCallback(() => {
    if (synth && synth.paused) {
      synth.resume();
    }
  }, [synth]);

  return {
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    isSpeaking,
    voices
  };
};

const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const recogRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRec) {
      setSupported(true);
      const recognition = new SpeechRec();

      // Enhanced recognition settings
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      // Auto-stop after silence
      recognition.onstart = () => {
        setListening(true);
        setError(null);
        setIsProcessing(false);

        // Auto-stop after 5 seconds of silence
        timeoutRef.current = setTimeout(() => {
          if (recognition && listening) {
            recognition.stop();
          }
        }, 5000);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setConfidence(event.results[i][0].confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          setInterimTranscript('');
          setIsProcessing(true);
        } else {
          setInterimTranscript(interimTranscript);
        }
      };

      recognition.onend = () => {
        setListening(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setIsProcessing(false);
      };

      recognition.onerror = (event) => {
        setListening(false);
        setError(event.error);
        setIsProcessing(false);

        // Handle specific errors
        switch (event.error) {
          case 'network':
            setError('Network error - check your connection');
            break;
          case 'not-allowed':
            setError('Microphone access denied');
            break;
          case 'no-speech':
            setError('No speech detected');
            break;
          case 'aborted':
            setError(null); // User cancelled, not an error
            break;
          default:
            setError('Speech recognition error: ' + event.error);
        }
      };

      recogRef.current = recognition;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [listening]);

  const startListening = useCallback(() => {
    if (!recogRef.current) return;

    try {
      setTranscript("");
      setInterimTranscript("");
      setError(null);
      setConfidence(0);
      recogRef.current.start();
    } catch (err) {
      setError('Failed to start speech recognition');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recogRef.current) return;

    try {
      recogRef.current.stop();
    } catch (err) {
      // Ignore errors when stopping
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
    setConfidence(0);
  }, []);

  return {
    transcript,
    interimTranscript,
    listening,
    supported,
    error,
    confidence,
    isProcessing,
    startListening,
    stopListening,
    resetTranscript,
    fullTranscript: transcript + interimTranscript
  };
};

/* ─────────────────────────────────────────
   AI RESPONSE LOGIC (Simulated + Pattern)
───────────────────────────────────────── */
const AI_RESPONSES = {
  greetings: ["Hello! It's so wonderful to hear your voice today. How are you feeling?",
    "Good to hear from you! I'm here to help you with anything you need.",
    "Hello there! I'm MemoVoice, your memory companion. What would you like to talk about?"],
  medication: ["It's time to take your medication. Would you like me to remind you which ones? Your caregiver has set up Lisinopril at 8 AM and Metformin at noon.",
    "You have two medications to take. Shall I read out the details for you?"],
  family: ["Your daughter Sarah called you the 'sunshine of her life' in a memory she shared. Would you like to hear more family memories?",
    "I have wonderful memories from your family saved. Your grandson Tommy scored his first goal last summer!"],
  memory: ["Let me help you remember. Your home address is 42 Maple Street. Your daughter's name is Sarah, and she visits every Sunday.",
    "Of course! Here are some things to remember: your doctor's appointment is Thursday at 2 PM, and your favorite tea is chamomile."],
  help: ["I'm here to help you! You can ask me to remind you about medications, share family memories, call a caregiver, or just have a chat.",
    "I can help with medication reminders, family memory recall, emergency alerts, and keeping you company. What do you need?"],
  default: ["I'm here with you. Could you tell me a bit more about what you need?",
    "I heard you. Let me see how I can help with that.",
    "Thank you for sharing that with me. I'm always here to listen and help."],
};

const getAIResponse = (input, memories) => {
  const lower = input.toLowerCase();
  if (lower.match(/hello|hi|hey|good morning|good afternoon/)) return rand(AI_RESPONSES.greetings);
  if (lower.match(/medic|pill|tablet|drug|dose/)) return rand(AI_RESPONSES.medication);
  if (lower.match(/family|daughter|son|wife|husband|grandchild|sister|brother/)) return rand(AI_RESPONSES.family);
  if (lower.match(/remember|forget|memory|recall|remind|who|where|what is/)) return rand(AI_RESPONSES.memory);
  if (lower.match(/help|what can you|how do/)) return rand(AI_RESPONSES.help);
  if (memories.length > 0) {
    const m = memories[Math.floor(Math.random() * memories.length)];
    return "Here's a memory your caregiver saved: \"" + m.text + "\" - shared by " + m.person + ". Would you like to hear more?";
  }
  return rand(AI_RESPONSES.default);
};

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* ─────────────────────────────────────────
   SHARED COMPONENTS
───────────────────────────────────────── */

// ── Page Header ──
const PageHeader = ({ title, subtitle, icon }) => (
  <div style={{ padding: "20px 20px 0" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}>
      {icon && <span style={{ color: "var(--teal)" }}>{icon}</span>}
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: "600", color: "var(--charcoal)" }}>{title}</h1>
    </div>
    {subtitle && <p style={{ fontSize: "13px", color: "var(--warm-gray)", marginLeft: icon ? "34px" : 0 }}>{subtitle}</p>}
  </div>
);

// ── Chat Bubble ──
const ChatBubble = ({ message }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: message.sender === "user" ? "flex-end" : "flex-start" }}>
    {message.sender === "ai" && (
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon.Brain size={14} />
        </div>
        <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--teal)", letterSpacing: "0.3px" }}>MEMOVOICE</span>
      </div>
    )}
    <div className={`chat-bubble ${message.sender}`}>{message.text}</div>
    <span className="chat-timestamp">{formatTime(message.time)}</span>
  </div>
);

// ── SOS Button ──
const SOSButton = ({ onPress }) => (
  <button
    className="sos-btn"
    onClick={onPress}
    style={{
      width: 56, height: 56, borderRadius: "50%",
      background: "var(--coral)", border: "none",
      color: "#fff", fontFamily: "var(--font-body)",
      fontSize: "11px", fontWeight: "700", letterSpacing: "1px",
      cursor: "pointer", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "1px",
      transition: "transform 0.1s", flexShrink: 0,
    }}
    onMouseDown={e => e.currentTarget.style.transform = "scale(0.94)"}
    onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
    title="Emergency SOS"
  >
    <Icon.Phone size={16} />
    <span style={{ fontSize: "9px", marginTop: "1px" }}>SOS</span>
  </button>
);

// ── Mic Button ──
const MicButton = ({ listening, onToggle }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
    {listening && (
      <>
        <div style={{
          position: "absolute", width: 90, height: 90, borderRadius: "50%",
          border: "2px solid var(--teal)", opacity: 0.5,
          animation: "pulse-ring 1.2s ease-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 90, height: 90, borderRadius: "50%",
          border: "2px solid var(--teal)", opacity: 0.3,
          animation: "pulse-ring2 1.2s ease-out infinite 0.3s",
        }} />
      </>
    )}
    <button
      onClick={onToggle}
      style={{
        width: 80, height: 80, borderRadius: "50%",
        background: listening ? "var(--coral)" : "var(--teal)",
        border: "none", color: "#fff",
        cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        boxShadow: listening ? "0 4px 24px rgba(200,75,47,0.4)" : "0 4px 24px rgba(42,123,111,0.35)",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        animation: listening ? "mic-glow 2s ease-in-out infinite" : "none",
        transform: listening ? "scale(1.08)" : "scale(1)",
        flexShrink: 0,
      }}
    >
      {listening ? <Icon.MicOff size={30} /> : <Icon.Mic size={30} />}
    </button>
  </div>
);

/* ─────────────────────────────────────────
   PAGE 1: HOME / VOICE ASSISTANT - ENHANCED
───────────────────────────────────────── */
const HomePage = ({ memories }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: "ai", text: "Hello! I'm MemoVoice, your memory companion. Tap the microphone and speak to me — I'm here to help you with anything you need. 💛", time: new Date() },
  ]);
  const [textInput, setTextInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const chatEndRef = useRef(null);

  // Enhanced speech hooks
  const { speak, stopSpeaking, isSpeaking } = useSpeech();
  const {
    transcript,
    interimTranscript,
    listening,
    supported,
    error: speechError,
    confidence,
    isProcessing,
    startListening,
    stopListening,
    resetTranscript,
    fullTranscript
  } = useSpeechRecognition();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Auto-send message when speech recognition completes
  useEffect(() => {
    if (transcript && !listening && !isProcessing) {
      sendMessage(transcript);
    }
  }, [transcript, listening, isProcessing]);

  // Handle speech recognition errors
  useEffect(() => {
    if (speechError) {
      const errorMsg = {
        id: Date.now(),
        sender: "ai",
        text: `I didn't catch that clearly. Could you try speaking again or type your message? (${speechError})`,
        time: new Date(),
        type: "error"
      };
      setMessages(prev => [...prev, errorMsg]);
      speak("I didn't catch that clearly. Could you try speaking again or type your message?");
    }
  }, [speechError, speak]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: text.trim(),
      time: new Date(),
      confidence: confidence > 0 ? Math.round(confidence * 100) : null
    };

    setMessages(prev => [...prev, userMsg]);
    setTextInput("");
    resetTranscript();
    setIsThinking(true);
    setBackendError(null);

    try {
      // Import the API function dynamically to avoid circular dependencies
      const { askAI } = await import('./api');

      // Prepare context from memories
      let context = "";
      if (memories.length > 0) {
        const recentMemories = memories.slice(0, 3).map(m =>
          `- ${m.person}: "${m.text}"`
        ).join("\n");
        context = `Recent memories:\n${recentMemories}`;
      }

      const response = await askAI(text.trim(), context);

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: response.reply,
        time: new Date(),
        latency: response.latency_ms,
        model: response.model
      };

      setMessages(prev => [...prev, aiMsg]);
      speak(response.reply);

    } catch (error) {
      console.error('Backend error:', error);
      setBackendError(error.message);

      const errorMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: "I'm having trouble connecting right now. Please check if the backend server is running on port 5000.",
        time: new Date(),
        type: "error"
      };

      setMessages(prev => [...prev, errorMsg]);
      speak("I'm having trouble connecting right now. Please check if the backend server is running.");
    } finally {
      setIsThinking(false);
    }
  }, [memories, confidence, speak, resetTranscript]);

  const handleMicToggle = () => {
    if (listening) {
      stopListening();
    } else {
      // Stop any current speech before starting listening
      stopSpeaking();
      startListening();
    }
  };

  const handleSOS = () => {
    setSosActive(true);
    speak("Emergency alert sent! Your caregiver has been notified immediately. Help is on the way. Stay calm.", { rate: 0.9, volume: 1.0 });
    const sosMsg = {
      id: Date.now(),
      sender: "ai",
      text: "🚨 Emergency SOS activated! Your caregiver Sarah has been notified. Please stay calm — help is on the way. Calling emergency contact now.",
      time: new Date(),
      type: "emergency"
    };
    setMessages(prev => [...prev, sosMsg]);
    setTimeout(() => setSosActive(false), 5000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(textInput);
    }
  };

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 12px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "600", color: "var(--charcoal)" }}>
              MemoVoice <span style={{ color: "var(--teal)" }}>AI</span>
            </h1>
            <p style={{ fontSize: "12px", color: "var(--warm-gray)", marginTop: "1px" }}>
              Your caring companion
              {backendError && <span style={{ color: "var(--coral)", marginLeft: "8px" }}>⚠️ Connection issue</span>}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div className={`badge ${backendError ? 'badge-coral' : 'badge-teal'}`} style={{ fontSize: "11px" }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: backendError ? "var(--coral)" : "var(--teal)",
                display: "inline-block"
              }} />
              {backendError ? 'Offline' : 'Active'}
            </div>
            {isSpeaking && (
              <div className="badge badge-amber" style={{ fontSize: "11px" }}>
                <Icon.Volume size={10} />
                Speaking
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {backendError && (
        <div style={{ margin: "0 16px 8px", padding: "10px 16px", background: "var(--coral-pale)", borderRadius: "var(--radius-sm)", border: "1px solid var(--coral)", color: "var(--coral)", fontSize: "13px", fontWeight: "500", textAlign: "center" }}>
          ⚠️ Backend connection failed. Make sure the server is running on port 5000.
        </div>
      )}

      {/* SOS Banner */}
      {sosActive && (
        <div style={{ margin: "0 16px 8px", padding: "10px 16px", background: "var(--coral)", borderRadius: "var(--radius-sm)", color: "#fff", fontSize: "13px", fontWeight: "600", textAlign: "center", animation: "bounceIn 0.3s ease" }}>
          🚨 Emergency Alert Sent — Help is Coming!
        </div>
      )}

      {/* Chat Area */}
      <div className="chat-scroll">
        {messages.map(msg => (
          <div key={msg.id} style={{ position: "relative" }}>
            <ChatBubble message={msg} />
            {msg.confidence && msg.confidence < 80 && (
              <div style={{
                position: "absolute", top: "-8px", right: "16px",
                background: "var(--amber-pale)", color: "var(--amber)",
                padding: "2px 6px", borderRadius: "8px", fontSize: "10px",
                fontWeight: "500"
              }}>
                {msg.confidence}% confidence
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: "#fff", borderRadius: "var(--radius-md)", borderBottomLeftRadius: "4px", width: "fit-content", boxShadow: "var(--shadow-sm)" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)", opacity: 0.7, animation: `wave 0.9s ease-in-out ${i * 0.15}s infinite` }} />
            ))}
            <span style={{ fontSize: "12px", color: "var(--warm-gray)", marginLeft: "4px" }}>Thinking...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Enhanced Listening indicator */}
      {listening && (
        <div style={{ padding: "8px 20px", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, background: "var(--teal-pale)", borderTop: "1px solid var(--teal)" }}>
          <div className="listening-waves">
            {[1,2,3,4,5].map(i => <span key={i} />)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", color: "var(--teal)", fontWeight: "500", marginBottom: "2px" }}>
              {fullTranscript || "Listening..."}
            </div>
            <div style={{ fontSize: "11px", color: "var(--warm-gray)" }}>
              {isProcessing ? "Processing..." : "Speak clearly - I'll auto-send when you finish"}
            </div>
          </div>
          <button
            onClick={stopListening}
            style={{
              padding: "6px 12px", background: "var(--coral)", color: "#fff",
              border: "none", borderRadius: "var(--radius-sm)", fontSize: "12px",
              cursor: "pointer", fontWeight: "500"
            }}
          >
            Stop
          </button>
        </div>
      )}

      {/* Voice Controls */}
      <div style={{ padding: "16px 20px", background: "#fff", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <MicButton listening={listening} onToggle={handleMicToggle} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--charcoal)", marginBottom: "2px" }}>
              {listening ? "Listening... tap to stop" : "Tap to speak"}
            </p>
            <p style={{ fontSize: "11px", color: "var(--warm-gray)" }}>
              {supported
                ? (speechError ? `Error: ${speechError}` : "Voice recognition ready - auto-send when finished")
                : "Voice not supported - type your message below"
              }
            </p>
          </div>
          <SOSButton onPress={handleSOS} />
        </div>

        {/* Enhanced Text input row */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              className="form-input"
              style={{ flex: 1, padding: "11px 14px", fontSize: "14px", paddingRight: "40px" }}
              placeholder={listening ? "Listening..." : "Type your message… (Enter to send)"}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={listening}
            />
            {textInput && (
              <button
                onClick={() => setTextInput("")}
                style={{
                  position: "absolute", right: "8px", top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", color: "var(--warm-gray)", cursor: "pointer",
                  padding: "4px", borderRadius: "50%"
                }}
                title="Clear text"
              >
                ×
              </button>
            )}
          </div>
          <button
            onClick={() => sendMessage(textInput)}
            disabled={!textInput.trim() || isThinking}
            style={{
              width: 42, height: 42, borderRadius: "var(--radius-sm)",
              background: (textInput.trim() && !isThinking) ? "var(--teal)" : "var(--cream-dark)",
              color: (textInput.trim() && !isThinking) ? "#fff" : "var(--warm-gray)",
              border: "none", cursor: (textInput.trim() && !isThinking) ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", flexShrink: 0,
            }}
            title="Send message (Enter)"
          >
            {isThinking ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Icon.Send size={16} />}
          </button>
        </div>

        {/* Status indicators */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
          <div style={{ fontSize: "11px", color: "var(--warm-gray)" }}>
            {messages.length} messages • {memories.length} memories stored
          </div>
          {backendError && (
            <div style={{ fontSize: "11px", color: "var(--coral)" }}>
              Backend offline
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   PAGE 2: CAREGIVER DASHBOARD
───────────────────────────────────────── */
const CaregiverDashboard = ({ memories, setMemories, medications, setMedications }) => {
  const [activeTab, setActiveTab] = useState("memories");
  const [memForm, setMemForm] = useState({ text: "", person: "", category: "family" });
  const [medForm, setMedForm] = useState({ name: "", dosage: "", time: "", frequency: "daily" });
  const [saved, setSaved] = useState(null);

  const CATEGORIES = [
    { value: "family", label: "Family", color: "badge-teal" },
    { value: "childhood", label: "Childhood", color: "badge-amber" },
    { value: "achievement", label: "Achievement", color: "badge-sage" },
    { value: "place", label: "Favorite Place", color: "badge-coral" },
  ];

  const saveMemory = () => {
    if (!memForm.text || !memForm.person) return;
    const newMem = { id: Date.now(), ...memForm, date: new Date().toLocaleDateString() };
    setMemories(prev => [newMem, ...prev]);
    setMemForm({ text: "", person: "", category: "family" });
    setSaved("memory");
    setTimeout(() => setSaved(null), 2500);
  };

  const saveMed = () => {
    if (!medForm.name || !medForm.time) return;
    const newMed = { id: Date.now(), ...medForm };
    setMedications(prev => [newMed, ...prev]);
    setMedForm({ name: "", dosage: "", time: "", frequency: "daily" });
    setSaved("medication");
    setTimeout(() => setSaved(null), 2500);
  };

  const deleteMemory = (id) => setMemories(prev => prev.filter(m => m.id !== id));
  const deleteMed = (id) => setMedications(prev => prev.filter(m => m.id !== id));

  return (
    <div className="page" style={{ overflow: "auto", height: "100%" }}>
      <PageHeader title="Caregiver Hub" subtitle="Manage memories & medications" icon={<Icon.Heart size={20} />} />

      {/* Tab Switcher */}
      <div style={{ display: "flex", margin: "16px 20px 0", background: "var(--cream-dark)", borderRadius: "var(--radius-sm)", padding: "3px" }}>
        {[
          { id: "memories", label: "Memories" },
          { id: "medications", label: "Medications" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: "10px", border: "none", borderRadius: "10px",
            fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "500",
            cursor: "pointer", transition: "all 0.2s",
            background: activeTab === tab.id ? "#fff" : "transparent",
            color: activeTab === tab.id ? "var(--teal)" : "var(--warm-gray)",
            boxShadow: activeTab === tab.id ? "var(--shadow-sm)" : "none",
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px 20px 100px" }}>
        {/* MEMORIES TAB */}
        {activeTab === "memories" && (
          <>
            {/* Success Banner */}
            {saved === "memory" && (
              <div className="bounce-in" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "var(--teal-pale)", borderRadius: "var(--radius-sm)", marginBottom: "16px", color: "var(--teal)", fontSize: "14px", fontWeight: "500" }}>
                <Icon.Check size={16} /> Memory saved successfully!
              </div>
            )}

            <div className="card" style={{ marginBottom: "20px" }}>
              <p className="section-label">Add a New Memory</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <textarea
                  className="form-textarea"
                  placeholder="Describe a cherished memory… (e.g. 'We visited Paris together in 1985 and danced in the rain')"
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
                <button className="btn-primary" onClick={saveMemory} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <Icon.Plus size={18} /> Save Memory
                </button>
              </div>
            </div>

            {/* Stored Memories */}
            <p className="section-label">Stored Memories ({memories.length})</p>
            {memories.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 20px", color: "var(--warm-gray)" }}>
                <Icon.Heart size={32} />
                <p style={{ marginTop: "8px", fontSize: "14px" }}>No memories added yet.<br />Add the first cherished moment above.</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {memories.map(mem => {
                const cat = CATEGORIES.find(c => c.value === mem.category) || CATEGORIES[0];
                return (
                  <div key={mem.id} className="card fade-slide-up" style={{ padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span className={`badge ${cat.color}`}>{cat.label}</span>
                      <button onClick={() => deleteMemory(mem.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--warm-gray)", padding: "2px" }}>
                        <Icon.Trash size={15} />
                      </button>
                    </div>
                    <p style={{ fontSize: "14px", lineHeight: "1.55", color: "var(--charcoal)", marginBottom: "8px" }}>"{mem.text}"</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "var(--warm-gray)" }}>— {mem.person}</span>
                      <span style={{ fontSize: "11px", color: "var(--warm-gray)" }}>{mem.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* MEDICATIONS TAB */}
        {activeTab === "medications" && (
          <>
            {saved === "medication" && (
              <div className="bounce-in" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "var(--amber-pale)", borderRadius: "var(--radius-sm)", marginBottom: "16px", color: "var(--amber)", fontSize: "14px", fontWeight: "500" }}>
                <Icon.Check size={16} /> Medication reminder saved!
              </div>
            )}

            <div className="card" style={{ marginBottom: "20px" }}>
              <p className="section-label">Add Medication Reminder</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input className="form-input" placeholder="Medication name (e.g. Lisinopril 10mg)" value={medForm.name} onChange={e => setMedForm(f => ({ ...f, name: e.target.value }))} />
                <input className="form-input" placeholder="Dosage (e.g. 1 tablet)" value={medForm.dosage} onChange={e => setMedForm(f => ({ ...f, dosage: e.target.value }))} />
                <div style={{ display: "flex", gap: "10px" }}>
                  <input className="form-input" type="time" value={medForm.time} onChange={e => setMedForm(f => ({ ...f, time: e.target.value }))} style={{ flex: 1 }} />
                  <select className="form-select" value={medForm.frequency} onChange={e => setMedForm(f => ({ ...f, frequency: e.target.value }))} style={{ flex: 1 }}>
                    <option value="daily">Daily</option>
                    <option value="twice">Twice Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="asneeded">As Needed</option>
                  </select>
                </div>
                <button className="btn-primary" onClick={saveMed} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <Icon.Plus size={18} /> Add Reminder
                </button>
              </div>
            </div>

            <p className="section-label">Active Reminders ({medications.length})</p>
            {medications.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 20px", color: "var(--warm-gray)" }}>
                <Icon.Pill size={32} />
                <p style={{ marginTop: "8px", fontSize: "14px" }}>No medications added yet.<br />Add reminders above to keep track.</p>
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
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <span className="badge badge-amber"><Icon.Clock size={11} /> {med.time || "Not set"}</span>
                        <span className="badge" style={{ background: "var(--cream-dark)", color: "var(--charcoal)" }}>{med.frequency}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteMed(med.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--warm-gray)", padding: "2px", marginLeft: "8px" }}>
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
───────────────────────────────────────── */
const AlertsPanel = ({ medications }) => {
  const [sosLog, setSosLog] = useState([
    { id: 1, time: "2:14 PM", date: "Today", status: "resolved", note: "Patient was disoriented, caregiver responded in 4 min" },
    { id: 2, time: "9:30 AM", date: "Yesterday", status: "resolved", note: "Missed medication reminder — resolved by phone call" },
  ]);
  const [notifSent, setNotifSent] = useState(false);
  const [medAlertSent, setMedAlertSent] = useState(false);
  const { speak } = useSpeech();

  const CAREGIVERS = [
    { name: "Sarah Mitchell", relation: "Daughter", phone: "+1 (555) 234-5678", initials: "SM", color: "var(--teal-pale)", textColor: "var(--teal)" },
    { name: "Dr. Patel", relation: "Primary Physician", phone: "+1 (555) 876-4321", initials: "DP", color: "var(--sage-pale)", textColor: "var(--sage)" },
    { name: "Maria (Nurse)", relation: "Home Care Nurse", phone: "+1 (555) 345-9012", initials: "MN", color: "var(--amber-pale)", textColor: "var(--amber)" },
  ];

  const sendNotif = () => {
    setNotifSent(true);
    setTimeout(() => setNotifSent(false), 3000);
  };

  const upcomingMeds = medications.filter(m => m.time);
  const now = new Date();
  const currentHour = now.getHours();

  const announceMedications = () => {
    if (upcomingMeds.length === 0) {
      speak("There are no medication reminders scheduled right now.");
      setMedAlertSent(true);
      setTimeout(() => setMedAlertSent(false), 3000);
      return;
    }

    const reminderText = upcomingMeds
      .map((med) => {
        const details = [];
        if (med.name) details.push(med.name);
        if (med.dosage) details.push(med.dosage);
        if (med.time) details.push(`at ${med.time}`);
        return details.join(' ');
      })
      .join('. ');

    speak(`Medication reminder. Please take your medicine: ${reminderText}.`);
    setMedAlertSent(true);
    setTimeout(() => setMedAlertSent(false), 3000);
  };

  return (
    <div className="page" style={{ overflow: "auto", height: "100%" }}>
      <PageHeader title="Alerts & Reminders" subtitle="Emergency log and notifications" icon={<Icon.Bell size={20} />} />

      <div style={{ padding: "16px 20px 100px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Emergency SOS Section */}
        <div>
          <p className="section-label">Emergency Alerts</p>
          <div className="alert-card emergency" style={{ marginBottom: "12px" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
              <Icon.Alert size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: "600", fontSize: "15px", color: "var(--coral)", marginBottom: "4px" }}>SOS Response System</p>
              <p style={{ fontSize: "13px", color: "#7B3A2A", lineHeight: "1.5" }}>Emergency alerts are instantly sent to all registered caregivers. Average response time: <strong>3.5 minutes</strong>.</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {sosLog.map(log => (
              <div key={log.id} className="card fade-slide-up" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--charcoal)" }}>{log.date} · {log.time}</span>
                  </div>
                  <span className="badge badge-sage"><Icon.Check size={11} /> {log.status}</span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--warm-gray)", lineHeight: "1.5" }}>{log.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Medication Reminders */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <p className="section-label" style={{ marginBottom: 0 }}>Today's Medications</p>
            <button
              className="btn-secondary"
              onClick={announceMedications}
              style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", padding: "8px 12px" }}
            >
              <Icon.Volume size={14} /> Voice Alert
            </button>
          </div>
          {medAlertSent && (
            <div className="badge badge-teal" style={{ marginBottom: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Icon.Check size={12} /> Medication reminder spoken
            </div>
          )}
          {upcomingMeds.length === 0 ? (
            <div className="alert-card info">
              <Icon.Pill size={20} />
              <p style={{ fontSize: "13px", color: "var(--teal)" }}>No medications scheduled. Add them in the Caregiver Hub.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {upcomingMeds.map(med => {
                const [h, m] = med.time.split(":").map(Number);
                const isPast = h < currentHour || (h === currentHour && m < now.getMinutes());
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

        {/* Caregiver Contacts */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <p className="section-label" style={{ marginBottom: 0 }}>Caregiver Contacts</p>
            {notifSent && (
              <span className="badge badge-teal bounce-in"><Icon.Check size={11} /> Notified!</span>
            )}
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
                  <button onClick={sendNotif} className="btn-secondary" style={{ padding: "8px 12px", fontSize: "12px", flexShrink: 0 }}>
                    Notify
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Overview */}
        <div>
          <p className="section-label">System Status</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "10px" }}>
            {[
              { label: "Voice AI", value: "Online", color: "var(--sage)" },
              { label: "Alerts", value: "Active", color: "var(--teal)" },
              { label: "Memories", value: "Synced", color: "var(--amber)" },
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
const BottomNav = ({ page, setPage }) => {
  const tabs = [
    { id: "home", label: "Home", icon: <Icon.Home size={22} /> },
    { id: "dashboard", label: "Caregiver", icon: <Icon.Dashboard size={22} /> },
    { id: "alerts", label: "Alerts", icon: <Icon.Bell size={22} /> },
  ];

  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430,
      background: "#fff", borderTop: "1px solid var(--border)",
      display: "flex", zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {tabs.map(tab => (
        <button key={tab.id} className={`nav-tab ${page === tab.id ? "active" : ""}`} onClick={() => setPage(tab.id)}>
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   APP ROOT
───────────────────────────────────────── */
const SAMPLE_MEMORIES = [
  { id: 1, text: "We celebrated your 60th birthday at the beach house in Cape Cod. You wore your favorite yellow sundress and danced barefoot in the sand.", person: "Daughter Sarah", category: "family", date: "Apr 10, 2025" },
  { id: 2, text: "Your first day of teaching at Lincoln Elementary in 1972 — you were so nervous but the children adored you immediately.", person: "Husband Robert", category: "achievement", date: "Mar 22, 2025" },
  { id: 3, text: "Every summer we used to pick blueberries at Grandma Edna's farm. The whole family would come, and you made the most wonderful pies.", person: "Sister Margaret", category: "childhood", date: "Feb 14, 2025" },
];

const SAMPLE_MEDS = [
  { id: 1, name: "Lisinopril 10mg", dosage: "1 tablet", time: "08:00", frequency: "daily" },
  { id: 2, name: "Metformin 500mg", dosage: "1 tablet with food", time: "13:00", frequency: "twice" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [memories, setMemories] = useState(SAMPLE_MEMORIES);
  const [medications, setMedications] = useState(SAMPLE_MEDS);

  return (
    <>
      <GlobalStyles />
      <div className="app-shell">
        {/* Brand bar */}
        <div style={{
          background: "var(--cream)", borderBottom: "1px solid var(--border)",
          padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
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
            <span style={{ fontSize: "11px", color: "var(--warm-gray)" }}>Patient Mode</span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {page === "home" && <HomePage memories={memories} />}
          {page === "dashboard" && (
            <CaregiverDashboard
              memories={memories} setMemories={setMemories}
              medications={medications} setMedications={setMedications}
            />
          )}
          {page === "alerts" && <AlertsPanel medications={medications} />}
        </div>

        <BottomNav page={page} setPage={setPage} />
      </div>
    </>
  );
}
