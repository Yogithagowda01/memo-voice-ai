# Voice Alerts & Text-to-Speech Guide

## 📢 Overview

MemoVoice AI now includes comprehensive **text-to-speech (TTS) voice alerts** for:
- Emergency SOS notifications
- Medication reminders
- Health check-ins
- Caregiver notifications
- General announcements

## 🎯 Features

### 1. **Emergency SOS Voice Alerts**
- **Activation**: Tap the red SOS button on the home page
- **What happens**: 
  - AI speaks urgent emergency message with elevated volume and pitch
  - Message: "Emergency alert activated! Your caregiver has been notified immediately. Help is on the way. Please stay calm."
  - Caregiver is notified instantly
  - Alert is logged to backend

### 2. **Medication Reminder Alerts**

#### In Caregiver Hub (Dashboard)
- **Location**: Medications tab
- **Feature**: Each medication has an "Announce" button with volume icon
- **What happens**: Speaks the medication name, dosage, and time
- **Example**: "Medication reminder: Please take Aspirin, 1 tablet at 9:00 AM. Take a sip of water after."

#### In Alerts & Reminders Panel
- **Location**: Top of "Today's Medications" section
- **Button**: "Voice Alert" button
- **What happens**: Speaks all scheduled medications at once
- **Customization**: Speech rate, pitch, and volume are optimized for clarity

### 3. **Multiple Medication Announcements**
- Automatically formats multiple medications into a single announcement
- Speaks each medication with name, dosage, and time
- Includes reminder to drink water

### 4. **Health Check-In Alerts**
Available through the voice alerts utility for future integration:
- **Vitals Check**: Reminds to measure blood pressure and temperature
- **Mood Check**: Asks how the user is feeling
- **Activity Check**: Reminds to take a walk or do stretching

### 5. **Gentle Reminders**
- Personalized reminders with encouragement
- Customizable task descriptions
- Supportive tone

## 🔧 Using Voice Alerts in Code

### Initialize Voice Alerts
```javascript
import { createVoiceAlerts } from "./voiceAlerts";
import { useSpeech } from "./App"; // or wherever useSpeech is defined

// In your component:
const { speak } = useSpeech();
const alerts = createVoiceAlerts(speak);
```

### Available Alert Methods

#### 1. **Medication Reminder**
```javascript
alerts.medicationReminder("Lisinopril", "10mg tablet", "9:00 AM");
// Output: "Medication reminder: Please take Lisinopril, 10mg tablet at 9:00 AM. Take a sip of water after."
```

#### 2. **Multiple Medications**
```javascript
const medications = [
  { name: "Aspirin", dosage: "1 tablet", time: "9:00 AM" },
  { name: "Lisinopril", dosage: "10mg", time: "9:00 AM" },
];
alerts.multipleMedicationsReminder(medications);
// Output: "Medication reminder. Please take: Aspirin, 1 tablet at 9:00 AM. Lisinopril, 10mg at 9:00 AM. Remember to drink water."
```

#### 3. **Emergency Alert**
```javascript
// Severity levels: "critical", "high", "medium"
alerts.emergencyAlert("critical");
alerts.emergencyAlert("high");
alerts.emergencyAlert("medium");
```

#### 4. **Health Check-In**
```javascript
// Types: "vitals", "mood", "activity", "general"
alerts.healthCheckIn("vitals");
alerts.healthCheckIn("mood");
alerts.healthCheckIn("activity");
```

#### 5. **Appointment Reminder**
```javascript
alerts.appointmentReminder("Doctor checkup", "2:00 PM", "Dr. Patel");
// Output: "Appointment reminder: You have a Doctor checkup appointment with Dr. Patel at 2:00 PM. Please get ready soon."
```

#### 6. **Memory Aid**
```javascript
alerts.memoryAid("Your daughter Sarah is visiting today", "She'll arrive around 2 PM");
// Output: "Memory note: Your daughter Sarah is visiting today. She'll arrive around 2 PM."
```

#### 7. **Caregiver Notification**
```javascript
alerts.caregiverNotification("Sarah", "your fall detection alert");
// Output: "Notification: Sarah has been notified about your fall detection alert. Sarah may contact you shortly."
```

#### 8. **Gentle Reminder**
```javascript
alerts.gentleReminder("Have you eaten lunch today?", "Remember to nourish yourself!");
// Output: "Gentle reminder: Have you eaten lunch today?. Remember to nourish yourself!"
```

#### 9. **General Announcement**
```javascript
alerts.announce("Your appointment with Dr. Patel is in 30 minutes");
```

#### 10. **Error Alert**
```javascript
alerts.errorAlert("Medication reminder failed to save");
// Output: "Attention: Medication reminder failed to save. Please try again or contact your caregiver if the problem persists."
```

#### 11. **Quick Acknowledgment**
```javascript
alerts.acknowledge("Got it!");
```

#### 12. **Greeting**
```javascript
alerts.greeting("Good morning! It's a beautiful day today.");
```

#### 13. **Urgent Alert**
```javascript
alerts.urgentAlert("Take your medication now");
// Output: "Urgent: Take your medication now. This needs your immediate attention."
```

## 🎨 Speech Customization

Each alert has optimized settings for:
- **Rate**: Speech speed (0.8 - 0.9 for clarity, especially for seniors)
- **Pitch**: Voice pitch (0.9 - 1.1 for natural tone)
- **Volume**: Speech volume (0.85 - 1.0)

Emergency alerts use:
- Faster rate (0.9)
- Higher pitch (1.1)
- Maximum volume (1.0)

## 📅 Scheduling Recurring Alerts

```javascript
import { scheduleVoiceAlert } from "./voiceAlerts";

// Schedule a medication reminder every 4 hours, max 3 times
const cancel = scheduleVoiceAlert(
  () => alerts.medicationReminder("Aspirin", "1 tablet", "12:00 PM"),
  intervalMinutes = 240,  // 4 hours
  maxRepeats = 3          // Stop after 3 times (0 = infinite)
);

// Cancel the schedule later
cancel();
```

## 🌍 Utility Functions

### Get Time Description
Converts HH:MM format to natural language:
```javascript
import { getTimeDescription } from "./voiceAlerts";

getTimeDescription("14:30"); // Returns "2:30 PM"
```

### Format Medication for Voice
```javascript
import { formatMedicationForVoice } from "./voiceAlerts";

formatMedicationForVoice("Aspirin", "1 tablet", "daily");
// Returns "Aspirin, 1 tablet, daily"
```

## 🔊 Browser Compatibility

Voice alerts use the Web Speech API:
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ Mobile browsers: Generally supported

Voice selection automatically prefers:
1. Female English voices (more natural for caregiving context)
2. Names containing "Female", "Samantha", or "Zira"
3. Fallback to any English voice
4. System default voice

## 🚨 Emergency Alerts Best Practices

1. **Always test** emergency alerts before relying on them
2. **Ensure volume** is not muted when needed
3. **Verify backend connectivity** for SOS logging
4. **Train users** on how to trigger SOS in emergencies

## 🎯 Accessibility Features

- **Clear speech rate** optimized for elderly users
- **Natural female voice** preferred for warmth
- **High volume** for emergency alerts
- **Multiple alert types** for different situations
- **Text + Voice** combination ensures information is conveyed

## 📝 Example: Complete Alert Flow

```javascript
// 1. User taps medication "Announce" button
handleMedicationAnnounce = (medication) => {
  const { speak } = useSpeech();
  const alerts = createVoiceAlerts(speak);
  
  // 2. Voice alerts utility speaks the medication
  alerts.medicationReminder(
    medication.name, 
    medication.dosage, 
    medication.time
  );
  
  // 3. Show confirmation
  setMedAlertSent(true);
  setTimeout(() => setMedAlertSent(false), 3000);
};
```

## 🔗 Integration Points

The voice alerts are currently integrated into:
1. **HomePage** - Emergency SOS button
2. **AlertsPanel** - Medication voice announcement button
3. **CaregiverDashboard** - Individual medication "Announce" buttons

Future integration opportunities:
- Appointment reminders (scheduled notifications)
- Daily health check-ins
- Memory prompts
- Activity reminders
- Caregiver status updates

## 📞 Troubleshooting

### Voice not working?
- Check browser microphone/speaker permissions
- Ensure browser is updated
- Test in Chrome/Edge first
- Check system volume is not muted

### Voice too fast/slow?
- Adjust rate parameter: 0.7 (slow) to 1.0 (fast)
- Default is 0.85 for clarity

### Wrong voice?
- Different browsers have different voice options
- Female voices are automatically preferred
- Falls back to system default if unavailable

### Emergency alert not heard?
- Ensure volume is at 1.0
- Verify browser tab is not muted
- Check system audio is working
- Test speak function independently

## 🎓 Tips for Users

1. **Medication reminders**: Keep volume at 80%+ for reliability
2. **Emergency alerts**: Always keep speaker volume accessible
3. **Best practice**: Speak alongside text UI for maximum clarity
4. **Testing**: Test voice alerts on device daily
5. **Feedback**: Report issues with voice recognition or TTS accuracy

---

**Version**: 1.0  
**Last Updated**: April 2026  
**Status**: Production Ready
