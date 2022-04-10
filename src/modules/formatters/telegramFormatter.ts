import { Match } from '../codAPIHandler/types/Match'

class TelegramFormatter {
  matchFormatter(match: Match): string  {
    return '*//////////// Match ////////////*\n' +
      `(${new Date(match.utcStartSeconds * 1000).toUTCString()})\n\n` +
      `*Mode:* ${match.mode}\n` +
      `*Position:* ${match.playerStats.teamPlacement}\n` +
      '*Lobby K/D:* ???\n\n' +
      `*${match.player.username}* | *K:* ${match.playerStats.kills} | *K/D:* ${Number(match.playerStats.kdRatio).toFixed(2)}`
  }
}

const telegramFormatter = new TelegramFormatter()
export { telegramFormatter }
