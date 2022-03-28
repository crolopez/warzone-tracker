import { InvalidTelegramEvent } from './messages'
import { TelegramEvent } from './types/TelegramEvent'

class TelegramEventParser {
  parse(event: any): TelegramEvent  {
    try {
      const parsedEvent = typeof event.body === 'string'
        ? JSON.parse(event.body)
        : event.body

      if (parsedEvent === undefined) {
        throw new Error('')
      }

      return parsedEvent as TelegramEvent
    } catch (error: any) {
      console.error(`Could not parse Telegram event: ${error.message}`)
      throw new Error(InvalidTelegramEvent)
    }
  }
}

const telegramEventParser = new TelegramEventParser()
export { telegramEventParser }
