'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@/types'
import { verifyToken } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isWebMode: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWebMode, setIsWebMode] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Проверяем, есть ли токен в localStorage
        const token = localStorage.getItem('auth_token')
        const savedUser = localStorage.getItem('user')

        if (token && savedUser) {
          // Проверяем валидность токена
          const tokenUser = verifyToken(token)
          if (tokenUser) {
            setUser(JSON.parse(savedUser))
            setIsWebMode(true)
          } else {
            // Токен недействителен, очищаем
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
          }
        } else {
          // Проверяем, есть ли Telegram WebApp
          if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            // Telegram режим
            setIsWebMode(false)
          } else {
            // Веб режим без авторизации - перенаправляем на логин
            setIsWebMode(true)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Очищаем недействительные данные
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        setIsWebMode(true)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = (userData: User, token: string) => {
    setUser(userData)
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsWebMode(true)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const value = {
    user,
    isLoading,
    isWebMode,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
