import { CommandDispatcher } from '../commandDispatcher/CommandDispatcher'
import { updateSSOCommand } from './commands/updateSSOCommand'

const commandRegex = '^/([^ ]+)[ ]*([^ ]*)[ ]*([^ ]*)'

export class TelegramCommandDispatcher extends CommandDispatcher {
  constructor() {
    super(commandRegex, [
      updateSSOCommand,
    ])
  }
}
