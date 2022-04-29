const mockSend = jest.fn()

import { dbHandler } from '../../../../../../src/modules/dbHandler/dbHandler'
import { telegramFormatter } from '../../../../../../src/modules/formatters/telegramFormatter'
import { lastMatchCommand } from '../../../../../../src/modules/telegramCommands/commands/lastMatchCommand'
import { MissingSSOToken } from '../../../../../../src/modules/telegramCommands/messages'
import { telegramSender } from '../../../../../../src/modules/telegramSender/telegramSender'

jest.mock('../../../../../../src/modules/telegramSender/telegramSender', () => {
  return {
    telegramSender: {
      send: mockSend,
    },
  }
})

jest.mock('../../../../../../src/modules/codAPIHandler/codAPIHandler', () => {
  return {
    codAPIHandler: {
      getLastMatchesIdFrom: jest.fn().mockReturnValue([]),
      getMatchInfo: jest.fn(),
    },
  }
})

jest.mock('../../../../../../src/modules/formatters/telegramFormatter', () => {
  return {
    telegramFormatter: {
      matchFormatter: jest.fn(),
    },
  }
})

jest.mock('../../../../../../src/modules/dbHandler/dbHandler', () => {
  return {
    dbHandler: {
      updateCredentials: jest.fn(),
      getCredentials: jest.fn(),
    },
  }
})

describe('lastMatchCommand', () => {
  const testChatId = 98765
  const telegramCommandRequest = {
    command: '/FakeCommand',
    source: {
      chatId: testChatId,
      firstName: 'User',
      type: 'private',
      username: 'UserName',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('#validate (returns ok)', async () => {
    const response = lastMatchCommand.argsValidation([
      '/LastMatch FakeUser',
      'LastMatch',
      'FakeUser',
    ])

    expect(response).toBe('ok')
  })

  test('#validate (validation fails)', async () => {
    const response = lastMatchCommand.argsValidation(
      [ '/LastMatch', 'LastMatch', '' ])

    expect(response).toBe('/LastMatch <User>')
  })

  test('#lastMatch (missing token)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce(undefined)

    const response = await lastMatchCommand.handler(
      telegramCommandRequest,
      [ '', '', '' ])

    expect(response).toStrictEqual({
      response: MissingSSOToken,
      success: false,
    })
  })

  test('#lastMatch (Telegram message is sent)', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce({
      ssoToken: 'FakeToken',
    })
    telegramFormatter.matchReportFormatter = jest.fn().mockReturnValueOnce('FormattedText')

    await lastMatchCommand.handler(
      telegramCommandRequest,
      [ '', '', '' ])

    expect(mockSend).toBeCalledWith(testChatId, 'FormattedText')
  })

  test('#lastMatch', async () => {
    dbHandler.getCredentials = jest.fn().mockResolvedValueOnce({
      ssoToken: 'FakeToken',
    })
    telegramSender.send = jest.fn().mockReturnValueOnce('Test response')

    const response = await lastMatchCommand.handler(
      telegramCommandRequest,
      [ '', '', '' ])

    expect(response).toStrictEqual({
      response: 'Test response',
      success: true,
    })
  })
})
