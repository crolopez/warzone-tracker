import { CommandResponse } from './types/CommandResponse'
import { Command } from './types/Command'
import { CommandRequest } from './types/CommandRequest'
import { InvalidBodyRequest, InvalidCommandFormat,
  CommandNotRecognised } from './messages'

function getCommandError(message: string): CommandResponse {
  return {
    response: message,
    success: false,
  }
}

export class CommandDispatcher {
  readonly commandRegex: string
  readonly commandList: Command[]

  constructor(commandRegex: string, commandList: Command[]) {
    this.commandRegex = commandRegex
    this.commandList = commandList
  }

  async dispatch(commandRequest: CommandRequest): Promise<CommandResponse> {
    const {
      command,
    } = commandRequest

    console.log(`Trying to execute '${command}'.`)

    if (command === undefined) {
      return getCommandError(InvalidBodyRequest)
    }

    const commandParsed = command.match(this.commandRegex)
    if (commandParsed == null) {
      return getCommandError(InvalidCommandFormat)
    }

    const commandHandler = this.commandList.filter(x => x.command == commandParsed[1])[0]
    if (commandHandler === undefined) {
      return getCommandError(CommandNotRecognised)
    }

    const validation = commandHandler.argsValidation(commandParsed)
    if (validation !== 'ok') {
      return getCommandError(`${InvalidCommandFormat}: ${validation}`)
    }

    return commandHandler.handler(commandRequest, commandParsed)
  }
}
