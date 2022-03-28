import axios from 'axios'
import { TitleIdentity } from './types/TitleIdentity'

const codApi = 'https://my.callofduty.com/api/papi-client'

function getHeaders(ssoToken: string) {
  return {
    'content-type': 'application/json',
    'ACT_SSO_COOKIE': ssoToken,
    'atvi-auth': ssoToken,
  }
}

async function sendRequest(ssoToken:string, route: string): Promise<any> {
  const { data } = await axios.post(`${codApi}${route}`, {},
    {
      headers: getHeaders(ssoToken),
    })

  if (data.status !== 'success') {
    console.log(`Request failed: ${data.data.message}'`)
    throw new Error(data.data.message)
  }

  return data.data
}

class CoDAPIHandler {
  async IsValidSSO(allowedUser: string, ssoToken: string): Promise<boolean> {
    const { titleIdentities } = await sendRequest(ssoToken, '/crm/cod/v2/identities')

    const userEntries: TitleIdentity[] = titleIdentities.filter((x: TitleIdentity) => x.username == allowedUser)
    return userEntries.length > 0
  }
}

const codAPIHandler = new CoDAPIHandler()
export { codAPIHandler }
