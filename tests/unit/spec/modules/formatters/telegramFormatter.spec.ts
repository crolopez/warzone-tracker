import { Match } from '../../../../../src/modules/codAPIHandler/types/Match'
import { telegramFormatter } from '../../../../../src/modules/formatters/telegramFormatter'

describe('telegramFormatter', () => {
  const testMatch = {
    matchID: 'FakeMatchId',
    mode: 'FakeMode',
    player: {
      username: 'FakeUserName',
    },
    playerStats: {
      kdRatio: 5.987654321,
      kills: 33,
      teamPlacement: 6,
    },
    utcStartSeconds: 1648740394,
  } as unknown as Match

  test('#matchFormatter', async () => {
    const matchFormatted = telegramFormatter.matchFormatter(testMatch)

    expect(matchFormatted).toBe(
      '*//////////// Match ////////////*\n' +
      '(1648740394)\n\n' +

      '*Mode:* FakeMode\n' +
      '*Position:* 6\n' +
      '*Lobby K/D:* ???\n\n' +

      '*FakeUserName* | *K:* 33 | *K/D:* 5.99'
    )
  })
})
