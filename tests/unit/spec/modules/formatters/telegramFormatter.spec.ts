import { PlayerMatch } from '../../../../../src/modules/codAPIHandler/types/PlayerMatch'
import { telegramFormatter } from '../../../../../src/modules/formatters/telegramFormatter'

describe('telegramFormatter', () => {
  const testUser = 'FakeUserName'
  const testPlayerMatch = {
    matchID: 'FakeMatchId',
    mode: 'FakeMode',
    player: {
      team: 'seven',
      username: 'FakeUserName',
    },
    playerStats: {
      kdRatio: 5.987654321,
      kills: 33,
      teamPlacement: 6,
    },
    utcStartSeconds: 1648740394,
  } as unknown as PlayerMatch
  const testSecondPlayerMatch = {
    player: {
      team: 'seven',
      username: 'FakeSecondName',
    },
    playerStats: {
      kdRatio: 0.72,
      kills: 16,
      teamPlacement: 6,
    },
  } as unknown as PlayerMatch

  test('#matchFormatter', async () => {
    const matchFormatted = telegramFormatter.matchReportFormatter([
      testPlayerMatch,
      testSecondPlayerMatch,
    ], testUser)

    expect(matchFormatted).toBe(
      '*//////////// Match ////////////*\n' +
      '(Thu, 31 Mar 2022 15:26:34 GMT)\n\n' +

      '*Mode:* FakeMode\n' +
      '*Position:* 6\n' +
      '*Lobby K/D:* ???\n\n' +

      '*FakeUserName* | *K:* 33 | *K/D:* 5.99\n'+
      '*FakeSecondName* | *K:* 16 | *K/D:* 0.72\n'
    )
  })
})
