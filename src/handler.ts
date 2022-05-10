import type { APIGatewayProxyHandler } from 'aws-lambda/trigger/api-gateway-proxy'
import { mapper } from './modules/mapper/mapper'
import { TelegramCommandDispatcher } from './modules/telegramCommands/TelegramCommandDispatcher'
import { telegramEventParser } from './modules/parsers/telegramEventParser'
import { ScheduledCommandDispatcher } from './modules/scheduledCommands/ScheduledCommandDispatcher'

async function processTelegramEvent(event: any): Promise<any> {
  const parsedEvent = telegramEventParser.parse(event)
  const commandRequest = mapper.telegramEventToTelegramCommandRequest(parsedEvent)
  return commandRequest !== undefined && commandRequest.command !== undefined
    ? await new TelegramCommandDispatcher().dispatch(commandRequest)
    : 'Unprocessed message'
}

async function processScheduledEvent(event: any): Promise<any> {
  const scheduledCommandDispatcher = new ScheduledCommandDispatcher()
  await scheduledCommandDispatcher.init()

  const reportLastMatchedCommand = { ... event, command: '/ReportLastMatches' }
  const response = await scheduledCommandDispatcher.dispatch(reportLastMatchedCommand)
  if (!response.success) return response

  const reportSessionCommand = { ... event, command: '/ReportSession' }
  return await scheduledCommandDispatcher.dispatch(reportSessionCommand)
}

const handle: APIGatewayProxyHandler = async (event: any): Promise<any> => {
  try {
    const response = event.postMatchReports || event.sessionReports
      ? await processScheduledEvent(event)
      : await processTelegramEvent(event)
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
