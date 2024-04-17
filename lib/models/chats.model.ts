import { type Chat } from '@/lib/types'
import mongoose, { Model, Schema, model, models } from 'mongoose'

export interface IChat extends Chat {}

export interface ChatDocument extends IChat, mongoose.Document {
  updatedAt: Date
  createdAt: Date
}

const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USERS',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    sharePath: {
      type: String,
      required: false
    },
    messages: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      default: {}
    }
  },
  { timestamps: true }
)

const CHATS: Model<ChatDocument> =
  models.CHATS || model<ChatDocument>('CHATS', chatSchema)

export default CHATS
