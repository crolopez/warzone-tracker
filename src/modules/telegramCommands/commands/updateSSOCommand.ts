import { CodAPIHandler } from '../../codAPIHandler/CodAPIHandler'
import { Command } from '../../commandDispatcher/types/Command'
import { CommandRequest } from '../../commandDispatcher/types/CommandRequest'
import { CommandResponse } from '../../commandDispatcher/types/CommandResponse'
import { configReader } from '../../configReader/configReader'
import { dbHandler } from '../../dbHandler/dbHandler'
import { telegramHandler } from '../../telegramHandler/telegramHandler'
import { InvalidSSOTokenUser, UserMustBeAdmin } from '../messages'
import { TelegramCommandRequest } from '../types/TelegramCommandRequest'
import { isAdmin } from '../utils'

const updateSSO = async (commandRequest: CommandRequest, args: string[]): Promise<CommandResponse> => {
  const ssoToken = args[2]
  const allowedUser = configReader.getConfig().acceptSSOFrom
  const request = commandRequest as TelegramCommandRequest

  if (configReader.getConfig().adminCommands
    && !(await isAdmin(request.from.userId, request.source.chatId))) {
    return {
      response: UserMustBeAdmin,
      success: false,
    }
  }
  const codAPIHandler = new CodAPIHandler(ssoToken)
  if (!await codAPIHandler.isValidSSO(allowedUser)) {
    return {
      response: InvalidSSOTokenUser,
      success: false,
    }
  }

  await dbHandler.updateCredentials(ssoToken)

  const response = await telegramHandler.send(request.source.chatId, 'SSO updated')

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
