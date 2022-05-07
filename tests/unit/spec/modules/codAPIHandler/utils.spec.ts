import axios from 'axios'
import { IdTypeVar, MatchIdVar, PlatformVar, UserTagVar } from '../../../../../src/modules/codAPIHandler/apiPaths'
import { Platform } from '../../../../../src/modules/codAPIHandler/types/Platform'
import { sendRequest, sendUserRequest } from '../../../../../src/modules/codAPIHandler/utils'
import { dbHandler } from '../../../../../src/modules/dbHandler/dbHandler'

jest.mock('axios')

jest.mock('../../../../../src/modules/dbHandler/dbHandler')

function getHeaders(sso: string): any {
  return {
    headers: {
      'content-type': 'application/json',
      'ACT_SSO_COOKIE': sso,
      'atvi-auth': sso,
    },
  }
}

const apiPath = 'https://my.callofduty.com/api/papi-client'
function expectAxiosPostCalled(sso: string, userTag: string, platform: string, idType: string, matchId: string): void {
  expect(axios.post)
    .toBeCalledWith(`${apiPath}/api/fake-route/${userTag}/${platform}/${idType}/${matchId}`,
      {}, getHeaders(sso))
}

describe('utils', () => {
  const testSSO = 'FakeSSO'
  const testUser = 'FakeUser#8287'
  const testUserEncoded = 'FakeUser%238287'
  const testRoute = `/api/fake-route/${UserTagVar}/${PlatformVar}/${IdTypeVar}/${MatchIdVar}`

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('#sendUserRequest (request is sent for all platforms)', async () => {
    axios.post = jest.fn()
    dbHandler.getUserMetadata = jest.fn().mockResolvedValueOnce(undefined)

    await sendUserRequest(testSSO, testUser, testRoute)

    expectAxiosPostCalled(testSSO, testUserEncoded, Platform.Uno, 'gamer', '')
    expectAxiosPostCalled(testSSO, testUserEncoded, Platform.Battlenet, 'gamer', '')
    expectAxiosPostCalled(testSSO, testUserEncoded, Platform.Uno, 'id', '')
    expectAxiosPostCalled(testSSO, testUserEncoded, Platform.PSN, 'gamer', '')
    expectAxiosPostCalled(testSSO, testUserEncoded, Platform.XBOX, 'gamer', '')
  })

  test('#sendUserRequest (request is sent for the stored platform)', async () => {
    dbHandler.getUserMetadata = jest.fn().mockResolvedValueOnce({
      platform: 'Fake stored platform',
    })

    await sendUserRequest(testSSO, testUser, testRoute)

    expectAxiosPostCalled(testSSO, testUserEncoded, 'Fake stored platform', 'gamer', '')
  })

  test('#sendUserRequest (user not found for any platform)', async () => {
    axios.post = jest.fn().mockReturnValue({
      data: undefined,
    })

    const response = await sendUserRequest(testSSO, testUser, testRoute)

    expect(response).toStrictEqual({
      status: 'error',
      requestProperties: {
        route: testRoute,
      },
      data: {
        message: `Could not get the API response from ${testUser}`,
      },
    })
  })

  test('#sendUserRequest (user found)', async () => {
    axios.post = jest.fn().mockReturnValue({
      data: {
        status: 'success',
        data: {
          message: 'Fake API Response',
        },
      },
    })

    const response = await sendUserRequest(testSSO, testUser, testRoute)

    expect(response.data.message).toBe('Fake API Response')
  })

  test('#sendRequest', async () => {
    axios.post = jest.fn().mockReturnValue({ data: {} })
    dbHandler.getUserMetadata = jest.fn().mockResolvedValueOnce(undefined)

    await sendRequest(testSSO, { route: 'FakeRoute' })

    expect(axios.post).toBeCalledWith(`${apiPath}FakeRoute`,
      {}, getHeaders(testSSO))
  })
})
