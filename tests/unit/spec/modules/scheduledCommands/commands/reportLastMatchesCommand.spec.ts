import { UserReportsDoc } from '../../../../../../src/models/types/UserReportsDoc'
import { CodAPIHandler } from '../../../../../../src/modules/codAPIHandler/CodAPIHandler'
import { dbHandler } from '../../../../../../src/modules/dbHandler/dbHandler'
import { reportLastMatchesCommand } from '../../../../../../src/modules/scheduledCommands/commands/reportLastMatchesCommand'
import { ScheduledReportDone } from '../../../../../../src/modules/scheduledCommands/messages'
import { ScheduledCommandRequest } from '../../../../../../src/modules/scheduledCommands/types/ScheduledCommandRequest'
import { telegramHandler } from '../../../../../../src/modules/telegramHandler/telegramHandler'

jest.mock('../../../../../../src/modules/telegramHandler/telegramHandler', () => {
  return {
    telegramHandler: {
      send: jest.fn(),
    },
  }
})

jest.mock('../../../../../../src/modules/configReader/configReader', () => {
  return {
    configReader: {
      getConfig: jest.fn().mockReturnValue({
        maxReportsPerUser: '4',
      }),
    },
  }
})

jest.mock('../../../../../../src/modules/codAPIHandler/CodAPIHandler')

jest.mock('../../../../../../src/modules/formatters/telegramFormatter')

jest.mock('../../../../../../src/modules/dbHandler/dbHandler', () => {
  return {
    dbHandler: {
      updateReports: jest.fn(),
    },
  }
})

function getCommandRequest(reports: UserReportsDoc[], postMatch: boolean): ScheduledCommandRequest {
  return {
    command: '/FakeCommand',
    ssoToken: 'FakeSSOToken',
    userReports: reports,
    postMatchReports: postMatch,
    sessionReports: false,
  }
}

describe('reportLastMatchesCommand', () => {
  const testArgs = [ '', '', '' ]
  const testSSO = { ssoToken: 'FakeSSO' }
  const fakeStoredReport = {
    user: 'FakeUser',
    lastMatch: 'FakeMatchId',
    channels: [ 9 ],
    lastMatchStartTimestamp: 0,
  } as unknown as UserReportsDoc

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('#validate (returns ok)', async () => {
    const response = reportLastMatchesCommand.argsValidation([])

    expect(response).toBe('ok')
  })

  test('#handler (no available reports)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    const commandRequest = getCommandRequest([], true)

    const response = await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(telegramHandler.send).toBeCalledTimes(0)
    expect(response).toStrictEqual({
      response: ScheduledReportDone,
      success: true,
    })
  })

  test('#handler (cannot get last matches)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    const commandRequest = getCommandRequest([fakeStoredReport], true)
    CodAPIHandler.prototype.getLastMatchesIdFrom = jest.fn().mockResolvedValueOnce(undefined)

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(CodAPIHandler.prototype.getMatchInfo).toBeCalledTimes(0)
  })

  test('#handler (match already reported)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    const commandRequest = getCommandRequest([fakeStoredReport], true)
    CodAPIHandler.prototype.getLastMatchesIdFrom = jest.fn().mockResolvedValueOnce([])

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(telegramHandler.send).toBeCalledTimes(0)
    expect(dbHandler.updateReports).toBeCalledTimes(0)
    expect(CodAPIHandler.prototype.getMatchInfo).toBeCalledTimes(0)
  })

  test('#handler (match not reported yet)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    const commandRequest = getCommandRequest([fakeStoredReport], true)
    CodAPIHandler.prototype.getLastMatchesIdFrom = jest.fn().mockResolvedValueOnce(['OldMatchId'])
    CodAPIHandler.prototype.getMatchInfo = jest.fn().mockResolvedValueOnce([{
      utcStartSeconds: 0,
      matchID: 'OldMatchId',
    }])

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(CodAPIHandler.prototype.getMatchInfo).toBeCalledTimes(1)
    expect(dbHandler.updateReports).toBeCalledTimes(1)
    expect(telegramHandler.send).toBeCalledTimes(1)
  })

  test('#handler (process reports for several users)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    const commandRequest = getCommandRequest([
      fakeStoredReport,
      fakeStoredReport,
      fakeStoredReport,
    ], true)
    CodAPIHandler.prototype.getLastMatchesIdFrom = jest.fn().mockResolvedValue(['OldMatchId'])
    CodAPIHandler.prototype.getMatchInfo = jest.fn().mockResolvedValue([{
      utcStartSeconds: 0,
      matchID: 'OldMatchId',
    }])

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(CodAPIHandler.prototype.getMatchInfo).toBeCalledTimes(3)
    expect(dbHandler.updateReports).toBeCalledTimes(3)
    expect(telegramHandler.send).toBeCalledTimes(3)
  })

  test('#handler (match is reported for several channels)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    const commandRequest = getCommandRequest([{
      ... fakeStoredReport,
      channels: [ 1, 2, 3, 4, 5 ],
    }] as unknown as UserReportsDoc[], true)
    CodAPIHandler.prototype.getLastMatchesIdFrom = jest.fn().mockResolvedValueOnce(['OldMatchId'])
    CodAPIHandler.prototype.getMatchInfo = jest.fn().mockResolvedValueOnce([{
      utcStartSeconds: 0,
      matchID: 'OldMatchId',
    }])

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(CodAPIHandler.prototype.getMatchInfo).toBeCalledTimes(1)
    expect(dbHandler.updateReports).toBeCalledTimes(1)
    expect(telegramHandler.send).toBeCalledTimes(5)
  })

  test('#handler (no matches found for the user)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    const commandRequest = getCommandRequest([{
      ... fakeStoredReport,
      channels: [ 1, 2, 3, 4, 5 ],
    }] as unknown as UserReportsDoc[], true)
    CodAPIHandler.prototype.getLastMatchesIdFrom = jest.fn().mockResolvedValueOnce([])
    CodAPIHandler.prototype.getMatchInfo = jest.fn().mockResolvedValueOnce([{
      utcStartSeconds: 0,
      matchID: 'OldMatchId',
    }])

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(CodAPIHandler.prototype.getMatchInfo).toBeCalledTimes(0)
    expect(dbHandler.updateReports).toBeCalledTimes(0)
    expect(telegramHandler.send).toBeCalledTimes(0)
  })

  test('#handler (could not get matches info)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    const commandRequest = getCommandRequest([{
      ... fakeStoredReport,
      channels: [ 1, 2, 3, 4, 5 ],
    }] as unknown as UserReportsDoc[], true)
    CodAPIHandler.prototype.getLastMatchesIdFrom = jest.fn().mockResolvedValueOnce(['OldMatchId'])
    CodAPIHandler.prototype.getMatchInfo = jest.fn().mockRejectedValueOnce([{
      utcStartSeconds: 0,
      matchID: 'OldMatchId',
    }])

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(CodAPIHandler.prototype.getMatchInfo).toBeCalledTimes(1)
    expect(dbHandler.updateReports).toBeCalledTimes(0)
    expect(telegramHandler.send).toBeCalledTimes(0)
  })
})
