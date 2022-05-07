import { CodAPIHandler } from '../../../../../../src/modules/codAPIHandler/CodAPIHandler'
import { dbHandler } from '../../../../../../src/modules/dbHandler/dbHandler'
import { reportLastMatchesCommand } from '../../../../../../src/modules/scheduledCommands/commands/reportLastMatchesCommand'
import { MissingSSOToken, ScheduledReportDone } from '../../../../../../src/modules/scheduledCommands/messages'
import { telegramSender } from '../../../../../../src/modules/telegramSender/telegramSender'

jest.mock('../../../../../../src/modules/telegramSender/telegramSender', () => {
  return {
    telegramSender: {
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

describe('reportLastMatchesCommand', () => {
  const testArgs = [ '', '', '' ]
  const testSSO = { ssoToken: 'FakeSSO' }
  const commandRequest = {
    command: '/FakeCommand',
  }
  const fakeStoredReport = {
    user: 'FakeUser',
    lastMatch: 'FakeMatchId',
    channels: [ 9 ],
    lastMatchTimestamp: 789,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('#validate (returns ok)', async () => {
    const response = reportLastMatchesCommand.argsValidation([])

    expect(response).toBe('ok')
  })

  test('#handler (missing token)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(undefined)

    const response = await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(response).toStrictEqual({
      response: MissingSSOToken,
      success: false,
    })
  })

  test('#handler (no available reports)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    dbHandler.getReports = jest.fn().mockResolvedValueOnce([])

    const response = await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(telegramSender.send).toBeCalledTimes(0)
    expect(response).toStrictEqual({
      response: ScheduledReportDone,
      success: true,
    })
  })

  test('#handler (cannot get last matches)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    dbHandler.getReports = jest.fn().mockResolvedValueOnce([fakeStoredReport])
    CodAPIHandler.prototype.getLastMatchesIdFrom = jest.fn().mockResolvedValueOnce(undefined)

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(CodAPIHandler.prototype.getMatchInfo).toBeCalledTimes(0)
  })

  test('#handler (match already reported)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    dbHandler.getReports = jest.fn().mockResolvedValueOnce([fakeStoredReport])
    CodAPIHandler.prototype.getLastMatchesIdFrom = jest.fn().mockResolvedValueOnce([])

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(telegramSender.send).toBeCalledTimes(0)
    expect(dbHandler.updateReports).toBeCalledTimes(0)
    expect(CodAPIHandler.prototype.getMatchInfo).toBeCalledTimes(0)
  })

  test('#handler (match not reported yet)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    dbHandler.getReports = jest.fn().mockResolvedValueOnce([fakeStoredReport])
    CodAPIHandler.prototype.getLastMatchesIdFrom = jest.fn().mockResolvedValueOnce(['OldMatchId'])
    CodAPIHandler.prototype.getMatchInfo = jest.fn().mockResolvedValueOnce([{
      utcStartSeconds: 0,
      matchID: 'OldMatchId',
    }])

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(CodAPIHandler.prototype.getMatchInfo).toBeCalledTimes(1)
    expect(dbHandler.updateReports).toBeCalledTimes(1)
    expect(telegramSender.send).toBeCalledTimes(1)
  })

  test('#handler (process reports for several users)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    dbHandler.getReports = jest.fn().mockResolvedValueOnce([
      fakeStoredReport,
      fakeStoredReport,
      fakeStoredReport,
    ])
    CodAPIHandler.prototype.getLastMatchesIdFrom = jest.fn().mockResolvedValue(['OldMatchId'])
    CodAPIHandler.prototype.getMatchInfo = jest.fn().mockResolvedValue([{
      utcStartSeconds: 0,
      matchID: 'OldMatchId',
    }])

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(CodAPIHandler.prototype.getMatchInfo).toBeCalledTimes(3)
    expect(dbHandler.updateReports).toBeCalledTimes(3)
    expect(telegramSender.send).toBeCalledTimes(3)
  })

  test('#handler (match is reported for several channels)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    dbHandler.getReports = jest.fn().mockResolvedValueOnce([{
      ... fakeStoredReport,
      channels: [ 1, 2, 3, 4, 5 ],
    }])
    CodAPIHandler.prototype.getLastMatchesIdFrom = jest.fn().mockResolvedValueOnce(['OldMatchId'])
    CodAPIHandler.prototype.getMatchInfo = jest.fn().mockResolvedValueOnce([{
      utcStartSeconds: 0,
      matchID: 'OldMatchId',
    }])

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(CodAPIHandler.prototype.getMatchInfo).toBeCalledTimes(1)
    expect(dbHandler.updateReports).toBeCalledTimes(1)
    expect(telegramSender.send).toBeCalledTimes(5)
  })

  test('#handler (no matches found for the user)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    dbHandler.getReports = jest.fn().mockResolvedValueOnce([{
      ... fakeStoredReport,
      channels: [ 1, 2, 3, 4, 5 ],
    }])
    CodAPIHandler.prototype.getLastMatchesIdFrom = jest.fn().mockResolvedValueOnce([])
    CodAPIHandler.prototype.getMatchInfo = jest.fn().mockResolvedValueOnce([{
      utcStartSeconds: 0,
      matchID: 'OldMatchId',
    }])

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(CodAPIHandler.prototype.getMatchInfo).toBeCalledTimes(0)
    expect(dbHandler.updateReports).toBeCalledTimes(0)
    expect(telegramSender.send).toBeCalledTimes(0)
  })

  test('#handler (could not get matches info)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    dbHandler.getReports = jest.fn().mockResolvedValueOnce([{
      ... fakeStoredReport,
      channels: [ 1, 2, 3, 4, 5 ],
    }])
    CodAPIHandler.prototype.getLastMatchesIdFrom = jest.fn().mockResolvedValueOnce(['OldMatchId'])
    CodAPIHandler.prototype.getMatchInfo = jest.fn().mockRejectedValueOnce([{
      utcStartSeconds: 0,
      matchID: 'OldMatchId',
    }])

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(CodAPIHandler.prototype.getMatchInfo).toBeCalledTimes(1)
    expect(dbHandler.updateReports).toBeCalledTimes(0)
    expect(telegramSender.send).toBeCalledTimes(0)
  })
})
