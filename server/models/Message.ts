import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  consultation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: 'patient' | 'doctor' | 'interpreter';
  originalText: string;
  originalLanguage: string;
  translatedText: string;
  targetLanguage: string;
  isEmergency: boolean;
  emergencyAlertText?: string;
  audioBase64?: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    consultation: { type: Schema.Types.ObjectId, ref: 'Consultation', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['patient', 'doctor', 'interpreter'], required: true },
    originalText: { type: String, required: true },
    originalLanguage: { type: String, required: true },
    translatedText: { type: String, required: true },
    targetLanguage: { type: String, required: true },
    isEmergency: { type: Boolean, default: false },
    emergencyAlertText: { type: String },
    audioBase64: { type: String }
  },
  { timestamps: true }
);

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
