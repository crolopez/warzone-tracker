import { Command } from '../../commandDispatcher/types/Command'
import { CommandRequest } from '../../commandDispatcher/types/CommandRequest'
import { CommandResponse } from '../../commandDispatcher/types/CommandResponse'
import { telegramSender } from '../../telegramSender/telegramSender'
import { TelegramCommandRequest } from '../types/TelegramCommandRequest'

const updateSSO = async (commandRequest: CommandRequest, args?: string[]): Promise<CommandResponse> => {
  const request = commandRequest as TelegramCommandRequest
  const response = await telegramSender.send(request.source.chatId, 'UpdateSSO dummy call')

  return {
    response: response,
    success: true,
  }
}

function validate(args: string[]): string {
  return 'ok'
}

class UpdateSSOCommand implements Command {
  command = 'UpdateSSO'
  handler = updateSSO
  argsValidation = validate
}

const updateSSOCommand = new UpdateSSOCommand()
export { updateSSOCommand }
