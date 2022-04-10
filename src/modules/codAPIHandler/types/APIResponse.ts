import { Match } from './Match'
import { RequestProperties } from './RequestProperties'
import { TitleIdentity } from './TitleIdentity'

export interface APIResponse {
  status: string
  requestProperties: RequestProperties
  data: {
    message: string
    type?: string
    titleIdentities?: TitleIdentity[]
    matches?: Match[]
  }
}
