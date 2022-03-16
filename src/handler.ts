import type { APIGatewayProxyHandler } from 'aws-lambda/trigger/api-gateway-proxy'
import { mapper } from './modules/mapper/mapper'
import { TelegramCommandDispatcher } from './modules/telegramCommands/TelegramCommandDispatcher'
import { telegramEventParser } from './modules/telegramEventParser/telegramEventParser'

const handle: APIGatewayProxyHandler = async (event: any) => {
  try {
    const parsedEvent = telegramEventParser.parse(event)
    const commandRequest = mapper.telegramEventToTelegramCommandRequest(parsedEvent)
    const response = await new TelegramCommandDispatcher().dispatch(commandRequest)
    return {
      body: JSON.stringify(response),
      statusCode: 200,
    }
  } catch (error: any) {
    return {
      body: JSON.stringify({ reason: error.message }),
      statusCode: 500,
    }
  }
}

export { handle }
