const mockConnect = jest.fn()

import mongoose from 'mongoose'
import CredentialsModel from '../../../../../src/models/CredentialsModel'
import UserMetadataModel from '../../../../../src/models/UserMetadataModel'
import UserReportsModel from '../../../../../src/models/UserReportsModel'
import { dbHandler } from '../../../../../src/modules/dbHandler/dbHandler'

jest.mock('mongoose', () => {
  return {
    connect: mockConnect,
    connection: jest.fn(),
  }
})

jest.mock('../../../../../src/models/CredentialsModel', () => {
  return function() {
    return {}
  }
})

jest.mock('../../../../../src/models/UserMetadataModel', () => {
  return function() {
    return {}
  }
})

jest.mock('../../../../../src/models/UserReportsModel', () => {
  return function() {
    return {}
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
    CredentialsModel.find = jest.fn().mockReturnValue([{}])
    CredentialsModel.findByIdAndUpdate = jest.fn()
    UserMetadataModel.init = jest.fn()
    UserMetadataModel.create = jest.fn()
    UserMetadataModel.find = jest.fn().mockReturnValue([])
    UserReportsModel.init = jest.fn()
    UserReportsModel.create = jest.fn()
    UserReportsModel.find = jest.fn().mockReturnValue([{}])
    UserReportsModel.findByIdAndUpdate = jest.fn()
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
    await dbHandler.getCredentials()

    expect(mockConnect).toBeCalled()
  })

  test('#getCredentials (does not call mongoose.connect)', async () => {
    Object.defineProperty(mongoose.connection, 'host', {
      value: 'FakeHost',
      configurable: true,
    })

    await dbHandler.getCredentials()

    expect(mockConnect).toBeCalledTimes(0)
  })

  test('#getCredentials (mongoose.connect throws an error)', async () => {
    Object.defineProperty(mongoose.connection, 'host', {
      value: undefined,
      configurable: true,
    })
    mongoose.connect = jest.fn().mockImplementation(() => {
      throw new Error()
    })
    const processExitMock = jest.spyOn(process, 'exit').mockImplementation()

    await dbHandler.getCredentials()

    expect(processExitMock).toBeCalledTimes(1)
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

  test('#getUserMetadata (calls model.find)', async () => {
    await dbHandler.getUserMetadata('FakeUser')

    expect(UserMetadataModel.find).toBeCalledWith({ user: 'FakeUser' })
  })

  test('#getUserMetadata (no entries found)', async () => {
    UserMetadataModel.find = jest.fn().mockResolvedValueOnce([])

    const response = await dbHandler.getUserMetadata('FakeUser')

    expect(response).toBe(undefined)
  })

  test('#getUserMetadata (entry found)', async () => {
    UserMetadataModel.find = jest.fn().mockResolvedValueOnce([{
      entryKey: 'entryValue',
    }])

    const response = await dbHandler.getUserMetadata('FakeUser')

    expect(response).toStrictEqual({
      entryKey: 'entryValue',
    })
  })

  test('#addUserMetadata', async () => {
    await dbHandler.addUserMetadata('FakeUser', 'FakePlatform')

    expect(UserMetadataModel.init).toBeCalled()
    expect(UserMetadataModel.create).toBeCalled()
  })

  test('#isUserRegistered', async () => {
    UserReportsModel.find = jest.fn().mockResolvedValue([{
      id: 56789,
      channels: [
        12345,
      ],
    }])

    const response = await dbHandler.isUserRegistered('FakeUser', 12345)

    expect(response).toBe(true)
  })

  test('#isUserRegistered (returns false)', async () => {
    UserReportsModel.find = jest.fn().mockResolvedValue([{
      id: 56789,
      channels: [
        12345,
      ],
    }])

    const response = await dbHandler.isUserRegistered('FakeUser', 54321)

    expect(response).toBe(false)
  })

  test('#getUserReports', async () => {
    UserReportsModel.find = jest.fn().mockResolvedValue([{
      id: 56789,
      fakeKey: 'FakeValue',
    }])

    const response = await dbHandler.getUserReports('FakeUser')

    expect(response).toStrictEqual({
      id: 56789,
      fakeKey: 'FakeValue',
    })
  })

  test('#registerUserReports (user not registered in any channel)', async () => {
    UserReportsModel.find = jest.fn().mockResolvedValue([])

    await dbHandler.registerUserReports('FakeUser', 98765)

    expect(UserReportsModel.init).toBeCalled()
    expect(UserReportsModel.create).toBeCalled()
  })

  test('#registerUserReports (user is updated)', async () => {
    UserReportsModel.find = jest.fn().mockResolvedValue([{
      channels: [],
    }])

    await dbHandler.registerUserReports('FakeUser', 98765)

    expect(UserReportsModel.findByIdAndUpdate).toBeCalled()
  })
})
