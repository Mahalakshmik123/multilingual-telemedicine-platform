export interface EmergencyCheckResult {
  isEmergency: boolean;
  matchedPhrases: string[];
  alertMessage: string;
  disclaimer: string;
}

const EMERGENCY_PATTERNS = [
  // English
  { pattern: /\b(chest\s*pain|heart\s*attack|cardiac\s*arrest)\b/i, category: 'Cardiac Emergency' },
  { pattern: /\b(difficulty\s*breathing|cannot\s*breathe|shortness\s*of\s*breath|suffocating|choking)\b/i, category: 'Respiratory Emergency' },
  { pattern: /\b(severe\s*bleeding|hemorrhage|uncontrolled\s*bleeding)\b/i, category: 'Severe Bleeding' },
  { pattern: /\b(unconscious|fainted|loss\s*of\s*consciousness|unresponsive|seizure|convulsions)\b/i, category: 'Loss of Consciousness / Seizure' },
  { pattern: /\b(anaphylaxis|severe\s*allergic\s*reaction|swollen\s*throat|lip\s*swelling)\b/i, category: 'Anaphylaxis' },
  { pattern: /\b(stroke|face\s*droop|slurred\s*speech|paralysis|sudden\s*numbness)\b/i, category: 'Stroke' },
  { pattern: /\b(severe\s*poisoning|swallowed\s*poison|overdose)\b/i, category: 'Poisoning/Overdose' },

  // Tamil (தமிழ்)
  { pattern: /(மார்பு\s*வலி|நெஞ்சு\s*வலி|மாரடைப்பு)/i, category: 'Cardiac Emergency (Tamil)' },
  { pattern: /(சுவாசிக்க\s*முடியவில்லை|மூச்சு\s*திணறல்|சுவாச\s*பிரச்சனை)/i, category: 'Respiratory Emergency (Tamil)' },
  { pattern: /(கடுமையான\s*இரத்தப்போக்கு|அதிக\s*ரத்தம்)/i, category: 'Severe Bleeding (Tamil)' },
  { pattern: /(மயக்கம்|நினைவிழந்த|வலிப்பு)/i, category: 'Unconscious/Seizure (Tamil)' },

  // Hindi (हिन्दी)
  { pattern: /(सीने\s*में\s*दर्द|दिल\s*का\s*दौरा|हार्ट\s*अटैक)/i, category: 'Cardiac Emergency (Hindi)' },
  { pattern: /(सांस\s*लेने\s*में\s*तकलीफ|सांस\s*फूलना|दम\s*घुटना)/i, category: 'Respiratory Emergency (Hindi)' },
  { pattern: /(गंभीर\s*रक्तस्राव|भारी\s*खून\s*बहना)/i, category: 'Severe Bleeding (Hindi)' },
  { pattern: /(बेहोश|मूर्छित|दौरा)/i, category: 'Unconscious/Seizure (Hindi)' },

  // Telugu (తెలుగు)
  { pattern: /(ఛాతీ\s*నొప్పి|గుండె\s*నొప్పి|గుండెపోటు)/i, category: 'Cardiac Emergency (Telugu)' },
  { pattern: /(శ్వాస\s*తీసుకోవడంలో\s*ఇబ్బంది|ఊపిరాడటం\s*లేదు)/i, category: 'Respiratory Emergency (Telugu)' },

  // Malayalam (മലയാളം)
  { pattern: /(നെഞ്ചുവേദന|ഹൃദയാഘാതം)/i, category: 'Cardiac Emergency (Malayalam)' },
  { pattern: /(ശ്വാസമെടുക്കാൻ\s*ബുദ്ധിമുട്ട്|ശ്വാസംമുട്ടൽ)/i, category: 'Respiratory Emergency (Malayalam)' },

  // Kannada (ಕನ್ನಡ)
  { pattern: /(ಎದೆ\s*ನೋವು|ಹೃದಯಾಘಾತ)/i, category: 'Cardiac Emergency (Kannada)' },
  { pattern: /(ಉಸಿರಾಟದ\s*ತೊಂದರೆ|ಉಸಿರುಗಟ್ಟುವುದು)/i, category: 'Respiratory Emergency (Kannada)' }
];

export const checkEmergencySymptoms = (text: string): EmergencyCheckResult => {
  if (!text || typeof text !== 'string') {
    return {
      isEmergency: false,
      matchedPhrases: [],
      alertMessage: '',
      disclaimer: ''
    };
  }

  const matchedPhrases: string[] = [];

  for (const item of EMERGENCY_PATTERNS) {
    if (item.pattern.test(text)) {
      matchedPhrases.push(item.category);
    }
  }

  const isEmergency = matchedPhrases.length > 0;

  return {
    isEmergency,
    matchedPhrases,
    alertMessage: isEmergency
      ? '🚨 Potential emergency symptom detected. Please seek immediate medical assistance or call emergency services (112 / 911 / 108).'
      : '',
    disclaimer:
      'NOTICE: This is an automated safety alert and does NOT constitute a medical diagnosis. The platform does not replace emergency medical facilities.'
  };
};
