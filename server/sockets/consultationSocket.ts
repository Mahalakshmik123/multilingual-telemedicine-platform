import { Server, Socket } from 'socket.io';
import { translateMedicalText } from '../services/aiService.ts';
import { checkEmergencySymptoms } from '../services/emergencyService.ts';
import { Message } from '../models/Message.ts';
import { Consultation } from '../models/Consultation.ts';
import { memoryStore } from '../models/store.ts';

export const setupConsultationSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    // Join consultation room
    socket.on('join-room', ({ consultationId, user }) => {
      socket.join(consultationId);
      socket.to(consultationId).emit('user-connected', {
        socketId: socket.id,
        user
      });
    });

    // Real-time medical chat message with auto-translation and emergency check
    socket.on('send-message', async (data) => {
      const {
        consultationId,
        sender,
        senderName,
        senderRole,
        text,
        sourceLanguage = 'en',
        targetLanguage = 'ta',
        audioBase64
      } = data;

      if (!text || text.trim() === '') return;

      // Emergency symptom check
      const emergencyCheck = checkEmergencySymptoms(text);

      // Medical Translation
      const translation = await translateMedicalText(
        text,
        sourceLanguage,
        targetLanguage,
        'Telemedicine Clinical Dialogue'
      );

      const messageDoc = {
        consultation: consultationId,
        sender,
        senderName: senderName || 'User',
        senderRole: senderRole || 'patient',
        originalText: text,
        originalLanguage: sourceLanguage,
        translatedText: translation.translatedText,
        targetLanguage,
        isEmergency: emergencyCheck.isEmergency,
        emergencyAlertText: emergencyCheck.alertMessage,
        audioBase64: audioBase64 || null,
        createdAt: new Date()
      };

      // Persist
      try {
        await Message.create(messageDoc);
      } catch {
        await memoryStore.messages.create(messageDoc);
      }

      // Broadcast message to everyone in room
      io.to(consultationId).emit('new-message', messageDoc);

      // If emergency symptom triggered, broadcast instant emergency alert
      if (emergencyCheck.isEmergency) {
        io.to(consultationId).emit('emergency-alert', {
          alertMessage: emergencyCheck.alertMessage,
          matchedPhrases: emergencyCheck.matchedPhrases,
          disclaimer: emergencyCheck.disclaimer,
          triggeredBy: senderName
        });
      }
    });

    // WebRTC Signaling
    socket.on('webrtc-offer', (payload) => {
      io.to(payload.target).emit('webrtc-offer', {
        sdp: payload.sdp,
        sender: socket.id,
        user: payload.user
      });
    });

    socket.on('webrtc-answer', (payload) => {
      io.to(payload.target).emit('webrtc-answer', {
        sdp: payload.sdp,
        sender: socket.id
      });
    });

    socket.on('ice-candidate', (payload) => {
      io.to(payload.target).emit('ice-candidate', {
        candidate: payload.candidate,
        sender: socket.id
      });
    });

    // Media toggles
    socket.on('toggle-media', ({ consultationId, isAudioMuted, isVideoOff, user }) => {
      socket.to(consultationId).emit('peer-media-toggled', {
        socketId: socket.id,
        isAudioMuted,
        isVideoOff,
        user
      });
    });

    // Interpreter escalation events
    socket.on('request-interpreter-live', (data) => {
      io.emit('interpreter-request-broadcast', data);
    });

    socket.on('interpreter-joining', ({ consultationId, interpreter }) => {
      io.to(consultationId).emit('interpreter-joined-room', { interpreter });
    });

    // Consultation lifecycle
    socket.on('end-consultation-event', ({ consultationId, summary }) => {
      io.to(consultationId).emit('consultation-ended-event', { summary });
    });

    socket.on('disconnect', () => {
      // socket disconnect
    });
  });
};
