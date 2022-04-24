import { codAPIHandler } from '../../../../../src/modules/codAPIHandler/codAPIHandler'
import { APIResponse } from '../../../../../src/modules/codAPIHandler/types/APIResponse'
import { PlayerMatch } from '../../../../../src/modules/codAPIHandler/types/PlayerMatch'
import { sendRequest, sendUserRequest } from '../../../../../src/modules/codAPIHandler/utils'

jest.mock('../../../../../src/modules/codAPIHandler/utils')
const sendRequestMock = sendRequest as jest.MockedFunction<typeof sendRequest>
const sendUserRequestMock = sendUserRequest as jest.MockedFunction<typeof sendUserRequest>
//const getLastMatchMock = getLastMatch as jest.MockedFunction<typeof getLastMatch>

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

  test('#GetMatchInfo (returns last match)', async () => {
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

    const response = await codAPIHandler.GetMatchInfo(testSSO, testUser, 'LastMatchId')

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

  test('#GetLastMatchId (returns last match)', async () => {
    sendUserRequestMock.mockResolvedValueOnce({
      status: 'success',
      data: {
        matches: [
          {
            utcStartSeconds: 20,
            matchID: '123',
          },
          {
            utcStartSeconds: 30,
            matchID: '456',
          },
          {
            utcStartSeconds: 10,
            matchID: '678',
          },
        ] as unknown as PlayerMatch[],
      },
    } as unknown as APIResponse)

    const response = await codAPIHandler.GetLastMatchId(testSSO, testUser)

    expect(response).toBe('456')
  })

  test('#GetLastMatchId (no matches found)', async () => {
    sendUserRequestMock.mockResolvedValueOnce({
      status: 'success',
      data: {
        message: 'Fake test message',
        matches: undefined,
      },
    } as unknown as APIResponse)

    try {
      await codAPIHandler.GetLastMatchId(testSSO, testUser)

      expect(1).toBe(0)
    } catch(error: any) {
      expect(error.message).toBe('Fake test message')
    }
  })
})
