import mongoose, { Schema, Document } from "mongoose";

export interface IEmailLog extends Document {
  recipient: string;
  subject: string;
  content: string;
  status: 'sent' | 'failed' | 'pending';
  messageId?: string;
  error?: string;
  sentAt: Date;
  userId: string;
  scenario: string;
  retryCount: number;
  customerId?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    recipient: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending',
    },
    messageId: {
      type: String,
      trim: true,
    },
    error: {
      type: String,
      trim: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: String,
      required: true,
    },
    scenario: {
      type: String,
      required: true,
      enum: [
        'BOOKING_REQUEST',
        'ADD_CUSTOMER',
        'UPDATE_CUSTOMER',
        'CANCEL_CUSTOMER',
        'UPDATE_SESSION',
        'SESSION_PHOTOS_SHARE',
        'CUSTOM',
      ],
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    customerId: {
      type: String,
      trim: true,
    },
    sessionId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances des requêtes
EmailLogSchema.index({ userId: 1, sentAt: -1 });
EmailLogSchema.index({ status: 1 });
EmailLogSchema.index({ scenario: 1 });
EmailLogSchema.index({ recipient: 1 });

export const EmailLog = mongoose.models.EmailLog || mongoose.model<IEmailLog>("EmailLog", EmailLogSchema); 