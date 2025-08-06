'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Trash2, Heart, Calendar, User, Tag, Plus, Activity, History, TrendingUp, Image } from 'lucide-react'
import Link from 'next/link'
import { Animal, HealthUpdate } from '@/types/animal'
import { getAnimal, deleteAnimal } from '@/lib/firestore'
import { format, formatDistanceToNow } from 'date-fns'
import { HealthUpdateForm } from '@/components/health-update-form'
import { UnifiedActivityTimeline } from '@/components/unified-activity-timeline'
import { WeightChart } from '@/components/weight-chart'
import { RecentActivity } from '@/components/recent-activity'
import { AnimalMediaTab } from '@/components/animal-media-tab'

export default function AnimalProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const animalId = params.id as string

  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'weight' | 'media'>('overview')
  const [showHealthForm, setShowHealthForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

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
      <div className="min-h-[60vh] bg-gradient-to-br from-emerald-50/30 via-gray-50 to-green-50/20 dark:from-emerald-950/10 dark:via-gray-900 dark:to-green-950/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loading Profile</h3>
            <p className="text-gray-600 dark:text-gray-400">Getting animal information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-gray-50 to-green-50/20 dark:from-emerald-950/10 dark:via-gray-900 dark:to-green-950/10">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg shadow-sm">
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Error</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Link href="/animals">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Animals
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleHealthUpdateSuccess = (healthUpdate: HealthUpdate) => {
    setShowHealthForm(false)
    setRefreshTrigger(prev => prev + 1)
    // Switch to activity timeline to show the new record
    setActiveTab('activity')
    // Optionally show a success message
    console.log('Health update added successfully:', healthUpdate)
  }

  const handleMediaDeleted = () => {
    // Refresh both the media tab and timeline when media is deleted
    setRefreshTrigger(prev => prev + 1)
    console.log('Media deleted, refreshing components')
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Heart className="h-4 w-4" /> },
    { id: 'activity', label: 'Activity Timeline', icon: <Activity className="h-4 w-4" /> },
    { id: 'weight', label: 'Weight Tracking', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'media', label: 'Media', icon: <Image className="h-4 w-4" /> },
  ] as const

  if (!animal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-gray-50 to-green-50/20 dark:from-emerald-950/10 dark:via-gray-900 dark:to-green-950/10">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Animal Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">The requested animal could not be found.</p>
              <Link href="/animals">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Animals
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-gray-50 to-green-50/20 dark:from-emerald-950/10 dark:via-gray-900 dark:to-green-950/10">
      {/* Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/animals">
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Animals
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setShowHealthForm(true)}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Health Update
              </Button>
              <Link href={`/animals/${animal.id}/edit`}>
                <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-emerald-300 hover:text-emerald-600">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {animal.profilePicture ? (
                <img 
                  src={animal.profilePicture} 
                  alt={`${animal.name}'s profile picture`}
                  className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-2xl object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-gray-700 dark:to-gray-600 border-4 border-white dark:border-gray-700 shadow-lg flex items-center justify-center">
                  <Heart className="h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32 text-emerald-400 dark:text-gray-400" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                  {animal.species.replace('-', ' ')}
                </span>
                {animal.breed && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {animal.breed}
                  </span>
                )}
                {animal.dateOfDeath ? (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                    Deceased
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    Active
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                {animal.name}
              </h1>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Sex</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{animal.sex}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Age</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDistanceToNow(animal.dateOfBirth, { addSuffix: false })}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Born</p>
                  <p className="font-medium text-gray-900 dark:text-white">{format(animal.dateOfBirth, 'MMM d, yyyy')}</p>
                </div>
                {animal.color && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Color</p>
                    <p className="font-medium text-gray-900 dark:text-white">{animal.color}</p>
                  </div>
                )}
                {animal.weight && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Weight</p>
                    <p className="font-medium text-gray-900 dark:text-white">{animal.weight} {animal.weightUnit}</p>
                  </div>
                )}
                {animal.height && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Height</p>
                    <p className="font-medium text-gray-900 dark:text-white">{animal.height} {animal.heightUnit}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>



        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 mb-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Health Update Form Modal */}
        {showHealthForm && (
          <div className="mb-6">
            <HealthUpdateForm
              animalId={animal.id}
              animalName={animal.name}
              onSuccess={handleHealthUpdateSuccess}
              onCancel={() => setShowHealthForm(false)}
            />
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Recent Activity */}
              <RecentActivity
                animalId={animal.id}
                animalName={animal.name}
                refreshTrigger={refreshTrigger}
                onViewAll={() => setActiveTab('activity')}
              />

              {/* Original content goes here - Details Grid and Additional Information */}
              {(animal.microchipNumber || animal.registrationNumber || animal.dateOfDeath) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Tag className="h-5 w-5 text-emerald-600 mr-2" />
                      Information
                    </h3>
                    <div className="space-y-3">
                      {animal.microchipNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Microchip</span>
                          <span className="font-medium text-gray-900 dark:text-white font-mono text-sm">{animal.microchipNumber}</span>
                        </div>
                      )}
                      {animal.registrationNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Registration</span>
                          <span className="font-medium text-gray-900 dark:text-white font-mono text-sm">{animal.registrationNumber}</span>
                        </div>
                      )}
                      {animal.dateOfDeath && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Date of Death</span>
                          <span className="font-medium text-gray-900 dark:text-white">{format(animal.dateOfDeath, 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {(animal.markings || animal.notes) && (
                <div className="space-y-4">
                  {animal.markings && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Tag className="h-5 w-5 text-teal-600 mr-2" />
                        Markings & Features
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{animal.markings}</p>
                    </div>
                  )}

                  {animal.notes && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Edit className="h-5 w-5 text-green-600 mr-2" />
                        Additional Notes
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{animal.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'activity' && (
            <UnifiedActivityTimeline
              animalId={animal.id}
              animalName={animal.name}
              refreshTrigger={refreshTrigger}
              onMediaDeleted={handleMediaDeleted}
            />
          )}

          {activeTab === 'weight' && (
            <WeightChart
              animalId={animal.id}
              animalName={animal.name}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === 'media' && (
            <AnimalMediaTab
              animalId={animal.id}
              animalName={animal.name}
              refreshTrigger={refreshTrigger}
              onMediaDeleted={handleMediaDeleted}
            />
          )}
        </div>
      </div>
    </div>
  )
}