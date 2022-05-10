import mongoose from 'mongoose'

export interface UserReportsDoc extends mongoose.Document {
  user: { type: string, trim: true, unique: true, sparse: true },
  channels: [{ type: number, trim: true, sparse: true }],
  lastMatch: { type: string, trim: true, sparse: true },
  lastMatchStartTimestamp: { type: number, trim: true, sparse: true },
  lastMatchEndTimestamp: { type: number, trim: true, sparse: true },
  sessionReported: { type: boolean, trim: true, sparse: true },
}
