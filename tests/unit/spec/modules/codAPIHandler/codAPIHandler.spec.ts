import { codAPIHandler } from '../../../../../src/modules/codAPIHandler/codAPIHandler'
import { Match } from '../../../../../src/modules/codAPIHandler/types/Match'
import { sendRequest, sendUserRequest } from '../../../../../src/modules/codAPIHandler/utils'

jest.mock('../../../../../src/modules/codAPIHandler/utils')
const sendRequestMock = sendRequest as jest.MockedFunction<typeof sendRequest>
const sendUserRequestMock = sendUserRequest as jest.MockedFunction<typeof sendUserRequest>

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

  test('#GetLastMatch (no matches found)', async () => {
    sendUserRequestMock.mockResolvedValueOnce({
      status: 'success',
      requestProperties: {
        route: testRoute,
      },
      data: {
        message: 'Fake error',
        titleIdentities: undefined,
      },
    })

    try {
      await codAPIHandler.GetLastMatch(testSSO, testUser)

      expect(1).toBe(0)
    } catch(error: any) {
      expect(error.message).toBe('Fake error')
    }
  })

  test('#GetLastMatch (returns last match)', async () => {
    sendUserRequestMock.mockResolvedValueOnce({
      status: 'success',
      requestProperties: {
        route: testRoute,
      },
      data: {
        message: '',
        matches: [
          {
            utcStartSeconds: 20,
          },
          {
            utcStartSeconds: 30,
          },
          {
            utcStartSeconds: 10,
          },
        ] as unknown as Match[],
      },
    })

    const response = await codAPIHandler.GetLastMatch(testSSO, testUser)

    expect(response.utcStartSeconds).toBe(30)
  })
})
