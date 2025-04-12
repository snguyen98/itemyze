import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  login as apiLogin,
  logout as apiLogout,
  logoutAll as apiLogoutAll,
  checkAuthStatus,
} from '../services/authService'

interface User {
  id: number
  username: string
  email: string
  // Add other user fields as needed
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a ref to track refresh operations
// Using a module export so it can be imported in authService.ts
export const refreshInProgress = { current: false }

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check auth status on initial render
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await checkAuthStatus()
        setUser(userData)
      } catch (error) {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      await apiLogin(username, password)
      // After successful login, get user data
      const userData = await checkAuthStatus()
      setUser(userData)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)
    try {
      await apiLogout()
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if API logout fails, we should clear the user state
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Logout from all devices
  const logoutAll = async () => {
    setIsLoading(true)
    try {
      await apiLogoutAll()
      setUser(null)
    } catch (error) {
      console.error('Logout all failed:', error)
      // Even if API logout fails, we should clear the user state
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    logoutAll,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
