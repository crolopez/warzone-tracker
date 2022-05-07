import { CommandDispatcher } from '../../../../../src/modules/commandDispatcher/CommandDispatcher'
import { CommandRequest } from '../../../../../src/modules/commandDispatcher/types/CommandRequest'
import { lastMatchCommand } from '../../../../../src/modules/telegramCommands/commands/lastMatchCommand'
import { registerUserReportsCommand } from '../../../../../src/modules/telegramCommands/commands/registerUserReportsCommand'
import { updateSSOCommand } from '../../../../../src/modules/telegramCommands/commands/updateSSOCommand'
import { versionCommand } from '../../../../../src/modules/telegramCommands/commands/versionCommand'
import { TelegramCommandDispatcher } from '../../../../../src/modules/telegramCommands/TelegramCommandDispatcher'
import { telegramSender } from '../../../../../src/modules/telegramSender/telegramSender'

jest.mock('../../../../../src/modules/commandDispatcher/CommandDispatcher')

jest.mock('../../../../../src/modules/telegramSender/telegramSender')

jest.mock('../../../../../src/modules/telegramCommands/commands/updateSSOCommand', () => {
  return {
    updateSSOCommand : jest.fn(),
  }
})

jest.mock('../../../../../src/modules/telegramCommands/commands/versionCommand', () => {
  return {
    versionCommand : jest.fn(),
  }
})

jest.mock('../../../../../src/modules/configReader/configReader', () => {
  return {
    configReader: {
      getConfig: jest.fn().mockReturnValue({
        telegramBotToken: 'DUMMYTOKEN',
      }),
    },
  }
})

describe('TelegramCommandDispatcher', () => {
  const telegramCommandRegex = '^/([^ ]+)[ ]*([^ ]*)[ ]*([^ ]*)'
  const telegramCommands = [
    updateSSOCommand,
    versionCommand,
    lastMatchCommand,
    registerUserReportsCommand,
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Parent constructor is called using the expected commands', async () => {
    new TelegramCommandDispatcher()

    expect(CommandDispatcher).toHaveBeenCalledTimes(1)
    expect(CommandDispatcher).toBeCalledWith(telegramCommandRegex, telegramCommands)
  })

  test('#dispatch (with error)', async () => {
    CommandDispatcher.prototype.dispatch = jest.fn().mockResolvedValueOnce({
      success: false,
      message: 'TestMessage',
    })

    const response = await new TelegramCommandDispatcher().dispatch({
      source: {
        chatId: 381,
      },
    } as unknown as CommandRequest)

    expect(telegramSender.send).toHaveBeenCalledTimes(1)
    expect(response).toStrictEqual({
      success: false,
      message: 'TestMessage',
    })
  })

  test('#dispatch (without error)', async () => {
    CommandDispatcher.prototype.dispatch = jest.fn().mockResolvedValueOnce({
      success: true,
      message: 'TestMessage',
    })

    const response = await new TelegramCommandDispatcher().dispatch({
      source: {
        chatId: 381,
      },
    } as unknown as CommandRequest)

    expect(telegramSender.send).toHaveBeenCalledTimes(0)
    expect(response).toStrictEqual({
      success: true,
      message: 'TestMessage',
    })
  })
})