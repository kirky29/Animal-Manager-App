'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from './firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('AuthProvider: Starting initialization...')
    
    // Only run on client side
    if (typeof window === 'undefined') {
      console.log('AuthProvider: Server side, skipping auth initialization')
      setLoading(false)
      return
    }

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('AuthProvider: Timeout reached, forcing loading to false')
      setLoading(false)
      setError('Authentication initialization timed out')
    }, 10000) // Increased timeout to 10 seconds

    try {
      console.log('AuthProvider: Setting up auth state listener...')
      
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('AuthProvider: Auth state changed, user:', user ? 'logged in' : 'not logged in')
        clearTimeout(timeout)
        setUser(user)
        setLoading(false)
        setError(null)
      }, (error) => {
        console.error('AuthProvider: Auth state change error:', error)
        clearTimeout(timeout)
        setLoading(false)
        setError(error.message)
      })

      return () => {
        console.log('AuthProvider: Cleaning up auth listener')
        clearTimeout(timeout)
        unsubscribe()
      }
    } catch (error) {
      console.error('AuthProvider: Error setting up auth listener:', error)
      clearTimeout(timeout)
      setLoading(false)
      setError(error instanceof Error ? error.message : 'Unknown error')
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p>Loading Animal Manager...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing Firebase authentication...</p>
          {error && (
            <p className="text-sm text-red-500 mt-2">Error: {error}</p>
          )}
          <button 
            onClick={() => {
              console.log('Force reload clicked')
              window.location.reload()
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload if stuck
          </button>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}