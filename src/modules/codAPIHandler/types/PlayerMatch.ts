export interface PlayerMatch {
  duration: number
  gameType: string
  map: string
  matchID: string
  mode: string
  player: {
    team: string
    clantag: string
    username: string
  }
  playerCount: number
  playerStats: {
    assists: number
    damageDone: number
    damageTaken: number
    death: number
    distanceTraveled: number
    gulagDeaths: number
    gulagKills: number
    kdRatio: number
    kills: number
    longestStreak: number
    percentTimeMoving: number
    score: number
    scorePerMinute: number
    teamPlacement: number
    teamSurvivalTime: number
  }
  privateMatch: boolean
  teamCount: number
  utcEndSeconds: number
  utcStartSeconds: number
}
