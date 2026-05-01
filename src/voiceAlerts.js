// ═══════════════════════════════════════════════════════════════
//  Voice Alerts Utility — voiceAlerts.js
//  Provides text-to-speech alert functions for different contexts
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize voice alerts with a speak function from useSpeech hook
 * Returns an object with alert methods for different scenarios
 * 
 * Usage:
 *   const { speak } = useSpeech();
 *   const alerts = createVoiceAlerts(speak);
 *   alerts.medicationReminder("Aspirin", "1 tablet", "9:00 AM");
 */
export const createVoiceAlerts = (speakFunction) => {
  if (!speakFunction) {
    console.warn("Voice alerts: speakFunction not provided");
    return {};
  }

  return {
    /**
     * Medication reminder alert
     * @param {string} medicationName - Name of medication
     * @param {string} dosage - Dosage information
     * @param {string} time - Time of medication
     */
    medicationReminder: (medicationName, dosage, time) => {
      const message = `Medication reminder: Please take ${medicationName}, ${dosage}${time ? ` at ${time}` : ""}. Take a sip of water after.`;
      speakFunction(message, {
        rate: 0.85,
        pitch: 1.0,
        volume: 0.95,
      });
    },

    /**
     * Multiple medications reminder
     * @param {Array} medications - Array of medication objects with name, dosage, time
     */
    multipleMedicationsReminder: (medications) => {
      if (!medications || medications.length === 0) {
        speakFunction("There are no medication reminders scheduled right now.", {
          rate: 0.85,
          pitch: 0.95,
          volume: 0.9,
        });
        return;
      }

      const medList = medications
        .map(m => `${m.name}, ${m.dosage}${m.time ? ` at ${m.time}` : ""}`)
        .join(". ");
      
      const message = `Medication reminder. Please take: ${medList}. Remember to drink water.`;
      speakFunction(message, {
        rate: 0.8,
        pitch: 1.0,
        volume: 1.0,
      });
    },

    /**
     * Emergency/SOS alert
     * @param {string} severity - "critical" | "high" | "medium"
     */
    emergencyAlert: (severity = "critical") => {
      const severityText = {
        critical: "Emergency alert activated! Your caregiver has been notified immediately. Help is on the way. Please stay calm.",
        high: "High priority alert sent! Your caregiver has been contacted. Assistance is being arranged.",
        medium: "Alert logged and caregiver notified. Help will be provided shortly.",
      };

      const message = severityText[severity] || severityText.critical;
      speakFunction(message, {
        rate: 0.9,
        pitch: 1.1,
        volume: 1.0,
      });
    },

    /**
     * Health check-in reminder
     * @param {string} checkType - "vitals" | "mood" | "activity"
     */
    healthCheckIn: (checkType = "general") => {
      const checkMessages = {
        vitals: "Health check-in time. Let's check your vital signs. Please measure your blood pressure and temperature when ready.",
        mood: "Hello! I'd like to check in on how you're feeling today. How are you doing?",
        activity: "Activity reminder: Have you been moving around today? A short walk or gentle stretching would be nice.",
        general: "Time for a quick health check-in. How are you feeling?",
      };

      const message = checkMessages[checkType] || checkMessages.general;
      speakFunction(message, {
        rate: 0.85,
        pitch: 0.95,
        volume: 0.9,
      });
    },

    /**
     * Appointment reminder
     * @param {string} appointmentType - Type of appointment
     * @param {string} time - When the appointment is
     * @param {string} provider - Who to see
     */
    appointmentReminder: (appointmentType, time, provider) => {
      const message = `Appointment reminder: You have a ${appointmentType} appointment${provider ? ` with ${provider}` : ""}${time ? ` at ${time}` : ""}. Please get ready soon.`;
      speakFunction(message, {
        rate: 0.85,
        pitch: 0.95,
        volume: 0.95,
      });
    },

    /**
     * Memory aid / Important information
     * @param {string} information - What the user should remember
     * @param {string} context - Context for the information
     */
    memoryAid: (information, context) => {
      let message = `Memory note: ${information}`;
      if (context) message += `. ${context}`;
      
      speakFunction(message, {
        rate: 0.85,
        pitch: 1.0,
        volume: 0.9,
      });
    },

    /**
     * Caregiver notification
     * @param {string} caregiver - Name of caregiver
     * @param {string} action - What action to notify about
     */
    caregiverNotification: (caregiver, action) => {
      const message = `Notification: ${caregiver} has been notified about ${action}. ${caregiver} may contact you shortly.`;
      speakFunction(message, {
        rate: 0.85,
        pitch: 1.0,
        volume: 0.9,
      });
    },

    /**
     * Gentle reminder with encouragement
     * @param {string} task - What the user needs to do
     * @param {string} encouragement - Optional encouragement
     */
    gentleReminder: (task, encouragement) => {
      let message = `Gentle reminder: ${task}.`;
      if (encouragement) message += ` ${encouragement}`;
      
      speakFunction(message, {
        rate: 0.85,
        pitch: 0.9,
        volume: 0.85,
      });
    },

    /**
     * General information announcement
     * @param {string} information - What to announce
     */
    announce: (information) => {
      speakFunction(information, {
        rate: 0.85,
        pitch: 1.0,
        volume: 0.9,
      });
    },

    /**
     * Error or problem alert
     * @param {string} problem - What went wrong
     */
    errorAlert: (problem) => {
      const message = `Attention: ${problem}. Please try again or contact your caregiver if the problem persists.`;
      speakFunction(message, {
        rate: 0.85,
        pitch: 0.95,
        volume: 0.95,
      });
    },

    /**
     * Quick acknowledgment
     * @param {string} acknowledgment - Brief message
     */
    acknowledge: (acknowledgment) => {
      speakFunction(acknowledgment, {
        rate: 0.9,
        pitch: 1.0,
        volume: 0.85,
      });
    },

    /**
     * Wake-up or greeting
     * @param {string} greeting - Greeting message
     */
    greeting: (greeting) => {
      speakFunction(greeting, {
        rate: 0.85,
        pitch: 0.95,
        volume: 0.9,
      });
    },

    /**
     * Urgent action needed
     * @param {string} actionNeeded - What action is needed
     */
    urgentAlert: (actionNeeded) => {
      const message = `Urgent: ${actionNeeded}. This needs your immediate attention.`;
      speakFunction(message, {
        rate: 0.8,
        pitch: 1.1,
        volume: 1.0,
      });
    },
  };
};

/**
 * Schedule a recurring voice alert
 * @param {function} alertFunction - The alert function to call
 * @param {number} intervalMinutes - How often to repeat (in minutes)
 * @param {number} maxRepeats - Maximum number of times to repeat (0 = infinite)
 * @returns {function} Function to cancel the interval
 */
export const scheduleVoiceAlert = (alertFunction, intervalMinutes = 30, maxRepeats = 0) => {
  let repeatCount = 0;
  
  const intervalId = setInterval(() => {
    if (maxRepeats > 0 && repeatCount >= maxRepeats) {
      clearInterval(intervalId);
      return;
    }
    
    alertFunction();
    repeatCount++;
  }, intervalMinutes * 60 * 1000);

  return () => clearInterval(intervalId);
};

/**
 * Get natural time description
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} Natural language time description
 */
export const getTimeDescription = (timeString) => {
  if (!timeString) return "";
  
  const [hours, minutes] = timeString.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

/**
 * Format medication string for voice
 * @param {string} name - Medication name
 * @param {string} dosage - Dosage
 * @param {string} frequency - How often to take
 * @returns {string} Formatted string for voice
 */
export const formatMedicationForVoice = (name, dosage, frequency) => {
  let result = name;
  if (dosage) result += `, ${dosage}`;
  if (frequency) result += `, ${frequency}`;
  return result;
};
