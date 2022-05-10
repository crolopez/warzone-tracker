import { IdentitiesRequest, MatchesRequest, MatchPlayersRequest, UserInfoRequest } from './apiPaths'
import { APIResponse } from './types/APIResponse'
import { PlayerMatch } from './types/PlayerMatch'
import { TitleIdentity } from './types/TitleIdentity'
import { sendRequest, sendUserRequest } from './utils'

class CodAPIHandler {
  private ssoToken: string

  constructor(ssoToken: string) {
    this.ssoToken = ssoToken
  }

  async isValidSSO(allowedUser: string): Promise<boolean> {
    const response = await sendRequest(this.ssoToken, { route: IdentitiesRequest })

    const { titleIdentities } = response.data
    if (titleIdentities == undefined) return false

    const userEntries: TitleIdentity[] = titleIdentities.filter((x: TitleIdentity) => x.username == allowedUser)
    return userEntries.length > 0
  }

  async getLastMatchesIdFrom(user: string, from?: number): Promise<string[] | undefined> {
    const response = await sendUserRequest(this.ssoToken, user, MatchesRequest)
    if (response.status !== 'success') {
      return undefined
    }

    if (response.data.matches === undefined) {
      throw new Error(response.data.message)
    }

    return response.data.matches
      .filter(x => x.utcStartSeconds > (from !== undefined ? from : 0))
      .sort((x, y) => y.utcStartSeconds - x.utcStartSeconds)
      .map(x => x.matchID)
  }

  async getLastSessionMatches(user: string, timeBetweenSessions: number): Promise<PlayerMatch[] | undefined> {
    const response = await sendUserRequest(this.ssoToken, user, MatchesRequest)
    if (response.status !== 'success') {
      return undefined
    }

    if (response.data.matches === undefined) {
      throw new Error(response.data.message)
    }

    const orderedMatches = response.data.matches
      .sort((x, y) => y.utcStartSeconds - x.utcStartSeconds)

    let previousMatch: PlayerMatch = orderedMatches[0]
    for (const match of orderedMatches.slice(1)) {
      const matchesDiff = previousMatch.utcStartSeconds - match.utcEndSeconds
      if (matchesDiff > timeBetweenSessions) {
        return orderedMatches.filter(x => x.utcStartSeconds > match.utcEndSeconds)
      }
      previousMatch = match
    }
    return orderedMatches
  }

  async getMatchInfo(user: string, matchId: string): Promise<PlayerMatch[]> {
    const lastMatchInfo = await sendRequest(this.ssoToken, {
      route: MatchPlayersRequest,
      matchId: matchId,
    })

    if (lastMatchInfo.status !== 'success') {
      throw new Error(lastMatchInfo.data.message)
    }

    return lastMatchInfo.data.allPlayers as PlayerMatch[]
  }

  async getUserSummary(user: string): Promise<APIResponse> {
    const response = await sendUserRequest(this.ssoToken, user, UserInfoRequest)
    return response
  }
}

export { CodAPIHandler }
