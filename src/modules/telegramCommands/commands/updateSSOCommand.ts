import { codAPIHandler } from '../../codAPIHandler/codAPIHandler'
import { Command } from '../../commandDispatcher/types/Command'
import { CommandRequest } from '../../commandDispatcher/types/CommandRequest'
import { CommandResponse } from '../../commandDispatcher/types/CommandResponse'
import { configReader } from '../../configReader/configReader'
import { dbHandler } from '../../dbHandler/dbHandler'
import { telegramSender } from '../../telegramSender/telegramSender'
import { InvalidSSOTokenUser } from '../messages'
import { TelegramCommandRequest } from '../types/TelegramCommandRequest'

const updateSSO = async (commandRequest: CommandRequest, args: string[]): Promise<CommandResponse> => {
  const ssoToken = args[2]
  const allowedUser = configReader.getConfig().acceptSSOFrom

  if (!await codAPIHandler.IsValidSSO(allowedUser, ssoToken)) {
    return {
      response: InvalidSSOTokenUser,
      success: false,
    }
  }

  await dbHandler.updateCredentials(ssoToken)

  const request = commandRequest as TelegramCommandRequest
  const response = await telegramSender.send(request.source.chatId, 'SSO updated')

  return {
    response: response,
    success: true,
  }
}

function validate(args: string[]): string {
  return args[2] === ''
    ? `/${args[1]} <SSO>`
    : 'ok'
}

class UpdateSSOCommand implements Command {
  command = 'UpdateSSO'
  handler = updateSSO
  argsValidation = validate
}

const updateSSOCommand = new UpdateSSOCommand()
export { updateSSOCommand }
