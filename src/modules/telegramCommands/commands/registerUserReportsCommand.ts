import { codAPIHandler } from '../../codAPIHandler/codAPIHandler'
import { Command } from '../../commandDispatcher/types/Command'
import { CommandRequest } from '../../commandDispatcher/types/CommandRequest'
import { CommandResponse } from '../../commandDispatcher/types/CommandResponse'
import { dbHandler } from '../../dbHandler/dbHandler'
import { telegramSender } from '../../telegramSender/telegramSender'
import { InvalidUser, MissingSSOToken, UserRegisteredForChannel } from '../messages'
import { TelegramCommandRequest } from '../types/TelegramCommandRequest'

const register = async (commandRequest: CommandRequest, args: string[]): Promise<CommandResponse> => {
  const user = args[2]
  const request = commandRequest as TelegramCommandRequest

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

  const ssoToken = sso.ssoToken as unknown as string
  const userSummary = await codAPIHandler.GetUserSummary(user, ssoToken)
  if (userSummary === undefined) {
    return {
      response: InvalidUser,
      success: false,
    }
  }

  const userToRegister = userSummary.data.username as string
  await dbHandler.registerUserReports(userToRegister, request.source.chatId)
  const response = await telegramSender.send(request.source.chatId, 'User registered')

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