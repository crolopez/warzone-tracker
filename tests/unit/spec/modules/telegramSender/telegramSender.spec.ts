import axios from 'axios'
import { telegramSender } from '../../../../../src/modules/telegramSender/telegramSender'

jest.mock('axios', () => {
  return {
    post: jest.fn().mockReturnValue({
      data: 'Send response',
    }),
  }
})

jest.mock('../../../../../src/modules/configReader/configReader', () => {
  return {
    configReader: {
      getConfig: jest.fn().mockReturnValue({
        telegramBotToken: 'DUMMYTOKEN',
      }),
    },
  }
})

describe('telegramSender', () => {
  const apiUrl = 'https://api.telegram.org/botDUMMYTOKEN/sendMessage'
  const chatId = 999
  const sentText = 'Dummy text'
  const postBody = {
    'chat_id': chatId,
    'parse_mode': 'markdown',
    'text': sentText,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('#send', async () => {
    await telegramSender.send(999, 'Dummy text')

    expect(axios.post).toBeCalledWith(apiUrl, postBody)
  })
})