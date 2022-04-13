import { Schema } from 'mongoose'

const UserMetadataSchema = new Schema({
  user: { type: String, trim: true, unique: true, sparse: true },
  platform: { type: String, trim: true, unique: true, sparse: true },
})

export { UserMetadataSchema }
