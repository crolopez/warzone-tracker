import { Configuration } from './types/Configuration'

class ConfigReader {
  getConfig(): Configuration {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is undefined')
    }

    return {
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN as string,
    }
  }
}

const configReader = new ConfigReader()
export { configReader }
