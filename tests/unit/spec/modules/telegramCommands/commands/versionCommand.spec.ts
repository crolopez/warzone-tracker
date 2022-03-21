import { telegramSender } from '../../../../../../src/modules/telegramSender/telegramSender'
import { versionCommand } from '../../../../../../src/modules/telegramCommands/commands/versionCommand'

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

describe('versionCommand', () => {
  const telegramCommandRequest = {
    command: '/FakeCommand',
    source: {
      chatId: 98765,
      firstName: 'User',
      type: 'private',
      username: 'UserName',
    },
  }

  test('#validate returns ok', async () => {
    const response = versionCommand.argsValidation([])

    expect(response).toBe('ok')
  })

  test('#handler returns a successful response', async () => {
    const response = await versionCommand.handler(telegramCommandRequest, [])

    expect(response).toStrictEqual({
      response: 'Send response',
      success: true,
    })
  })

  test('#handler calls TelegramSender', async () => {
    await versionCommand.handler(telegramCommandRequest, [])

    expect(telegramSender.send).toBeCalledWith(98765, '*Version:* DummyVersion')
  })
})