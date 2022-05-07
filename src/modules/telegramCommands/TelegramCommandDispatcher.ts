import { CommandDispatcher } from '../commandDispatcher/CommandDispatcher'
import { CommandRequest } from '../commandDispatcher/types/CommandRequest'
import { CommandResponse } from '../commandDispatcher/types/CommandResponse'
import { telegramSender } from '../telegramSender/telegramSender'
import { lastMatchCommand } from './commands/lastMatchCommand'
import { registerUserReportsCommand } from './commands/registerUserReportsCommand'
import { updateSSOCommand } from './commands/updateSSOCommand'
import { versionCommand } from './commands/versionCommand'
import { TelegramCommandRequest } from './types/TelegramCommandRequest'

const commandRegex = '^/([^ ]+)[ ]*([^ ]*)[ ]*([^ ]*)'

export class TelegramCommandDispatcher extends CommandDispatcher {
  constructor() {
    super(commandRegex, [
      updateSSOCommand,
      versionCommand,
      lastMatchCommand,
      registerUserReportsCommand,
    ])
  }

  async dispatch(commandRequest: CommandRequest): Promise<CommandResponse> {
    const result = await super.dispatch(commandRequest)

    if (result.success == false) {
      const request = commandRequest as TelegramCommandRequest
      await telegramSender.send(request.source.chatId, result.response)
    }

    return result
  }
}
