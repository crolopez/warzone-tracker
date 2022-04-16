import { IdentitiesRequest, MatchPlayersRequest, UserInfoRequest } from './apiPaths'
import { APIResponse } from './types/APIResponse'
import { PlayerMatch } from './types/PlayerMatch'
import { TitleIdentity } from './types/TitleIdentity'
import { assertValidResponse, getLastMatch, sendRequest, sendUserRequest } from './utils'

class CoDAPIHandler {
  async IsValidSSO(allowedUser: string, ssoToken: string): Promise<boolean> {
    const response = await sendRequest(ssoToken, { route: IdentitiesRequest })
    assertValidResponse(response)

    const { titleIdentities } = response.data
    if (titleIdentities == undefined) return false

    const userEntries: TitleIdentity[] = titleIdentities.filter((x: TitleIdentity) => x.username == allowedUser)
    return userEntries.length > 0
  }

  async GetLastMatchInfo(sso: string, user: string): Promise<PlayerMatch[]> {
    const lastMatch = await getLastMatch(sso, user)
    const lastMatchInfo = await sendRequest(sso, {
      route: MatchPlayersRequest,
      matchId: lastMatch,
    })

    assertValidResponse(lastMatchInfo)

    return lastMatchInfo.data.allPlayers as PlayerMatch[]
  }

  async GetUserSummary(user: string, sso: string): Promise<APIResponse> {
    const response = await sendUserRequest(sso, user, UserInfoRequest)
    assertValidResponse(response)
    return response
  }
}

const codAPIHandler = new CoDAPIHandler()
export { codAPIHandler }
