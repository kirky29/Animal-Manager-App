'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, PawPrint, Calendar, User, ArrowUpDown, SortAsc, SortDesc, Heart, Fish, Bird, Circle, Grid3X3, List, Eye } from 'lucide-react'
import Link from 'next/link'
import { Animal } from '@/types/animal'
import { getAnimals } from '@/lib/firestore'
import { formatDistanceToNow } from 'date-fns'
import { generateUniqueSlug } from '@/lib/utils'
import { AnimalSearchFilter } from '@/components/animal-search-filter'

export default function AnimalsPage() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecies, setSelectedSpecies] = useState('all')
  const [selectedSex, setSelectedSex] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [ageFilter, setAgeFilter] = useState('all')
  const [deceasedFilter, setDeceasedFilter] = useState('living') // Default to showing only living animals
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Function to get species-specific icon
  const getSpeciesIcon = (species: string) => {
    const iconClass = "h-16 w-16 text-emerald-400"
    
    switch (species.toLowerCase()) {
      case 'dog': return <Heart className={iconClass} />
      case 'cat': return <Heart className={iconClass} />
      case 'horse': return <Circle className={iconClass} />
      case 'cow': return <Circle className={iconClass} />
      case 'pig': return <Circle className={iconClass} />
      case 'goat': return <Circle className={iconClass} />
      case 'sheep': return <Circle className={iconClass} />
      case 'chicken': return <Bird className={iconClass} />
      case 'rabbit': return <Circle className={iconClass} />
      case 'llama': return <Circle className={iconClass} />
      case 'alpaca': return <Circle className={iconClass} />
      case 'ferret': return <Circle className={iconClass} />
      case 'parrot': return <Bird className={iconClass} />
      case 'bird-of-prey': return <Bird className={iconClass} />
      default: return null
    }
  }

  // Function to calculate age in days for filtering
  const getAgeInDays = (birthDate: Date) => {
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - birthDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  useEffect(() => {
    const fetchAnimals = async () => {
      if (user) {
        try {
          const userAnimals = await getAnimals(user.uid)
          setAnimals(userAnimals)
          setFilteredAnimals(userAnimals)
        } catch (error) {
          console.error('Error fetching animals:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchAnimals()
  }, [user])

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

  const uniqueSpecies = Array.from(new Set(animals.map(animal => animal.species)))
  const uniqueSexes = Array.from(new Set(animals.map(animal => animal.sex)))

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 border-b-2 border-emerald-600 rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loading Animals</h3>
              <p className="text-gray-600 dark:text-gray-400">Gathering your animal data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Modern Header */}
      <header className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="w-full px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Animals</h1>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{animals.length} Total Animals</span>
                <span>•</span>
                <span>{uniqueSpecies.length} Species</span>
              </div>
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
      <div className="w-full px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filter Card */}
          <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl mb-8">
            <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50">
              <CardTitle className="text-lg text-gray-900 dark:text-white">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
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
                
                <div className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
                  Showing {filteredAnimals.length} of {animals.length} animals
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Animals Display */}
          {filteredAnimals.length === 0 ? (
            <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
              <CardContent className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl mb-4">
                  <PawPrint className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {animals.length === 0 ? 'No Animals Yet' : 'No Results Found'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {animals.length === 0 
                    ? "Start building your animal collection by adding your first animal."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {animals.length === 0 && (
                  <Link href="/animals/new">
                    <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Animal
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {filteredAnimals.map((animal) => {
                const slug = generateUniqueSlug(animal.name, animal.id)
                return (
                  <Link key={animal.id} href={`/animals/${slug}`} className="block">
                    <Card className={`hover:shadow-xl transition-all duration-200 cursor-pointer group border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl ${
                      viewMode === 'list' ? 'flex items-center space-x-4' : 'h-full flex flex-col'
                    }`}>
                      <CardContent className={`p-0 ${viewMode === 'list' ? 'flex items-center w-full' : 'flex flex-col h-full'}`}>
                        {/* Image */}
                        <div className={`relative ${viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'h-48 flex-shrink-0'}`}>
                          {animal.profilePicture ? (
                            <img 
                              src={animal.profilePicture} 
                              alt={`${animal.name}'s profile`}
                              className={`${viewMode === 'list' 
                                ? 'w-24 h-24 object-cover rounded-l-xl' 
                                : 'w-full h-48 object-cover rounded-t-xl'
                              } group-hover:brightness-105 transition-all`}
                            />
                          ) : (
                            <div className={`${viewMode === 'list' 
                              ? 'w-24 h-24 rounded-l-xl' 
                              : 'w-full h-48 rounded-t-xl'
                            } bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 flex items-center justify-center group-hover:brightness-105 transition-all`}>
                              {getSpeciesIcon(animal.species) || <PawPrint className="h-8 w-8 text-emerald-400" />}
                            </div>
                          )}
                          {animal.dateOfDeath && (
                            <span className="absolute top-2 right-2 text-xs bg-red-500 text-white px-2 py-1 rounded-lg">
                              Deceased
                            </span>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className={`${viewMode === 'list' ? 'flex-1 p-4' : 'p-4 flex flex-col flex-1'}`}>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {animal.name}
                            </h3>
                            {viewMode === 'list' && (
                              <Eye className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3 capitalize">
                            {animal.species.replace('-', ' ')}
                          </p>
                          
                          <div className={`grid ${viewMode === 'list' ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4`}>
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              <span className="capitalize">{animal.sex}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{formatDistanceToNow(animal.dateOfBirth)} old</span>
                            </div>
                            {viewMode === 'list' && animal.breed && (
                              <div className="flex items-center">
                                <span className="capitalize">{animal.breed}</span>
                              </div>
                            )}
                          </div>
                          
                          {viewMode === 'grid' && (
                            <div className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-center py-2 px-4 rounded-xl group-hover:from-emerald-700 group-hover:to-emerald-800 transition-all duration-200 font-medium mt-auto">
                              View Profile
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}