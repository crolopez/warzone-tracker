import { Schema } from 'mongoose'

const UserReportsSchema = new Schema({
  user: { type: String, trim: true, unique: true, sparse: true },
  channels: [{ type: Number, trim: true, sparse: true }],
  lastMatch: { type: String, trim: true, sparse: true },
  lastMatchStartTimestamp: { type: Number, trim: true, sparse: true },
  lastMatchEndTimestamp: { type: Number, trim: true, sparse: true },
  sessionReported: { type: Boolean, trim: true, sparse: true },
})

export { UserReportsSchema }
