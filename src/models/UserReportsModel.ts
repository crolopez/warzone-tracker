import mongoose from 'mongoose'
import { UserReportsDocName } from './DocumentNames'
import { UserReportsSchema } from './schemas/UserReportsSchema'
import { UserReportsDoc } from './types/UserReportsDoc'

export default mongoose.model<UserReportsDoc>(UserReportsDocName, UserReportsSchema)
