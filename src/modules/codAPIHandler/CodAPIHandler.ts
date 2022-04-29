import { IdentitiesRequest, MatchesRequest, MatchPlayersRequest, UserInfoRequest } from './apiPaths'
import { APIResponse } from './types/APIResponse'
import { PlayerMatch } from './types/PlayerMatch'
import { TitleIdentity } from './types/TitleIdentity'
import { assertValidResponse, sendRequest, sendUserRequest } from './utils'

class CodAPIHandler {
  private ssoToken: string

  constructor(ssoToken: string) {
    this.ssoToken = ssoToken
  }

  async isValidSSO(allowedUser: string): Promise<boolean> {
    const response = await sendRequest(this.ssoToken, { route: IdentitiesRequest })
    assertValidResponse(response)

    const { titleIdentities } = response.data
    if (titleIdentities == undefined) return false

    const userEntries: TitleIdentity[] = titleIdentities.filter((x: TitleIdentity) => x.username == allowedUser)
    return userEntries.length > 0
  }

  async getLastMatchesIdFrom(user: string, from?: number): Promise<string[]> {
    const response = await sendUserRequest(this.ssoToken, user, MatchesRequest)
    assertValidResponse(response)

    if (response.data.matches === undefined) {
      throw new Error(response.data.message)
    }

    return response.data.matches
      .filter(x => x.utcStartSeconds > (from !== undefined ? from : 0))
      .sort((x, y) => y.utcStartSeconds - x.utcStartSeconds)
      .map(x => x.matchID)
  }

  async getMatchInfo(user: string, matchId: string): Promise<PlayerMatch[]> {
    const lastMatchInfo = await sendRequest(this.ssoToken, {
      route: MatchPlayersRequest,
      matchId: matchId,
    })

    assertValidResponse(lastMatchInfo)

    return lastMatchInfo.data.allPlayers as PlayerMatch[]
  }

  async getUserSummary(user: string): Promise<APIResponse> {
    const response = await sendUserRequest(this.ssoToken, user, UserInfoRequest)
    assertValidResponse(response)
    return response
  }
}

export { CodAPIHandler }
