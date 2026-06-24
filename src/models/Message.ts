import { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema({
  roomId: { type: String, required: true, index: true },
  text: { type: String, required: true },
  sender: { type: String, enum: ['user', 'admin'], required: true },
  time: { type: String, required: true },
}, { timestamps: true });

export const MessageModel = models.Message || model('Message', MessageSchema);