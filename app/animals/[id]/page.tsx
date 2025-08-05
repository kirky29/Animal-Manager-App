'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Trash2, Heart, Calendar, User, Tag } from 'lucide-react'
import Link from 'next/link'
import { Animal } from '@/types/animal'
import { getAnimal, deleteAnimal } from '@/lib/firestore'
import { format, formatDistanceToNow } from 'date-fns'

export default function AnimalProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const animalId = params.id as string

  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const loadAnimal = async () => {
      if (!user || !animalId) {
        setLoading(false)
        return
      }

      try {
        const animalData = await getAnimal(animalId)
        
        if (!animalData) {
          setError('Animal not found')
          setLoading(false)
          return
        }

        // Check ownership
        if (animalData.ownerId !== user.uid) {
          setError('You do not have permission to view this animal')
          setLoading(false)
          return
        }

        setAnimal(animalData)
        setLoading(false)
      } catch (err) {
        console.error('Error loading animal:', err)
        setError('Failed to load animal data')
        setLoading(false)
      }
    }

    loadAnimal()
  }, [user, animalId])

  const handleDelete = async () => {
    if (!animal || !confirm(`Are you sure you want to delete ${animal.name}? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      await deleteAnimal(animal.id)
      router.push('/animals')
    } catch (error) {
      console.error('Error deleting animal:', error)
      alert('Failed to delete animal. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <Heart className="h-8 w-8 text-primary mx-auto mb-2 animate-pulse" />
          <p>Loading animal profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/animals">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Animals
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!animal) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Animal Not Found</h3>
            <p className="text-muted-foreground mb-4">The requested animal could not be found.</p>
            <Link href="/animals">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Animals
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <Link href="/animals">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Animals
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Link href={`/animals/${animal.id}/edit`}>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-8 lg:space-y-0 lg:space-x-12">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {animal.profilePicture ? (
                <img 
                  src={animal.profilePicture} 
                  alt={`${animal.name}'s profile picture`}
                  className="w-48 h-48 lg:w-64 lg:h-64 rounded-2xl object-cover border-4 border-white/30 shadow-2xl"
                />
              ) : (
                <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-2xl bg-white/20 border-4 border-white/30 shadow-2xl flex items-center justify-center">
                  <Heart className="h-24 w-24 text-white/60" />
                </div>
              )}
            </div>

            {/* Hero Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium capitalize">
                  {animal.species.replace('-', ' ')}
                </span>
                {animal.breed && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {animal.breed}
                  </span>
                )}
                {animal.dateOfDeath && (
                  <span className="px-3 py-1 bg-red-500/80 rounded-full text-sm font-medium">
                    Deceased
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-4">{animal.name}</h1>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <User className="h-4 w-4" />
                  <span className="capitalize">{animal.sex}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(animal.dateOfBirth, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDistanceToNow(animal.dateOfBirth, { addSuffix: false })}</span>
                </div>
                {animal.color && (
                  <div className="flex items-center justify-center lg:justify-start space-x-2">
                    <Tag className="h-4 w-4" />
                    <span>{animal.color}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {animal.microchipNumber && (
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <Tag className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Microchip</p>
                        <p className="text-sm text-gray-600">{animal.microchipNumber}</p>
                      </div>
                    </div>
                  )}
                  {animal.registrationNumber && (
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <Tag className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Registration</p>
                        <p className="text-sm text-gray-600">{animal.registrationNumber}</p>
                      </div>
                    </div>
                  )}
                  {animal.dateOfDeath && (
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Date of Death</p>
                        <p className="text-sm text-gray-600">{format(animal.dateOfDeath, 'MMMM d, yyyy')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Age & Birth Info */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span>Age & Birth</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                    <p className="text-sm font-medium text-gray-600 mb-1">Current Age</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {formatDistanceToNow(animal.dateOfBirth, { addSuffix: false })}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">Born</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {format(animal.dateOfBirth, 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Additional Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Markings & Features */}
            {animal.markings && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Tag className="h-5 w-5 text-purple-500" />
                    <span>Markings & Distinctive Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <p className="text-gray-700 leading-relaxed">{animal.markings}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {animal.notes && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Edit className="h-5 w-5 text-green-500" />
                    <span>Additional Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                    <p className="text-gray-700 leading-relaxed">{animal.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <span>Quick Facts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl">
                    <User className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Sex</p>
                    <p className="text-lg font-semibold text-gray-800 capitalize">{animal.sex}</p>
                  </div>
                  {animal.color && (
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl">
                      <Tag className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Color</p>
                      <p className="text-lg font-semibold text-gray-800">{animal.color}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}