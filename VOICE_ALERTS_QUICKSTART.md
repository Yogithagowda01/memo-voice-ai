# Voice Alerts - Quick Start Guide

## 🎯 What's New

Your MemoVoice AI app now has **voice alerts and text-to-speech** capabilities for:
- 🚨 Emergency SOS alerts
- 💊 Medication reminders (speak aloud)
- 🔊 All medications announcement button
- 📢 13+ different alert types

## 🚀 Getting Started

### 1. Start the Application
```bash
# Terminal 1 - Start backend
cd backend
npm install
npm start  # or: node server.js

# Terminal 2 - Start frontend
cd memo-voice-ai
npm start
```

### 2. Test Voice Alerts

#### A. Emergency SOS Alert
1. Go to **Home** tab
2. Click red **SOS** button
3. 🔊 You'll hear: "Emergency alert activated! Your caregiver has been notified..."

#### B. Medication Announcements (Individual)
1. Go to **Caregiver Hub** tab
2. Click **Medications** tab
3. Add a medication (e.g., "Aspirin", "1 tablet", "9:00 AM")
4. Find the medication card
5. Click the **Announce** button (with 🔊 icon)
6. 🔊 You'll hear: "Medication reminder: Please take Aspirin, 1 tablet at 9:00 AM..."

#### C. All Medications Voice Alert
1. Go to **Alerts & Reminders** tab
2. Look for **Today's Medications** section
3. Click **Voice Alert** button
4. 🔊 You'll hear all scheduled medications announced
5. A blue checkmark "Spoken aloud" appears briefly

## 🔧 How It Works

### The Voice Alerts System
```
┌─────────────────────────────────────┐
│      React Component (App.js)       │
│  (HomePage, Dashboard, AlertsPanel) │
└──────────────────┬──────────────────┘
                   │
                   ├──> useSpeech() hook
                   │    (from App.js)
                   │
                   ├──> createVoiceAlerts()
                   │    (from voiceAlerts.js)
                   │
                   └──> Web Speech API
                        (Browser TTS)
                        
Result: Text is spoken aloud using 
        browser's built-in voice synthesis
```

### Alert Types Available
1. **Emergency Alerts** - SOS, high priority, medium priority
2. **Medication Alerts** - Single or multiple medications
3. **Health Check-ins** - Vitals, mood, activity checks
4. **Appointment Reminders** - Upcoming appointments
5. **Memory Aids** - Remember important information
6. **Caregiver Notifications** - Contact notifications
7. **Gentle Reminders** - Supportive, encouraging messages
8. **Error Alerts** - Problem notifications
9. **General Announcements** - Any text to be spoken

## 🎨 Features

### Customized Speech
- **Rate**: 0.85 (slow, clear speech)
- **Pitch**: 1.0 (natural voice)
- **Volume**: 0.9 (comfortable volume)

Emergency alerts use faster rate (0.9) and higher volume (1.0) for urgency.

### Voice Selection
- Automatically selects female English voices for warmth
- Falls back to system default if unavailable
- Works across Chrome, Firefox, Safari, Edge

### User-Friendly UI
- Clear icons (🔊 for volume/voice)
- Hover effects on buttons
- Visual confirmation after alerts
- Accessible button sizes for elderly users

## 📱 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended, best performance |
| Edge | ✅ Full | Excellent support |
| Firefox | ✅ Full | Full Web Speech API support |
| Safari | ✅ Good | Mobile Safari supported |
| Mobile Chrome | ✅ Good | Works on tablets/phones |

## 🔊 Volume & Audio Tips

1. **Test volume first** - Play a notification sound
2. **Keep volume at 80%+** - Ensure alerts are heard
3. **Check browser mute** - Click speaker icon in tab if muted
4. **System volume** - Verify system is not in silent mode
5. **Speaker/Headphones** - Test with actual audio output

## 📝 File Structure

```
memo-voice-ai/
├── src/
│   ├── App.js                    # ✅ Updated: Voice alerts integrated
│   ├── voiceAlerts.js            # ✨ NEW: Voice alerts utility (13+ methods)
│   ├── api.js                    # API client (unchanged)
│   └── index.js                  # Entry point (unchanged)
│
├── VOICE_ALERTS_GUIDE.md         # ✨ NEW: Detailed usage guide
├── VOICE_ALERTS_IMPLEMENTATION.md # ✨ NEW: Implementation details
├── README.md                      # Main documentation
└── SETUP_GUIDE.md                # Setup instructions
```

## 🧪 Testing Scenarios

### Scenario 1: Emergency Response
```
1. Tap SOS button
2. Verify voice message plays
3. Check backend logs for SOS entry
4. Confirm caregiver notification (manual check for now)
```

### Scenario 2: Medication Management
```
1. Add 3 medications in Caregiver Hub
2. Set different times (9 AM, 1 PM, 6 PM)
3. Click individual "Announce" buttons
4. Click "Voice Alert" button in Alerts panel
5. Verify all medications are announced together
```

### Scenario 3: Speech Quality
```
1. Test with different text lengths
2. Verify speech rate is clear (not too fast)
3. Check volume is appropriate
4. Confirm female voice is selected
```

## 🐛 Troubleshooting

### Voice Not Working?
**Check:**
- [ ] Browser tab is not muted (look for 🔇 icon)
- [ ] System volume is turned up
- [ ] Browser supports Web Speech API
- [ ] Microphone/Speaker permissions granted

**Solution:**
- Try Chrome/Edge first
- Restart browser if needed
- Check browser console for errors (F12)

### Speech Too Fast/Slow?
**Check:** Rate setting in voiceAlerts.js
```javascript
// Current: 0.85 (good for elderly users)
utt.rate = options.rate || 0.85;
// Try: 0.75 for slower, 0.95 for faster
```

### Wrong Voice Gender?
**Current:** Automatically selects female voices
**To change:** Edit voice selection in App.js useSpeech() hook:
```javascript
const voice = voices.find(v => v.lang.startsWith("en") &&
  (v.name.includes("Male") || v.name.includes("Google")))
```

### Medication Alert Not Speaking?
**Check:**
- [ ] Medications have times set
- [ ] At least one medication exists
- [ ] Click correct button (individual "Announce" or "Voice Alert")
- [ ] Browser volume is on

## 🎓 For Developers

### Adding a New Alert Type
1. Open `voiceAlerts.js`
2. Add new method to the object returned by `createVoiceAlerts()`:
```javascript
newAlertType: (param1, param2) => {
  const message = `Your custom message: ${param1}`;
  speakFunction(message, {
    rate: 0.85,
    pitch: 1.0,
    volume: 0.9,
  });
}
```
3. Use in components: `alerts.newAlertType("value1", "value2");`

### Integrating Into New Components
```javascript
// Import utilities
import { useSpeech } from "./App";
import { createVoiceAlerts } from "./voiceAlerts";

// In your component
const { speak } = useSpeech();
const alerts = createVoiceAlerts(speak);

// Use any alert method
alerts.medicationReminder("Name", "Dosage", "Time");
```

## 📚 Documentation Files

1. **VOICE_ALERTS_GUIDE.md** - Complete reference (all methods, examples, troubleshooting)
2. **VOICE_ALERTS_IMPLEMENTATION.md** - Technical implementation details
3. This file - Quick start guide

## ✅ Verification Checklist

- [x] Voice alerts utility created (`voiceAlerts.js`)
- [x] Emergency SOS alert integrated (HomePage)
- [x] Individual medication announcements (CaregiverDashboard)
- [x] All medications voice button (AlertsPanel)
- [x] UI buttons added with hover effects
- [x] No syntax errors in code
- [x] Documentation complete

## 🚀 Next Steps

1. **Test** all voice alerts in your browser
2. **Adjust** speech rate/volume if needed
3. **Report** any issues in browser console (F12)
4. **Integrate** voice alerts into other features
5. **Customize** messages for your needs

## 📞 Need Help?

1. **Check** VOICE_ALERTS_GUIDE.md for detailed docs
2. **Review** Browser console (F12) for errors
3. **Test** with Chrome/Edge first (most compatible)
4. **Verify** system volume and browser permissions
5. **Restart** browser if experiencing issues

---

**Status**: ✅ Ready to Use  
**Last Updated**: April 2026  
**Version**: 1.0  

**Enjoy your enhanced voice-enabled companion app! 🎉**
