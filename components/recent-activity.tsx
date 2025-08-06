'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Eye,
  Edit,
  UserCheck,
  Pencil,
  ArrowRight,
  Plus
} from 'lucide-react'
import { HealthUpdate, AuditLog } from '@/types/animal'
import { getHealthUpdates, getAuditLogs } from '@/lib/firestore'
import { format, formatDistanceToNow } from 'date-fns'

interface TimelineItem {
  id: string
  type: 'health_update' | 'audit_log'
  date: Date
  data: HealthUpdate | AuditLog
}

interface RecentActivityProps {
  animalId: string
  animalName: string
  refreshTrigger?: number
  onViewAll?: () => void
}

export function RecentActivity({ animalId, animalName, refreshTrigger, onViewAll }: RecentActivityProps) {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivityData()
  }, [animalId, refreshTrigger])

  const loadActivityData = async () => {
    try {
      setLoading(true)
      console.log('Loading recent activity for animal:', animalId)

      // Load health updates and audit logs in parallel
      const [healthUpdates, auditLogs] = await Promise.all([
        getHealthUpdates(animalId),
        getAuditLogs(animalId)
      ])

      console.log('Loaded health updates:', healthUpdates.length)
      console.log('Loaded audit logs:', auditLogs.length)

      // Combine both into timeline items
      const combinedItems: TimelineItem[] = [
        // Health updates - always include
        ...healthUpdates.map(update => ({
          id: `health_${update.id}`,
          type: 'health_update' as const,
          date: update.date,
          data: update
        })),
        // Audit logs - filter out generic profile updates (only show meaningful changes)
        ...auditLogs
          .filter(audit => {
            // Exclude audit logs that are redundant with health updates
            const excludedActions = ['health_added', 'weight_recorded', 'medical_added', 'updated']
            return !excludedActions.includes(audit.action)
          })
          .map(audit => ({
            id: `audit_${audit.id}`,
            type: 'audit_log' as const,
            date: audit.timestamp,
            data: audit
          }))
      ]

      // Sort by date (newest first) and take only first 5
      const sortedItems = combinedItems
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5)

      console.log('Recent activity items:', sortedItems.length)
      setTimelineItems(sortedItems)
    } catch (error) {
      console.error('Error loading recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthUpdateIcon = (type: string) => {
    switch (type) {
      case 'weight': return <Weight className="h-4 w-4" />
      case 'height': return <Ruler className="h-4 w-4" />
      case 'medical': return <Heart className="h-4 w-4" />
      case 'behavior': return <Activity className="h-4 w-4" />
      case 'diet': return <FileText className="h-4 w-4" />
      case 'exercise': return <TrendingUp className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getHealthUpdateColor = (type: string) => {
    switch (type) {
      case 'weight': return 'text-blue-600'
      case 'height': return 'text-purple-600'
      case 'medical': return 'text-red-600'
      case 'behavior': return 'text-orange-600'
      case 'diet': return 'text-green-600'
      case 'exercise': return 'text-emerald-600'
      default: return 'text-gray-600'
    }
  }



  const getAuditActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Plus className="h-4 w-4" />
      case 'updated': return <Edit className="h-4 w-4" />
      case 'health_added': return <Heart className="h-4 w-4" />
      case 'weight_recorded': return <Weight className="h-4 w-4" />
      case 'medical_added': return <Heart className="h-4 w-4" />
      default: return <UserCheck className="h-4 w-4" />
    }
  }

  const renderHealthUpdate = (item: TimelineItem) => {
    const update = item.data as HealthUpdate
    
    // Check if recently edited (within last 24 hours)
    const isRecentlyEdited = update.updatedAt &&
      update.updatedAt.getTime() > Date.now() - (24 * 60 * 60 * 1000) &&
      update.updatedAt.getTime() > update.createdAt.getTime() + (5 * 60 * 1000)

    return (
      <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <div className={`flex-shrink-0 p-2 rounded-lg bg-white dark:bg-gray-800 ${getHealthUpdateColor(update.type)}`}>
          {getHealthUpdateIcon(update.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{update.title}</h4>

            {isRecentlyEdited && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                <Pencil className="h-3 w-3 mr-1" />
                Edited
              </span>
            )}
          </div>
          
          <div className="flex items-center text-xs text-gray-500 space-x-3">
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {format(update.date, 'MMM d')}
            </span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(update.createdAt, { addSuffix: true })}
            </span>
          </div>
          
          {update.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{update.description}</p>
          )}
        </div>
      </div>
    )
  }

  const renderAuditLog = (item: TimelineItem) => {
    const audit = item.data as AuditLog

    return (
      <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <div className="flex-shrink-0 p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600">
          {getAuditActionIcon(audit.action)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{audit.summary}</h4>
          
          <div className="flex items-center text-xs text-gray-500 space-x-3 mt-1">
            <span className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              {audit.userName || 'Unknown'}
            </span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(audit.timestamp, { addSuffix: true })}
            </span>
          </div>
          
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 mt-1">
            Profile Change
          </span>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 text-emerald-600 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 text-emerald-600 mr-2" />
          Recent Activity
        </CardTitle>
        {timelineItems.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {timelineItems.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No activity yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Health updates and changes will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {timelineItems.map((item) => (
              <div key={item.id}>
                {item.type === 'health_update' ? renderHealthUpdate(item) : renderAuditLog(item)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}