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
