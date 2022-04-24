import { codAPIHandler } from '../../../../../../src/modules/codAPIHandler/codAPIHandler'
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

jest.mock('../../../../../../src/modules/formatters/telegramFormatter')

jest.mock('../../../../../../src/modules/dbHandler/dbHandler', () => {
  return {
    dbHandler: {
      updateReports: jest.fn(),
    },
  }
})

jest.mock('../../../../../../src/modules/codAPIHandler/codAPIHandler', () => {
  return {
    codAPIHandler: {
      GetMatchInfo: jest.fn(),
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

  test('#handler (match already reported)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    dbHandler.getReports = jest.fn().mockResolvedValueOnce([{
      user: 'FakeUser',
      lastMatch: 'FakeMatchId',
    }])
    codAPIHandler.GetLastMatchId = jest.fn().mockResolvedValueOnce('FakeMatchId')

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(telegramSender.send).toBeCalledTimes(0)
    expect(dbHandler.updateReports).toBeCalledTimes(0)
    expect(codAPIHandler.GetMatchInfo).toBeCalledTimes(0)
  })

  test('#handler (match not reported)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    dbHandler.getReports = jest.fn().mockResolvedValueOnce([fakeStoredReport])
    codAPIHandler.GetLastMatchId = jest.fn().mockResolvedValueOnce('OldMatchId')
    codAPIHandler.GetMatchInfo = jest.fn().mockResolvedValueOnce([{
      utcStartSeconds: 0,
    }])

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(codAPIHandler.GetMatchInfo).toBeCalledTimes(1)
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
    codAPIHandler.GetLastMatchId = jest.fn().mockResolvedValue('OldMatchId')
    codAPIHandler.GetMatchInfo = jest.fn().mockResolvedValue([{
      utcStartSeconds: 0,
    }])

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(codAPIHandler.GetMatchInfo).toBeCalledTimes(3)
    expect(dbHandler.updateReports).toBeCalledTimes(3)
    expect(telegramSender.send).toBeCalledTimes(3)
  })

  test('#handler (match is reported for several channels)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(testSSO)
    dbHandler.getReports = jest.fn().mockResolvedValueOnce([{
      ... fakeStoredReport,
      channels: [ 1, 2, 3, 4, 5 ],
    }])
    codAPIHandler.GetLastMatchId = jest.fn().mockResolvedValueOnce('OldMatchId')
    codAPIHandler.GetMatchInfo = jest.fn().mockResolvedValueOnce([{
      utcStartSeconds: 0,
    }])

    await reportLastMatchesCommand.handler(commandRequest, testArgs)

    expect(codAPIHandler.GetMatchInfo).toBeCalledTimes(1)
    expect(dbHandler.updateReports).toBeCalledTimes(1)
    expect(telegramSender.send).toBeCalledTimes(5)
  })
})
