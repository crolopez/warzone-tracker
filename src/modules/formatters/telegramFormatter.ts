import { PlayerMatch } from '../codAPIHandler/types/PlayerMatch'
import { gameModeDic } from './types/gameModeDic'
import moment from 'moment'

function getGameMode(rawMode: string): string {
  const mode = gameModeDic.get(rawMode)

  return mode ?? rawMode.replace(/_/g, '\\_')
}

function getDate(epoch: number): string {
  return moment.utc(epoch).format('MMM Do YYYY, HH:mm:ss')
}

function getDateRange(epochFrom: number, epochTo: number): string {
  return `${getDate(epochFrom)}\n\
↓\n\
${getDate(epochTo)}`
}

class TelegramFormatter {
  matchReportFormatter(players: PlayerMatch[], user: string): string  {
    const mainPlayer = user.split('#')[0]
    const mainPlayerInfo = players.filter(x => x.player.username == mainPlayer)[0]
    const teamPlayersInfo = players.filter(x => x.player.team == mainPlayerInfo.player.team)

    let playersReport = ''
    teamPlayersInfo.forEach(player => {
      playersReport += `*${player.player.username}* | *K:* ${player.playerStats.kills} | *K/D:* ${Number(player.playerStats.kdRatio).toFixed(2)}\n`
    })

    return `*//////////// Match ////////////*\n\
${getDate(mainPlayerInfo.utcStartSeconds * 1000)}\n\n\
*Mode:* ${getGameMode(mainPlayerInfo.mode)}\n\
*Position:* ${mainPlayerInfo.playerStats.teamPlacement}\n\n\
${playersReport}`
  }

  sessionReportFormatter(sessionMatches: PlayerMatch[]): string  {
    let kdSum = 0
    let killSum = 0
    let assistSum = 0
    let winSum = 0
    let percentTimeMovingSum = 0
    let matchesWithGulag = 0
    let kdGulagSum = 0

    sessionMatches.forEach(x => {
      kdSum += x.playerStats.kdRatio
      killSum += x.playerStats.kills
      assistSum += x.playerStats.assists
      winSum += x.playerStats.teamPlacement == 1 ? 1 : 0
      percentTimeMovingSum += x.playerStats.percentTimeMoving
      if (x.playerStats.gulagKills > 0 || x.playerStats.gulagDeaths > 0) {
        matchesWithGulag++
        kdGulagSum += x.playerStats.gulagDeaths == 0
          ? x.playerStats.gulagKills
          : x.playerStats.gulagKills / x.playerStats.gulagDeaths
      }
    })

    const to = sessionMatches[0].utcEndSeconds * 1000
    const from = sessionMatches[sessionMatches.length - 1].utcStartSeconds * 1000
    const user = sessionMatches[0].player.username
    const kd = Number(kdSum / sessionMatches.length).toFixed(2)
    const kdGulag = Number(kdGulagSum / matchesWithGulag).toFixed(2)
    const percentTimeMoving = Number(percentTimeMovingSum / sessionMatches.length).toFixed(2)

    return `*//////////// ${user}'s session stats ////////////*\n\
${getDateRange(from, to)}\n\n\
*Wins:* ${winSum}\n\
*Session KD:* ${kd}\n\
${matchesWithGulag > 0 ? `*Session KD in Gulag:* ${kdGulag}\n` : ''}\
*Kills:* ${killSum}\n\
*Assists:* ${assistSum}\n\
*Time moving:* ${percentTimeMoving}%\n\
*Matches:* ${sessionMatches.length}\n`
  }
}

const telegramFormatter = new TelegramFormatter()
export { telegramFormatter }
