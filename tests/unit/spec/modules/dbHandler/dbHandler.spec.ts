import mongoose from 'mongoose'
import CredentialsModel from '../../../../../src/models/CredentialsModel'
import { dbHandler } from '../../../../../src/modules/dbHandler/dbHandler'

jest.mock('mongoose', () => {
  return {
    connect: jest.fn(),
    connection: jest.fn(),
  }
})

jest.mock('../../../../../src/models/CredentialsModel', () => {
  return function() {
    return {
    }
  }
})

jest.mock('../../../../../src/modules/configReader/configReader', () => {
  return {
    configReader: {
      getConfig: jest.fn().mockReturnValue({}),
    },
  }
})

describe('dbHandler', () => {
  const testId = 999999
  const testSSOToken = 'TEST:SSO-TOKEN'
  const testSSOTokenExpiryDate = 'TEST:SSO-TOKEN-EXPIRYDATE'

  beforeEach(() => {
    jest.clearAllMocks()
    CredentialsModel.init = jest.fn()
    CredentialsModel.create = jest.fn()
    CredentialsModel.findByIdAndUpdate = jest.fn()
  })

  test('#getCredentials', async () => {
    CredentialsModel.find = jest.fn().mockResolvedValue([{
      id: 999999,
      ssoToken: 'TEST:SSO-TOKEN',
      ssoTokenExpiryDate: 'TEST:SSO-TOKEN-EXPIRYDATE',
    }])

    const credentials = await dbHandler.getCredentials()

    expect(credentials).toStrictEqual({
      id: testId,
      ssoToken: testSSOToken,
      ssoTokenExpiryDate: testSSOTokenExpiryDate,
    })
  })

  test('#getCredentials (calls mongoose.connect)', async () => {
    const connectSpy = jest.spyOn(mongoose, 'connect')

    await dbHandler.getCredentials()

    expect(connectSpy).toBeCalled()
  })

  test('#getCredentials (does not call mongoose.connect)', async () => {
    Object.defineProperty(mongoose.connection, 'host', {
      value: jest.fn().mockReturnValue({
        host: 'FakeHost',
      }),
    })
    const connectSpy = jest.spyOn(mongoose, 'connect')

    await dbHandler.getCredentials()

    expect(connectSpy).toBeCalledTimes(0)
  })

  test('#updateCredentials', async () => {
    await dbHandler.updateCredentials(testSSOToken)

    expect(CredentialsModel.findByIdAndUpdate).toBeCalled()
  })

  test('#updateCredentials (credentials not found)', async () => {
    CredentialsModel.find = jest.fn().mockResolvedValue([])

    await dbHandler.updateCredentials(testSSOToken)

    expect(CredentialsModel.init).toBeCalled()
    expect(CredentialsModel.create).toBeCalled()
  })

  test('#updateCredentials (credentials not found)', async () => {
    CredentialsModel.find = jest.fn().mockResolvedValue([])

    await dbHandler.updateCredentials(testSSOToken)

    expect(CredentialsModel.init).toBeCalled()
    expect(CredentialsModel.create).toBeCalled()
  })
})
