import { mapper } from '../../../../../src/modules/mapper/mapper'

describe('mapper', () => {
  const telegramEvent = {
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
  }

  test('#telegramEventToTelegramCommandRequest', async () => {
    const commandRequest = mapper.telegramEventToTelegramCommandRequest(telegramEvent)

    expect(commandRequest).toStrictEqual({
      command: '/FakeCommand',
      source: {
        chatId: 98765,
        firstName: 'User',
        type: 'private',
        username: 'UserName',
      },
    })
  })
})