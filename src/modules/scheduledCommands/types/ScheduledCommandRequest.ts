import { UserReportsDoc } from '../../../models/types/UserReportsDoc'
import { CommandRequest } from '../../commandDispatcher/types/CommandRequest'

export interface ScheduledCommandRequest extends CommandRequest {
  ssoToken: string
  userReports: UserReportsDoc[]
  postMatchReports: boolean
  sessionReports: boolean
}
