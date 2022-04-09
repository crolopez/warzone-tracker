import axios from 'axios'
import { IdTypeVar, PlatformVar, UserTagVar } from '../../../../../src/modules/codAPIHandler/apiPaths'
import { APIResponse } from '../../../../../src/modules/codAPIHandler/types/APIResponse'
import { Platform } from '../../../../../src/modules/codAPIHandler/types/Platform'
import { assertValidResponse, sendUserRequest } from '../../../../../src/modules/codAPIHandler/utils'

jest.mock('axios')

function getHeaders(sso: string): any {
  return {
    headers: {
      'content-type': 'application/json',
      'ACT_SSO_COOKIE': sso,
      'atvi-auth': sso,
    },
  }
}

function expectAxiosPostCalled(sso: string, userTag: string, platform: string, idType: string): void {
  const apiPath = 'https://my.callofduty.com/api/papi-client'

  expect(axios.post)
    .toBeCalledWith(`${apiPath}/api/fake-route/${userTag}/${platform}/${idType}`,
      {}, getHeaders(sso))
}

describe('utils', () => {
  const testSSO = 'FakeSSO'
  const testUser = 'FakeUser#8287'
  const testUserEncoded = 'FakeUser%238287'
  const testRoute = `/api/fake-route/${UserTagVar}/${PlatformVar}/${IdTypeVar}`

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('#assertValidResponse', async () => {
    assertValidResponse({
      status: 'success',
    } as unknown as APIResponse)
  })

  test('#assertValidResponse (error status)', async () => {
    try {
      assertValidResponse({
        status: 'error',
        data: {
          message: 'Fake error',
        },
      })

      expect(1).toBe(0)
    } catch (error: any) {
      expect(error.message).toBe('Fake error')
    }
  })

  test('#sendUserRequest (request is sent for all platforms)', async () => {
    axios.post = jest.fn()

    await sendUserRequest(testSSO, testUser, testRoute)

    expectAxiosPostCalled(testSSO, testUserEncoded, Platform.Uno, 'gamer')
    expectAxiosPostCalled(testSSO, testUserEncoded, Platform.Battlenet, 'gamer')
    expectAxiosPostCalled(testSSO, testUserEncoded, Platform.Uno, 'id')
    expectAxiosPostCalled(testSSO, testUserEncoded, Platform.PSN, 'gamer')
    expectAxiosPostCalled(testSSO, testUserEncoded, Platform.XBOX, 'gamer')
  })

  test('#sendUserRequest (user not found for any platform)', async () => {
    axios.post = jest.fn().mockReturnValue({
      data: undefined,
    })

    const response = await sendUserRequest(testSSO, testUser, testRoute)

    expect(response).toStrictEqual({
      status: 'error',
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
})
