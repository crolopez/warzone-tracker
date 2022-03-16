import { CommandDispatcher } from '../../../../../src/modules/commandDispatcher/CommandDispatcher'
import { updateSSOCommand } from '../../../../../src/modules/telegramCommands/commands/updateSSOCommand'
import { TelegramCommandDispatcher } from '../../../../../src/modules/telegramCommands/TelegramCommandDispatcher'

jest.mock('../../../../../src/modules/commandDispatcher/CommandDispatcher')
jest.mock('../../../../../src/modules/telegramCommands/commands/updateSSOCommand', () => {
  return {
    updateSSOCommand : jest.fn(),
  }
})

describe('TelegramCommandDispatcher', () => {
  const telegramCommandRegex = '^/([^ ]+)[ ]*([^ ]*)[ ]*([^ ]*)'
  const telegramCommands = [ updateSSOCommand ]

  test('Parent constructor is called using the expected commands', async () => {
    new TelegramCommandDispatcher()

    expect(CommandDispatcher).toHaveBeenCalledTimes(1)
    expect(CommandDispatcher).toBeCalledWith(telegramCommandRegex, telegramCommands)
  })
})