import { codAPIHandler } from '../../codAPIHandler/codAPIHandler'
import { PlayerMatch } from '../../codAPIHandler/types/PlayerMatch'
import { Command } from '../../commandDispatcher/types/Command'
import { CommandRequest } from '../../commandDispatcher/types/CommandRequest'
import { CommandResponse } from '../../commandDispatcher/types/CommandResponse'
import { dbHandler } from '../../dbHandler/dbHandler'
import { telegramFormatter } from '../../formatters/telegramFormatter'
import { telegramSender } from '../../telegramSender/telegramSender'
import { MissingSSOToken, ScheduledReportDone } from '../messages'

async function sendReportsViaTelegram(matchInfo: PlayerMatch[], user: string, channels: number[]): Promise<void> {
  const formattedMatchReport = telegramFormatter.matchReportFormatter(matchInfo, user)
  const matchId = matchInfo[0].matchID

  channels.forEach(async channel => {
    console.log(`Sending Telegram report for ${user} for ${matchId} match`)
    await telegramSender.send(channel, formattedMatchReport)
  })
}

const reportLastMatches = async (commandRequest: CommandRequest, args: string[]): Promise<CommandResponse> => {
  const sso = await dbHandler.getCredentials()
  if (sso === undefined) {
    return {
      response: MissingSSOToken,
      success: false,
    }
  }

  const ssoToken = sso.ssoToken as unknown as string
  const reports = await dbHandler.getReports()
  const promises = Array.from(reports, async report => {
    const user = report.user.valueOf() as string
    const lastReportedMatchId = report.lastMatch.valueOf() as string
    const lastMatchId = await codAPIHandler.getLastMatchId(ssoToken, user)

    if (lastReportedMatchId == lastMatchId) {
      console.log(`Match ${lastMatchId} already reported for ${user}`)
      return
    }

    const matchInfo = await codAPIHandler.getMatchInfo(ssoToken, user, lastMatchId)
    const lastMatchTimestamp = matchInfo[0].utcStartSeconds
    await dbHandler.updateReports(report, lastMatchId, lastMatchTimestamp)

    const channels = report.channels.valueOf() as number[]
    await sendReportsViaTelegram(matchInfo, user, channels)
  })

  await Promise.allSettled(promises)

  return {
    response: ScheduledReportDone,
    success: true,
  }
}

function validate(args: string[]): string {
  return 'ok'
}

class ReportLastMatchesCommand implements Command {
  command = 'ReportLastMatches'
  handler = reportLastMatches
  argsValidation = validate
}

const reportLastMatchesCommand = new ReportLastMatchesCommand()
export { reportLastMatchesCommand }
