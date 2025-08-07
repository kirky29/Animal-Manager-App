'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Heart, Calendar, TrendingUp, Users, Activity, Search, Filter, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Animal } from '@/types/animal'
import { getAnimals, getRecentActivityForUser } from '@/lib/firestore'
import { formatDistanceToNow } from 'date-fns'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { generateUniqueSlug } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecies, setSelectedSpecies] = useState('all')
  const [selectedSex, setSelectedSex] = useState('all')
  const [ageFilter, setAgeFilter] = useState('all')
  const [deceasedFilter, setDeceasedFilter] = useState('living')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([])

  // Get unique values for filters
  const uniqueSpecies = animals.reduce((acc, animal) => {
    if (!acc.includes(animal.species)) {
      acc.push(animal.species)
    }
    return acc
  }, [] as string[])

  const uniqueSexes = animals.reduce((acc, animal) => {
    if (!acc.includes(animal.sex)) {
      acc.push(animal.sex)
    }
    return acc
  }, [] as string[])

  // Function to calculate age in days for filtering
  const getAgeInDays = (birthDate: Date) => {
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - birthDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

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
          setFilteredAnimals(userAnimals)
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

  // Filter and sort animals
  useEffect(() => {
    let filtered = animals

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(animal =>
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.color?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by species
    if (selectedSpecies !== 'all') {
      filtered = filtered.filter(animal => animal.species === selectedSpecies)
    }

    // Filter by sex
    if (selectedSex !== 'all') {
      filtered = filtered.filter(animal => animal.sex === selectedSex)
    }

    // Filter by age
    if (ageFilter !== 'all') {
      filtered = filtered.filter(animal => {
        const ageInDays = getAgeInDays(animal.dateOfBirth)
        switch (ageFilter) {
          case 'young':
            return ageInDays < 365
          case 'adult':
            return ageInDays >= 365 && ageInDays < 2555
          case 'senior':
            return ageInDays >= 2555
          default:
            return true
        }
      })
    }

    // Filter by deceased status
    if (deceasedFilter === 'living') {
      filtered = filtered.filter(animal => !animal.dateOfDeath)
    } else if (deceasedFilter === 'deceased') {
      filtered = filtered.filter(animal => animal.dateOfDeath)
    }

    // Sort animals
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'species':
          aValue = a.species.toLowerCase()
          bValue = b.species.toLowerCase()
          break
        case 'age':
          aValue = a.dateOfBirth.getTime()
          bValue = b.dateOfBirth.getTime()
          break
        case 'created':
          aValue = a.createdAt.getTime()
          bValue = b.createdAt.getTime()
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredAnimals(filtered)
  }, [animals, searchTerm, selectedSpecies, selectedSex, ageFilter, deceasedFilter, sortBy, sortOrder])

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
          
          {/* Unified Dashboard Card */}
          <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-2xl">
            
            {/* Stats Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
                  <p className="text-gray-600 dark:text-gray-400">Your animal family at a glance</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
              </div>
              
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
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">{uniqueSpecies.length}</div>
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

            {/* Search and Filter Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search & Filter</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Find and organize your animals</p>
                </div>
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Search className="h-5 w-5 text-white" />
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-6">
                <div className="space-y-6">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search animals by name, species, breed, or color..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  
                  {/* Filters Row */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <select
                        value={selectedSpecies}
                        onChange={(e) => setSelectedSpecies(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="all">All Species</option>
                        {uniqueSpecies.map(species => (
                          <option key={species} value={species}>
                            {species.charAt(0).toUpperCase() + species.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <select
                      value={selectedSex}
                      onChange={(e) => setSelectedSex(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Sexes</option>
                      {uniqueSexes.map(sex => (
                        <option key={sex} value={sex}>
                          {sex.charAt(0).toUpperCase() + sex.slice(1)}
                        </option>
                      ))}
                    </select>

                    <select
                      value={ageFilter}
                      onChange={(e) => setAgeFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Ages</option>
                      <option value="young">Young (less than 1 year)</option>
                      <option value="adult">Adult (1-7 years)</option>
                      <option value="senior">Senior (7+ years)</option>
                    </select>

                    <select
                      value={deceasedFilter}
                      onChange={(e) => setDeceasedFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="living">Living Only</option>
                      <option value="deceased">Deceased Only</option>
                      <option value="all">All Animals</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Animals Grid */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Animals</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredAnimals.length} of {totalAnimals} animals
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="species">Sort by Species</option>
                    <option value="age">Sort by Age</option>
                    <option value="created">Sort by Created</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </div>

              {filteredAnimals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Heart className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {animals.length === 0 ? 'No animals yet' : 'No animals match your filters'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {animals.length === 0 
                      ? 'Start by adding your first animal to the family!'
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                  {animals.length === 0 && (
                    <Link href="/animals/new">
                      <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Animal
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAnimals.map((animal) => (
                    <Link
                      key={animal.id}
                      href={`/animals/${generateUniqueSlug(animal.name, animal.id)}`}
                      className="group"
                    >
                      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group-hover:scale-[1.02]">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <ImageWithFallback
                                src={animal.profilePicture}
                                alt={`${animal.name}'s profile picture`}
                                containerClassName="w-12 h-12 rounded-xl overflow-hidden"
                                fallbackIcon={<Heart className="h-6 w-6 text-gray-400" />}
                                fallbackClassName="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                              />
                              {animal.dateOfDeath && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✝</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {animal.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                {animal.species.replace('-', ' ')}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Age</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {formatDistanceToNow(animal.dateOfBirth, { addSuffix: false })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Sex</span>
                            <span className="text-gray-900 dark:text-white font-medium capitalize">
                              {animal.sex}
                            </span>
                          </div>
                          {animal.breed && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Breed</span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {animal.breed}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
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