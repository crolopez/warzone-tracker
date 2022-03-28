import { Command } from '../../commandDispatcher/types/Command'
import { CommandRequest } from '../../commandDispatcher/types/CommandRequest'
import { CommandResponse } from '../../commandDispatcher/types/CommandResponse'
import { telegramSender } from '../../telegramSender/telegramSender'
import { TelegramCommandRequest } from '../types/TelegramCommandRequest'
import { version } from '../../../../package.json'

const getVersion = async (commandRequest: CommandRequest, args: string[]): Promise<CommandResponse> => {
  const packageVersion = `*Version:* ${version}`
  const request = commandRequest as TelegramCommandRequest
  const response = await telegramSender.send(request.source.chatId, packageVersion)

  return {
    response: response,
    success: true,
  }
}

function validate(args: string[]): string {
  return 'ok'
}

class VersionCommand implements Command {
  command = 'Version'
  handler = getVersion
  argsValidation = validate
}

const versionCommand = new VersionCommand()
export { versionCommand }
