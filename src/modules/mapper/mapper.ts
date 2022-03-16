import { TelegramCommandRequest } from '../telegramCommands/types/TelegramCommandRequest'
import { TelegramEvent } from '../telegramEventParser/types/TelegramEvent'

class Mapper {
  telegramEventToTelegramCommandRequest(event: TelegramEvent): TelegramCommandRequest {
    return {
      source: {
        chatId: event.message.chat.id,
        firstName: event.message.chat.first_name,
        username: event.message.chat.username,
        type: event.message.chat.type,
      },
      command: event.message.text,
    }
  }
}

const mapper = new Mapper()
export { mapper }
