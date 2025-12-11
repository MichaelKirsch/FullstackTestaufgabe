import mongoose, { Schema, Document } from 'mongoose';

export interface IEmail extends Document {
  subject: string;
  toEmail: string;
  fromEmail: string;
  body: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
  sentAt?: Date;
  error?: string;
  externalId?: string;
  ownerId: string;
}

const EmailSchema: Schema = new Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  toEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  fromEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  body: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  sentAt: {
    type: Date
  },
  error: {
    type: String
  },
  externalId: {
    type: String
  },
  ownerId: {
    type: String,
    required: true
  }
});

// Index für bessere Performance bei Queries
EmailSchema.index({ status: 1, createdAt: 1 });
EmailSchema.index({ ownerId: 1 });
EmailSchema.index({ externalId: 1 });

export const Email = mongoose.model<IEmail>('Email', EmailSchema);

