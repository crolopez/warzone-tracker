import { configReader } from '../../../../../src/modules/configReader/configReader'

describe('configReader', () => {
  const testBotToken = 'TEST:BOT-TOKEN'
  const testDatabaseConnectionString = 'TEST:DB-CONNECTION-STRING'
  const testAcceptSSOFrom = 'TEST:ACCEPT-SSO-FROM'
  const testMaxReportsPerUser = '3'
  const testAdminCommands = 'true'

  beforeEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = testBotToken
    process.env.DATABASE_CONNECTION_STRING = testDatabaseConnectionString
    process.env.ACCEPT_SSO_FROM = testAcceptSSOFrom
    process.env.MAX_REPORTS_PER_USER = testMaxReportsPerUser
    process.env.ADMIN_COMMANDS = testAdminCommands
  })

  test('#getConfig', async () => {
    const config = configReader.getConfig()

    expect(config).toStrictEqual({
      telegramBotToken: testBotToken,
      databaseConnectionString: testDatabaseConnectionString,
      acceptSSOFrom: testAcceptSSOFrom,
      maxReportsPerUser: testMaxReportsPerUser,
      adminCommands: true,
    })
  })

  test('#getConfig (TELEGRAM_BOT_TOKEN undefined)', async () => {
    try {
      delete process.env.TELEGRAM_BOT_TOKEN
      configReader.getConfig()

      expect(1).toBe(0)
    } catch (error: any) {
      expect(error.message).toBe('TELEGRAM_BOT_TOKEN is undefined')
    }
  })

  test('#getConfig (DATABASE_CONNECTION_STRING undefined)', async () => {
    try {
      delete process.env.DATABASE_CONNECTION_STRING
      configReader.getConfig()

      expect(1).toBe(0)
    } catch (error: any) {
      expect(error.message).toBe('DATABASE_CONNECTION_STRING is undefined')
    }
  })

  test('#getConfig (ACCEPT_SSO_FROM undefined)', async () => {
    try {
      delete process.env.ACCEPT_SSO_FROM
      configReader.getConfig()

      expect(1).toBe(0)
    } catch (error: any) {
      expect(error.message).toBe('ACCEPT_SSO_FROM is undefined')
    }
  })

  test('#getConfig (MAX_REPORTS_PER_USER undefined)', async () => {
    try {
      delete process.env.MAX_REPORTS_PER_USER
      configReader.getConfig()

      expect(1).toBe(0)
    } catch (error: any) {
      expect(error.message).toBe('MAX_REPORTS_PER_USER is undefined')
    }
  })

  test('#getConfig (ADMIN_COMMANDS undefined)', async () => {
    try {
      delete process.env.ADMIN_COMMANDS
      configReader.getConfig()

      expect(1).toBe(0)
    } catch (error: any) {
      expect(error.message).toBe('ADMIN_COMMANDS is undefined')
    }
  })
})
