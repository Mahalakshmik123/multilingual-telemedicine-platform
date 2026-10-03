import { Request, Response } from 'express';
import { translateMedicalText, explainMedicalTerm } from '../services/aiService.ts';
import { checkEmergencySymptoms } from '../services/emergencyService.ts';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../config/languages.ts';

export const translateText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, sourceLanguage = 'ta', targetLanguage = 'en', category = 'General Medicine' } = req.body;

    if (!text || text.trim() === '') {
      res.status(400).json({ success: false, message: 'Please provide text to translate' });
      return;
    }

    const emergencyCheck = checkEmergencySymptoms(text);

    const result = await translateMedicalText(text, sourceLanguage, targetLanguage, category);

    res.json({
      success: true,
      originalText: text,
      sourceLanguage: result.sourceLang,
      sourceLanguageCode: sourceLanguage,
      targetLanguage: result.targetLang,
      targetLanguageCode: targetLanguage,
      translatedText: result.translatedText,
      isAiGenerated: result.isAiGenerated,
      emergencyAlert: emergencyCheck.isEmergency
        ? {
            detected: true,
            alertMessage: emergencyCheck.alertMessage,
            matchedPhrases: emergencyCheck.matchedPhrases,
            disclaimer: emergencyCheck.disclaimer
          }
        : { detected: false }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Translation failed', error: error.message });
  }
};

export const explainTerm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { term, targetLanguage = 'en' } = req.body;

    if (!term || term.trim() === '') {
      res.status(400).json({ success: false, message: 'Please provide a medical term' });
      return;
    }

    const explanation = await explainMedicalTerm(term, targetLanguage);

    res.json({
      success: true,
      ...explanation
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to explain medical term', error: error.message });
  }
};

export const getSupportedLanguages = (req: Request, res: Response): void => {
  res.json({
    success: true,
    languages: SUPPORTED_LANGUAGES
  });
};
