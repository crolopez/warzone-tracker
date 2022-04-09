import { Match } from './Match'
import { TitleIdentity } from './TitleIdentity'

export interface APIResponse {
  status: string
  data: {
    message: string
    type?: string
    titleIdentities?: TitleIdentity[]
    matches?: Match[]
  }
}
