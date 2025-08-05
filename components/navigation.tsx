'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Heart, Menu, X, Plus, User, LogOut } from 'lucide-react'

export function Navigation() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) {
    return (
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Animal Manager</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Animal Manager</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
              Dashboard
            </Link>
            <Link href="/animals" className="text-sm font-medium hover:text-primary">
              My Animals
            </Link>
            <Link href="/animals/new" className="flex items-center space-x-1 text-sm font-medium hover:text-primary">
              <Plus className="h-4 w-4" />
              <span>Add Animal</span>
            </Link>
            <Link href="/debug" className="text-sm font-medium hover:text-primary">
              Debug
            </Link>
            <Link href="/test-auth" className="text-sm font-medium hover:text-primary">
              Test Auth
            </Link>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/animals"
                className="text-sm font-medium hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                My Animals
              </Link>
              <Link
                href="/animals/new"
                className="flex items-center space-x-1 text-sm font-medium hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                <Plus className="h-4 w-4" />
                <span>Add Animal</span>
              </Link>
              <Link
                href="/debug"
                className="text-sm font-medium hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Debug
              </Link>
              <Link
                href="/test-auth"
                className="text-sm font-medium hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Test Auth
              </Link>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}