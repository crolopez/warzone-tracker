import { TelegramCommandRequest } from '../telegramCommands/types/TelegramCommandRequest'
import { TelegramEvent } from '../parsers/types/TelegramEvent'

class Mapper {
  telegramEventToTelegramCommandRequest(event: TelegramEvent): TelegramCommandRequest | undefined {
    return event.message !== undefined
      ? {
        source: {
          chatId: event.message.chat.id,
          type: event.message.chat.type,
        },
        from: {
          userId: event.message.from.id,
          username: event.message.from.username,
          firstName: event.message.from.first_name,
        },
        command: event.message.text,
      }
      : undefined
  }
}

const mapper = new Mapper()
export { mapper }
