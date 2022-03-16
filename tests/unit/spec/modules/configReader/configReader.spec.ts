import { configReader } from '../../../../../src/modules/configReader/configReader'

describe('configReader', () => {
  const testBotToken = 'TEST:BOT-TOKEN'

  test('#getConfig', async () => {
    process.env.TELEGRAM_BOT_TOKEN = testBotToken
    const config = configReader.getConfig()

    expect(config).toStrictEqual({
      telegramBotToken: testBotToken,
    })
  })

  test('#getConfig (TELEGRAM_BOT_TOKEN undefined)', async () => {
    try {
      delete process.env.TELEGRAM_BOT_TOKEN
      configReader.getConfig()

      expect(1).toBe(0)
    } catch (error: any) {
      expect(error.message).toBe('TELEGRAM_BOT_TOKEN is undefined')
    }
  })
})
