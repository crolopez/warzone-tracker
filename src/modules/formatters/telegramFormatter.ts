import { PlayerMatch } from '../codAPIHandler/types/PlayerMatch'
import { gameModeDic } from './types/gameModeDic'

function getGameMode(rawMode: string): string {
  const mode = gameModeDic.get(rawMode)

  return mode ?? rawMode.replace(/_/g, '\\_')
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
(${new Date(mainPlayerInfo.utcStartSeconds * 1000).toUTCString()})\n\n\
*Mode:* ${getGameMode(mainPlayerInfo.mode)}\n\
*Position:* ${mainPlayerInfo.playerStats.teamPlacement}\n\n\
${playersReport}`
  }
}

const telegramFormatter = new TelegramFormatter()
export { telegramFormatter }
