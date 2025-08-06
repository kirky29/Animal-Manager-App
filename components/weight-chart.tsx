'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts'
import { 
  Weight, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar,
  Target,
  BarChart
} from 'lucide-react'
import { HealthUpdate } from '@/types/animal'
import { getHealthUpdates } from '@/lib/firestore'
import { format, parseISO } from 'date-fns'

interface WeightChartProps {
  animalId: string
  animalName: string
  refreshTrigger?: number
}

interface WeightData {
  date: string
  weight: number
  unit: string
  rawDate: Date
  notes?: string
}

export function WeightChart({ animalId, animalName, refreshTrigger }: WeightChartProps) {
  const [weightData, setWeightData] = useState<WeightData[]>([])
  const [loading, setLoading] = useState(true)
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg')
  const [timeRange, setTimeRange] = useState<'all' | '1year' | '6months' | '3months'>('all')

  const loadWeightData = async () => {
    try {
      const healthUpdates = await getHealthUpdates(animalId)
      
      // Filter and process weight data
      const weightUpdates = healthUpdates
        .filter(update => update.weight && update.weightUnit)
        .map(update => ({
          date: format(update.date, 'MMM dd, yyyy'),
          weight: update.weight!,
          unit: update.weightUnit!,
          rawDate: update.date,
          notes: update.description
        }))
        .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())

      setWeightData(weightUpdates)
      
      // Set unit based on most common unit in data
      if (weightUpdates.length > 0) {
        const unitCounts = weightUpdates.reduce((acc, data) => {
          acc[data.unit] = (acc[data.unit] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        const mostCommonUnit = Object.keys(unitCounts).reduce((a, b) => 
          unitCounts[a] > unitCounts[b] ? a : b
        ) as 'kg' | 'lbs'
        
        setUnit(mostCommonUnit)
      }
    } catch (error) {
      console.error('Error loading weight data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWeightData()
  }, [animalId, refreshTrigger])

  // Convert weights to selected unit for display
  const convertWeight = (weight: number, fromUnit: string): number => {
    if (fromUnit === unit) return weight
    
    if (fromUnit === 'kg' && unit === 'lbs') {
      return weight * 2.20462
    } else if (fromUnit === 'lbs' && unit === 'kg') {
      return weight / 2.20462
    }
    
    return weight
  }

  // Filter data by time range
  const filterByTimeRange = (data: WeightData[]): WeightData[] => {
    if (timeRange === 'all') return data
    
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (timeRange) {
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3)
        break
    }
    
    return data.filter(item => item.rawDate >= cutoffDate)
  }

  const processedData = filterByTimeRange(weightData).map(item => ({
    ...item,
    weight: Math.round(convertWeight(item.weight, item.unit) * 10) / 10
  }))

  // Calculate statistics
  const getStatistics = () => {
    if (processedData.length < 2) return null

    const weights = processedData.map(d => d.weight)
    const currentWeight = weights[weights.length - 1]
    const previousWeight = weights[weights.length - 2]
    const minWeight = Math.min(...weights)
    const maxWeight = Math.max(...weights)
    const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length

    const change = currentWeight - previousWeight
    const changePercent = (change / previousWeight) * 100

    return {
      current: currentWeight,
      previous: previousWeight,
      change,
      changePercent,
      min: minWeight,
      max: maxWeight,
      average: Math.round(avgWeight * 10) / 10,
      trend: change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'stable'
    }
  }

  const statistics = getStatistics()

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            Weight: {payload[0].value} {unit}
          </p>
          {data.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {data.notes.length > 50 ? `${data.notes.substring(0, 50)}...` : data.notes}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading weight chart...</span>
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
              <Weight className="h-5 w-5 mr-2 text-emerald-600" />
              Weight Tracking
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Weight progression for {animalName}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="1year">Last Year</option>
              <option value="6months">Last 6 Months</option>
              <option value="3months">Last 3 Months</option>
            </select>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {processedData.length === 0 ? (
          <div className="text-center py-8">
            <Weight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Weight Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start recording weight measurements to see the chart here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistics Cards */}
            {statistics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Current</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {statistics.current} {unit}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    {statistics.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600 mr-1" />}
                    {statistics.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600 mr-1" />}
                    {statistics.trend === 'stable' && <Minus className="h-4 w-4 text-gray-600 mr-1" />}
                    <span className="text-sm text-gray-600 dark:text-gray-400">Change</span>
                  </div>
                  <div className={`text-lg font-bold ${
                    statistics.change > 0 ? 'text-green-600' : 
                    statistics.change < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {statistics.change > 0 ? '+' : ''}{statistics.change.toFixed(1)} {unit}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <BarChart className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Average</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {statistics.average} {unit}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="h-4 w-4 text-orange-600 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Records</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {processedData.length}
                  </div>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: `Weight (${unit})`, angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Average line */}
                  {statistics && (
                    <ReferenceLine 
                      y={statistics.average} 
                      stroke="#9CA3AF" 
                      strokeDasharray="5 5"
                      label={{ value: "Average", position: "insideTopRight" }}
                    />
                  )}
                  
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Trend Analysis */}
            {statistics && statistics.changePercent && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Recent Trend Analysis
                </h4>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    {statistics.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600 mr-1" />}
                    {statistics.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600 mr-1" />}
                    {statistics.trend === 'stable' && <Minus className="h-4 w-4 text-gray-600 mr-1" />}
                    <span className="text-gray-700 dark:text-gray-300">
                      Weight has {statistics.trend === 'up' ? 'increased' : statistics.trend === 'down' ? 'decreased' : 'remained stable'} by{' '}
                      <span className="font-medium">
                        {Math.abs(statistics.changePercent).toFixed(1)}%
                      </span>{' '}
                      since last measurement
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Range: {statistics.min} - {statistics.max} {unit}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}