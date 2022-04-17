import axios from 'axios'
import { APIResponse } from './types/APIResponse'
import { Platform } from './types/Platform'
import { RequestProperties } from './types/RequestProperties'
import { IdTypeVar, MatchesRequest, MatchIdVar, PlatformVar, UserTagVar } from './apiPaths'
import { dbHandler } from '../dbHandler/dbHandler'

const codApi = 'https://my.callofduty.com/api/papi-client'

function getHeaders(ssoToken: string): any {
  return {
    'content-type': 'application/json',
    'ACT_SSO_COOKIE': ssoToken,
    'atvi-auth': ssoToken,
  }
}

function getRequestProperties(route: string, user: string, platform: string): RequestProperties {
  return {
    route: route,
    userTag: user,
    encodedUserTag: encodeURIComponent(user),
    idType: platform === Platform.Uno ? 'id' : 'gamer',
    platform: platform === Platform.Activision ? Platform.Uno : platform,
  }
}

async function getStoredPlatform(user: string): Promise<string | undefined> {
  const userMetadata = await dbHandler.getUserMetadata(user)
  return userMetadata
    ? userMetadata.platform as unknown as string
    : undefined
}

async function storePlatform(user: string, platform: string): Promise<void> {
  await dbHandler.addUserMetadata(user, platform)
}

function getPromiseValue(promise: PromiseSettledResult<APIResponse>): APIResponse | undefined {
  return promise.status === 'fulfilled' ? promise.value : undefined
}

function getFinalRoute(requestProperties: RequestProperties): string {
  return requestProperties.route
    .replace(UserTagVar, requestProperties.encodedUserTag ?? '')
    .replace(PlatformVar, requestProperties.platform ?? '')
    .replace(IdTypeVar, requestProperties.idType ?? '')
    .replace(MatchIdVar, requestProperties.matchId ?? '')
}

function getRequestForAllPlatforms(user: string, ssoToken: string, route: string): Promise<APIResponse>[] {
  return Array.from(Object.values(Platform), platform => {
    const requestProperties = getRequestProperties(route, user, platform)
    console.log('Trying to request with ' +
      `[${requestProperties.encodedUserTag}]-[${requestProperties.platform}]-[${requestProperties.idType}]`)
    return sendRequest(ssoToken, requestProperties)
  })
}

function getRequestForPlatform(user: string, ssoToken: string, route: string, platform: string): Promise<APIResponse> {
  const requestProperties = getRequestProperties(route, user, platform)
  return sendRequest(ssoToken, requestProperties)
}

function assertValidResponse(response: APIResponse): void {
  if (response.status !== 'success') {
    console.log(`Unexpected response: ${response.data.message}`)
    throw new Error(response.data.message)
  }
}

async function sendUserRequest(ssoToken:string, user: string, route: string): Promise<APIResponse> {
  const platform = await getStoredPlatform(user)

  const requests = platform !== undefined
    ? [ getRequestForPlatform(user, ssoToken, route, platform) ]
    : getRequestForAllPlatforms(user, ssoToken, route)

  let response = undefined
  await Promise.allSettled(requests)
    .then(results => results.forEach(result => {
      const promiseValue = getPromiseValue(result)
      if (promiseValue !== undefined && promiseValue.status === 'success') {
        response  = promiseValue
        const user = promiseValue.requestProperties.userTag as string
        const usedPlatform = promiseValue.requestProperties.platform as string
        if (platform === undefined) storePlatform(user, usedPlatform)
      }
    }))

  return response !== undefined
    ? response
    : {
      status: 'error',
      requestProperties: {
        route: route,
      },
      data: {
        message: `Could not get the API response from ${user}`,
      },
    }
}

async function sendRequest(ssoToken:string, requestProperties: RequestProperties): Promise<APIResponse> {
  const request = `${codApi}${getFinalRoute(requestProperties)}`

  console.log(`Sending request to: ${request}`)
  const { data } = await axios.post(request, {},
    {
      headers: getHeaders(ssoToken),
    })

  return { ... data, requestProperties: requestProperties }
}

export { sendRequest, sendUserRequest, assertValidResponse }
