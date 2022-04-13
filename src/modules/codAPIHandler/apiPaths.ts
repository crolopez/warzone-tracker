export const PlatformVar = '[PLATFORM]'
export const IdTypeVar = '[IDTYPE]'
export const UserTagVar = '[USERTAG]'
export const MatchIdVar = '[MATCHID]'

export const MatchesRequest = '/crm/cod/v2/title/mw/platform/' +
  `${PlatformVar}/${IdTypeVar}/${UserTagVar}/matches/wz/start/0/end/0/details`

export const MatchPlayersRequest = '/crm/cod/v2/title/mw/platform/battle/fullMatch/wz/' +
  `${MatchIdVar}/it`

export const IdentitiesRequest = '/crm/cod/v2/identities'
