import mongoose from 'mongoose'

export interface CredentialsDoc extends mongoose.Document {
  ssoToken: { type: string, trim: true, unique: true, sparse: true },
  ssoTokenExpiryDate: { type: string, trim: true, unique: true, sparse: true },
}
