import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Languages,
  Video,
  ShieldCheck,
  Stethoscope,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  UserCheck,
  MessageSquare,
  Volume2
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/languages.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const Home: React.FC = () => {
  const { currentLanguage, speakText } = useLanguage();
  const { isAuthenticated, user, quickSwitchDemo } = useAuth();
  const navigate = useNavigate();

  // Interactive Live Translation Preview Demo
  const [demoInput, setDemoInput] = useState('எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது.');
  const [demoSource, setDemoSource] = useState('ta');
  const [demoTarget, setDemoTarget] = useState('en');
  const [demoTranslated, setDemoTranslated] = useState('I have had a fever for three days.');

  const sampleTranslations: Record<string, { src: string; tgt: string; original: string; trans: string }> = {
    tamil: {
      src: 'ta',
      tgt: 'en',
      original: 'எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது.',
      trans: 'I have had a fever for three days.'
    },
    hindi: {
      src: 'hi',
      tgt: 'en',
      original: 'मुझे तीन दिनों से तेज सिरदर्द और चक्कर आ रहे हैं।',
      trans: 'I have had a severe headache and dizziness for three days.'
    },
    telugu: {
      src: 'te',
      tgt: 'en',
      original: 'నాకు ఛాతీలో కొద్దిగా నొప్పి మరియు శ్వాసలో ఇబ్బంది ఉంది.',
      trans: 'I have mild chest pain and difficulty in breathing.'
    },
    doctor_to_patient: {
      src: 'en',
      tgt: 'ta',
      original: 'Take Paracetamol 500mg twice daily after meals for 3 days.',
      trans: 'உணவுக்குப் பிறகு பாராசிட்டமால் 500mg மாத்திரையை தினமும் இரண்டு முறை மூன்று நாட்களுக்கு எடுத்துக் கொள்ளுங்கள்.'
    }
  };

  const loadSample = (key: string) => {
    const s = sampleTranslations[key];
    if (s) {
      setDemoSource(s.src);
      setDemoTarget(s.tgt);
      setDemoInput(s.original);
      setDemoTranslated(s.trans);
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Real-Time AI Medical Translation & Human Interpreter Support
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Healthcare Without <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  Language Barriers
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                Connect with experienced healthcare professionals through multilingual telemedicine. Communicate comfortably in your native tongue — Tamil, Hindi, Telugu, Malayalam, Kannada, or English — powered by real-time clinical translation and certified medical interpreters.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/doctors"
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition flex items-center gap-2 group cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4 text-emerald-100" />
                  Find a Doctor
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>

                <Link
                  to={isAuthenticated ? (user?.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard') : '/register'}
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-xs hover:border-slate-300 transition flex items-center gap-2 cursor-pointer"
                >
                  Get Started
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  6 Supported Regional Languages
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  HIPAA-Aligned Privacy Guardrails
                </div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Live Human Interpreter Escalation
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Translation Card Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Live Translation Engine
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Clinical Accuracy Safe
                  </span>
                </div>

                {/* Sample Selector Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
                  <span className="text-[11px] text-slate-400 font-semibold shrink-0">Try Demo:</span>
                  <button
                    onClick={() => loadSample('tamil')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-medium hover:bg-emerald-100 text-[11px] shrink-0"
                  >
                    Tamil ➔ English
                  </button>
                  <button
                    onClick={() => loadSample('hindi')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 text-[11px] shrink-0"
                  >
                    Hindi ➔ English
                  </button>
                  <button
                    onClick={() => loadSample('doctor_to_patient')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 text-[11px] shrink-0"
                  >
                    Prescription ➔ Tamil
                  </button>
                </div>

                {/* Input box */}
                <div className="mt-3 space-y-3">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span className="font-semibold text-slate-700">Patient Speech / Text</span>
                      <button
                        onClick={() => speakText(demoInput, demoSource)}
                        className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 text-[11px] font-medium"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Speak
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed font-tamil">
                      {demoInput}
                    </p>
                  </div>

                  {/* Translation result */}
                  <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200/80 relative">
                    <div className="flex items-center justify-between text-xs text-emerald-800 mb-1.5">
                      <span className="font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Doctor Receives (Real-Time Translation)
                      </span>
                      <button
                        onClick={() => speakText(demoTranslated, demoTarget)}
                        className="text-emerald-800 hover:text-emerald-950 flex items-center gap-1 text-[11px] font-medium"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Listen
                      </button>
                    </div>
                    <p className="text-sm font-bold text-slate-900 leading-relaxed">
                      "{demoTranslated}"
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
                  Preserves clinical meanings, symptoms, durations, and medication dosages seamlessly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Supported Languages Carousel / Grid */}
      <section className="bg-slate-50 py-12 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Multilingual Access
            </h2>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              Supported Regional & International Languages
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Architected with an extensible language matrix to easily onboard additional languages.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div
                key={lang.code}
                className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs hover:shadow-md transition text-center space-y-1.5"
              >
                <div className="text-3xl">{lang.flag}</div>
                <div className="font-bold text-slate-900 text-base">{lang.nativeName}</div>
                <div className="text-xs text-slate-400 font-medium">{lang.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Core Clinical Workflow: How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Patient Journey
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
            How The Multilingual Consultation Works
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            A frictionless 5-step telemedicine flow designed for accessibility and clinical safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            {
              step: '01',
              title: 'Select Language',
              desc: 'Choose your preferred native language (e.g. Tamil or Hindi) for interface and speech.',
              icon: Languages
            },
            {
              step: '02',
              title: 'Find Doctor',
              desc: 'Search licensed doctors by specialization, experience, languages, and open slots.',
              icon: Stethoscope
            },
            {
              step: '03',
              title: 'Video Consultation',
              desc: 'Join encrypted video consultation with real-time bidirectional speech/text translation.',
              icon: Video
            },
            {
              step: '04',
              title: 'Interpreter Assistance',
              desc: 'Escalate to certified human medical interpreters anytime with one single click.',
              icon: UserCheck
            },
            {
              step: '05',
              title: 'Rx & AI Summary',
              desc: 'Receive digital prescriptions with translated dosage advice and structured clinical summaries.',
              icon: FileText
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-200">{item.step}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Three Dedicated User Portals */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-14 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Role-Based Access
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              Tailored Portals for Every Participant
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Patient Portal */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Patient Experience</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patients easily navigate the platform in their native tongue, search for specialists, book appointments without double booking, speak using their voice, and receive translated prescriptions.
              </p>
              <button
                onClick={() => quickSwitchDemo('patient')}
                className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition cursor-pointer"
              >
                Try Patient Demo (Kavitha) ➔
              </button>
            </div>

            {/* Doctor Portal */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Doctor Console</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Doctors manage appointment queues, accept/reject bookings, conduct consultations with real-time translation subtitles, issue e-prescriptions, and generate AI-assisted clinical summaries.
              </p>
              <button
                onClick={() => quickSwitchDemo('doctor')}
                className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs transition cursor-pointer"
              >
                Try Doctor Demo (Dr. Rajesh) ➔
              </button>
            </div>

            {/* Interpreter Portal */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Languages className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Interpreter Hub</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Certified medical interpreters receive live escalation requests from consultations requiring nuanced human interpretation, accept sessions, and join ongoing consultation video rooms.
              </p>
              <button
                onClick={() => quickSwitchDemo('interpreter')}
                className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs transition cursor-pointer"
              >
                Try Interpreter Demo (Ananya) ➔
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Key questions regarding technology, AI safety, and interpreter escalation.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Does the AI provide medical diagnoses to patients independently?',
              a: 'No. The AI system strictly assists with clinical translation, terminology simplification, and documentation summaries. The attending licensed physician remains solely responsible for all diagnoses and prescriptions.'
            },
            {
              q: 'What happens if a patient mentions acute emergency symptoms like chest pain?',
              a: 'The system includes an automatic rule-based emergency safety detector across all supported languages (Tamil, Hindi, Telugu, Malayalam, Kannada, English) that immediately surfaces a prominent emergency alert advising immediate hospitalization (108 / 112).'
            },
            {
              q: 'How does the human interpreter escalation workflow operate?',
              a: 'Either the patient or doctor can click "Request Interpreter" during or before a consultation. This routes a priority request to certified medical interpreters who accept and immediately join the active consultation.'
            },
            {
              q: 'Can patients view or print their electronic prescriptions?',
              a: 'Yes. Patients can view and print verified e-prescriptions anytime from their dashboard with medication instructions automatically translated into their native language.'
            }
          ].map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm">{faq.q}</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
