import { telegramHandler } from '../../../../../../src/modules/telegramHandler/telegramHandler'
import { versionCommand } from '../../../../../../src/modules/telegramCommands/commands/versionCommand'

jest.mock('../../../../../../src/modules/telegramHandler/telegramHandler', () => {
  return {
    telegramHandler: {
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

  test('#handler calls telegramHandler', async () => {
    await versionCommand.handler(telegramCommandRequest, [])

    expect(telegramHandler.send).toBeCalledWith(98765, '*Version:* DummyVersion')
  })
})