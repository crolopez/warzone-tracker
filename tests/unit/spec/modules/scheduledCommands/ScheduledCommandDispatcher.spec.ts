import { CommandDispatcher } from '../../../../../src/modules/commandDispatcher/CommandDispatcher'
import { ScheduledCommandDispatcher } from '../../../../../src/modules/scheduledCommands/ScheduledCommandDispatcher'
import { reportLastMatchesCommand } from '../../../../../src/modules/scheduledCommands/commands/reportLastMatchesCommand'

jest.mock('../../../../../src/modules/commandDispatcher/CommandDispatcher')

jest.mock('../../../../../src/modules/configReader/configReader', () => {
  return {
    configReader: {
      getConfig: jest.fn().mockReturnValue({
        telegramBotToken: 'DUMMYTOKEN',
      }),
    },
  }
})

describe('ScheduledCommandDispatcher', () => {
  const scheduledCommandRegex = '^/([^ ]+)'
  const scheduledCommands = [
    reportLastMatchesCommand,
  ]

  test('Parent constructor is called using the expected commands', async () => {
    new ScheduledCommandDispatcher()

    expect(CommandDispatcher).toHaveBeenCalledTimes(1)
    expect(CommandDispatcher).toBeCalledWith(scheduledCommandRegex, scheduledCommands)
  })
})