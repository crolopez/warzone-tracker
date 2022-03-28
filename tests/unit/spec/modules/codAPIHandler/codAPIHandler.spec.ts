import axios from 'axios'
import { codAPIHandler } from '../../../../../src/modules/codAPIHandler/codAPIHandler'

jest.mock('axios')

describe('codAPIHandler', () => {
  const testUser = 'FakeUser'
  const testSSO = 'FakeSSO'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('#IsValidSSO (request failed)', async () => {
    axios.post = jest.fn().mockResolvedValue(
      {
        data: {
          status: 'Failed',
          data: {
            message: 'Invalid request',
          },
        },
      })

    try {
      await codAPIHandler.IsValidSSO(testUser, testSSO)

      expect(1).toBe(0)
    } catch (error: any) {
      expect(error.message).toBe('Invalid request')
    }
  })

  test('#IsValidSSO (user is not allowed)', async () => {
    axios.post = jest.fn().mockResolvedValue(
      {
        data: {
          status: 'success',
          data: {
            titleIdentities: [],
          },
        },
      })

    const response = await codAPIHandler.IsValidSSO(testUser, testSSO)

    expect(response).toBe(false)
  })

  test('#IsValidSSO (user is allowed)', async () => {
    axios.post = jest.fn().mockResolvedValue(
      {
        data: {
          status: 'success',
          data: {
            titleIdentities: [ { username: 'FakeUser' } ],
          },
        },
      })

    const response = await codAPIHandler.IsValidSSO(testUser, testSSO)

    expect(response).toBe(true)
  })
})
