import mongoose from 'mongoose'
import CredentialsModel from '../../models/CredentialsModel'
import { CredentialsDoc } from '../../models/types/CredentialsDoc'
import { UserMetadataDoc } from '../../models/types/UserMetadataDoc'
import UserMetadataModel from '../../models/UserMetadataModel'
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
}

const dbHandler = new DbHandler()
export { dbHandler }
