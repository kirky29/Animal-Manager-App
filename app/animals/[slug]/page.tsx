'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Trash2, Heart, Calendar, User, Tag, Plus, Activity, History, TrendingUp, Image, Search, Eye, Weight, Ruler } from 'lucide-react'
import Link from 'next/link'
import { Animal, HealthUpdate, AnimalMedia, HealthUpdateMedia, AuditLog } from '@/types/animal'
import { getAnimalBySlug, deleteAnimal, getHealthUpdates, getAllAnimalMedia, getAuditLogs } from '@/lib/firestore'
import { format, formatDistanceToNow } from 'date-fns'
import { HealthUpdateForm } from '@/components/health-update-form'
import { UnifiedActivityTimeline } from '@/components/unified-activity-timeline'
import { WeightChart } from '@/components/weight-chart'
import { RecentActivity } from '@/components/recent-activity'
import { AnimalMediaTab } from '@/components/animal-media-tab'
import { AnimalSearchFilter } from '@/components/animal-search-filter'

export default function AnimalProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const slug = params.slug as string

  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'weight' | 'media'>('overview')
  const [showHealthForm, setShowHealthForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // Search data state
  const [healthUpdates, setHealthUpdates] = useState<HealthUpdate[]>([])
  const [media, setMedia] = useState<(AnimalMedia | HealthUpdateMedia)[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [searchDataLoading, setSearchDataLoading] = useState(false)

  const loadSearchData = async () => {
    if (!animal) return
    
    setSearchDataLoading(true)
    try {
      const [healthData, mediaData, auditData] = await Promise.all([
        getHealthUpdates(animal.id),
        getAllAnimalMedia(animal.id),
        getAuditLogs(animal.id)
      ])
      
      setHealthUpdates(healthData)
      setMedia(mediaData)
      setAuditLogs(auditData)
    } catch (err) {
      console.error('Error loading search data:', err)
    } finally {
      setSearchDataLoading(false)
    }
  }

  useEffect(() => {
    const loadAnimal = async () => {
      if (!user || !slug) {
        setLoading(false)
        return
      }

      try {
        const animalData = await getAnimalBySlug(slug, user.uid)
        
        if (!animalData) {
          setError('Animal not found')
          setLoading(false)
          return
        }

        setAnimal(animalData)
        setLoading(false)
        
        // Load search data after animal is loaded
        loadSearchData()
      } catch (err) {
        console.error('Error loading animal:', err)
        setError('Failed to load animal data')
        setLoading(false)
      }
    }

    loadAnimal()
  }, [user, slug])

  // Refresh search data when refreshTrigger changes
  useEffect(() => {
    if (animal && refreshTrigger > 0) {
      loadSearchData()
    }
  }, [refreshTrigger, animal])

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

  const handleMediaDeleted = () => {
    // Refresh both the media tab and timeline when media is deleted
    setRefreshTrigger(prev => prev + 1)
    // Refresh search data
    loadSearchData()
    console.log('Media deleted, refreshing components')
  }

  const handleSearchResultClick = (result: any) => {
    // Navigate to appropriate tab based on result type
    switch (result.type) {
      case 'health_update':
        setActiveTab('activity')
        break
      case 'media':
        setActiveTab('media')
        break
      case 'audit_log':
        setActiveTab('activity')
        break
      default:
        setActiveTab('overview')
    }
  }

  const handleHealthUpdateSuccess = (healthUpdate: HealthUpdate) => {
    setShowHealthForm(false)
    setRefreshTrigger(prev => prev + 1)
    // Refresh search data
    loadSearchData()
    // Switch to activity timeline to show the new record
    setActiveTab('activity')
    // Optionally show a success message
    console.log('Health update added successfully:', healthUpdate)
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
    <div className="min-h-screen w-full bg-white dark:bg-gray-900">
      {/* Modern Header */}
      <header className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="w-full px-6 lg:px-8">
          {/* Navigation */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/animals" className="group">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200">
                  <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Back</span>
                </div>
              </Link>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{animal.name}</h1>
                {animal.dateOfDeath && (
                  <span className="text-sm px-2 py-1 bg-red-500/20 text-red-700 dark:text-red-300 rounded-lg font-medium">
                    ✝ Deceased
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setShowHealthForm(true)}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Update
              </Button>

              <div className="flex items-center space-x-2">
                <Link href={`/animals/${slug}/edit`}>
                  <Button 
                    variant="outline" 
                    className="border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl font-medium transition-all duration-200"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                
                <Button 
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 rounded-xl font-medium disabled:opacity-50 transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="bg-white py-8">
        <div className="w-full px-6 lg:px-8">
          {animal && (
            <AnimalSearchFilter
              animal={animal}
              healthUpdates={healthUpdates}
              media={media}
              auditLogs={auditLogs}
              onResultClick={handleSearchResultClick}
              className="w-full"
            />
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="w-full px-6 lg:px-8 pb-12">
        
        {/* Profile Hero Card */}
        <div className={`${
          animal.dateOfDeath 
            ? 'bg-gray-100/60 dark:bg-gray-800/60 border-gray-300/50 dark:border-gray-600/50' 
            : 'bg-white/40 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-700/50'
        } backdrop-blur-xl rounded-3xl border p-8 mb-8 shadow-2xl`}>
          <div className="flex flex-col xl:flex-row items-center xl:items-start gap-8">
            {/* Profile Image */}
            <div className="relative group">
              {animal.profilePicture ? (
                <div className="relative">
                  <img 
                    src={animal.profilePicture} 
                    alt={`${animal.name}'s profile picture`}
                    className={`w-64 h-64 xl:w-80 xl:h-80 rounded-3xl object-cover shadow-2xl ring-4 ${
                      animal.dateOfDeath 
                        ? 'ring-gray-400/50 dark:ring-gray-600/50 grayscale' 
                        : 'ring-white/50 dark:ring-gray-700/50'
                    } transition-all duration-300 group-hover:scale-105`}
                  />
                  <div className={`absolute inset-0 rounded-3xl ${
                    animal.dateOfDeath 
                      ? 'bg-gradient-to-t from-gray-900/40 to-gray-600/20' 
                      : 'bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100'
                  } transition-opacity duration-300`}></div>
                  {animal.dateOfDeath && (
                    <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      ✝ Deceased
                    </div>
                  )}
                </div>
              ) : (
                <div className={`w-64 h-64 xl:w-80 xl:h-80 rounded-3xl ${
                  animal.dateOfDeath 
                    ? 'bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 grayscale' 
                    : 'bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600'
                } shadow-2xl ring-4 ${
                  animal.dateOfDeath 
                    ? 'ring-gray-400/50 dark:ring-gray-600/50' 
                    : 'ring-white/50 dark:ring-gray-700/50'
                } flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                  <Heart className={`h-24 w-24 xl:h-32 xl:w-32 ${
                    animal.dateOfDeath 
                      ? 'text-gray-400 dark:text-gray-600' 
                      : 'text-emerald-400 dark:text-gray-400'
                  }`} />
                  {animal.dateOfDeath && (
                    <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      ✝ Deceased
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center xl:text-left max-w-3xl">
              {/* Status Badges */}
              <div className="flex items-center justify-center xl:justify-start flex-wrap gap-3 mb-6">
                {animal.dateOfDeath && (
                  <div className="flex items-center px-4 py-2 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 text-red-800 dark:text-red-200 rounded-2xl font-semibold shadow-lg">
                    <span className="mr-2">✝</span>
                    Deceased
                  </div>
                )}
                <div className={`flex items-center px-4 py-2 bg-gradient-to-r ${
                  animal.dateOfDeath 
                    ? 'from-gray-100 to-gray-200 dark:from-gray-700/40 dark:to-gray-600/40 text-gray-700 dark:text-gray-300' 
                    : 'from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 text-emerald-800 dark:text-emerald-200'
                } rounded-2xl font-semibold shadow-lg`}>
                  <Heart className="h-4 w-4 mr-2" />
                  {animal.species.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                {animal.breed && (
                  <div className={`flex items-center px-4 py-2 bg-gradient-to-r ${
                    animal.dateOfDeath 
                      ? 'from-gray-100 to-gray-200 dark:from-gray-700/40 dark:to-gray-600/40 text-gray-700 dark:text-gray-300' 
                      : 'from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-800 dark:text-blue-200'
                  } rounded-2xl font-semibold shadow-lg`}>
                    <Tag className="h-4 w-4 mr-2" />
                    {animal.breed}
                  </div>
                )}
              </div>
              
              {/* Name */}
              <h1 className="text-3xl xl:text-4xl font-black mb-6 text-gray-900 dark:text-white tracking-tight">
                {animal.name}
              </h1>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-center xl:justify-start mb-2">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sex</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white capitalize text-center xl:text-left">{animal.sex}</p>
                </div>
                
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-center xl:justify-start mb-2">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Age</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white text-center xl:text-left">{formatDistanceToNow(animal.dateOfBirth, { addSuffix: false })}</p>
                </div>

                <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-center xl:justify-start mb-2">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Born</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white text-center xl:text-left">{format(animal.dateOfBirth, 'MMM d, yyyy')}</p>
                </div>

                {animal.color && (
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-center xl:justify-start mb-2">
                      <Eye className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Color</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white text-center xl:text-left">{animal.color}</p>
                  </div>
                )}

                {animal.weight && (
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-center xl:justify-start mb-2">
                      <Weight className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weight</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white text-center xl:text-left">{animal.weight} {animal.weightUnit}</p>
                  </div>
                )}

                {animal.height && (
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-center xl:justify-start mb-2">
                      <Ruler className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Height</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white text-center xl:text-left">{animal.height} {animal.heightUnit}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-2 mb-8 shadow-xl">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/25 transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-lg hover:scale-105'
                }`}
              >
                <div className={`${
                  activeTab === tab.id ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                } transition-colors duration-300`}>
                  {tab.icon}
                </div>
                <span className="ml-3 font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 animate-pulse"></div>
                )}
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

              {/* Modern Information Cards */}
              <div className="space-y-6">
                {/* Identification Information */}
                {(animal.microchipNumber || animal.registrationNumber || animal.dateOfDeath) && (
                  <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                        <Tag className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">Identification</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {animal.microchipNumber && (
                        <div className="bg-white/40 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-700/30">
                          <div className="flex items-center mb-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Microchip</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900 dark:text-white font-mono">{animal.microchipNumber}</span>
                        </div>
                      )}
                      {animal.registrationNumber && (
                        <div className="bg-white/40 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-700/30">
                          <div className="flex items-center mb-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Registration</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900 dark:text-white font-mono">{animal.registrationNumber}</span>
                        </div>
                      )}
                      {animal.dateOfDeath && (
                        <div className="bg-white/40 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-700/30 md:col-span-2">
                          <div className="flex items-center mb-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date of Death</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{format(animal.dateOfDeath, 'MMMM d, yyyy')}</span>
                          {animal.deceasedNotes && (
                            <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-2">Notes</span>
                              <p className="text-gray-700 dark:text-gray-300">{animal.deceasedNotes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Markings & Features */}
                {animal.markings && (
                  <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300">
                        <Tag className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">Markings & Features</h3>
                    </div>
                    <div className="bg-white/40 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-700/30">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{animal.markings}</p>
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                {animal.notes && (
                  <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                        <Edit className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">Additional Notes</h3>
                    </div>
                    <div className="bg-white/40 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-700/30">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{animal.notes}</p>
                    </div>
                  </div>
                )}
              </div>
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
      </main>
    </div>
  )
} 