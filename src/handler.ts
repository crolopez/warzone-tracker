import type { APIGatewayProxyHandler } from 'aws-lambda/trigger/api-gateway-proxy'
import { mapper } from './modules/mapper/mapper'
import { TelegramCommandDispatcher } from './modules/telegramCommands/TelegramCommandDispatcher'
import { telegramEventParser } from './modules/parsers/telegramEventParser'

const handle: APIGatewayProxyHandler = async (event: any) => {
  try {
    const parsedEvent = telegramEventParser.parse(event)
    const commandRequest = mapper.telegramEventToTelegramCommandRequest(parsedEvent)
    const response = commandRequest !== undefined
      ? await new TelegramCommandDispatcher().dispatch(commandRequest)
      : 'Unprocessed message'
    return {
      body: JSON.stringify(response),
      statusCode: 200,
    }
  } catch (error: any) {
    console.error(error.message)
    return {
      body: JSON.stringify({ error: error.message }),
      statusCode: 200,
    }
  }
}

export { handle }
