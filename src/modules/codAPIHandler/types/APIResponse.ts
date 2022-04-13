import { PlayerMatch } from './PlayerMatch'
import { RequestProperties } from './RequestProperties'
import { TitleIdentity } from './TitleIdentity'

export interface APIResponse {
  status: string
  requestProperties: RequestProperties
  data: {
    message: string
    type?: string
    titleIdentities?: TitleIdentity[]
    matches?: PlayerMatch[]
    allPlayers?: PlayerMatch[]
  }
}
