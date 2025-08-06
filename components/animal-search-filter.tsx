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
  Download
} from 'lucide-react'
import { Animal, HealthUpdate, AnimalMedia, HealthUpdateMedia, AuditLog } from '@/types/animal'
import { format, formatDistanceToNow } from 'date-fns'

interface SearchResult {
  id: string
  type: 'animal' | 'health_update' | 'media' | 'audit_log'
  title: string
  description: string
  date: Date
  relevance: number
  data: Animal | HealthUpdate | AnimalMedia | HealthUpdateMedia | AuditLog
  matchedFields: string[]
}

interface AnimalSearchFilterProps {
  animal: Animal
  healthUpdates: HealthUpdate[]
  media: (AnimalMedia | HealthUpdateMedia)[]
  auditLogs: AuditLog[]
  onResultClick: (result: SearchResult) => void
  className?: string
}

export function AnimalSearchFilter({ 
  animal, 
  healthUpdates, 
  media, 
  auditLogs, 
  onResultClick,
  className = '' 
}: AnimalSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['animal', 'health_update', 'media', 'audit_log']))
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({})
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)

  // Search across all data
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    // Search animal profile data
    if (activeFilters.has('animal')) {
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
          matchedFields
        })
      }
    }

    // Search health updates
    if (activeFilters.has('health_update')) {
      healthUpdates.forEach(update => {
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
          results.push({
            id: `health_${update.id}`,
            type: 'health_update',
            title: update.title,
            description: update.description || `${update.type} update`,
            date: update.date,
            relevance: matchedFields.includes('title') ? 8 : 6,
            data: update,
            matchedFields
          })
        }
      })
    }

    // Search media
    if (activeFilters.has('media')) {
      media.forEach(item => {
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
          results.push({
            id: `media_${item.id}`,
            type: 'media',
            title: item.caption || item.originalName,
            description: `${item.type} - ${item.category}`,
            date: item.uploadedAt,
            relevance: matchedFields.includes('caption') ? 7 : 5,
            data: item,
            matchedFields
          })
        }
      })
    }

    // Search audit logs
    if (activeFilters.has('audit_log')) {
      auditLogs.forEach(log => {
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
          results.push({
            id: `audit_${log.id}`,
            type: 'audit_log',
            title: log.summary,
            description: `${log.action} by ${log.userName || log.userEmail}`,
            date: log.timestamp,
            relevance: matchedFields.includes('summary') ? 6 : 4,
            data: log,
            matchedFields
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
  }, [searchQuery, healthUpdates, media, auditLogs, activeFilters, dateRange, animal])

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
          onResultClick(searchResults[selectedResultIndex])
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
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name, breed, health updates, media files, notes, dates..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setShowResults(e.target.value.length > 0)
            setSelectedResultIndex(-1)
          }}
          onFocus={() => setShowResults(searchQuery.length > 0)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Use arrow keys to navigate, Enter to select, Escape to close
      </div>

      {/* Filter Toggles */}
      <div className="flex flex-wrap gap-2 mt-3">
        {[
          { key: 'animal', label: 'Profile', icon: <Heart className="h-3 w-3" /> },
          { key: 'health_update', label: 'Health', icon: <Activity className="h-3 w-3" /> },
          { key: 'media', label: 'Media', icon: <Image className="h-3 w-3" /> },
          { key: 'audit_log', label: 'Activity', icon: <Clock className="h-3 w-3" /> }
        ].map(filter => (
          <Button
            key={filter.key}
            variant={activeFilters.has(filter.key) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter(filter.key)}
            className={`text-xs ${activeFilters.has(filter.key) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
          >
            {filter.icon}
            <span className="ml-1">{filter.label}</span>
          </Button>
        ))}
      </div>

      {/* Search Results */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto shadow-lg border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Search Results ({searchResults.length})</span>
              {searchResults.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResults(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
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
                      onResultClick(result)
                      setShowResults(false)
                      setSelectedResultIndex(-1)
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      index === selectedResultIndex
                        ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getTypeColor(result.type)}`}>
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {result.title}
                          </h4>
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
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
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