'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  Weight, 
  Ruler, 
  Heart, 
  Activity, 
  FileText,
  User,
  Calendar,
  DollarSign,
  Tag,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { HealthUpdate } from '@/types/animal'
import { getHealthUpdates, deleteHealthUpdate } from '@/lib/firestore'
import { format, formatDistanceToNow } from 'date-fns'
import { HealthUpdateEditForm } from './health-update-edit-form'

interface HealthTimelineProps {
  animalId: string
  animalName: string
  refreshTrigger?: number
}

export function HealthTimeline({ animalId, animalName, refreshTrigger }: HealthTimelineProps) {
  const [healthUpdates, setHealthUpdates] = useState<HealthUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>(null)
  const [editingUpdate, setEditingUpdate] = useState<HealthUpdate | null>(null)

  const loadHealthUpdates = async () => {
    try {
      console.log('Loading health updates for animal:', animalId)
      const updates = await getHealthUpdates(animalId)
      console.log('Loaded health updates:', updates)
      console.log('Health updates array length:', updates.length)
      if (updates.length > 0) {
        console.log('First health update:', updates[0])
      }
      setHealthUpdates(updates)
      console.log('State set with updates')
    } catch (error) {
      console.error('Error loading health updates:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHealthUpdates()
  }, [animalId, refreshTrigger])

  const handleDelete = async (updateId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteHealthUpdate(updateId)
      setHealthUpdates(prev => prev.filter(update => update.id !== updateId))
    } catch (error) {
      console.error('Error deleting health update:', error)
      alert('Failed to delete health update. Please try again.')
    }
  }

  const handleEditSuccess = (updatedHealthUpdate: HealthUpdate) => {
    setEditingUpdate(null)
    setHealthUpdates(prev => 
      prev.map(update => 
        update.id === updatedHealthUpdate.id ? updatedHealthUpdate : update
      )
    )
  }

  const handleEdit = (update: HealthUpdate) => {
    setEditingUpdate(update)
    setExpandedUpdate(null) // Close any expanded update
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weight': return <Weight className="h-4 w-4" />
      case 'height': return <Ruler className="h-4 w-4" />
      case 'medical': return <Heart className="h-4 w-4" />
      case 'behavior': return <Activity className="h-4 w-4" />
      case 'diet': return <Activity className="h-4 w-4" />
      case 'exercise': return <Activity className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weight': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'height': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
      case 'medical': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      case 'behavior': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
      case 'diet': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      case 'exercise': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
    }
  }



  const getWeightTrend = (updates: HealthUpdate[], currentIndex: number) => {
    const currentUpdate = updates[currentIndex]
    if (!currentUpdate.weight) return null

    // Find the previous weight update
    for (let i = currentIndex + 1; i < updates.length; i++) {
      const prevUpdate = updates[i]
      if (prevUpdate.weight) {
        const diff = currentUpdate.weight - prevUpdate.weight
        if (Math.abs(diff) < 0.1) return <Minus className="h-4 w-4 text-gray-500" />
        return diff > 0 
          ? <TrendingUp className="h-4 w-4 text-green-600" />
          : <TrendingDown className="h-4 w-4 text-red-600" />
      }
    }
    return null
  }

  const filteredUpdates = healthUpdates.filter(update => 
    filter === 'all' || update.type === filter
  )

  console.log('Rendering HealthTimeline - healthUpdates:', healthUpdates.length, 'filteredUpdates:', filteredUpdates.length, 'filter:', filter)

  const uniqueTypes = Array.from(new Set(healthUpdates.map(update => update.type)))

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading health timeline...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-gray-900 dark:text-white">
              <Clock className="h-5 w-5 mr-2 text-emerald-600" />
              Health Timeline
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Complete history of health updates for {animalName}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Edit Form */}
        {editingUpdate && (
          <div className="mb-6">
            <HealthUpdateEditForm
              healthUpdate={editingUpdate}
              animalName={animalName}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingUpdate(null)}
            />
          </div>
        )}
        {filteredUpdates.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No Health Updates Yet' : `No ${filter} Updates`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' 
                ? 'Start tracking health updates to see the timeline here.'
                : `No ${filter} updates have been recorded yet.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUpdates.map((update, index) => (
              <div
                key={update.id}
                className="relative flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {/* Timeline Line */}
                {index < filteredUpdates.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
                )}

                {/* Type Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(update.type)}`}>
                  {getTypeIcon(update.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {update.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(update.type)}`}>
                          {update.type}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(update.date, 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(update.createdAt)} ago
                        </div>
                      </div>

                      {/* Measurements */}
                      <div className="flex flex-wrap gap-4 mb-2">
                        {update.weight && (
                          <div className="flex items-center text-sm">
                            <Weight className="h-3 w-3 mr-1 text-blue-600" />
                            <span className="font-medium">{update.weight} {update.weightUnit}</span>
                            {getWeightTrend(filteredUpdates, index)}
                          </div>
                        )}
                        {update.height && (
                          <div className="flex items-center text-sm">
                            <Ruler className="h-3 w-3 mr-1 text-purple-600" />
                            <span className="font-medium">{update.height} {update.heightUnit}</span>
                          </div>
                        )}
                        {update.cost && (
                          <div className="flex items-center text-sm">
                            <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                            <span className="font-medium">£{update.cost}</span>
                          </div>
                        )}
                        {update.veterinarian && (
                          <div className="flex items-center text-sm">
                            <User className="h-3 w-3 mr-1 text-gray-600" />
                            <span>{update.veterinarian}</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {update.tags && update.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {update.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                            >
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Description (expandable) */}
                      {update.description && (
                        <div className="mt-2">
                          {expandedUpdate === update.id ? (
                            <div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                {update.description}
                              </p>
                              <button
                                onClick={() => setExpandedUpdate(null)}
                                className="text-emerald-600 hover:text-emerald-700 text-xs mt-1"
                              >
                                Show less
                              </button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                                {update.description.length > 100 
                                  ? `${update.description.substring(0, 100)}...`
                                  : update.description
                                }
                              </p>
                              {update.description.length > 100 && (
                                <button
                                  onClick={() => setExpandedUpdate(update.id)}
                                  className="text-emerald-600 hover:text-emerald-700 text-xs mt-1"
                                >
                                  Show more
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Next Due Date */}
                      {update.nextDueDate && (
                        <div className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Next due: {format(update.nextDueDate, 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedUpdate(expandedUpdate === update.id ? null : update.id)}
                        className="text-gray-500 hover:text-gray-700"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(update)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit update"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(update.id, update.title)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete update"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}