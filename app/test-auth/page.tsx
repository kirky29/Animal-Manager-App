'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuthPage() {
  const { user, loading, signIn, signUp, logout } = useAuth()

  const handleTestSignIn = async () => {
    try {
      await signIn('test@example.com', 'password123')
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const handleTestSignUp = async () => {
    try {
      await signUp('test@example.com', 'password123')
    } catch (error) {
      console.error('Sign up error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Authentication Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? 'Logged In' : 'Not Logged In'}</p>
            {user && (
              <>
                <p><strong>User ID:</strong> {user.uid}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </>
            )}
          </div>
          
          <div className="flex space-x-4">
            {!user ? (
              <>
                <Button onClick={handleTestSignUp}>
                  Test Sign Up
                </Button>
                <Button onClick={handleTestSignIn} variant="outline">
                  Test Sign In
                </Button>
              </>
            ) : (
              <Button onClick={logout} variant="destructive">
                Logout
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Firebase Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not Set'}</p>
            <p><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not Set'}</p>
            <p><strong>Auth Domain:</strong> {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not Set'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 