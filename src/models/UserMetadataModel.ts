import mongoose from 'mongoose'
import { UserMetadataDocName } from './DocumentNames'
import { UserMetadataSchema } from './schemas/UserMetadataSchema'
import { UserMetadataDoc } from './types/UserMetadataDoc'

export default mongoose.model<UserMetadataDoc>(UserMetadataDocName, UserMetadataSchema)
