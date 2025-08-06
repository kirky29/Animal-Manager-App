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
    }, 5000) // Reduced timeout to 5 seconds

    try {
      console.log('AuthProvider: Setting up auth state listener...')
      
      // Check if Firebase auth is available
      if (!auth) {
        console.error('AuthProvider: Firebase auth is not available')
        clearTimeout(timeout)
        setLoading(false)
        setError('Firebase authentication is not available')
        return
      }
      
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
        <div className="text-center bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Animal Manager...</h2>
          <p className="text-sm text-gray-500 mb-4">Initializing Firebase authentication...</p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600">Error: {error}</p>
            </div>
          )}
          <div className="space-y-2">
            <button 
              onClick={() => {
                console.log('Force reload clicked')
                window.location.reload()
              }}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
              Reload if stuck
            </button>
            <button 
              onClick={() => {
                console.log('Continue without auth clicked')
                setLoading(false)
                setError(null)
              }}
              className="block w-full px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Continue without authentication
            </button>
          </div>
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