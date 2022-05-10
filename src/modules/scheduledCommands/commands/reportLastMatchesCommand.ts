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

async function sendReportsViaTelegram(matchInfo: PlayerMatch[], user: string, channels: number[]): Promise<void> {
  const formattedMatchReport = telegramFormatter.matchReportFormatter(matchInfo, user)
  const matchId = matchInfo[0].matchID

  const messagesSent = Array.from(channels, async channel => {
    console.log(`Sending Telegram report for ${user} for ${matchId} match in ${channel} channel`)
    await telegramHandler.send(channel, formattedMatchReport)
  })

  await Promise.allSettled(messagesSent)
}

function getPromiseValue(promise: PromiseSettledResult<PlayerMatch[] | undefined>): PlayerMatch[] | undefined {
  return promise.status === 'fulfilled' ? promise.value : undefined
}

const reportLastMatches = async (commandRequest: CommandRequest, args: string[]): Promise<CommandResponse> => {
  const scheduledCommandRequest = commandRequest as ScheduledCommandRequest
  const codAPIHandler = new CodAPIHandler(scheduledCommandRequest.ssoToken)
  const maxReportsPerUser = configReader.getConfig().maxReportsPerUser

  const reportsSentForAllUser = Array.from(scheduledCommandRequest.userReports, async report => {
    const user = report.user.valueOf() as string
    const channels = report.channels.valueOf() as number[]
    const lastReportedTimestamp = report.lastMatchStartTimestamp.valueOf() as number

    const lastMatches = await codAPIHandler.getLastMatchesIdFrom(user, lastReportedTimestamp)
    if (lastMatches == undefined) {
      console.error(`Could not get the last matches from ${user}`)
      return
    }

    if (lastMatches.length === 0) {
      console.log(`There are no pending matches to report for ${user}`)
      return
    }

    const playerMatchesInfo = Array.from(lastMatches.slice(0, maxReportsPerUser), async matchId => {
      return await codAPIHandler.getMatchInfo(user, matchId)
    })

    await Promise.allSettled(playerMatchesInfo)
      .then(async promisedMatches => {
        for (const promisedMatch of promisedMatches.reverse()) {
          const matchValue = getPromiseValue(promisedMatch)
          if (matchValue === undefined) {
            return
          }

          if (scheduledCommandRequest.postMatchReports) {
            await sendReportsViaTelegram(matchValue, user, channels)
          }

          const matchId = matchValue[0].matchID
          if (matchId == lastMatches[0]) {
            const start = matchValue[0].utcStartSeconds
            const end = matchValue[0].utcEndSeconds
            await dbHandler.updateReports(report, matchId, start, end)
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
