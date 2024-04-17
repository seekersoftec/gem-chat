import { User } from '@/lib/types'
import mongoose, { Model, Schema, model, models } from 'mongoose'

export interface IUser extends User {}

export interface UserDocument extends IUser, mongoose.Document {
  updatedAt: Date
  createdAt: Date
  comparePassword: (candidatePassword: string) => Promise<boolean>
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      match: /.+\@.+\..+/,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    salt: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  const user = this as UserDocument
  const password = user.password
  const isMatch = password === candidatePassword
  return isMatch
}

const USERS: Model<UserDocument> =
  models.USERS || model<UserDocument>('USERS', userSchema)

export default USERS
