'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  FileText, 
  Image, 
  Activity, 
  Tag,
  Weight,
  Ruler,
  User,
  Heart,
  Clock,
  Eye,
  Download,
  ArrowRight,
  Users,
  MapPin
} from 'lucide-react'
import { Animal, HealthUpdate, AnimalMedia, HealthUpdateMedia, AuditLog } from '@/types/animal'
import { format, formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/lib/auth-context'
import { getAnimals, getHealthUpdates, getAnimalMedia, getHealthUpdateMedia, getAuditLogs } from '@/lib/firestore'
import Link from 'next/link'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { generateUniqueSlug } from '@/lib/utils'

interface SearchResult {
  id: string
  type: 'animal' | 'health_update' | 'media' | 'audit_log'
  title: string
  description: string
  date: Date
  relevance: number
  data: Animal | HealthUpdate | AnimalMedia | HealthUpdateMedia | AuditLog
  matchedFields: string[]
  animalId?: string
  animalName?: string
}

interface DashboardSearchProps {
  className?: string
}

export function DashboardSearch({ className = '' }: DashboardSearchProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['animal', 'health_update', 'media', 'audit_log']))
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({})
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1)
  const [allData, setAllData] = useState<{
    animals: Animal[]
    healthUpdates: HealthUpdate[]
    media: (AnimalMedia | HealthUpdateMedia)[]
    auditLogs: AuditLog[]
  }>({
    animals: [],
    healthUpdates: [],
    media: [],
    auditLogs: []
  })
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Fetch all data for the user
  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return
      
      setLoading(true)
      try {
        // Get all animals for the user
        const animals = await getAnimals(user.uid)
        
        // Get all related data for each animal
        const allHealthUpdates: HealthUpdate[] = []
        const allMedia: (AnimalMedia | HealthUpdateMedia)[] = []
        const allAuditLogs: AuditLog[] = []

        for (const animal of animals) {
          // Get health updates
          try {
            const healthUpdates = await getHealthUpdates(animal.id)
            allHealthUpdates.push(...healthUpdates)
          } catch (error) {
            console.error(`Error fetching health updates for animal ${animal.id}:`, error)
          }

          // Get media
          try {
            const animalMedia = await getAnimalMedia(animal.id)
            const healthUpdateMedia = await getHealthUpdateMedia(animal.id)
            allMedia.push(...animalMedia, ...healthUpdateMedia)
          } catch (error) {
            console.error(`Error fetching media for animal ${animal.id}:`, error)
          }

          // Get audit logs
          try {
            const auditLogs = await getAuditLogs(animal.id)
            allAuditLogs.push(...auditLogs)
          } catch (error) {
            console.error(`Error fetching audit logs for animal ${animal.id}:`, error)
          }
        }

        setAllData({
          animals,
          healthUpdates: allHealthUpdates,
          media: allMedia,
          auditLogs: allAuditLogs
        })
      } catch (error) {
        console.error('Error fetching data for search:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [user])

  // Search across all data
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    // Search animals
    if (activeFilters.has('animal')) {
      allData.animals.forEach(animal => {
        const animalFields = [
          { field: 'name', value: animal.name },
          { field: 'species', value: animal.species },
          { field: 'breed', value: animal.breed },
          { field: 'color', value: animal.color },
          { field: 'markings', value: animal.markings },
          { field: 'notes', value: animal.notes },
          { field: 'microchip', value: animal.microchipNumber },
          { field: 'registration', value: animal.registrationNumber },
          { field: 'sex', value: animal.sex }
        ].filter(f => f.value)

        const matchedFields = animalFields
          .filter(f => f.value?.toLowerCase().includes(query))
          .map(f => f.field)

        if (matchedFields.length > 0) {
          results.push({
            id: `animal_${animal.id}`,
            type: 'animal',
            title: animal.name,
            description: `${animal.species}${animal.breed ? ` - ${animal.breed}` : ''}`,
            date: animal.createdAt,
            relevance: matchedFields.includes('name') ? 10 : 5,
            data: animal,
            matchedFields,
            animalId: animal.id,
            animalName: animal.name
          })
        }
      })
    }

    // Search health updates
    if (activeFilters.has('health_update')) {
      allData.healthUpdates.forEach(update => {
        const updateFields = [
          { field: 'title', value: update.title },
          { field: 'description', value: update.description },
          { field: 'tags', value: update.tags?.join(' ') },
          { field: 'veterinarian', value: update.veterinarian },
          { field: 'weight', value: update.weight?.toString() },
          { field: 'height', value: update.height?.toString() }
        ].filter(f => f.value)

        const matchedFields = updateFields
          .filter(f => f.value?.toLowerCase().includes(query))
          .map(f => f.field)

        if (matchedFields.length > 0) {
          // Find the animal for this health update
          const animal = allData.animals.find(a => a.id === update.animalId)
          
          results.push({
            id: `health_${update.id}`,
            type: 'health_update',
            title: update.title,
            description: update.description || `${update.type} update`,
            date: update.date,
            relevance: matchedFields.includes('title') ? 8 : 6,
            data: update,
            matchedFields,
            animalId: update.animalId,
            animalName: animal?.name
          })
        }
      })
    }

    // Search media
    if (activeFilters.has('media')) {
      allData.media.forEach(item => {
        const mediaFields = [
          { field: 'filename', value: item.fileName },
          { field: 'originalName', value: item.originalName },
          { field: 'caption', value: item.caption },
          { field: 'tags', value: item.tags?.join(' ') },
          { field: 'category', value: item.category }
        ].filter(f => f.value)

        const matchedFields = mediaFields
          .filter(f => f.value?.toLowerCase().includes(query))
          .map(f => f.field)

        if (matchedFields.length > 0) {
          // Find the animal for this media
          const animal = allData.animals.find(a => a.id === item.animalId)
          
          results.push({
            id: `media_${item.id}`,
            type: 'media',
            title: item.caption || item.originalName,
            description: `${item.type} - ${item.category}`,
            date: item.uploadedAt,
            relevance: matchedFields.includes('caption') ? 7 : 5,
            data: item,
            matchedFields,
            animalId: item.animalId,
            animalName: animal?.name
          })
        }
      })
    }

    // Search audit logs
    if (activeFilters.has('audit_log')) {
      allData.auditLogs.forEach(log => {
        const logFields = [
          { field: 'summary', value: log.summary },
          { field: 'userName', value: log.userName },
          { field: 'userEmail', value: log.userEmail },
          { field: 'action', value: log.action },
          { field: 'entityType', value: log.entityType }
        ].filter(f => f.value)

        const matchedFields = logFields
          .filter(f => f.value?.toLowerCase().includes(query))
          .map(f => f.field)

        if (matchedFields.length > 0) {
          // Find the animal for this audit log
          const animal = allData.animals.find(a => a.id === log.animalId)
          
          results.push({
            id: `audit_${log.id}`,
            type: 'audit_log',
            title: log.summary,
            description: `${log.action} by ${log.userName || log.userEmail}`,
            date: log.timestamp,
            relevance: matchedFields.includes('summary') ? 6 : 4,
            data: log,
            matchedFields,
            animalId: log.animalId,
            animalName: animal?.name
          })
        }
      })
    }

    // Apply date range filter
    let filteredResults = results
    if (dateRange.start || dateRange.end) {
      filteredResults = results.filter(result => {
        const resultDate = result.date
        if (dateRange.start && resultDate < dateRange.start) return false
        if (dateRange.end && resultDate > dateRange.end) return false
        return true
      })
    }

    // Sort by relevance and date
    return filteredResults.sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance
      }
      return b.date.getTime() - a.date.getTime()
    })
  }, [searchQuery, allData, activeFilters, dateRange])

  const toggleFilter = (filter: string) => {
    const newFilters = new Set(activeFilters)
    if (newFilters.has(filter)) {
      newFilters.delete(filter)
    } else {
      newFilters.add(filter)
    }
    setActiveFilters(newFilters)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setShowResults(false)
    setSelectedResultIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedResultIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedResultIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedResultIndex >= 0 && selectedResultIndex < searchResults.length) {
          handleResultClick(searchResults[selectedResultIndex])
          setShowResults(false)
          setSelectedResultIndex(-1)
        }
        break
      case 'Escape':
        setShowResults(false)
        setSelectedResultIndex(-1)
        break
    }
  }

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the appropriate page based on result type
    if (result.animalId) {
      const slug = generateUniqueSlug(result.animalName || 'animal', result.animalId)
      if (result.type === 'animal') {
        window.location.href = `/animals/${slug}`
      } else {
        window.location.href = `/animals/${slug}`
      }
    }
  }

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setSelectedResultIndex(-1)
      }
    }

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showResults])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'animal': return <Heart className="h-4 w-4" />
      case 'health_update': return <Activity className="h-4 w-4" />
      case 'media': return <Image className="h-4 w-4" />
      case 'audit_log': return <Clock className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'animal': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
      case 'health_update': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
      case 'media': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/30'
      case 'audit_log': return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30'
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Ultra-Modern Search Container */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
        {/* Search Input */}
        <div className="relative group">
          <div className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200">
            <Search className="h-6 w-6" />
          </div>
          <Input
            type="text"
            placeholder="Search across all your animals, health records, media, and activities..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowResults(e.target.value.length > 0)
              setSelectedResultIndex(-1)
            }}
            onFocus={() => setShowResults(searchQuery.length > 0)}
            onKeyDown={handleKeyDown}
            className="pl-16 pr-16 h-16 text-lg bg-white/60 dark:bg-gray-800/60 border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 rounded-full bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Modern Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <div className="flex items-center px-4 py-2 bg-gray-50/80 dark:bg-gray-800/80 rounded-2xl">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Filter by:</span>
          </div>
          {[
            { key: 'animal', label: 'Animals', icon: <Heart className="h-4 w-4" />, gradient: 'from-emerald-500 to-emerald-600' },
            { key: 'health_update', label: 'Health Records', icon: <Activity className="h-4 w-4" />, gradient: 'from-blue-500 to-blue-600' },
            { key: 'media', label: 'Media', icon: <Image className="h-4 w-4" />, gradient: 'from-purple-500 to-purple-600' },
            { key: 'audit_log', label: 'Activities', icon: <Clock className="h-4 w-4" />, gradient: 'from-gray-500 to-gray-600' }
          ].map(filter => (
            <Button
              key={filter.key}
              variant="ghost"
              size="sm"
              onClick={() => toggleFilter(filter.key)}
              className={`relative overflow-hidden px-5 py-3 rounded-2xl font-medium transition-all duration-300 hover:scale-105 ${
                activeFilters.has(filter.key) 
                  ? `bg-gradient-to-r ${filter.gradient} text-white shadow-xl hover:shadow-2xl transform scale-105`
                  : 'bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center space-x-2">
                {filter.icon}
                <span>{filter.label}</span>
              </div>
              {activeFilters.has(filter.key) && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse rounded-2xl"></div>
              )}
            </Button>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center mt-4">
            <div className="h-6 w-6 border-b-2 border-emerald-600 rounded-full animate-spin"></div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading your data...</span>
          </div>
        )}
      </div>

      {/* Ultra-Modern Search Results */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-4 max-h-96 overflow-y-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl">
          <CardHeader className="pb-4 border-b border-gray-100/50 dark:border-gray-700/50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Search Results</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{searchResults.length} results found</p>
                </div>
              </div>
              {searchResults.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResults(false)}
                  className="h-10 w-10 p-0 rounded-full bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{searchQuery}"</p>
                <p className="text-sm">Try different keywords or check your filters</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <div
                    key={result.id}
                    onClick={() => {
                      handleResultClick(result)
                      setShowResults(false)
                      setSelectedResultIndex(-1)
                    }}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      index === selectedResultIndex
                        ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600 shadow-md scale-[1.02]'
                        : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getTypeColor(result.type)}`}>
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {result.title}
                            </h4>
                            {result.animalName && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                {result.animalName}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(result.date, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {result.description}
                        </p>
                        {result.matchedFields.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.matchedFields.slice(0, 3).map((field) => (
                              <span
                                key={field}
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-700/50"
                              >
                                {field}
                              </span>
                            ))}
                            {result.matchedFields.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{result.matchedFields.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 