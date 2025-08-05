'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Heart, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { Animal } from '@/types/animal'
import { getAnimals } from '@/lib/firestore'
import { formatDistanceToNow, format } from 'date-fns'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'

export default function AnimalsPage() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecies, setSelectedSpecies] = useState('all')

  useEffect(() => {
    const fetchAnimals = async () => {
      console.log('Fetching animals for user:', user?.uid)
      if (user) {
        try {
          const userAnimals = await getAnimals(user.uid)
          console.log('Animals fetched:', userAnimals)
          setAnimals(userAnimals)
          setFilteredAnimals(userAnimals)
        } catch (error) {
          console.error('Error fetching animals:', error)
        } finally {
          setLoading(false)
        }
      } else {
        console.log('No user, setting loading to false')
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
        animal.breed?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by species
    if (selectedSpecies !== 'all') {
      filtered = filtered.filter(animal => animal.species === selectedSpecies)
    }

    setFilteredAnimals(filtered)
  }, [animals, searchTerm, selectedSpecies])

  const uniqueSpecies = Array.from(new Set(animals.map(animal => animal.species)))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Heart className="h-8 w-8 text-primary mx-auto mb-2 animate-pulse" />
          <p>Loading your animals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Animals</h1>
          <p className="text-muted-foreground">
            Manage and track all your animals in one place
          </p>
        </div>
        <Link href="/animals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Animal
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search animals by name, species, or breed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Species</option>
                {uniqueSpecies.map(species => (
                  <option key={species} value={species} className="capitalize">
                    {species.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animals Grid */}
      {filteredAnimals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {animals.length === 0 ? 'No animals yet' : 'No animals match your search'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {animals.length === 0 
                ? 'Start by adding your first animal to track their health and growth.'
                : 'Try adjusting your search terms or filters.'
              }
            </p>
            {animals.length === 0 && (
              <Link href="/animals/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Animal
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map((animal) => (
            <Card key={animal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <ImageWithFallback
                    src={animal.profilePicture}
                    alt={`${animal.name}'s profile picture`}
                    containerClassName="w-12 h-12 rounded-full overflow-hidden"
                    fallbackClassName="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"
                  />
                  {animal.dateOfDeath && (
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                      Deceased
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl">{animal.name}</CardTitle>
                <CardDescription className="capitalize">
                  {animal.species.replace('-', ' ')} {animal.breed && `• ${animal.breed}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sex:</span>
                    <span className="capitalize">{animal.sex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Born:</span>
                    <span>{format(animal.dateOfBirth, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span>
                      {formatDistanceToNow(animal.dateOfBirth, { addSuffix: false })}
                    </span>
                  </div>
                  {animal.color && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color:</span>
                      <span>{animal.color}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link href={`/animals/${animal.id}`}>
                    <Button className="w-full">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}