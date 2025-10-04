import type { LoginCredentials, LoginResponse } from '../types/auth.types'

const API_URL = 'https://dummyjson.com/auth'

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error en la autenticación')
      }

      const data: LoginResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido al intentar iniciar sesión')
    }
  }

  static saveToken(accessToken: string): void {
    localStorage.setItem('authToken', accessToken)
  }

  static getToken(): string | null {
    return localStorage.getItem('authToken')
  }

  static saveUser(user: LoginResponse): void {
    localStorage.setItem('userData', JSON.stringify(user))
  }

  static getUser(): LoginResponse | null {
    const userData = localStorage.getItem('userData')
    return userData ? JSON.parse(userData) : null
  }

  static logout(): void {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
  }
}