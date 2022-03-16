import axios from 'axios'
import { configReader } from '../configReader/configReader'

const telegramAPI = 'https://api.telegram.org/bot'
const botKey = configReader.getConfig().telegramBotToken

class TelegramSender {
  async send(chatId: number, text: string): Promise<string>  {
    const response = await axios.post(`${telegramAPI}${botKey}/sendMessage`,
      {
        chat_id: chatId,
        text: text,
        parse_mode: 'markdown',
      }
    )
    return response.data
  }
}

const telegramSender = new TelegramSender()
export { telegramSender }
