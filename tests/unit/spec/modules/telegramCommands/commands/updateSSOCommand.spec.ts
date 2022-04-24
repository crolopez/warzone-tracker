import { codAPIHandler } from '../../../../../../src/modules/codAPIHandler/codAPIHandler'
import { updateSSOCommand } from '../../../../../../src/modules/telegramCommands/commands/updateSSOCommand'
import { InvalidSSOTokenUser } from '../../../../../../src/modules/telegramCommands/messages'
import { telegramSender } from '../../../../../../src/modules/telegramSender/telegramSender'

jest.mock('../../../../../../src/modules/telegramSender/telegramSender', () => {
  return {
    telegramSender: {
      send: jest.fn().mockResolvedValue('Send response'),
    },
  }
})

jest.mock('../../../../../../src/modules/codAPIHandler/codAPIHandler')

jest.mock('../../../../../../src/modules/dbHandler/dbHandler', () => {
  return {
    dbHandler: {
      updateCredentials: jest.fn(),
    },
  }
})

jest.mock('../../../../../../src/modules/configReader/configReader', () => {
  return {
    configReader: {
      getConfig: jest.fn().mockReturnValue({}),
    },
  }
})

describe('updateSSOCommand', () => {
  const telegramCommandRequest = {
    command: '/FakeCommand',
    source: {
      chatId: 98765,
      firstName: 'User',
      type: 'private',
      username: 'UserName',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    codAPIHandler.IsValidSSO = jest.fn().mockResolvedValue(true)
  })

  test('#validate (returns ok)', async () => {
    const response = updateSSOCommand.argsValidation([
      '/UpdateSSO FakeSSO',
      'UpdateSSO',
      'FakeSSO',
    ])

    expect(response).toBe('ok')
  })

  test('#validate (validation fails)', async () => {
    const response = updateSSOCommand.argsValidation([
      '/UpdateSSO FakeSSO',
      'UpdateSSO',
      '',
    ])

    expect(response).toBe('/UpdateSSO <SSO>')
  })

  test('#handler (returns a successful response)', async () => {
    const response = await updateSSOCommand.handler(telegramCommandRequest, [])

    expect(response).toStrictEqual({
      response: 'Send response',
      success: true,
    })
  })

  test('#handler (calls TelegramSender)', async () => {
    await updateSSOCommand.handler(telegramCommandRequest, [])

    expect(telegramSender.send).toBeCalledWith(98765, 'SSO updated')
  })

  test('#handler (invalid SSO)', async () => {
    codAPIHandler.IsValidSSO = jest.fn().mockResolvedValue(false)

    const response = await updateSSOCommand.handler(telegramCommandRequest, [])

    expect(response).toStrictEqual({
      response: InvalidSSOTokenUser,
      success: false,
    })
  })
})
