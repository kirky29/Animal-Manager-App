'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Heart, Calendar, Zap, TrendingUp, Users, Activity, Leaf, Flower2, TreePine, Sparkles, Sun, Moon, ArrowRight, Eye, Ruler, Weight } from 'lucide-react'
import Link from 'next/link'
import { Animal } from '@/types/animal'
import { getAnimals, getRecentActivityForUser } from '@/lib/firestore'
import { formatDistanceToNow } from 'date-fns'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { DashboardSearch } from '@/components/dashboard-search'
import { generateUniqueSlug } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          console.log('Fetching data for user:', user.uid)
          
          // Fetch animals and recent activity in parallel
          const [userAnimals, activity] = await Promise.all([
            getAnimals(user.uid),
            getRecentActivityForUser(user.uid, 5)
          ])
          
          console.log('Fetched animals:', userAnimals)
          console.log('Fetched activity:', activity)
          
          setAnimals(userAnimals)
          setRecentActivity(activity)
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 border-b-2 border-emerald-600 rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loading Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-400">Gathering your animal data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalAnimals = animals.length
  const livingAnimals = animals.filter(animal => !animal.dateOfDeath).length
  const recentlyAdded = animals.filter(animal => {
    const daysSinceAdded = (Date.now() - animal.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceAdded <= 7
  }).length

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Modern Header */}
      <header className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="w-full px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {user?.email}</p>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/animals/new">
                <Button 
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Animal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 lg:px-8 pb-12">
        
        {/* Stats Hero Section */}
        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 mb-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Animals Card */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalAnimals}</div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Total Animals</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{livingAnimals} currently living</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Recently Added Card */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{recentlyAdded}</div>
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">Recently Added</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">In the last 7 days</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Species Card */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {new Set(animals.map(animal => animal.species)).size}
                  </div>
                  <div className="text-sm text-teal-600 dark:text-teal-400 font-medium">Species</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Different species</span>
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Search Section */}
        <div className="mb-8">
          <DashboardSearch />
        </div>

        {/* Recent Animals Section */}
        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-2xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Animals</h2>
              <p className="text-gray-600 dark:text-gray-400">Your most recent and active animals</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
          </div>

          {animals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No animals yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Start building your animal family by adding your first pet. Track their health, activities, and create lasting memories.
              </p>
              <Link href="/animals/new">
                <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Animal
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {animals
                .sort(() => Math.random() - 0.5)
                .slice(0, 5)
                .map((animal, index) => {
                  const slug = generateUniqueSlug(animal.name, animal.id)
                  return (
                                         <Link
                       key={animal.id}
                       href={`/animals/${slug}`}
                       className="block group"
                     >
                       <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group-hover:scale-[1.02]">
                         <div className="flex flex-col items-center text-center space-y-4">
                           <div className="relative">
                             <div className="w-48 h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 shadow-lg">
                               {animal.profilePicture ? (
                                 <img
                                   src={animal.profilePicture}
                                   alt={animal.name}
                                   className="w-full h-full object-cover object-center scale-110"
                                 />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center">
                                   <Heart className="h-8 w-8 text-emerald-500" />
                                 </div>
                               )}
                             </div>
                           </div>
                           <div>
                             <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-lg">
                               {animal.name}
                             </h3>
                           </div>
                         </div>
                       </div>
                     </Link>
                  )
                })}
            </div>
          )}

          {animals.length > 5 && (
            <div className="mt-8 text-center">
              <Link href="/animals">
                <Button 
                  variant="outline" 
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  View All Animals
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
              <p className="text-gray-600 dark:text-gray-400">Latest updates from all your animals</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No recent activity</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Activity will appear here when you add health updates or make changes to your animals.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <Link
                  key={`${activity.type}-${activity.id}-${index}`}
                  href={`/animals/${generateUniqueSlug(activity.animalName || 'animal', activity.animalId)}`}
                  className="block group"
                >
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group-hover:scale-[1.02]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <div className={`p-3 rounded-xl shadow-lg ${
                            activity.type === 'health_update' 
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                              : 'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}>
                            {activity.type === 'health_update' ? (
                              <Heart className="h-5 w-5 text-white" />
                            ) : (
                              <Activity className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {activity.animalName}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              activity.type === 'health_update' 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' 
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            }`}>
                              {activity.type === 'health_update' ? 'Health Update' : 'System Update'}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                            {activity.type === 'health_update' 
                              ? activity.title 
                              : activity.summary
                            }
                          </p>
                          {activity.type === 'health_update' && activity.description && (
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                              {activity.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(activity.timestamp)} ago
                            </span>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}