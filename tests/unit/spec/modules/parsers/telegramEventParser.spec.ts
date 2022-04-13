import { InvalidTelegramEvent } from '../../../../../src/modules/parsers/messages'
import { telegramEventParser } from '../../../../../src/modules/parsers/telegramEventParser'

describe('telegramEventParser', () => {
  const telegramEvent = {
    body: {
      message: {
        chat: {
          id: 98765,
          first_name: 'User',
          username: 'UserName',
          type: 'private',
        },
        text: '/FakeCommand',
      },
      update_id: 675381,
    },
  }

  test('#telegramEventToCommandRequest', async () => {
    const parsedEvent = telegramEventParser.parse(telegramEvent)

    expect(parsedEvent).toStrictEqual(telegramEvent.body)
  })

  test('#telegramEventToCommandRequest (with object)', async () => {
    const parsedEvent = telegramEventParser.parse({
      ... telegramEventParser,
      body: JSON.stringify(telegramEvent.body),
    })

    expect(parsedEvent).toStrictEqual(telegramEvent.body)
  })

  test('#telegramEventToCommandRequest (invalid telegram event)', async () => {
    try {
      telegramEventParser.parse({})

      expect(1).toBe(0)
    } catch (error: any) {
      expect(error.message).toBe(InvalidTelegramEvent)
    }
  })
})
