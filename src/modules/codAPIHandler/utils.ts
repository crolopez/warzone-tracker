import axios from 'axios'
import { APIResponse } from './types/APIResponse'
import { Platform } from './types/Platform'
import { RequestProperties } from './types/RequestProperties'
import { IdTypeVar, PlatformVar, UserTagVar } from './apiPaths'

const codApi = 'https://my.callofduty.com/api/papi-client'

function getHeaders(ssoToken: string): any {
  return {
    'content-type': 'application/json',
    'ACT_SSO_COOKIE': ssoToken,
    'atvi-auth': ssoToken,
  }
}

function getRequestProperties(user: string, platform: string): RequestProperties {
  return {
    userTag: encodeURIComponent(user),
    idType: platform === Platform.Uno ? 'id' : 'gamer',
    platform: platform === Platform.Activision ? Platform.Uno : platform,
  }
}

function getStoredPlatform(): string | undefined {
  return undefined
}

function getPromiseValue(promise: PromiseSettledResult<APIResponse>): APIResponse | undefined {
  return promise.status === 'fulfilled' ? promise.value : undefined
}

function getFinalRoute(route: string, requestProperties: RequestProperties): string {
  return route
    .replace(UserTagVar, requestProperties.userTag)
    .replace(PlatformVar, requestProperties.platform)
    .replace(IdTypeVar, requestProperties.idType)
}

function getRequestForAllPlatforms(user: string, ssoToken: string, route: string): Promise<APIResponse>[] {
  return Array.from(Object.values(Platform), platform => {
    const requestProperties = getRequestProperties(user, platform)
    console.log('Trying to request with ' +
      `[${requestProperties.userTag}]-[${requestProperties.platform}]-[${requestProperties.idType}]`)
    return sendRequest(ssoToken, getFinalRoute(route, requestProperties))
  })
}

function getRequestForPlatform(user: string, ssoToken: string, route: string, platform: string): Promise<APIResponse> {
  const requestProperties = getRequestProperties(user, platform)
  return sendRequest(ssoToken, getFinalRoute(route, requestProperties))
}

function assertValidResponse(response: APIResponse): void {
  if (response.status !== 'success') {
    console.log(`Unexpected response: ${response.data.message}`)
    throw new Error(response.data.message)
  }
}

async function sendUserRequest(ssoToken:string, user: string, route: string): Promise<APIResponse> {
  const platform = getStoredPlatform()

  const requests = platform !== undefined
    ? [ getRequestForPlatform(user, ssoToken, route, platform) ]
    : getRequestForAllPlatforms(user, ssoToken, route)

  let response = undefined
  await Promise.allSettled(requests)
    .then(results => results.forEach(result => {
      const promiseValue = getPromiseValue(result)
      if (promiseValue !== undefined && promiseValue.status === 'success') {
        response  = promiseValue
      }
    }))

  return response !== undefined
    ? response
    : {
      status: 'error',
      data: {
        message: `Could not get the API response from ${user}`,
      },
    }
}

async function sendRequest(ssoToken:string, route: string): Promise<APIResponse> {
  const request = `${codApi}${route}`

  console.log(`Sending request to: ${request}`)
  const { data } = await axios.post(request, {},
    {
      headers: getHeaders(ssoToken),
    })

  return data
}

export { sendRequest, sendUserRequest, assertValidResponse }