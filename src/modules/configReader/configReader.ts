import { Configuration } from './types/Configuration'

class ConfigReader {
  getConfig(): Configuration {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is undefined')
    }

    if (!process.env.DATABASE_CONNECTION_STRING) {
      throw new Error('DATABASE_CONNECTION_STRING is undefined')
    }

    if (!process.env.ACCEPT_SSO_FROM) {
      throw new Error('ACCEPT_SSO_FROM is undefined')
    }

    if (!process.env.MAX_REPORTS_PER_USER) {
      throw new Error('MAX_REPORTS_PER_USER is undefined')
    }

    if (!process.env.ADMIN_COMMANDS) {
      throw new Error('ADMIN_COMMANDS is undefined')
    }

    if (!process.env.TIME_BETWEEN_SESSIONS) {
      throw new Error('TIME_BETWEEN_SESSIONS is undefined')
    }

    return {
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN as string,
      databaseConnectionString: process.env.DATABASE_CONNECTION_STRING as string,
      acceptSSOFrom: process.env.ACCEPT_SSO_FROM as string,
      maxReportsPerUser: process.env.MAX_REPORTS_PER_USER as unknown as number,
      adminCommands: process.env.ADMIN_COMMANDS == 'true',
      timeBetweenSessions: process.env.TIME_BETWEEN_SESSIONS as unknown as number * 60,
    }
  }
}

const configReader = new ConfigReader()
export { configReader }
