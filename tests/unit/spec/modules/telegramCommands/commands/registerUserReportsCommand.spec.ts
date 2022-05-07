import { CodAPIHandler } from '../../../../../../src/modules/codAPIHandler/CodAPIHandler'
import { dbHandler } from '../../../../../../src/modules/dbHandler/dbHandler'
import { registerUserReportsCommand } from '../../../../../../src/modules/telegramCommands/commands/registerUserReportsCommand'
import { InvalidUser, MissingSSOToken, UserRegisteredForChannel } from '../../../../../../src/modules/telegramCommands/messages'

jest.mock('../../../../../../src/modules/dbHandler/dbHandler')

jest.mock('../../../../../../src/modules/telegramSender/telegramSender', () => {
  return {
    telegramSender: {
      send: jest.fn().mockResolvedValue('Send response'),
    },
  }
})

jest.mock('../../../../../../package.json', () => {
  return {
    version: 'DummyVersion',
  }
})

describe('registerUserReportsCommand', () => {
  const telegramCommandRequest = {
    command: '/FakeCommand',
    source: {
      chatId: 98765,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('#validate (returns ok)', async () => {
    const response = registerUserReportsCommand.argsValidation([
      '/RegisterUserReports FakeUser',
      'RegisterUserReports',
      'FakeUser',
    ])

    expect(response).toBe('ok')
  })

  test('#validate (validation fails)', async () => {
    const response = registerUserReportsCommand.argsValidation(
      [ '/RegisterUserReports', 'RegisterUserReports', '' ])

    expect(response).toBe('/RegisterUserReports <User>')
  })

  test('#handler (user registered)', async () => {
    dbHandler.isUserRegistered = jest.fn().mockResolvedValueOnce(true)

    const response = await registerUserReportsCommand.handler(
      telegramCommandRequest, [ '', '', 'FakeUser' ])

    expect(response).toStrictEqual({
      response: UserRegisteredForChannel,
      success: false,
    })
  })

  test('#handler (missing SSO)', async () => {
    dbHandler.isUserRegistered = jest.fn().mockResolvedValueOnce(false)
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(undefined)

    const response = await registerUserReportsCommand.handler(
      telegramCommandRequest, [ '', '', 'FakeUser' ])

    expect(response).toStrictEqual({
      response: MissingSSOToken,
      success: false,
    })
  })

  test('#handler (invalid user)', async () => {
    dbHandler.isUserRegistered = jest.fn().mockResolvedValueOnce(false)
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce('FakeSSO')
    CodAPIHandler.prototype.getUserSummary = jest.fn().mockResolvedValueOnce({
      status: 'error',
    })

    const response = await registerUserReportsCommand.handler(
      telegramCommandRequest, [ '', '', 'FakeUser' ])

    expect(response).toStrictEqual({
      response: InvalidUser,
      success: false,
    })
  })

  test('#handler', async () => {
    dbHandler.isUserRegistered = jest.fn().mockResolvedValueOnce(false)
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce('FakeSSO')
    CodAPIHandler.prototype.getUserSummary = jest.fn().mockResolvedValueOnce({
      status: 'success',
      data: {
        username: 'FakeUser',
      },
    })

    const response = await registerUserReportsCommand.handler(
      telegramCommandRequest, [ '', '', 'FakeUser' ])

    expect(response).toStrictEqual({
      response: 'Send response',
      success: true,
    })
  })
})
