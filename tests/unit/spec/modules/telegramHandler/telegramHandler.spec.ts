import axios from 'axios'
import { telegramHandler } from '../../../../../src/modules/telegramHandler/telegramHandler'

jest.mock('../../../../../src/modules/configReader/configReader', () => {
  return {
    configReader: {
      getConfig: jest.fn().mockReturnValue({
        telegramBotToken: 'DUMMYTOKEN',
      }),
    },
  }
})

describe('telegramHandler', () => {
  const apiSendUrl = 'https://api.telegram.org/botDUMMYTOKEN/sendMessage'
  const apiGetAdminsUrl = 'https://api.telegram.org/botDUMMYTOKEN/getChatAdministrators'
  const chatId = 999
  const sentText = 'Dummy text'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('#send', async () => {
    axios.post = jest.fn().mockReturnValue({
      data: 'Send response',
    })

    await telegramHandler.send(999, 'Dummy text')

    expect(axios.post).toBeCalledWith(apiSendUrl, {
      'chat_id': chatId,
      'parse_mode': 'markdown',
      'text': sentText,
    })
  })

  test('#getChatAdministrators', async () => {
    axios.post = jest.fn().mockReturnValue({
      data: {
        result: [
          {
            user: 'Adolfo',
          },
          {
            user: 'Adolfa',
          },
        ],
      },
    })

    const response = await telegramHandler.getChatAdministrators(999)

    expect(response).toStrictEqual([ 'Adolfo', 'Adolfa' ])
    expect(axios.post).toBeCalledWith(apiGetAdminsUrl, {
      'chat_id': chatId,
    })
  })
})
