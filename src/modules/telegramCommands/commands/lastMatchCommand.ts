import { CodAPIHandler } from '../../codAPIHandler/CodAPIHandler'
import { Command } from '../../commandDispatcher/types/Command'
import { CommandRequest } from '../../commandDispatcher/types/CommandRequest'
import { CommandResponse } from '../../commandDispatcher/types/CommandResponse'
import { dbHandler } from '../../dbHandler/dbHandler'
import { telegramFormatter } from '../../formatters/telegramFormatter'
import { telegramHandler } from '../../telegramHandler/telegramHandler'
import { InvalidUser, MissingSSOToken } from '../messages'
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

  const codAPIHandler = new CodAPIHandler(sso.ssoToken as unknown as string)
  const lastMatchId = await codAPIHandler.getLastMatchesIdFrom(user)
  if (lastMatchId == undefined) {
    return {
      response: InvalidUser,
      success: false,
    }
  }

  const matchInfo = await codAPIHandler.getMatchInfo(user, lastMatchId[0])
  const formattedMatchReport = telegramFormatter.matchReportFormatter(matchInfo, user)

  const request = commandRequest as TelegramCommandRequest
  const response = await telegramHandler.send(request.source.chatId, formattedMatchReport)

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
