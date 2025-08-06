'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Heart, Calendar, Zap, TrendingUp, Users, Activity, Leaf, Flower2, TreePine, Sparkles, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import { Animal } from '@/types/animal'
import { getAnimals } from '@/lib/firestore'
import { formatDistanceToNow } from 'date-fns'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'

export default function DashboardPage() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnimals = async () => {
      if (user) {
        try {
          console.log('Fetching animals for user:', user.uid)
          const userAnimals = await getAnimals(user.uid)
          console.log('Fetched animals:', userAnimals)
          setAnimals(userAnimals)
        } catch (error) {
          console.error('Error fetching animals:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchAnimals()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-br from-emerald-50/30 via-gray-50 to-green-50/20 dark:from-emerald-950/10 dark:via-gray-900 dark:to-green-950/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loading Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400">Gathering your animal data...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-gray-50 to-green-50/20 dark:from-emerald-950/10 dark:via-gray-900 dark:to-green-950/10">
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-emerald-200/50 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Welcome back! Here's an overview of your animals.
                </p>
              </div>
              <Link href="/animals/new">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Animal
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Animals Card */}
            <Card className="bg-white dark:bg-gray-800 border border-emerald-200/50 dark:border-gray-700 rounded-lg shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Animals</CardTitle>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                  <Heart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalAnimals}</div>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                  {livingAnimals} currently living
                </p>
              </CardContent>
            </Card>

            {/* Recently Added Card */}
            <Card className="bg-white dark:bg-gray-800 border border-emerald-200/50 dark:border-gray-700 rounded-lg shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Recently Added</CardTitle>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{recentlyAdded}</div>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                  In the last 7 days
                </p>
              </CardContent>
            </Card>

            {/* Species Card */}
            <Card className="bg-white dark:bg-gray-800 border border-emerald-200/50 dark:border-gray-700 rounded-lg shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Species</CardTitle>
                <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-md">
                  <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(animals.map(animal => animal.species)).size}
                </div>
                <p className="text-xs text-teal-600/70 dark:text-teal-400/70 mt-1">
                  Different species
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Animals Section */}
          <Card className="bg-white dark:bg-gray-800 border border-emerald-200/50 dark:border-gray-700 rounded-lg shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">Recent Animals</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Your most recently added animals
                  </CardDescription>
                </div>
                {animals.length > 0 && (
                  <Link href="/animals">
                    <Button variant="outline" size="sm" className="border-emerald-300 dark:border-gray-600 text-emerald-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700">
                      View All
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {animals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No animals yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm mx-auto">
                    Start by adding your first animal to track their health and growth.
                  </p>
                  <Link href="/animals/new">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Animal
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {animals.slice(0, 5).map((animal, index) => (
                    <Link
                      key={animal.id}
                      href={`/animals/${animal.id}`}
                      className="block group"
                    >
                      <div className="flex items-center justify-between p-4 border border-emerald-200/30 dark:border-gray-700 rounded-lg hover:bg-emerald-50/30 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-4">
                          <ImageWithFallback
                            src={animal.profilePicture}
                            alt={`${animal.name}'s profile picture`}
                            containerClassName="w-12 h-12 rounded-full overflow-hidden ring-1 ring-emerald-200/50 dark:ring-gray-600"
                            fallbackClassName="w-12 h-12 bg-emerald-50 dark:bg-gray-700 rounded-full flex items-center justify-center"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {animal.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {animal.species} • {animal.sex}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Added {formatDistanceToNow(animal.createdAt)} ago
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Active</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {animals.length > 5 && (
                    <div className="text-center pt-4">
                      <Link href="/animals">
                        <Button variant="outline" className="border-emerald-300 dark:border-gray-600 text-emerald-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700">
                          View All {animals.length} Animals
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}