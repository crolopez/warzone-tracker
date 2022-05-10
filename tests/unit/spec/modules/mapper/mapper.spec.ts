import { mapper } from '../../../../../src/modules/mapper/mapper'
import { TelegramEvent } from '../../../../../src/modules/parsers/types/TelegramEvent'

describe('mapper', () => {
  const telegramEvent = {
    message: {
      chat: {
        id: 98765,
        type: 'private',
      },
      from: {
        id: 99991,
        first_name: 'User',
        username: 'UserName',
      },
      text: '/FakeCommand',
    },
    update_id: 675381,
  }

  test('#telegramEventToTelegramCommandRequest', async () => {
    const commandRequest = mapper.telegramEventToTelegramCommandRequest(telegramEvent)

    expect(commandRequest).toStrictEqual({
      command: '/FakeCommand',
      source: {
        chatId: 98765,
        type: 'private',
      },
      from: {
        userId: 99991,
        username: 'UserName',
        firstName: 'User',
      },
    })
  })

  test('#telegramEventToTelegramCommandRequest (undefined)', async () => {
    const commandRequest = mapper.telegramEventToTelegramCommandRequest(
      {... telegramEvent, message: undefined} as unknown as TelegramEvent)

    expect(commandRequest).toStrictEqual(undefined)
  })
})