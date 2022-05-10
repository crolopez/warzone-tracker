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

function createUserReportEntry(userReports: UserReportsDoc): any {
  return {
    user: userReports.user,
    channels: userReports.channels,
    lastMatch: userReports.lastMatch,
    lastMatchStartTimestamp: userReports.lastMatchStartTimestamp,
    lastMatchEndTimestamp: userReports.lastMatchEndTimestamp,
    sessionReported: userReports.sessionReported,
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

  async updateReports(report: UserReportsDoc, lastMatch: string, startTime: number, endTime: number): Promise<void> {
    const updatedUserReports = {
      lastMatch: lastMatch,
      lastMatchStartTimestamp: startTime,
      lastMatchEndTimestamp: endTime,
      sessionReported: false,
    }
    await UserReportsModel.findByIdAndUpdate(report.id, updatedUserReports)
  }

  async updateSessionReport(user: string): Promise<void> {
    const userReport = await this.getUserReports(user)

    if (userReport == undefined) {
      console.error('Unexpected error trying to update the session report')
      return
    }

    await UserReportsModel.findByIdAndUpdate(userReport.id, {
      ... createUserReportEntry(userReport),
      sessionReported: true,
    })
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
        lastMatchStartTimestamp: 0,
        lastMatchEndTimestamp: 0,
        sessionReported: false,
      }))
      return
    }

    await UserReportsModel.findByIdAndUpdate(userReports.id, {
      ... createUserReportEntry(userReports),
      channels: [
        ... userReports.channels,
        chatId,
      ],
    })
  }
}

const dbHandler = new DbHandler()
export { dbHandler }
