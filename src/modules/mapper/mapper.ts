import { TelegramCommandRequest } from '../telegramCommands/types/TelegramCommandRequest'
import { TelegramEvent } from '../parsers/types/TelegramEvent'

class Mapper {
  telegramEventToTelegramCommandRequest(event: TelegramEvent): TelegramCommandRequest | undefined {
    return event.message !== undefined
      ? {
        source: {
          chatId: event.message.chat.id,
          firstName: event.message.chat.first_name,
          username: event.message.chat.username,
          type: event.message.chat.type,
        },
        command: event.message.text,
      }
      : undefined
  }
}

const mapper = new Mapper()
export { mapper }
