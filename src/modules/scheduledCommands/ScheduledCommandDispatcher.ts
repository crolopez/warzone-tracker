import { UserReportsDoc } from '../../models/types/UserReportsDoc'
import { CommandDispatcher } from '../commandDispatcher/CommandDispatcher'
import { CommandRequest } from '../commandDispatcher/types/CommandRequest'
import { CommandResponse } from '../commandDispatcher/types/CommandResponse'
import { dbHandler } from '../dbHandler/dbHandler'
import { MissingSSOToken } from '../telegramCommands/messages'
import { reportLastMatchesCommand } from './commands/reportLastMatchesCommand'
import { reportSessionCommand } from './commands/reportSessionCommand'

const commandRegex = '^/([^ ]+)'

export class ScheduledCommandDispatcher extends CommandDispatcher {
  private ssoToken: string
  private userReports: UserReportsDoc[]

  constructor() {
    super(commandRegex, [
      reportLastMatchesCommand,
      reportSessionCommand,
    ])
    this.ssoToken = ''
    this.userReports = []
  }

  async init(): Promise<void> {
    const sso = await dbHandler.getCredentials()

    if (sso === undefined) {
      throw new Error(MissingSSOToken)
    }

    this.ssoToken = sso.ssoToken as unknown as string
    this.userReports = await dbHandler.getReports()
  }

  async dispatch(commandRequest: CommandRequest): Promise<CommandResponse> {
    const scheduledCommandRequest = {
      ... commandRequest,
      ssoToken: this.ssoToken,
      userReports: this.userReports,
    }
    return await super.dispatch(scheduledCommandRequest)
  }
}
