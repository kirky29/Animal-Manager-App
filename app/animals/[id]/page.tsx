'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Heart, 
  Calendar, 
  Weight, 
  Ruler, 
  FileText, 
  MapPin, 
  Tag, 
  User, 
  Clock,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { Animal, WeightRecord, HeightRecord, MedicalRecord } from '@/types/animal'
import { getAnimal, getWeightRecords, getHeightRecords, getMedicalRecords, deleteAnimal } from '@/lib/firestore'
import { format, formatDistanceToNow, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'

export default function AnimalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const animalId = params.id as string

  const [animal, setAnimal] = useState<Animal | null>(null)
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([])
  const [heightRecords, setHeightRecords] = useState<HeightRecord[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching animal data for ID:', animalId)
      console.log('Current user:', user?.uid)
      
      try {
        const [animalData, weights, heights, medical] = await Promise.all([
          getAnimal(animalId),
          getWeightRecords(animalId),
          getHeightRecords(animalId),
          getMedicalRecords(animalId)
        ])

        console.log('Animal data fetched:', animalData)

        if (!animalData) {
          console.log('No animal found, redirecting to /animals')
          router.push('/animals')
          return
        }

        // Check if the animal belongs to the current user
        if (animalData.ownerId !== user?.uid) {
          console.log('Animal does not belong to user, redirecting to /animals')
          router.push('/animals')
          return
        }

        setAnimal(animalData)
        setWeightRecords(weights)
        setHeightRecords(heights)
        setMedicalRecords(medical)
      } catch (error) {
        console.error('Error fetching animal data:', error)
        router.push('/animals')
      } finally {
        setLoading(false)
      }
    }

    if (user && animalId) {
      fetchData()
    } else {
      console.log('No user or animalId, setting loading to false')
      setLoading(false)
    }
  }, [user, animalId, router])

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

  const getAgeDetails = (birthDate: Date) => {
    const years = differenceInYears(new Date(), birthDate)
    const months = differenceInMonths(new Date(), birthDate) % 12
    const days = differenceInDays(new Date(), birthDate) % 30

    if (years > 0) {
      return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? `, ${months} month${months !== 1 ? 's' : ''}` : ''}`
    } else if (months > 0) {
      return `${months} month${months !== 1 ? 's' : ''}${days > 0 ? `, ${days} day${days !== 1 ? 's' : ''}` : ''}`
    } else {
      return `${days} day${days !== 1 ? 's' : ''}`
    }
  }

  const getLatestWeight = () => {
    if (weightRecords.length === 0) return null
    return weightRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  }

  const getLatestHeight = () => {
    if (heightRecords.length === 0) return null
    return heightRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  }

  const getRecentMedicalRecords = () => {
    return medicalRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Heart className="h-8 w-8 text-primary mx-auto mb-2 animate-pulse" />
          <p>Loading animal details...</p>
        </div>
      </div>
    )
  }

  if (!animal) {
    return null
  }

  const latestWeight = getLatestWeight()
  const latestHeight = getLatestHeight()
  const recentMedical = getRecentMedicalRecords()

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
              <ImageWithFallback
                src={animal.profilePicture}
                alt={`${animal.name}'s profile picture`}
                containerClassName="w-48 h-48 lg:w-64 lg:h-64 rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl"
                fallbackIcon={<Heart className="h-24 w-24 text-white/60" />}
                fallbackClassName="w-48 h-48 lg:w-64 lg:h-64 rounded-2xl bg-white/20 border-4 border-white/30 shadow-2xl flex items-center justify-center"
              />
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
                  <Clock className="h-4 w-4" />
                  <span>{getAgeDetails(animal.dateOfBirth)}</span>
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
          {/* Left Column - Basic Info & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {animal.microchipNumber && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Microchip</p>
                        <p className="text-sm text-gray-600">{animal.microchipNumber}</p>
                      </div>
                    </div>
                  )}
                  {animal.registrationNumber && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Star className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Registration</p>
                        <p className="text-sm text-gray-600">{animal.registrationNumber}</p>
                      </div>
                    </div>
                  )}
                  {animal.markings && (
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Markings & Features</p>
                        <p className="text-sm text-gray-600">{animal.markings}</p>
                      </div>
                    </div>
                  )}
                  {animal.notes && (
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Notes</p>
                        <p className="text-sm text-gray-600">{animal.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Common tasks for {animal.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
                    <Weight className="h-5 w-5" />
                    <span className="text-xs">Add Weight</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
                    <Ruler className="h-5 w-5" />
                    <span className="text-xs">Add Height</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
                    <FileText className="h-5 w-5" />
                    <span className="text-xs">Add Medical</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
                    <Calendar className="h-5 w-5" />
                    <span className="text-xs">Add Event</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Records & Statistics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Weight className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Current Weight</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {latestWeight ? `${latestWeight.weight} ${latestWeight.unit}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Ruler className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700">Current Height</p>
                      <p className="text-2xl font-bold text-green-900">
                        {latestHeight ? `${latestHeight.height} ${latestHeight.unit}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-700">Medical Records</p>
                      <p className="text-2xl font-bold text-purple-900">{medicalRecords.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Records Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weight Records */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Weight className="h-5 w-5 text-blue-500" />
                    <span>Weight History</span>
                  </CardTitle>
                  <CardDescription>
                    {weightRecords.length} record{weightRecords.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {weightRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <Weight className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No weight records yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {weightRecords
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map((record) => (
                          <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">{record.weight} {record.unit}</span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {format(record.date, 'MMM d, yyyy')}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <Weight className="h-4 w-4 mr-2" />
                    Add Weight Record
                  </Button>
                </CardContent>
              </Card>

              {/* Height Records */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Ruler className="h-5 w-5 text-green-500" />
                    <span>Height History</span>
                  </CardTitle>
                  <CardDescription>
                    {heightRecords.length} record{heightRecords.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {heightRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <Ruler className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No height records yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {heightRecords
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map((record) => (
                          <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span className="font-medium">{record.height} {record.unit}</span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {format(record.date, 'MMM d, yyyy')}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <Ruler className="h-4 w-4 mr-2" />
                    Add Height Record
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Medical Records */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <span>Recent Medical Records</span>
                </CardTitle>
                <CardDescription>
                  Latest medical events and treatments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {medicalRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No medical records yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentMedical.map((record) => (
                      <div key={record.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                                 <div className="flex-shrink-0">
                           {record.type === 'vaccination' && (
                             <CheckCircle className="h-5 w-5 text-green-500" />
                           )}
                           {record.type === 'surgery' && (
                             <AlertCircle className="h-5 w-5 text-red-500" />
                           )}
                           {record.type === 'checkup' && (
                             <Activity className="h-5 w-5 text-blue-500" />
                           )}
                           {record.type === 'treatment' && (
                             <FileText className="h-5 w-5 text-purple-500" />
                           )}
                           {record.type === 'medication' && (
                             <FileText className="h-5 w-5 text-orange-500" />
                           )}
                           {record.type === 'other' && (
                             <FileText className="h-5 w-5 text-gray-500" />
                           )}
                         </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{record.title}</h4>
                          <p className="text-sm text-gray-600 capitalize">
                            {record.type} • {format(record.date, 'MMM d, yyyy')}
                          </p>
                          {record.description && (
                            <p className="text-sm text-gray-500 mt-1">{record.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Medical Record
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}