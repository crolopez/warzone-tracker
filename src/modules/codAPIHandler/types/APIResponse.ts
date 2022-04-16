import { LifetimeInfo } from './LifetimeInfo'
import { PlayerMatch } from './PlayerMatch'
import { RequestProperties } from './RequestProperties'
import { TitleIdentity } from './TitleIdentity'

export interface APIResponse {
  status: string
  requestProperties: RequestProperties
  data: {
    message: string
    type?: string
    username?: string
    platform?: string
    level?: number
    lifetime?: LifetimeInfo
    titleIdentities?: TitleIdentity[]
    matches?: PlayerMatch[]
    allPlayers?: PlayerMatch[]
  }
}
