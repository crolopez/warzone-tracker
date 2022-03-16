import { updateSSOCommand } from '../../../../../../src/modules/telegramCommands/commands/updateSSOCommand'
import { telegramSender } from '../../../../../../src/modules/telegramSender/telegramSender'

jest.mock('../../../../../../src/modules/telegramSender/telegramSender', () => {
  return {
    telegramSender: {
      send: jest.fn().mockResolvedValue('Send response'),
    },
  }
})

describe('UpdateSSOCommand', () => {
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
  })

  test('#validate returns ok', async () => {
    const response = updateSSOCommand.argsValidation([])

    expect(response).toBe('ok')
  })

  test('#handler returns a successful response', async () => {
    const response = await updateSSOCommand.handler(telegramCommandRequest, [])

    expect(response).toStrictEqual({
      response: 'Send response',
      success: true,
    })
  })

  test('#handler calls TelegramSender', async () => {
    await updateSSOCommand.handler(telegramCommandRequest, [])

    expect(telegramSender.send).toBeCalledWith(98765, 'UpdateSSO dummy call')
  })
})