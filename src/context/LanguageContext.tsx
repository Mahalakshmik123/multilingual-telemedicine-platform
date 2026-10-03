import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, getLanguageByCode, LanguageConfig, UI_TRANSLATIONS } from '../utils/languages.ts';

interface LanguageContextType {
  currentLanguage: LanguageConfig;
  setLanguage: (code: string) => void;
  t: (key: string) => string;
  speakText: (text: string, langCode?: string) => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [langCode, setLangCode] = useState<string>(() => {
    return localStorage.getItem('telemedicine_preferred_lang') || 'ta';
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentLanguage = getLanguageByCode(langCode);

  const setLanguage = (code: string) => {
    setLangCode(code);
    localStorage.setItem('telemedicine_preferred_lang', code);
  };

  const t = (key: string): string => {
    const langDict = UI_TRANSLATIONS[currentLanguage.code] || UI_TRANSLATIONS.en;
    return langDict[key] || UI_TRANSLATIONS.en[key] || key;
  };

  const speakText = (text: string, overrideLangCode?: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported on this browser');
      return;
    }

    window.speechSynthesis.cancel();
    const targetConfig = getLanguageByCode(overrideLangCode || currentLanguage.code);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetConfig.speechCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(targetConfig.code) || v.lang.replace('_', '-').includes(targetConfig.speechCode));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        speakText,
        isSpeaking,
        stopSpeaking
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
