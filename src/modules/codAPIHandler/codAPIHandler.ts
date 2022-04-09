import { IdentitiesRequest, MatchesRequest } from './apiPaths'
import { Match } from './types/Match'
import { TitleIdentity } from './types/TitleIdentity'
import { assertValidResponse, sendRequest, sendUserRequest } from './utils'

class CoDAPIHandler {
  async IsValidSSO(allowedUser: string, ssoToken: string): Promise<boolean> {
    const response = await sendRequest(ssoToken, IdentitiesRequest)
    assertValidResponse(response)

    const { titleIdentities } = response.data
    if (titleIdentities == undefined) return false

    const userEntries: TitleIdentity[] = titleIdentities.filter((x: TitleIdentity) => x.username == allowedUser)
    return userEntries.length > 0
  }

  async GetLastMatch(sso: string, user: string): Promise<Match> {
    const response = await sendUserRequest(sso, user, MatchesRequest)
    assertValidResponse(response)

    if (response.data.matches === undefined) {
      throw new Error(response.data.message)
    }

    return response.data.matches
      .sort((x, y) => y.utcStartSeconds - x.utcStartSeconds)[0]
  }
}

const codAPIHandler = new CoDAPIHandler()
export { codAPIHandler }
