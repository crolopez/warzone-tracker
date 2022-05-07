import { CodAPIHandler } from '../../codAPIHandler/CodAPIHandler'
import { Command } from '../../commandDispatcher/types/Command'
import { CommandRequest } from '../../commandDispatcher/types/CommandRequest'
import { CommandResponse } from '../../commandDispatcher/types/CommandResponse'
import { dbHandler } from '../../dbHandler/dbHandler'
import { telegramHandler } from '../../telegramHandler/telegramHandler'
import { InvalidUser, MissingSSOToken, UserMustBeAdmin, UserRegisteredForChannel } from '../messages'
import { TelegramCommandRequest } from '../types/TelegramCommandRequest'

const register = async (commandRequest: CommandRequest, args: string[]): Promise<CommandResponse> => {
  const user = args[2]
  const request = commandRequest as TelegramCommandRequest

  const chatAdmins = await telegramHandler.getChatAdministrators(request.source.chatId)
  if (chatAdmins.filter(x => x.id == request.from.userId).length == 0) {
    return {
      response: UserMustBeAdmin,
      success: false,
    }
  }

  if (await dbHandler.isUserRegistered(user, request.source.chatId)) {
    return {
      response: UserRegisteredForChannel,
      success: false,
    }
  }

  const sso = await dbHandler.getCredentials()
  if (sso === undefined) {
    return {
      response: MissingSSOToken,
      success: false,
    }
  }

  const codAPIHandler = new CodAPIHandler(sso.ssoToken as unknown as string)
  const userSummary = await codAPIHandler.getUserSummary(user)
  if (userSummary.status !== 'success') {
    return {
      response: InvalidUser,
      success: false,
    }
  }

  const userToRegister = userSummary.data.username as string
  await dbHandler.registerUserReports(userToRegister, request.source.chatId)
  const response = await telegramHandler.send(request.source.chatId, 'User registered')

  return {
    response: response,
    success: true,
  }
}

function validate(args: string[]): string {
  return args[2] === ''
    ? `/${args[1]} <User>`
    : 'ok'
}

class RegisterUserReportsCommand implements Command {
  command = 'RegisterUserReports'
  handler = register
  argsValidation = validate
}

const registerUserReportsCommand = new RegisterUserReportsCommand()
export { registerUserReportsCommand }
