import { GoogleGenAI } from '@google/genai';
import { getLanguageByCode } from '../config/languages.ts';

// Server-side initialization per Google AI Studio guidelines
const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.warn('[Gemini AI] Initialization warning:', err);
  }
}

// Built-in high accuracy fallback translation table for medical scenarios
const COMMON_MEDICAL_PHRASES: Record<string, Record<string, string>> = {
  // English to languages
  'i have had a fever for three days': {
    ta: 'எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது.',
    hi: 'मुझे तीन दिनों से बुखार है।',
    te: 'నాకు మూడు రోజులుగా జ్వరం ఉంది.',
    ml: 'എനിക്ക് മൂന്ന് ദിവസമായി പനിയുണ്ട്.',
    kn: 'ನನಗೆ ಮೂರು ದಿನಗಳಿಂದ ಜ್ವರವಿದೆ.'
  },
  'i have a headache': {
    ta: 'எனக்கு தலைவலி உள்ளது.',
    hi: 'मुझे सिरदर्द है।',
    te: 'నాకు తలనొప్పిగా ఉంది.',
    ml: 'എനിക്ക് തലവേദനയുണ്ട്.',
    kn: 'ನನಗೆ ತಲೆನೋವು ಇದೆ.'
  },
  'take paracetamol 500mg twice a day after meals': {
    ta: 'உணவுக்குப் பிறகு பாராசிட்டமால் 500mg மாத்திரையை தினமும் இரண்டு முறை எடுத்துக் கொள்ளுங்கள்.',
    hi: 'भोजन के बाद दिन में दो बार पेरासिटामोल 500mg लें।',
    te: 'భోజనం తర్వాత రోజుకు రెండుసార్లు పారాసిటమాల్ 500mg తీసుకోండి.',
    ml: 'ഭക്ഷണത്തിന് ശേഷം ദിവസത്തിൽ രണ്ടുതവണ പാരസെറ്റമോൾ 500mg കഴിക്കുക.',
    kn: 'ಊಟದ ನಂತರ ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ಪ್ಯಾರಸಿಟಮಾಲ್ 500mg ತೆಗೆದುಕೊಳ್ಳಿ.'
  },
  // Tamil to English
  'எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது': {
    en: 'I have had a fever for three days.',
    hi: 'मुझे तीन दिनों से बुखार है।'
  },
  'எனக்கு தலைவலி உள்ளது': {
    en: 'I have a headache.',
    hi: 'मुझे सिरदर्द है।'
  },
  'எனக்கு நெஞ்சு வலி இருக்கிறது': {
    en: 'I have chest pain.',
    hi: 'मुझे सीने में दर्द है।'
  },
  // Hindi to English
  'मुझे तीन दिनों से बुखार है': {
    en: 'I have had a fever for three days.',
    ta: 'எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது.'
  },
  'मुझे सिरदर्द है': {
    en: 'I have a headache.',
    ta: 'எனக்கு தலைவலி உள்ளது.'
  }
};

/**
 * Translates medical text between languages with clinical terminology preservation.
 */
export async function translateMedicalText(
  text: string,
  sourceLangCode: string,
  targetLangCode: string,
  medicalCategory: string = 'General Medicine'
): Promise<{
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  isAiGenerated: boolean;
  preservedTerms: string[];
}> {
  if (!text || text.trim() === '') {
    return {
      translatedText: '',
      sourceLang: sourceLangCode,
      targetLang: targetLangCode,
      isAiGenerated: false,
      preservedTerms: []
    };
  }

  // Same language check
  if (sourceLangCode.toLowerCase() === targetLangCode.toLowerCase()) {
    return {
      translatedText: text,
      sourceLang: sourceLangCode,
      targetLang: targetLangCode,
      isAiGenerated: false,
      preservedTerms: []
    };
  }

  const srcLang = getLanguageByCode(sourceLangCode);
  const tgtLang = getLanguageByCode(targetLangCode);

  // Check fallback dictionary first for exact phrases
  const normalizedKey = text.trim().toLowerCase().replace(/[.!?।]$/, '');
  for (const [key, mapping] of Object.entries(COMMON_MEDICAL_PHRASES)) {
    if (key.toLowerCase() === normalizedKey && mapping[targetLangCode]) {
      return {
        translatedText: mapping[targetLangCode],
        sourceLang: srcLang.name,
        targetLang: tgtLang.name,
        isAiGenerated: false,
        preservedTerms: []
      };
    }
  }

  // Use Gemini if initialized
  if (ai) {
    try {
      const prompt = `You are a specialized medical interpreter and clinical translator assisting in a real-time telemedicine consultation.
Source Language: ${srcLang.name} (${srcLang.nativeName})
Target Language: ${tgtLang.name} (${tgtLang.nativeName})
Clinical Context: ${medicalCategory}

Text to translate:
"""
${text}
"""

Instructions:
1. Translate accurately into natural, culturally respectful ${tgtLang.name}.
2. Ensure precise medical meanings (symptoms, dosage, duration, organ names, anatomical terms) are preserved.
3. Keep the output clean without markdown formatting, quotes, or preambles. Output ONLY the translated sentence.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      const translated = response.text?.trim() || '';
      if (translated) {
        return {
          translatedText: translated,
          sourceLang: srcLang.name,
          targetLang: tgtLang.name,
          isAiGenerated: true,
          preservedTerms: []
        };
      }
    } catch (err: any) {
      console.warn('[Gemini Translation Error]', err.message);
    }
  }

  // Safe fallback if offline or API key absent
  return {
    translatedText: `[${tgtLang.nativeName}] ${text}`,
    sourceLang: srcLang.name,
    targetLang: tgtLang.name,
    isAiGenerated: false,
    preservedTerms: []
  };
}

/**
 * Generates an educational, simplified explanation of a medical term in patient's preferred language.
 * STRICTLY avoids diagnosing or replacing a medical professional.
 */
export async function explainMedicalTerm(
  term: string,
  targetLangCode: string
): Promise<{
  term: string;
  explanation: string;
  language: string;
  disclaimer: string;
}> {
  const lang = getLanguageByCode(targetLangCode);
  const disclaimer = 'Notice: This explanation is for educational purposes only. Always consult your attending doctor for clinical guidance.';

  if (ai) {
    try {
      const prompt = `Explain the medical term "${term}" in simple, comforting, patient-friendly ${lang.name} (${lang.nativeName}).
Rules:
- Explain what it means in everyday words that a non-medical person can understand.
- Provide practical everyday analogy if helpful.
- DO NOT diagnose the patient.
- DO NOT recommend prescription medication.
- Keep it concise (2-4 sentences).
- End with reassurance to discuss any concerns with their doctor.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      const explanation = response.text?.trim();
      if (explanation) {
        return {
          term,
          explanation,
          language: lang.name,
          disclaimer
        };
      }
    } catch (err: any) {
      console.warn('[Gemini Explain Error]', err.message);
    }
  }

  return {
    term,
    explanation: `${term} is a medical condition or term being discussed in your consultation. Please ask your doctor for a detailed explanation specific to your health condition.`,
    language: lang.name,
    disclaimer
  };
}

/**
 * Generates a structured consultation summary based on the doctor's entered notes and conversation.
 * IMPORTANT: The AI does NOT independently diagnose the patient.
 */
export async function generateConsultationSummary(data: {
  patientName: string;
  doctorName: string;
  symptoms: string;
  duration?: string;
  doctorObservations?: string;
  doctorDiagnosis: string;
  treatmentPlan?: string;
  followUpInstructions?: string;
  conversationSnippet?: string;
}): Promise<{
  symptomsSummary: string;
  duration: string;
  observations: string;
  diagnosis: string;
  treatmentPlan: string;
  followUp: string;
  keyMedicalTerms: string[];
  disclaimer: string;
}> {
  const disclaimer =
    'DISCLAIMER: This summary is generated from notes and records provided during the consultation. The attending doctor remains solely responsible for all diagnoses and clinical decisions.';

  if (ai) {
    try {
      const prompt = `You are a clinical documentation assistant summarizing a completed telemedicine consultation.
CRITICAL CONSTRAINT: You must NOT create or infer a new medical diagnosis. The doctor's entered diagnosis is the official diagnosis.

Consultation Information:
- Patient: ${data.patientName}
- Attending Doctor: ${data.doctorName}
- Reported Symptoms: ${data.symptoms || 'None recorded'}
- Duration of Symptoms: ${data.duration || 'Not specified'}
- Doctor's Physical/Clinical Observations: ${data.doctorObservations || 'Standard remote observation'}
- Doctor's Official Diagnosis: ${data.doctorDiagnosis}
- Treatment Plan & Medications: ${data.treatmentPlan || 'As prescribed by doctor'}
- Follow-up Instructions: ${data.followUpInstructions || 'Follow up as needed'}
- Consultation Dialogue Excerpts: ${data.conversationSnippet || 'Telemedicine audio/chat'}

Please return a structured JSON response with exactly these keys:
{
  "symptomsSummary": "concise bulleted or sentence summary of patient's chief complaints",
  "duration": "stated duration of illness",
  "observations": "clinical observations recorded by the doctor",
  "diagnosis": "the doctor's diagnosis verbatim or formatted professionally",
  "treatmentPlan": "summary of prescribed medications, lifestyle advice, rest",
  "followUp": "follow-up timeframe and warning signs requiring urgent attention",
  "keyMedicalTerms": ["term1", "term2", "term3"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        return {
          symptomsSummary: parsed.symptomsSummary || data.symptoms,
          duration: parsed.duration || data.duration || '3 days',
          observations: parsed.observations || data.doctorObservations || 'Clinical examination normal',
          diagnosis: parsed.diagnosis || data.doctorDiagnosis,
          treatmentPlan: parsed.treatmentPlan || data.treatmentPlan || 'Rest and prescribed medication',
          followUp: parsed.followUp || data.followUpInstructions || 'Review in 3 days if symptoms persist',
          keyMedicalTerms: Array.isArray(parsed.keyMedicalTerms) ? parsed.keyMedicalTerms : [],
          disclaimer
        };
      }
    } catch (err: any) {
      console.warn('[Gemini Summary Error]', err.message);
    }
  }

  // Fallback structured summary
  return {
    symptomsSummary: data.symptoms || 'Chief complaints discussed during telemedicine consultation.',
    duration: data.duration || '3 days',
    observations: data.doctorObservations || 'Patient evaluated via video consultation.',
    diagnosis: data.doctorDiagnosis || 'Clinical diagnosis documented by attending physician.',
    treatmentPlan: data.treatmentPlan || 'Follow prescription guidelines and hydration.',
    followUp: data.followUpInstructions || 'Contact clinic if symptoms do not improve in 3-5 days.',
    keyMedicalTerms: ['Consultation', 'Prescription', 'Telemedicine'],
    disclaimer
  };
}
