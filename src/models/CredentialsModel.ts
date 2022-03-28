import mongoose from 'mongoose'
import { CredentialsDocName } from './DocumentNames'
import { CredentialsSchema } from './schemas/CredentialsSchema'
import { CredentialsDoc } from './types/CredentialsDoc'

export default mongoose.model<CredentialsDoc>(CredentialsDocName, CredentialsSchema)
