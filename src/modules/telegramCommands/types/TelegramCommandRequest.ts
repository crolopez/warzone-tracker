import { CommandRequest } from '../../commandDispatcher/types/CommandRequest'

export interface TelegramCommandRequest extends CommandRequest {
  source: {
    chatId: number
    type: string
  },
  from: {
    userId: number
    username: string
    firstName: string
  }
}
