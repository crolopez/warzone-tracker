import { isAdmin } from '../../../../../src/modules/telegramCommands/utils'

jest.mock('../../../../../src/modules/telegramHandler/telegramHandler', () => {
  return {
    telegramHandler: {
      getChatAdministrators: jest.fn().mockReturnValue([
        {
          id: '123',
        },
      ]),
    },
  }
})

describe('utils', () => {
  test('#isAdmin (returns false)', async () => {
    const response = await isAdmin(1234, 456)

    expect(response).toBe(false)
  })

  test('#isAdmin (returns true)', async () => {
    const response = await isAdmin(123, 456)

    expect(response).toBe(true)
  })
})
