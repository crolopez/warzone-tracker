import { IdentitiesRequest, MatchesRequest, MatchPlayersRequest, UserInfoRequest } from './apiPaths'
import { APIResponse } from './types/APIResponse'
import { PlayerMatch } from './types/PlayerMatch'
import { TitleIdentity } from './types/TitleIdentity'
import { assertValidResponse, sendRequest, sendUserRequest } from './utils'

class CoDAPIHandler {
  async isValidSSO(allowedUser: string, ssoToken: string): Promise<boolean> {
    const response = await sendRequest(ssoToken, { route: IdentitiesRequest })
    assertValidResponse(response)

    const { titleIdentities } = response.data
    if (titleIdentities == undefined) return false

    const userEntries: TitleIdentity[] = titleIdentities.filter((x: TitleIdentity) => x.username == allowedUser)
    return userEntries.length > 0
  }

  async getLastMatchesIdFrom(ssoToken: string, user: string, fromMatchId?: string): Promise<string[]> {
    const response = await sendUserRequest(ssoToken, user, MatchesRequest)
    assertValidResponse(response)

    if (response.data.matches === undefined) {
      throw new Error(response.data.message)
    }

    let matches = response.data.matches
    const fromMatch = matches.filter(x => x.matchID == fromMatchId)[0]
    if (fromMatch !== undefined) {
      matches = matches.filter(x => x.utcStartSeconds > fromMatch.utcStartSeconds)
    }

    return matches
      .sort((x, y) => y.utcStartSeconds - x.utcStartSeconds)
      .map(x => x.matchID)
  }

  async getMatchInfo(sso: string, user: string, matchId: string): Promise<PlayerMatch[]> {
    const lastMatchInfo = await sendRequest(sso, {
      route: MatchPlayersRequest,
      matchId: matchId,
    })

    assertValidResponse(lastMatchInfo)

    return lastMatchInfo.data.allPlayers as PlayerMatch[]
  }

  async getUserSummary(user: string, sso: string): Promise<APIResponse> {
    const response = await sendUserRequest(sso, user, UserInfoRequest)
    assertValidResponse(response)
    return response
  }
}

const codAPIHandler = new CoDAPIHandler()
export { codAPIHandler }
