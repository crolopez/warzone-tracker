import { CommandDispatcher } from '../commandDispatcher/CommandDispatcher'
import { reportLastMatchesCommand } from './commands/reportLastMatchesCommand'

const commandRegex = '^/([^ ]+)'

export class ScheduledCommandDispatcher extends CommandDispatcher {
  constructor() {
    super(commandRegex, [
      reportLastMatchesCommand,
    ])
  }
}
