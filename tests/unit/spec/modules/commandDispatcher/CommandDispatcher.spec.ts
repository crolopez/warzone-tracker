import { CommandDispatcher } from '../../../../../src/modules/commandDispatcher/CommandDispatcher'
import { CommandNotRecognised, InvalidBodyRequest, InvalidCommandFormat } from '../../../../../src/modules/commandDispatcher/messages'
import { CommandRequest } from '../../../../../src/modules/commandDispatcher/types/CommandRequest'

describe('CommandDispatcher', () => {
  test('#dispatch (invalid body request)', async () => {
    const dispatcher = new CommandDispatcher('', [])

    const response = await dispatcher.dispatch({} as CommandRequest)

    expect(response.response).toBe(InvalidBodyRequest)
    expect(response.success).toBe(false)
  })

  test('#dispatch (invalid command format)', async () => {
    const dispatcher = new CommandDispatcher('^/([^ ]+)', [])

    const response = await dispatcher.dispatch({
      command: '',
    })

    expect(response.response).toBe(InvalidCommandFormat)
    expect(response.success).toBe(false)
  })

  test('#dispatch (command not recognised)', async () => {
    const dispatcher = new CommandDispatcher('^/([^ ]+)', [])

    const response = await dispatcher.dispatch({
      command: '/unrecognisedCommand',
    })

    expect(response.response).toBe(CommandNotRecognised)
    expect(response.success).toBe(false)
  })

  test('#dispatch (validation format error)', async () => {
    const fakeCommand = {
      command: 'fakeCommand',
      argsValidation: jest.fn().mockReturnValue('X'),
      handler: jest.fn(),
    }
    const dispatcher = new CommandDispatcher('^/([^ ]+)', [fakeCommand])

    const response = await dispatcher.dispatch({
      command: '/fakeCommand',
    })

    expect(response.response).toBe(`${InvalidCommandFormat}: X`)
    expect(response.success).toBe(false)
  })

  test('#dispatch (handler is called)', async () => {
    const fakeCommand = {
      command: 'fakeCommand',
      argsValidation: jest.fn().mockReturnValue('ok'),
      handler: jest.fn().mockReturnValue({
        response: 'Valid response',
        success: true,
      }),
    }
    const dispatcher = new CommandDispatcher('^/([^ ]+)', [fakeCommand])

    const response = await dispatcher.dispatch({
      command: '/fakeCommand',
    })

    expect(response.response).toBe('Valid response')
    expect(response.success).toBe(true)
  })
})