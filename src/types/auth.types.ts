export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  user: LoginResponse | null
  accessToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}