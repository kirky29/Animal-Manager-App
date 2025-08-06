'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Heart, Menu, X, Plus, User, LogOut, Settings, Bug, TestTube, ChevronDown, Leaf } from 'lucide-react'

export function Navigation() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setIsDropdownOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  if (!user) {
    return (
      <nav className="border-b border-emerald-200/30 bg-gradient-to-r from-emerald-50/80 via-background to-blue-50/60 backdrop-blur supports-[backdrop-filter]:bg-emerald-50/60 dark:from-emerald-950/40 dark:via-background dark:to-blue-950/30 relative z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 border border-emerald-200/50 dark:border-emerald-700/30 shadow-sm">
                <Heart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">Animal Manager</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-emerald-700 hover:bg-emerald-100/50 dark:text-emerald-300 dark:hover:bg-emerald-900/20">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b border-emerald-200/30 bg-gradient-to-r from-emerald-50/80 via-background to-blue-50/60 backdrop-blur supports-[backdrop-filter]:bg-emerald-50/60 dark:from-emerald-950/40 dark:via-background dark:to-blue-950/30 relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 border border-emerald-200/50 dark:border-emerald-700/30 shadow-sm">
              <Heart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">Animal Manager</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/animals" className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-400 transition-colors">
              My Animals
            </Link>
            
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 text-emerald-700 hover:bg-emerald-100/50 dark:text-emerald-300 dark:hover:bg-emerald-900/20 rounded-xl px-3 py-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-200 to-green-200 dark:from-emerald-800 to-green-800 flex items-center justify-center border border-emerald-300/50 dark:border-emerald-700/50">
                    <User className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <span className="font-medium">{getUserDisplayName()}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </Button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-emerald-500/10 border border-emerald-200/50 dark:border-emerald-800/50 py-2 z-[9999] backdrop-blur-sm">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-emerald-100/50 dark:border-emerald-800/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-200 to-green-200 dark:from-emerald-800 to-green-800 flex items-center justify-center border border-emerald-300/50 dark:border-emerald-700/50">
                        <User className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-800 dark:text-emerald-200">{getUserDisplayName()}</p>
                        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link 
                      href="/settings" 
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">Settings</span>
                    </Link>
                    
                    <Link 
                      href="/debug" 
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Bug className="h-4 w-4" />
                      <span className="font-medium">Debug</span>
                    </Link>
                    
                    <Link 
                      href="/test-auth" 
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <TestTube className="h-4 w-4" />
                      <span className="font-medium">Test Auth</span>
                    </Link>

                    <div className="border-t border-emerald-100/50 dark:border-emerald-800/50 my-2"></div>
                    
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-emerald-700 hover:bg-emerald-100/50 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-emerald-200/30 dark:border-emerald-800/30 py-4">
            <div className="flex flex-col space-y-3">
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-400 transition-colors px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/animals"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-400 transition-colors px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                My Animals
              </Link>
              
              {/* User Section in Mobile */}
              <div className="pt-4 border-t border-emerald-200/30 dark:border-emerald-800/30">
                <div className="flex items-center space-x-3 px-2 py-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-200 to-green-200 dark:from-emerald-800 to-green-800 flex items-center justify-center border border-emerald-300/50 dark:border-emerald-700/50">
                    <User className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-200">{getUserDisplayName()}</p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Link
                    href="/settings"
                    className="flex items-center space-x-3 text-sm font-medium text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-400 transition-colors px-2 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="/debug"
                    className="flex items-center space-x-3 text-sm font-medium text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-400 transition-colors px-2 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Bug className="h-4 w-4" />
                    <span>Debug</span>
                  </Link>
                  <Link
                    href="/test-auth"
                    className="flex items-center space-x-3 text-sm font-medium text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-400 transition-colors px-2 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <TestTube className="h-4 w-4" />
                    <span>Test Auth</span>
                  </Link>
                  
                  <div className="border-t border-emerald-200/30 dark:border-emerald-800/30 my-2"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 text-sm font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 transition-colors px-2 py-2 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}