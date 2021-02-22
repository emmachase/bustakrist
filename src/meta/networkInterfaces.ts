export interface AuthResponse {
  user: string
  bal: number
  token: string
  friends: string[]
}

export interface BalanceResponse {
  user: string
  bal: number
}

export interface ProfileResponse {
  joined: number
  balance: number
  netBase: number
  allTimeLow: number
  allTimeHigh: number
  gamesPlayed: number
  totalWagered: number
}

export interface ProfileBetsResponse {
  entities: {
    id: number
    game: number
    newBalance: number
    bet: number
    busted: number
    cashout?: number
    timestamp: number
  }[]
  more: boolean
}
