import axios from 'axios'
import { configReader } from '../configReader/configReader'
import { TelegramChatAdmins } from './types/TelegramChatAdmins'

const telegramAPI = 'https://api.telegram.org/bot'
const botKey = configReader.getConfig().telegramBotToken

class TelegramHandler {
  async send(chatId: number, text: string): Promise<any>  {
    const { data } = await axios.post(`${telegramAPI}${botKey}/sendMessage`,
      {
        chat_id: chatId,
        text: text,
        parse_mode: 'markdown',
      }
    )
    return data
  }

  async getChatAdministrators(chatId: number): Promise<TelegramChatAdmins[]>  {
    const { data } = await axios.post(`${telegramAPI}${botKey}/getChatAdministrators`,
      {
        chat_id: chatId,
      }
    )
    return data.result.map((x: { user: TelegramChatAdmins }) => x.user)
  }
}

const telegramHandler = new TelegramHandler()
export { telegramHandler }
