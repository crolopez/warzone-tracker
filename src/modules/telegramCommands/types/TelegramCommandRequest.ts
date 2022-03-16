import { CommandRequest } from '../../commandDispatcher/types/CommandRequest'

export interface TelegramCommandRequest extends CommandRequest {
  source: {
    chatId: number
    firstName: string
    username: string
    type: string
  }
}
