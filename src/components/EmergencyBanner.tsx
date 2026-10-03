import React from 'react';
import { AlertTriangle, Phone, X } from 'lucide-react';

interface EmergencyBannerProps {
  message?: string;
  matchedPhrases?: string[];
  onDismiss?: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  message = 'Potential emergency symptom detected. Please seek immediate medical assistance.',
  matchedPhrases = [],
  onDismiss
}) => {
  return (
    <div className="bg-rose-600 text-white rounded-xl p-4 shadow-xl border-2 border-rose-300 animate-pulse my-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-700 rounded-lg shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="font-extrabold text-base flex items-center gap-2">
              <span>CRITICAL SAFETY ALERT</span>
              {matchedPhrases.length > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-800 text-rose-100">
                  Detected: {matchedPhrases.join(', ')}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-medium text-rose-50 leading-relaxed">
              {message}
            </p>
            <p className="mt-1.5 text-xs text-rose-200">
              IMPORTANT: This is an automated rule-based alert. It does not replace emergency medical physicians or diagnose patients. Call local emergency hotline (108 / 112 / 911) immediately.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:112"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs shadow-sm transition"
          >
            <Phone className="w-3.5 h-3.5" />
            Dial Emergency
          </a>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 text-rose-200 hover:text-white hover:bg-rose-700 rounded-lg transition"
              title="Dismiss Alert"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
