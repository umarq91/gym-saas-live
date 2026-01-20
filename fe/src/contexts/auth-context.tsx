"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Gym, AuthResponse } from '@/types'
import { apiClient } from '@/lib/api'

interface AuthContextType {
  user: User | null
  gym: Gym | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [gym, setGym] = useState<Gym | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('gym-saas-token')
    const storedUser = localStorage.getItem('gym-saas-user')
    const storedGym = localStorage.getItem('gym-saas-gym')

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        if (storedGym) {
          setGym(JSON.parse(storedGym))
        }
        apiClient.setToken(storedToken)
      } catch (error) {
        console.error('Error parsing stored auth data:', error)
        logout()
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await apiClient.login({ email, password })
      
      setUser(response.user)
      setGym(response.gym || null)
      setToken(response.token)
      
      localStorage.setItem('gym-saas-token', response.token)
      localStorage.setItem('gym-saas-user', JSON.stringify(response.user))
      if (response.gym) {
        localStorage.setItem('gym-saas-gym', JSON.stringify(response.gym))
      }
      
      apiClient.setToken(response.token)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setGym(null)
    setToken(null)
    localStorage.removeItem('gym-saas-token')
    localStorage.removeItem('gym-saas-user')
    localStorage.removeItem('gym-saas-gym')
  }

  const isAuthenticated = !!user && !!token

  return (
    <AuthContext.Provider
      value={{
        user,
        gym,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
