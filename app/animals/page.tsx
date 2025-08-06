'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, PawPrint, Calendar, User, ArrowUpDown, SortAsc, SortDesc, Heart, Fish, Bird, Circle } from 'lucide-react'
import Link from 'next/link'
import { Animal } from '@/types/animal'
import { getAnimals } from '@/lib/firestore'
import { formatDistanceToNow } from 'date-fns'
import { generateUniqueSlug } from '@/lib/utils'

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

  // Function to get species-specific icon
  const getSpeciesIcon = (species: string) => {
    const iconClass = "h-16 w-16 text-blue-400"
    
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
  }, [animals, searchTerm, selectedSpecies, selectedSex, ageFilter, sortBy, sortOrder])

  const uniqueSpecies = Array.from(new Set(animals.map(animal => animal.species)))
  const uniqueSexes = Array.from(new Set(animals.map(animal => animal.sex)))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p>Loading your animals...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg mb-8">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Animals</h1>
            <p className="text-blue-100">
              Manage and track all your animals in one place
            </p>
          </div>
          <div className="mt-4 lg:mt-0 text-center">
            <div className="flex gap-6 mb-4">
              <div>
                <div className="text-2xl font-bold">{animals.length}</div>
                <div className="text-blue-200 text-sm">Total Animals</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{uniqueSpecies.length}</div>
                <div className="text-blue-200 text-sm">Species</div>
              </div>
            </div>
            <Link href="/animals/new">
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                <Plus className="mr-2 h-4 w-4" />
                Add New Animal
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search animals by name, species, breed, or color..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ages</option>
              <option value="young">Young (less than 1 year)</option>
              <option value="adult">Adult (1-7 years)</option>
              <option value="senior">Senior (7+ years)</option>
            </select>

            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="species">Sort by Species</option>
                <option value="age">Sort by Age</option>
                <option value="created">Sort by Date Added</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredAnimals.length} of {animals.length} animals
          </div>
        </CardContent>
      </Card>

      {/* Animals Grid */}
      {filteredAnimals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <PawPrint className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {animals.length === 0 ? 'No Animals Yet' : 'No Results Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {animals.length === 0 
                ? "Start building your animal collection by adding your first animal."
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {animals.length === 0 && (
              <Link href="/animals/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Animal
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAnimals.map((animal) => {
            const slug = generateUniqueSlug(animal.name, animal.id)
            return (
              <Link key={animal.id} href={`/animals/${slug}`} className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative">
                    {animal.profilePicture ? (
                      <img 
                        src={animal.profilePicture} 
                        alt={`${animal.name}'s profile`}
                        className="w-full h-48 object-cover rounded-t-lg group-hover:brightness-105 transition-all"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center group-hover:brightness-105 transition-all">
                        {getSpeciesIcon(animal.species) || <PawPrint className="h-16 w-16 text-blue-400" />}
                      </div>
                    )}
                    {animal.dateOfDeath && (
                      <span className="absolute top-2 right-2 text-xs bg-red-500 text-white px-2 py-1 rounded">
                        Deceased
                      </span>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">{animal.name}</h3>
                    <p className="text-gray-600 mb-3 capitalize">
                      {animal.species.replace('-', ' ')}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span className="capitalize">{animal.sex}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDistanceToNow(animal.dateOfBirth)} old</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg group-hover:bg-blue-700 transition-colors">
                      View Profile
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
        </div>
      )}
    </div>
  )
}