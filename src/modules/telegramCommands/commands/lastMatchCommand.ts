import { codAPIHandler } from '../../codAPIHandler/codAPIHandler'
import { Command } from '../../commandDispatcher/types/Command'
import { CommandRequest } from '../../commandDispatcher/types/CommandRequest'
import { CommandResponse } from '../../commandDispatcher/types/CommandResponse'
import { dbHandler } from '../../dbHandler/dbHandler'
import { telegramFormatter } from '../../formatters/telegramFormatter'
import { telegramSender } from '../../telegramSender/telegramSender'
import { MissingSSOToken } from '../messages'
import { TelegramCommandRequest } from '../types/TelegramCommandRequest'

const lastMatch = async (commandRequest: CommandRequest, args: string[]): Promise<CommandResponse> => {
  const user = args[2]

  const sso = await dbHandler.getCredentials()
  if (sso === undefined) {
    return {
      response: MissingSSOToken,
      success: false,
    }
  }

  const ssoToken = sso.ssoToken as unknown as string
  const match = await codAPIHandler.GetLastMatch(ssoToken, user)
  const formattedMatch = telegramFormatter.matchFormatter(match)

  const request = commandRequest as TelegramCommandRequest
  const response = await telegramSender.send(request.source.chatId, formattedMatch)

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

class LastMatchCommand implements Command {
  command = 'LastMatch'
  handler = lastMatch
  argsValidation = validate
}

const lastMatchCommand = new LastMatchCommand()
export { lastMatchCommand }
