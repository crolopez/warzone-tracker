import { Schema } from 'mongoose'

const CredentialsSchema = new Schema({
  ssoToken: { type: String, trim: true, unique: true, sparse: true },
  ssoTokenExpiryDate: { type: String, trim: true, unique: true, sparse: true },
})

export { CredentialsSchema }
