'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Database,
  Heart,
  Leaf,
  Flower2,
  TreePine,
  Sun,
  Moon,
  Sparkles,
  Save,
  LogOut,
  Mail,
  Lock,
  Globe,
  Smartphone
} from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({
    health: true,
    feeding: true,
    appointments: true,
    milestones: false
  })

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-background to-blue-50/20 dark:from-emerald-950/20 dark:via-background dark:to-blue-950/10">
        {/* Floating nature elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-emerald-200/20 dark:text-emerald-800/15 animate-pulse">
            <Leaf className="h-8 w-8 transform rotate-12" />
          </div>
          <div className="absolute top-40 right-20 text-blue-200/20 dark:text-blue-800/15 animate-pulse delay-1000">
            <Flower2 className="h-6 w-6 transform -rotate-12" />
          </div>
          <div className="absolute bottom-32 left-1/4 text-green-200/15 dark:text-green-800/10 animate-pulse delay-2000">
            <TreePine className="h-10 w-10" />
          </div>
          <div className="absolute top-60 right-1/3 text-yellow-200/20 dark:text-yellow-800/15 animate-pulse delay-500">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
        
        <div className="relative space-y-6 sm:space-y-8 p-4 sm:p-6 max-w-6xl mx-auto">
          {/* Settings Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100/80 via-green-50/60 to-blue-50/40 dark:from-emerald-950/40 dark:via-green-950/20 dark:to-blue-950/20 border border-emerald-200/50 dark:border-emerald-800/30 p-6 sm:p-8 backdrop-blur-sm">
            {/* Nature pattern overlay */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
              <div className="absolute top-4 left-4 text-emerald-600">
                <Leaf className="h-12 w-12 transform rotate-45" />
              </div>
              <div className="absolute top-8 right-8 text-blue-600">
                <Flower2 className="h-8 w-8 transform -rotate-12" />
              </div>
              <div className="absolute bottom-4 left-12 text-green-600">
                <TreePine className="h-10 w-10" />
              </div>
              <div className="absolute bottom-8 right-16 text-yellow-600">
                <Sun className="h-6 w-6" />
              </div>
            </div>
            
            <div className="relative flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
              <div className="space-y-3">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 border border-emerald-200/50 dark:border-emerald-700/30 shadow-lg">
                    <Settings className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-blue-600 dark:from-emerald-400 dark:via-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                      Settings
                    </h1>
                    <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 font-medium">Customize Your Experience</p>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-emerald-700/80 dark:text-emerald-300/90 max-w-md leading-relaxed">
                  Personalize your experience and manage your account preferences for the best pet care journey.
                </p>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" className="border-emerald-300/50 text-emerald-700 hover:bg-emerald-100/50 dark:border-emerald-700/50 dark:text-emerald-300 dark:hover:bg-emerald-900/20 rounded-2xl">
                  <Heart className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Settings */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50/40 via-pink-50/20 to-orange-50/10 dark:from-rose-950/20 dark:via-pink-950/10 dark:to-orange-950/5 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 opacity-5 dark:opacity-8">
                <div className="absolute top-6 right-6">
                  <Heart className="h-16 w-16 text-rose-500 transform rotate-12" />
                </div>
              </div>
              
              <CardHeader className="relative pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-200 to-pink-200 dark:from-rose-800/50 dark:to-pink-800/50 border border-rose-300/30 dark:border-rose-700/30 shadow-lg">
                    <User className="h-6 w-6 text-rose-700 dark:text-rose-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-rose-800 dark:text-rose-200">Account</CardTitle>
                    <CardDescription className="text-base text-rose-700/70 dark:text-rose-300/80">
                      Manage your profile and security
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-100/50 dark:bg-rose-900/20 border border-rose-200/30 dark:border-rose-800/30">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                      <div>
                        <p className="font-medium text-rose-800 dark:text-rose-200">Email</p>
                        <p className="text-sm text-rose-600/70 dark:text-rose-400/70">{user?.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-rose-700 hover:bg-rose-200/50 dark:text-rose-300 dark:hover:bg-rose-800/30">
                      Edit
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-100/50 dark:bg-rose-900/20 border border-rose-200/30 dark:border-rose-800/30">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                      <div>
                        <p className="font-medium text-rose-800 dark:text-rose-200">Password</p>
                        <p className="text-sm text-rose-600/70 dark:text-rose-400/70">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-rose-700 hover:bg-rose-200/50 dark:text-rose-300 dark:hover:bg-rose-800/30">
                      Change
                    </Button>
                  </div>

                  <div className="pt-2">
                    <Button onClick={handleLogout} variant="outline" className="w-full border-rose-300/50 text-rose-700 hover:bg-rose-100/50 dark:border-rose-700/50 dark:text-rose-300 dark:hover:bg-rose-900/20 rounded-xl">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-sky-50/40 via-blue-50/20 to-indigo-50/10 dark:from-sky-950/20 dark:via-blue-950/10 dark:to-indigo-950/5 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 opacity-5 dark:opacity-8">
                <div className="absolute top-6 right-6">
                  <Palette className="h-16 w-16 text-sky-500 transform -rotate-12" />
                </div>
              </div>
              
              <CardHeader className="relative pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-200 to-blue-200 dark:from-sky-800/50 dark:to-blue-800/50 border border-sky-300/30 dark:border-sky-700/30 shadow-lg">
                    <Palette className="h-6 w-6 text-sky-700 dark:text-sky-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-sky-800 dark:text-sky-200">Preferences</CardTitle>
                    <CardDescription className="text-base text-sky-700/70 dark:text-sky-300/80">
                      Customize your experience
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-sky-100/50 dark:bg-sky-900/20 border border-sky-200/30 dark:border-sky-800/30">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {darkMode ? <Moon className="h-5 w-5 text-sky-600 dark:text-sky-400" /> : <Sun className="h-5 w-5 text-sky-600 dark:text-sky-400" />}
                        <div>
                          <p className="font-medium text-sky-800 dark:text-sky-200">Theme</p>
                          <p className="text-sm text-sky-600/70 dark:text-sky-400/70">{darkMode ? 'Dark mode' : 'Light mode'}</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-sky-700 hover:bg-sky-200/50 dark:text-sky-300 dark:hover:bg-sky-800/30"
                      onClick={() => setDarkMode(!darkMode)}
                    >
                      Toggle
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-sky-100/50 dark:bg-sky-900/20 border border-sky-200/30 dark:border-sky-800/30">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                      <div>
                        <p className="font-medium text-sky-800 dark:text-sky-200">Language</p>
                        <p className="text-sm text-sky-600/70 dark:text-sky-400/70">English (US)</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-sky-700 hover:bg-sky-200/50 dark:text-sky-300 dark:hover:bg-sky-800/30">
                      Change
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50/40 via-green-50/20 to-teal-50/10 dark:from-emerald-950/20 dark:via-green-950/10 dark:to-teal-950/5 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 opacity-5 dark:opacity-8">
                <div className="absolute top-6 right-6">
                  <Bell className="h-16 w-16 text-emerald-500 transform rotate-12" />
                </div>
              </div>
              
              <CardHeader className="relative pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-200 to-green-200 dark:from-emerald-800/50 dark:to-green-800/50 border border-emerald-300/30 dark:border-emerald-700/30 shadow-lg">
                    <Bell className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-emerald-800 dark:text-emerald-200">Notifications</CardTitle>
                    <CardDescription className="text-base text-emerald-700/70 dark:text-emerald-300/80">
                      Stay updated on your pets
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="space-y-3">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-emerald-100/50 dark:bg-emerald-900/20 border border-emerald-200/30 dark:border-emerald-800/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${value ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        <div>
                          <p className="font-medium text-emerald-800 dark:text-emerald-200 capitalize">{key} reminders</p>
                          <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                            {value ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-emerald-700 hover:bg-emerald-200/50 dark:text-emerald-300 dark:hover:bg-emerald-800/30"
                        onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                      >
                        {value ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data & Privacy */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50/40 via-violet-50/20 to-indigo-50/10 dark:from-purple-950/20 dark:via-violet-950/10 dark:to-indigo-950/5 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 opacity-5 dark:opacity-8">
                <div className="absolute top-6 right-6">
                  <Shield className="h-16 w-16 text-purple-500 transform -rotate-12" />
                </div>
              </div>
              
              <CardHeader className="relative pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-200 to-violet-200 dark:from-purple-800/50 dark:to-violet-800/50 border border-purple-300/30 dark:border-purple-700/30 shadow-lg">
                    <Shield className="h-6 w-6 text-purple-700 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-purple-800 dark:text-purple-200">Data & Privacy</CardTitle>
                    <CardDescription className="text-base text-purple-700/70 dark:text-purple-300/80">
                      Control your information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-100/50 dark:bg-purple-900/20 border border-purple-200/30 dark:border-purple-800/30">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="font-medium text-purple-800 dark:text-purple-200">Export Data</p>
                        <p className="text-sm text-purple-600/70 dark:text-purple-400/70">Download all your pet data</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-purple-700 hover:bg-purple-200/50 dark:text-purple-300 dark:hover:bg-purple-800/30">
                      Export
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-100/50 dark:bg-purple-900/20 border border-purple-200/30 dark:border-purple-800/30">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="font-medium text-purple-800 dark:text-purple-200">Data Usage</p>
                        <p className="text-sm text-purple-600/70 dark:text-purple-400/70">View privacy settings</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-purple-700 hover:bg-purple-200/50 dark:text-purple-300 dark:hover:bg-purple-800/30">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Changes Button */}
          <div className="text-center pt-4">
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 rounded-2xl px-8">
              <Save className="h-5 w-5 mr-2" />
              Save All Changes
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}