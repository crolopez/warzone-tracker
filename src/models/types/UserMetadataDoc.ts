import mongoose from 'mongoose'

export interface UserMetadataDoc extends mongoose.Document {
  user: { type: string, trim: true, unique: true, sparse: true },
  platform: { type: string, trim: true, unique: true, sparse: true },
}
