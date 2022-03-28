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

    return {
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN as string,
      databaseConnectionString: process.env.DATABASE_CONNECTION_STRING as string,
      acceptSSOFrom: process.env.ACCEPT_SSO_FROM as string,
    }
  }
}

const configReader = new ConfigReader()
export { configReader }
