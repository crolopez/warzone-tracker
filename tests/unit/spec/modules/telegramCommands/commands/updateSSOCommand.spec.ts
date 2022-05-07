import { CodAPIHandler } from '../../../../../../src/modules/codAPIHandler/CodAPIHandler'
import { dbHandler } from '../../../../../../src/modules/dbHandler/dbHandler'
import { updateSSOCommand } from '../../../../../../src/modules/telegramCommands/commands/updateSSOCommand'
import { InvalidSSOTokenUser, UserMustBeAdmin } from '../../../../../../src/modules/telegramCommands/messages'
import { telegramHandler } from '../../../../../../src/modules/telegramHandler/telegramHandler'

jest.mock('../../../../../../src/modules/telegramHandler/telegramHandler', () => {
  return {
    telegramHandler: {
      send: jest.fn().mockResolvedValue('Send response'),
    },
  }
})

jest.mock('../../../../../../src/modules/codAPIHandler/CodAPIHandler')

jest.mock('../../../../../../src/modules/dbHandler/dbHandler', () => {
  return {
    dbHandler: {
      updateCredentials: jest.fn(),
    },
  }
})

jest.mock('../../../../../../src/modules/configReader/configReader', () => {
  return {
    configReader: {
      getConfig: jest.fn().mockReturnValue({}),
    },
  }
})

describe('updateSSOCommand', () => {
  const telegramCommandRequest = {
    command: '/FakeCommand',
    source: {
      chatId: 98765,
      firstName: 'User',
      type: 'private',
      username: 'UserName',
    },
    from: {
      userId: 8917,
    },
  }
  const adminNode = {
    id: telegramCommandRequest.from.userId,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    CodAPIHandler.prototype.isValidSSO = jest.fn().mockResolvedValue(true)
    telegramHandler.getChatAdministrators = jest.fn().mockResolvedValueOnce([
      adminNode,
    ])
  })

  test('#validate (returns ok)', async () => {
    const response = updateSSOCommand.argsValidation([
      '/UpdateSSO FakeSSO',
      'UpdateSSO',
      'FakeSSO',
    ])

    expect(response).toBe('ok')
  })

  test('#validate (validation fails)', async () => {
    const response = updateSSOCommand.argsValidation([
      '/UpdateSSO FakeSSO',
      'UpdateSSO',
      '',
    ])

    expect(response).toBe('/UpdateSSO <SSO>')
  })

  test('#handler (returns a successful response)', async () => {
    const response = await updateSSOCommand.handler(telegramCommandRequest, [])

    expect(response).toStrictEqual({
      response: 'Send response',
      success: true,
    })
  })

  test('#handler (user not admin)', async () => {
    dbHandler.isUserRegistered = jest.fn().mockResolvedValueOnce(true)
    const nonAdminRequest = { ... telegramCommandRequest, from: { userId: 999999 }}

    const response = await updateSSOCommand.handler(nonAdminRequest, [])

    expect(response).toStrictEqual({
      response: UserMustBeAdmin,
      success: false,
    })
  })

  test('#handler (calls telegramHandler)', async () => {
    await updateSSOCommand.handler(telegramCommandRequest, [])

    expect(telegramHandler.send).toBeCalledWith(98765, 'SSO updated')
  })

  test('#handler (invalid SSO)', async () => {
    CodAPIHandler.prototype.isValidSSO = jest.fn().mockResolvedValue(false)

    const response = await updateSSOCommand.handler(telegramCommandRequest, [])

    expect(response).toStrictEqual({
      response: InvalidSSOTokenUser,
      success: false,
    })
  })
})
