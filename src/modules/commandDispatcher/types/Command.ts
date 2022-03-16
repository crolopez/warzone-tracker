import { CommandRequest } from './CommandRequest'
import { CommandResponse } from './CommandResponse'

export interface Command {
  command: string
  argsValidation: (args: string[]) => string
  handler: (commandRequest: CommandRequest, args?: string[]) => Promise<CommandResponse>
}
