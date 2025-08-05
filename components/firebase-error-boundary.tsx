'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface FirebaseErrorBoundaryProps {
  children: React.ReactNode
}

interface FirebaseErrorBoundaryState {
  hasError: boolean
  error?: Error
  isFirebaseError: boolean
}

export class FirebaseErrorBoundary extends React.Component<
  FirebaseErrorBoundaryProps,
  FirebaseErrorBoundaryState
> {
  constructor(props: FirebaseErrorBoundaryProps) {
    super(props)
    this.state = { 
      hasError: false, 
      isFirebaseError: false 
    }
  }

  static getDerivedStateFromError(error: Error): FirebaseErrorBoundaryState {
    const isFirebaseError = 
      error.message.includes('Firebase') ||
      error.message.includes('firebase') ||
      error.message.includes('auth/') ||
      error.message.includes('firestore') ||
      error.message.includes('storage')

    return { 
      hasError: true, 
      error, 
      isFirebaseError 
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Firebase Error Boundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, isFirebaseError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">
                {this.state.isFirebaseError ? 'Firebase Connection Error' : 'Application Error'}
              </CardTitle>
              <CardDescription>
                {this.state.isFirebaseError
                  ? 'We encountered an issue connecting to Firebase services.'
                  : 'Something went wrong with the application.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.isFirebaseError && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    This might be due to:
                  </p>
                  <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
                    <li>Network connectivity issues</li>
                    <li>Firebase configuration problems</li>
                    <li>Service temporarily unavailable</li>
                  </ul>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Reload Page
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}