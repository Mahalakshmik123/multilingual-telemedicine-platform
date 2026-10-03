export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
  direction: 'ltr' | 'rtl';
  sampleGreeting: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    speechCode: 'en-US',
    direction: 'ltr',
    sampleGreeting: 'Hello, how can I help you today?',
    flag: '🇬🇧'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    speechCode: 'ta-IN',
    direction: 'ltr',
    sampleGreeting: 'வணக்கம், உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?',
    flag: '🇮🇳'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechCode: 'hi-IN',
    direction: 'ltr',
    sampleGreeting: 'नमस्ते, आज मैं आपकी क्या मदद कर सकता हूँ?',
    flag: '🇮🇳'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    speechCode: 'te-IN',
    direction: 'ltr',
    sampleGreeting: 'నమస్కారం, ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?',
    flag: '🇮🇳'
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    speechCode: 'ml-IN',
    direction: 'ltr',
    sampleGreeting: 'നമസ്കാരം, ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?',
    flag: '🇮🇳'
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    speechCode: 'kn-IN',
    direction: 'ltr',
    sampleGreeting: 'ನಮಸ್ಕಾರ, ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    flag: '🇮🇳'
  }
];

export const getLanguageByCode = (code: string): LanguageConfig => {
  const found = SUPPORTED_LANGUAGES.find(l => l.code.toLowerCase() === code.toLowerCase());
  return found || SUPPORTED_LANGUAGES[0];
};

export const getLanguageName = (code: string): string => {
  const lang = getLanguageByCode(code);
  return `${lang.name} (${lang.nativeName})`;
};
