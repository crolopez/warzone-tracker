import mongoose from 'mongoose'
import CredentialsModel from '../../models/CredentialsModel'
import { CredentialsDoc } from '../../models/types/CredentialsDoc'
import { UserMetadataDoc } from '../../models/types/UserMetadataDoc'
import { UserReportsDoc } from '../../models/types/UserReportsDoc'
import UserMetadataModel from '../../models/UserMetadataModel'
import UserReportsModel from '../../models/UserReportsModel'
import { configReader } from '../configReader/configReader'

async function connectMongo(): Promise<void> {
  const connectionString = configReader.getConfig().databaseConnectionString
  try {
    if (mongoose.connection.host === undefined) {
      await mongoose.connect(connectionString)
      console.log(`MongoDB connected (${connectionString})`)
    }
  } catch (error) {
    console.error(error)
    process.exit(-1)
  }
}

class DbHandler {
  async getCredentials(): Promise<CredentialsDoc | undefined> {
    await connectMongo()
    const credentials = await CredentialsModel.find({})
    return credentials[0]
  }

  async updateCredentials(ssoToken: string): Promise<void> {
    const credentialsEntry = {
      ssoToken: ssoToken,
      ssoTokenExpiryDate: 'DummySSOTokenExpiryDate',
    }
    const credentials = await this.getCredentials()
    if (credentials === undefined) {
      await CredentialsModel.init()
      await CredentialsModel.create(new CredentialsModel(credentialsEntry))
      return
    }

    await CredentialsModel.findByIdAndUpdate(credentials.id, credentialsEntry)
  }

  async getUserMetadata(user: string): Promise<UserMetadataDoc | undefined> {
    await connectMongo()
    const userMetadata = await UserMetadataModel.find({ user: user })
    return userMetadata[0]
  }

  async addUserMetadata(user: string, platform: string): Promise<void> {
    const userMetadataEntry = {
      user: user,
      platform: platform,
    }

    await UserMetadataModel.init()
    await UserMetadataModel.create(new UserMetadataModel(userMetadataEntry))
  }

  async isUserRegistered(user: string, channel: number): Promise<boolean> {
    await connectMongo()
    const userReports = await this.getUserReports(user)
    return userReports !== undefined
      && userReports.channels.filter(x => x.valueOf() == channel)[0] !== undefined
  }

  async updateReports(report: UserReportsDoc, lastMatch: string, lastMatchTimestamp: number): Promise<void> {
    const updatedUserReports = {
      lastMatch: lastMatch,
      lastMatchTimestamp: lastMatchTimestamp,
    }
    await UserReportsModel.findByIdAndUpdate(report.id, updatedUserReports)
  }

  async getReports(): Promise<UserReportsDoc[]> {
    await connectMongo()
    const userReports = await UserReportsModel.find()
    return userReports
  }

  async getUserReports(user: string): Promise<UserReportsDoc | undefined> {
    await connectMongo()
    const userReports = await UserReportsModel.find({ user: user })
    return userReports[0]
  }

  async registerUserReports(user: string, chatId: number): Promise<void> {
    const userReports = await this.getUserReports(user)
    if (userReports === undefined) {
      await UserReportsModel.init()
      await UserReportsModel.create(new UserReportsModel({
        user: user,
        channels: [chatId],
        lastMatch: '',
        lastMatchTimestamp: 0,
      }))
      return
    }

    const updatedUserReports = {
      user: userReports.user,
      channels: [
        ... userReports.channels,
        chatId,
      ],
      lastMatch: userReports.lastMatch,
      lastMatchTimestamp: userReports.lastMatchTimestamp,
    }
    await UserReportsModel.findByIdAndUpdate(userReports.id, updatedUserReports)
  }
}

const dbHandler = new DbHandler()
export { dbHandler }
