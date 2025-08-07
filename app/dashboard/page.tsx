'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Heart, Calendar, Zap, TrendingUp, Users, Activity, Leaf, Flower2, TreePine, Sparkles, Sun, Moon, ArrowRight, Eye, Ruler, Weight, Search, Filter, Grid3X3, List, ArrowUpDown, SortAsc, SortDesc, Tag } from 'lucide-react'
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
  const uniqueSpecies = Array.from(new Set(animals.map(animal => animal.species)))
  const uniqueSexes = Array.from(new Set(animals.map(animal => animal.sex)))

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
          case 'young': return ageInDays < 365
          case 'adult': return ageInDays >= 365 && ageInDays < 2555
          case 'senior': return ageInDays >= 2555
          default: return true
        }
      })
    }

    // Filter by deceased status
    if (deceasedFilter !== 'all') {
      filtered = filtered.filter(animal => {
        switch (deceasedFilter) {
          case 'living': return !animal.dateOfDeath
          case 'deceased': return !!animal.dateOfDeath
          default: return true
        }
      })
    }

    // Sort animals
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'species':
          comparison = a.species.localeCompare(b.species)
          break
        case 'age':
          const ageA = getAgeInDays(a.dateOfBirth)
          const ageB = getAgeInDays(b.dateOfBirth)
          comparison = ageA - ageB
          break
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
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

                  <div className="flex items-center space-x-2">
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="species">Sort by Species</option>
                      <option value="age">Sort by Age</option>
                      <option value="created">Sort by Date Added</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {sortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-1 ml-auto">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' 
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' 
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Animals Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {searchTerm || selectedSpecies !== 'all' || selectedSex !== 'all' || ageFilter !== 'all' || deceasedFilter !== 'living' 
                    ? `Filtered Animals (${filteredAnimals.length}/${animals.length})`
                    : 'Featured Animals'
                  }
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {searchTerm || selectedSpecies !== 'all' || selectedSex !== 'all' || ageFilter !== 'all' || deceasedFilter !== 'living'
                    ? `Showing ${filteredAnimals.length} of ${animals.length} animals`
                    : 'Your most recent and active animals'
                  }
                </p>
              </div>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Users className="h-5 w-5 text-white" />
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
          ) : filteredAnimals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/40 dark:to-gray-700/40 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No animals match your filters</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Try adjusting your search terms or filters to see more results.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedSpecies('all')
                  setSelectedSex('all')
                  setAgeFilter('all')
                  setDeceasedFilter('living')
                }}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'list' 
                ? 'grid-cols-1' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
              {(searchTerm || selectedSpecies !== 'all' || selectedSex !== 'all' || ageFilter !== 'all' || deceasedFilter !== 'living' 
                ? filteredAnimals 
                : filteredAnimals.sort(() => Math.random() - 0.5).slice(0, 8)
              ).map((animal, index) => {
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

          {(searchTerm || selectedSpecies !== 'all' || selectedSex !== 'all' || ageFilter !== 'all' || deceasedFilter !== 'living') ? (
            filteredAnimals.length > 0 && (
              <div className="mt-8 text-center">
                <Link href="/animals">
                  <Button 
                    variant="outline" 
                    className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    View in Animals Page
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )
          ) : (
            animals.length > 8 && (
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
            )
          )}
        </div>
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
      </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}