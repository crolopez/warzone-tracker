import { CodAPIHandler } from '../../codAPIHandler/CodAPIHandler'
import { PlayerMatch } from '../../codAPIHandler/types/PlayerMatch'
import { Command } from '../../commandDispatcher/types/Command'
import { CommandRequest } from '../../commandDispatcher/types/CommandRequest'
import { CommandResponse } from '../../commandDispatcher/types/CommandResponse'
import { configReader } from '../../configReader/configReader'
import { dbHandler } from '../../dbHandler/dbHandler'
import { telegramFormatter } from '../../formatters/telegramFormatter'
import { telegramHandler } from '../../telegramHandler/telegramHandler'
import { ScheduledReportDone } from '../messages'
import { ScheduledCommandRequest } from '../types/ScheduledCommandRequest'

async function sendSessionReportViaTelegram(sessionMatches: PlayerMatch[], channels: number[]): Promise<void> {
  const formattedSessionReport = telegramFormatter.sessionReportFormatter(sessionMatches)
  const user = sessionMatches[0].player.username

  const messagesSent = Array.from(channels, async channel => {
    console.log(`Sending Telegram session report for ${user} in ${channel} channel`)
    await telegramHandler.send(channel, formattedSessionReport)
  })

  await Promise.allSettled(messagesSent)
}

const reportSession = async (commandRequest: CommandRequest, args: string[]): Promise<CommandResponse> => {
  const scheduledCommandRequest = commandRequest as ScheduledCommandRequest
  const codAPIHandler = new CodAPIHandler(scheduledCommandRequest.ssoToken)
  const timeBetweenSessions = configReader.getConfig().timeBetweenSessions

  const sessionReportsSentForAllUser = Array.from(scheduledCommandRequest.userReports, async report => {
    const sessionReported = report.sessionReported.valueOf() as boolean
    const user = report.user.valueOf() as string
    if (sessionReported) {
      console.log(`The last session of ${user} has already been reported.`)
      return
    }

    const endTimeLastMatch = report.lastMatchEndTimestamp.valueOf() as number
    const now = new Date().getTime()
    if (now - endTimeLastMatch < timeBetweenSessions) {
      console.log(`${user}'s session cannot be reported yet`)
      return
    }

    const sessionMatches = await codAPIHandler.getLastSessionMatches(user, timeBetweenSessions)
    if (sessionMatches == undefined || sessionMatches.length == 0) {
      console.error(`Could not get the session matches from ${user}`)
      return
    }

    if (scheduledCommandRequest.sessionReports) {
      const channels = report.channels.valueOf() as number[]
      await sendSessionReportViaTelegram(sessionMatches, channels)
    }

    await dbHandler.updateSessionReport(report.user.valueOf() as string)
  })

  await Promise.allSettled(sessionReportsSentForAllUser)

  return {
    response: ScheduledReportDone,
    success: true,
  }
}

function validate(args: string[]): string {
  return 'ok'
}

class ReportSessionCommand implements Command {
  command = 'ReportSession'
  handler = reportSession
  argsValidation = validate
}

const reportSessionCommand = new ReportSessionCommand()
export { reportSessionCommand }
