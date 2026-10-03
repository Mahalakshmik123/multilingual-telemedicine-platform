export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
  flag: string;
  fontFamily?: string;
  sampleGreeting: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    speechCode: 'en-US',
    flag: '🇬🇧',
    sampleGreeting: 'Hello, how can I help you today?'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    speechCode: 'ta-IN',
    flag: '🇮🇳',
    sampleGreeting: 'வணக்கம், உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechCode: 'hi-IN',
    flag: '🇮🇳',
    sampleGreeting: 'नमस्ते, आज मैं आपकी क्या मदद कर सकता हूँ?'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    speechCode: 'te-IN',
    flag: '🇮🇳',
    sampleGreeting: 'నమస్కారం, ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?'
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    speechCode: 'ml-IN',
    flag: '🇮🇳',
    sampleGreeting: 'നമസ്കാരം, ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?'
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    speechCode: 'kn-IN',
    flag: '🇮🇳',
    sampleGreeting: 'ನಮಸ್ಕಾರ, ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?'
  }
];

export const getLanguageByCode = (code: string): LanguageConfig => {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
};

// UI Localized strings for patient navigation and essential terms
export const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    findDoctor: 'Find a Doctor',
    bookAppointment: 'Book Appointment',
    dashboard: 'Dashboard',
    appointments: 'Appointments',
    consultations: 'Consultations',
    prescriptions: 'Prescriptions',
    medicalTerms: 'Medical Terms',
    interpreter: 'Interpreter Hub',
    emergencyNotice: 'Emergency Alert',
    requestInterpreter: 'Request Interpreter',
    endConsultation: 'End Consultation',
    original: 'Original',
    translated: 'Translated'
  },
  ta: {
    findDoctor: 'மருத்துவரைத் தேடுக',
    bookAppointment: 'முன்பதிவு செய்க',
    dashboard: 'முகப்பு பலகை',
    appointments: 'சந்திப்புகள்',
    consultations: 'ஆலோசனைகள்',
    prescriptions: 'மருந்துச் சீட்டுகள்',
    medicalTerms: 'மருத்துவச் சொற்கள்',
    interpreter: 'மொழிபெயர்ப்பாளர் மையம்',
    emergencyNotice: 'அவசர சிகிச்சை எச்சரிக்கை',
    requestInterpreter: 'மொழிபெயர்ப்பாளரைக் கோருக',
    endConsultation: 'ஆலோசனையை முடிக்க',
    original: 'அசல் உரை',
    translated: 'மொழிபெயர்ப்பு'
  },
  hi: {
    findDoctor: 'डॉक्टर खोजें',
    bookAppointment: 'अपॉइंटमेंट बुक करें',
    dashboard: 'डैशबोर्ड',
    appointments: 'अपॉइंटमेंट',
    consultations: 'परामर्श',
    prescriptions: 'दवा का पर्चा',
    medicalTerms: 'चिकित्सा शब्दावली',
    interpreter: 'दुभाषिया केंद्र',
    emergencyNotice: 'आपातकालीन चेतावनी',
    requestInterpreter: 'दुभाषिया का अनुरोध करें',
    endConsultation: 'परामर्श समाप्त करें',
    original: 'मूल पाठ',
    translated: 'अनुवादित'
  },
  te: {
    findDoctor: 'వైద్యుడిని కనుగొనండి',
    bookAppointment: 'అపాయింట్‌మెంట్ బుక్ చేయండి',
    dashboard: 'డాష్‌బోర్డ్',
    appointments: 'అపాయింట్‌మెంట్‌లు',
    consultations: 'సంప్రదింపులు',
    prescriptions: 'ప్రిస్క్రిప్షన్లు',
    medicalTerms: 'వైద్య పదాలు',
    interpreter: 'ఇంటర్‌ప్రిటర్ కేంద్రం',
    emergencyNotice: 'అత్యవసర హెచ్చరిక',
    requestInterpreter: 'ఇంటర్‌ప్రిటర్‌ని అభ్యర్థించండి',
    endConsultation: 'ముగించండి',
    original: 'అసలు',
    translated: 'అనువాదం'
  },
  ml: {
    findDoctor: 'ഡോക്ടറെ കണ്ടെത്തുക',
    bookAppointment: 'അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക',
    dashboard: 'ഡാഷ്‌ബോർഡ്',
    appointments: 'അപ്പോയിന്റ്മെന്റുകൾ',
    consultations: 'കൺസൾട്ടേഷനുകൾ',
    prescriptions: 'കുറിപ്പടികൾ',
    medicalTerms: 'വൈദ്യശാസ്ത്ര പദങ്ങൾ',
    interpreter: 'വിവർത്തക കേന്ദ്രം',
    emergencyNotice: 'അടിയന്തര മുന്നറിയിപ്പ്',
    requestInterpreter: 'വിവർത്തകനെ ആവശ്യപ്പെടുക',
    endConsultation: 'അവസാനിപ്പിക്കുക',
    original: 'യഥാർത്ഥം',
    translated: 'വിവർത്തനം'
  },
  kn: {
    findDoctor: 'ವೈದ್ಯರನ್ನು ಹುಡುಕಿ',
    bookAppointment: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    appointments: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು',
    consultations: 'ಸಮಾಲೋಚನೆಗಳು',
    prescriptions: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು',
    medicalTerms: 'ವೈದ್ಯಕೀಯ ಪದಗಳು',
    interpreter: 'ಅನುವಾದಕರ ಕೇಂದ್ರ',
    emergencyNotice: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ',
    requestInterpreter: 'ಅನುವಾದಕರನ್ನು ವಿನಂತಿಸಿ',
    endConsultation: 'ಮುಕ್ತಾಯಗೊಳಿಸಿ',
    original: 'ಮೂಲ',
    translated: 'ಅನುವಾದ'
  }
};
