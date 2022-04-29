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

  const messagesSent = Array.from(channels, async channel => {
    console.log(`Sending Telegram report for ${user} for ${matchId} match in ${channel} channel`)
    await telegramSender.send(channel, formattedMatchReport)
  })

  await Promise.allSettled(messagesSent)
}

function getPromiseValue(promise: PromiseSettledResult<PlayerMatch[]>): PlayerMatch[] | undefined {
  return promise.status === 'fulfilled' ? promise.value : undefined
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
  const reportsSentForAllUser = Array.from(reports, async report => {
    const user = report.user.valueOf() as string
    const channels = report.channels.valueOf() as number[]
    const lastReportedMatchId = report.lastMatch.valueOf() as string
    const lastMatches = await codAPIHandler.getLastMatchesIdFrom(ssoToken, user, lastReportedMatchId)

    if (lastMatches.length == 0) {
      console.log(`Match ${lastReportedMatchId} already reported for ${user}`)
      return
    }

    const playerMatchesInfo = Array.from(lastMatches.slice(0, 5), async matchId => {
      return await codAPIHandler.getMatchInfo(ssoToken, user, matchId)
    })

    await Promise.allSettled(playerMatchesInfo)
      .then(async promisedMatches => {
        for (const promisedMatch of promisedMatches.reverse()) {
          const matchValue = getPromiseValue(promisedMatch)
          if (matchValue === undefined) {
            return
          }

          await sendReportsViaTelegram(matchValue, user, channels)

          const matchId = matchValue[0].matchID
          if (matchId == lastMatches[0]) {
            const lastMatchTimestamp = matchValue[0].utcStartSeconds
            await dbHandler.updateReports(report, matchId, lastMatchTimestamp)
          }
        }
      })
  })

  await Promise.allSettled(reportsSentForAllUser)

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
