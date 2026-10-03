import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type:
    | 'appointment_booked'
    | 'appointment_confirmed'
    | 'appointment_cancelled'
    | 'appointment_rejected'
    | 'consultation_starting'
    | 'interpreter_requested'
    | 'interpreter_joined'
    | 'prescription_ready'
    | 'emergency_alert';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        'appointment_booked',
        'appointment_confirmed',
        'appointment_cancelled',
        'appointment_rejected',
        'consultation_starting',
        'interpreter_requested',
        'interpreter_joined',
        'prescription_ready',
        'emergency_alert'
      ]
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
