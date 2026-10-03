import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useSocket } from '../context/SocketContext.tsx';
import api from '../services/api.ts';
import { getLanguageByCode } from '../utils/languages.ts';
import { EmergencyBanner } from '../components/EmergencyBanner.tsx';
import { TerminologyModal } from '../components/TerminologyModal.tsx';
import { NewPrescriptionModal } from '../components/NewPrescriptionModal.tsx';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Send,
  Sparkles,
  Users,
  Languages,
  BookOpen,
  Pill,
  FileCheck,
  AlertTriangle,
  Loader2,
  CheckCircle,
  ShieldCheck,
  Info
} from 'lucide-react';

export const ConsultationRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { currentLanguage, speakText, isSpeaking, stopSpeaking } = useLanguage();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  // Audio / Video device states
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);

  // Modals & Panels
  const [showTerminologyModal, setShowTerminologyModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Emergency status
  const [emergencyAlert, setEmergencyAlert] = useState<any>(null);

  // Interpreter status
  const [interpreterRequested, setInterpreterRequested] = useState(false);
  const [interpreterJoined, setInterpreterJoined] = useState(false);
  const [interpreterData, setInterpreterData] = useState<any>(null);

  // Local media stream for real camera access
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Language configurations
  const isDoctor = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';
  const isInterpreter = user?.role === 'interpreter';

  // Determine source and target languages
  // If doctor speaks English, target is patient's language (e.g. Tamil)
  // If patient speaks Tamil, target is English
  const patientLangCode = consultation?.patient?.preferredLanguage || 'ta';
  const mySourceLang = isDoctor ? 'en' : patientLangCode;
  const myTargetLang = isDoctor ? patientLangCode : 'en';

  const patientLang = getLanguageByCode(patientLangCode);
  const doctorLang = getLanguageByCode('en');

  // Load Consultation Data
  const loadConsultation = async () => {
    try {
      const res = await api.get(`/consultations/${id}`);
      if (res.data?.success) {
        const c = res.data.consultation;
        setConsultation(c);
        setMessages(c.messages || []);
        if (c.emergencyAlertTriggered) {
          setEmergencyAlert({
            alertMessage: 'Potential emergency symptom detected during this session.',
            matchedPhrases: c.emergencyPhrasesDetected || []
          });
        }
        if (c.interpreter) {
          setInterpreterJoined(true);
          setInterpreterData(c.interpreter);
        }
        if (c.aiSummary) {
          setAiSummary(c.aiSummary);
        }
      }
    } catch (err: any) {
      console.error('Failed to load consultation', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultation();
  }, [id]);

  // Start local video stream
  useEffect(() => {
    let localStream: MediaStream | null = null;
    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        }
      } catch (err) {
        console.warn('Camera/mic access error (expected in some sandbox/iframe environments):', err);
      }
    }
    startCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Socket.IO Room & Real-Time Sync
  useEffect(() => {
    if (!socket || !id || !user) return;

    // Join room
    socket.emit('join-room', {
      consultationId: id,
      user: { id: user.id, name: user.name, role: user.role }
    });

    // Handle new message
    const handleNewMessage = (msg: any) => {
      setMessages((prev) => {
        // avoid duplicates
        if (prev.some(m => m.id === msg.id || (m.originalText === msg.originalText && m.createdAt === msg.createdAt))) {
          return prev;
        }
        return [...prev, msg];
      });

      // If speaker is on and message came from the other person, speak the translation!
      if (isSpeakerOn && msg.sender !== user.id) {
        const speakLang = isDoctor ? 'en' : patientLangCode;
        speakText(msg.translatedText, speakLang);
      }
    };

    // Handle emergency alert broadcast
    const handleEmergencyAlert = (alertData: any) => {
      setEmergencyAlert(alertData);
    };

    // Handle interpreter joined
    const handleInterpreterJoined = (data: any) => {
      setInterpreterJoined(true);
      setInterpreterData(data.interpreter);
    };

    socket.on('new-message', handleNewMessage);
    socket.on('emergency-alert', handleEmergencyAlert);
    socket.on('interpreter-joined-room', handleInterpreterJoined);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('emergency-alert', handleEmergencyAlert);
      socket.off('interpreter-joined-room', handleInterpreterJoined);
    };
  }, [socket, id, user, isSpeakerOn, isDoctor, patientLangCode]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      const res = await api.post(`/consultations/${id}/messages`, {
        text: textToSend,
        sourceLanguage: mySourceLang,
        targetLanguage: myTargetLang
      });

      if (res.data?.success) {
        const newMsg = res.data.message;
        setMessages((prev) => [...prev, newMsg]);

        // Emit through socket for peer
        if (socket) {
          socket.emit('send-message', {
            consultationId: id,
            sender: user?.id,
            senderName: user?.name,
            senderRole: user?.role,
            text: textToSend,
            sourceLanguage: mySourceLang,
            targetLanguage: myTargetLang
          });
        }

        if (res.data.emergencyAlert?.detected) {
          setEmergencyAlert(res.data.emergencyAlert);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  // Speech to Text feature using Web Speech Recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser. You can type your message in the text box.');
      return;
    }

    if (isListeningSpeech) {
      setIsListeningSpeech(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const speechCode = getLanguageByCode(mySourceLang).speechCode;
      recognition.lang = speechCode;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListeningSpeech(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
        }
        setIsListeningSpeech(false);
      };

      recognition.onerror = () => {
        setIsListeningSpeech(false);
      };

      recognition.onend = () => {
        setIsListeningSpeech(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed', err);
      setIsListeningSpeech(false);
    }
  };

  // Request Interpreter Escalation
  const handleRequestInterpreter = async () => {
    if (interpreterRequested || interpreterJoined) return;
    try {
      const res = await api.post('/interpreter-requests', {
        consultationId: id,
        patientLanguage: patientLangCode,
        doctorLanguage: 'en',
        reason: 'Patient and physician requested human interpreter escalation for clinical consultation.'
      });

      if (res.data?.success) {
        setInterpreterRequested(true);
        if (socket) {
          socket.emit('request-interpreter-live', {
            consultationId: id,
            patientLanguage: patientLangCode,
            doctorLanguage: 'en'
          });
        }
      }
    } catch (err: any) {
      alert('Failed to request interpreter');
    }
  };

  // Generate AI Summary & Complete Consultation
  const handleGenerateSummary = async (doctorDiagnosis: string, treatmentPlan: string) => {
    setGeneratingSummary(true);
    try {
      const res = await api.put(`/consultations/${id}/complete`, {
        doctorDiagnosis,
        treatmentPlan,
        doctorObservations: 'Clinical examination conducted remotely via TeleMed Lingua real-time video session.',
        durationOfSymptoms: '3 days',
        followUpInstructions: 'Follow up in clinic or via telemedicine if symptoms persist beyond 72 hours.'
      });

      if (res.data?.success) {
        setAiSummary(res.data.summary);
        setShowSummaryModal(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete consultation');
    } finally {
      setGeneratingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Entering secure telemedicine consultation room...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* Top Session Status Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <div className="font-bold text-sm flex items-center gap-2">
              <span>Telemedicine Video Consultation</span>
              <span className="text-[10px] bg-emerald-600/80 text-emerald-100 font-semibold px-2 py-0.5 rounded-full">
                Active Encrypted Session
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Patient: <strong>{consultation?.patient?.name || 'Patient'}</strong> ({patientLang.nativeName}) • Attending Doctor: <strong>{consultation?.doctor?.name || 'Doctor'}</strong>
            </div>
          </div>
        </div>

        {/* Translation Pair Indicator */}
        <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
          <Languages className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-300">Live AI Translation:</span>
          <span className="font-bold text-emerald-400">
            {patientLang.nativeName} ({patientLang.name}) ⟷ English
          </span>
        </div>

        {/* Interpreter Escalation Badge */}
        {interpreterJoined ? (
          <div className="flex items-center gap-1.5 text-xs bg-purple-950 border border-purple-800 text-purple-200 px-3 py-1 rounded-xl">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Human Interpreter Connected: <strong>{interpreterData?.name || 'Certified Interpreter'}</strong></span>
          </div>
        ) : interpreterRequested ? (
          <div className="text-xs text-amber-300 bg-amber-950/60 border border-amber-800 px-3 py-1 rounded-xl flex items-center gap-1.5 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Interpreter Escalation Requested...</span>
          </div>
        ) : (
          <button
            onClick={handleRequestInterpreter}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Users className="w-3.5 h-3.5" />
            Request Human Interpreter
          </button>
        )}
      </div>

      {/* Emergency Alert Banner */}
      {emergencyAlert && (
        <EmergencyBanner
          message={emergencyAlert.alertMessage}
          matchedPhrases={emergencyAlert.matchedPhrases}
          onDismiss={() => setEmergencyAlert(null)}
        />
      )}

      {/* Main Consultation Layout: Split Video Screen & Translation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Video Streams (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Doctor Video Box */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-video sm:aspect-4/3 relative flex items-center justify-center border border-slate-800 shadow-md group">
              {isDoctor && isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 border border-slate-700">
                    <img
                      src={consultation?.doctor?.avatarUrl || `https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80`}
                      alt="Doctor"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="text-sm font-bold text-slate-200">
                    {consultation?.doctor?.name || 'Dr. Rajesh Sharma'}
                  </div>
                  <div className="text-[11px] text-slate-400">Attending Physician • English Speaking</div>
                </div>
              )}

              {/* Video Overlay Badge */}
              <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Doctor Feed (English)
              </div>
            </div>

            {/* 2. Patient Video Box */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-video sm:aspect-4/3 relative flex items-center justify-center border border-slate-800 shadow-md group">
              {isPatient && isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 border border-slate-700">
                    <img
                      src={consultation?.patient?.avatarUrl || `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80`}
                      alt="Patient"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="text-sm font-bold text-slate-200">
                    {consultation?.patient?.name || 'Kavitha Murugan'}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    Patient • {patientLang.nativeName} ({patientLang.name})
                  </div>
                </div>
              )}

              {/* Video Overlay Badge */}
              <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Patient Feed ({patientLang.nativeName})
              </div>
            </div>
          </div>

          {/* Telemedicine Media Controls Bar */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Mic Toggle */}
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-xl font-semibold text-xs transition cursor-pointer ${
                  isMicOn ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-rose-100 text-rose-700'
                }`}
                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              {/* Camera Toggle */}
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-xl font-semibold text-xs transition cursor-pointer ${
                  isVideoOn ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-rose-100 text-rose-700'
                }`}
                title={isVideoOn ? 'Stop Video' : 'Start Video'}
              >
                {isVideoOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              {/* Speaker Toggle (TTS Audio) */}
              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-3 rounded-xl font-semibold text-xs transition cursor-pointer ${
                  isSpeakerOn ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-slate-200 text-slate-400'
                }`}
                title={isSpeakerOn ? 'Translation Audio Speaker Active' : 'Speaker Muted'}
              >
                {isSpeakerOn ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Terminology Helper */}
              <button
                onClick={() => setShowTerminologyModal(true)}
                className="px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                title="Explain Medical Terminology"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Explain Medical Term
              </button>
            </div>

            {/* Doctor Clinical Actions */}
            <div className="flex items-center gap-2">
              {isDoctor && (
                <>
                  <button
                    onClick={() => setShowPrescriptionModal(true)}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pill className="w-3.5 h-3.5" />
                    Issue e-Prescription
                  </button>

                  <button
                    onClick={() =>
                      handleGenerateSummary(
                        consultation?.diagnosis || 'Acute Viral Pharyngitis & Upper Respiratory Infection',
                        consultation?.treatmentPlan || 'Symptomatic relief, hydration, Paracetamol 500mg'
                      )
                    }
                    disabled={generatingSummary}
                    className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {generatingSummary ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    Generate AI Summary
                  </button>
                </>
              )}

              {/* End Call Button */}
              <button
                onClick={() => navigate(isDoctor ? '/doctor/dashboard' : '/patient/dashboard')}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                End Consultation
              </button>
            </div>
          </div>
        </div>

        {/* Right: Real-Time Two-Way Medical Translation & Dialogue Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col h-[650px] overflow-hidden">
          {/* Translation Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800 text-sm">Real-Time Medical Translation</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {mySourceLang.toUpperCase()} ➔ {myTargetLang.toUpperCase()}
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/40">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <Languages className="w-10 h-10 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No dialogue messages yet.</p>
                <p className="text-[11px] max-w-xs text-slate-400">
                  Speak into your microphone or type a symptom. The engine will instantly translate between {patientLang.nativeName} and English.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMine = msg.sender === user?.id;
                const isEmergency = msg.isEmergency;

                return (
                  <div
                    key={msg.id || idx}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="text-[10px] font-bold text-slate-400 px-1 flex items-center gap-1">
                      <span>{msg.senderName}</span>
                      <span className="capitalize text-slate-500">({msg.senderRole})</span>
                    </div>

                    <div
                      className={`max-w-[88%] rounded-2xl p-3 text-xs space-y-2 shadow-xs ${
                        isEmergency
                          ? 'bg-rose-50 border-2 border-rose-400 text-slate-900'
                          : isMine
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-900'
                      }`}
                    >
                      {/* Original text */}
                      <div>
                        <div
                          className={`text-[10px] font-extrabold uppercase tracking-wider mb-0.5 ${
                            isMine ? 'text-emerald-200' : 'text-slate-400'
                          }`}
                        >
                          Original ({getLanguageByCode(msg.originalLanguage).nativeName}):
                        </div>
                        <div className="font-medium text-sm leading-relaxed">
                          {msg.originalText}
                        </div>
                      </div>

                      {/* Translated text */}
                      <div
                        className={`pt-2 border-t ${
                          isMine ? 'border-emerald-500/60' : 'border-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                              isMine ? 'text-amber-200' : 'text-emerald-700'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            Translated ({getLanguageByCode(msg.targetLanguage).nativeName}):
                          </span>

                          <button
                            type="button"
                            onClick={() => speakText(msg.translatedText, msg.targetLanguage)}
                            className={`p-1 rounded hover:bg-black/10 transition cursor-pointer ${
                              isMine ? 'text-emerald-100' : 'text-slate-500'
                            }`}
                            title="Listen"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="font-bold text-sm leading-relaxed">
                          "{msg.translatedText}"
                        </div>
                      </div>

                      {/* Emergency symptom badge */}
                      {isEmergency && (
                        <div className="mt-1 p-2 rounded-lg bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Emergency Symptom Triggered</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box with Speech Recognition */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2">
              {/* Mic STT button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  isListeningSpeech
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title={`Speech to Text (${getLanguageByCode(mySourceLang).nativeName})`}
              >
                <Mic className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isListeningSpeech
                    ? `Listening in ${getLanguageByCode(mySourceLang).nativeName}... speak now`
                    : `Type or speak in ${getLanguageByCode(mySourceLang).nativeName}...`
                }
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600 text-slate-900"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Speaking: <strong>{getLanguageByCode(mySourceLang).nativeName}</strong></span>
              <span>Translating to: <strong>{getLanguageByCode(myTargetLang).nativeName}</strong></span>
            </div>
          </form>
        </div>
      </div>

      {/* AI Consultation Summary Modal */}
      {showSummaryModal && aiSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-indigo-700 to-blue-700 text-white p-5 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-200 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Structured Clinical Summary
              </div>
              <h3 className="text-lg font-bold mt-1">Consultation Summary & Documentation</h3>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 uppercase text-[10px]">Chief Complaints</span>
                <p className="text-slate-800 font-medium">{aiSummary.symptomsSummary}</p>
                <p className="text-slate-500 text-[11px]">Duration: {aiSummary.duration}</p>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-800 uppercase text-[10px]">Doctor Confirmed Diagnosis</span>
                <p className="text-emerald-950 font-extrabold text-sm">{aiSummary.diagnosis}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 uppercase text-[10px]">Treatment Plan & Medications</span>
                <p className="text-slate-800 leading-relaxed font-medium">{aiSummary.treatmentPlan}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 uppercase text-[10px]">Follow-Up Instructions</span>
                <p className="text-slate-800">{aiSummary.followUp}</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>CLINICAL SAFETY DISCLAIMER:</strong> {aiSummary.disclaimer}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Creation Modal */}
      {showPrescriptionModal && (
        <NewPrescriptionModal
          consultationId={id || ''}
          patientId={consultation?.patient?._id || consultation?.patient?.id || consultation?.patient}
          patientName={consultation?.patient?.name || 'Patient'}
          onClose={() => setShowPrescriptionModal(false)}
          onSuccess={() => {
            alert('Prescription created and translated successfully!');
          }}
        />
      )}

      {/* Medical Terminology Helper Modal */}
      {showTerminologyModal && (
        <TerminologyModal
          initialTerm="Hypertension"
          onClose={() => setShowTerminologyModal(false)}
        />
      )}
    </div>
  );
};
