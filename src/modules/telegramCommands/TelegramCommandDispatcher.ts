import { CommandDispatcher } from '../commandDispatcher/CommandDispatcher'
import { lastMatchCommand } from './commands/lastMatchCommand'
import { updateSSOCommand } from './commands/updateSSOCommand'
import { versionCommand } from './commands/versionCommand'

const commandRegex = '^/([^ ]+)[ ]*([^ ]*)[ ]*([^ ]*)'

export class TelegramCommandDispatcher extends CommandDispatcher {
  constructor() {
    super(commandRegex, [
      updateSSOCommand,
      versionCommand,
      lastMatchCommand,
    ])
  }
}
