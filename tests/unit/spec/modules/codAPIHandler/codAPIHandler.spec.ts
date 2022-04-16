import { codAPIHandler } from '../../../../../src/modules/codAPIHandler/codAPIHandler'
import { APIResponse } from '../../../../../src/modules/codAPIHandler/types/APIResponse'
import { PlayerMatch } from '../../../../../src/modules/codAPIHandler/types/PlayerMatch'
import { sendRequest, getLastMatch, sendUserRequest } from '../../../../../src/modules/codAPIHandler/utils'

jest.mock('../../../../../src/modules/codAPIHandler/utils')
const sendRequestMock = sendRequest as jest.MockedFunction<typeof sendRequest>
const sendUserRequestMock = sendUserRequest as jest.MockedFunction<typeof sendUserRequest>
const getLastMatchMock = getLastMatch as jest.MockedFunction<typeof getLastMatch>

describe('codAPIHandler', () => {
  const testUser = 'FakeUser#9812'
  const testSSO = 'FakeSSO'
  const testRoute = '/api/fake-route'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('#IsValidSSO (user is not allowed)', async () => {
    sendRequestMock.mockResolvedValueOnce({
      status: 'success',
      requestProperties: {
        route: testRoute,
      },
      data: {
        message: '',
        titleIdentities: undefined,
      },
    })

    const response = await codAPIHandler.IsValidSSO(testRoute, testSSO)

    expect(response).toBe(false)
  })

  test('#IsValidSSO (user is allowed)', async () => {
    sendRequestMock.mockResolvedValueOnce({
      status: 'success',
      requestProperties: {
        route: testRoute,
      },
      data: {
        message: '',
        titleIdentities: [{
          username: 'FakeUser#9812',
        }],
      },
    })

    const response = await codAPIHandler.IsValidSSO(testUser, testSSO)

    expect(response).toBe(true)
  })

  test('#GetLastMatchInfo (returns last match)', async () => {
    getLastMatchMock.mockResolvedValueOnce('LastMatchId')
    sendRequestMock.mockResolvedValueOnce({
      status: 'success',
      requestProperties: {
        route: testRoute,
      },
      data: {
        message: '',
        allPlayers: [
          {
            map: 'FakeMap',
          },
        ] as PlayerMatch[],
      },
    })

    const response = await codAPIHandler.GetLastMatchInfo(testSSO, testUser)

    expect(response).toStrictEqual([ { map: 'FakeMap' } ])
  })

  test('#GetUserSummary', async () => {
    sendUserRequestMock.mockResolvedValueOnce({
      status: 'success',
      fakeKey: 'fakeValue',
    } as unknown as APIResponse)

    const response = await codAPIHandler.GetUserSummary(testSSO, testUser)

    expect(response).toStrictEqual({
      status: 'success',
      fakeKey: 'fakeValue',
    })
  })
})
