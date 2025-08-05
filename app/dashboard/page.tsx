'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Heart, Calendar, Weight, Ruler } from 'lucide-react'
import Link from 'next/link'
import { Animal } from '@/types/animal'
import { getAnimals } from '@/lib/firestore'
import { formatDistanceToNow } from 'date-fns'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'

export default function DashboardPage() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnimals = async () => {
      if (user) {
        try {
          console.log('Fetching animals for user:', user.uid)
          const userAnimals = await getAnimals(user.uid)
          console.log('Fetched animals:', userAnimals)
          setAnimals(userAnimals)
        } catch (error) {
          console.error('Error fetching animals:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchAnimals()
  }, [user])

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

  const totalAnimals = animals.length
  const livingAnimals = animals.filter(animal => !animal.dateOfDeath).length
  const recentlyAdded = animals.filter(animal => {
    const daysSinceAdded = (Date.now() - animal.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceAdded <= 7
  }).length

  return (
    <ProtectedRoute>
      <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your animals.
          </p>
        </div>
        <Link href="/animals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Animal
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnimals}</div>
            <p className="text-xs text-muted-foreground">
              {livingAnimals} currently living
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Added</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentlyAdded}</div>
            <p className="text-xs text-muted-foreground">
              In the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Species</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(animals.map(animal => animal.species)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different species tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Animals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Animals</CardTitle>
          <CardDescription>
            Your most recently added animals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {animals.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No animals yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first animal to track their health and growth.
              </p>
              <Link href="/animals/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Animal
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {animals.slice(0, 5).map((animal) => (
                <Link
                  key={animal.id}
                  href={`/animals/${animal.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                      <div className="flex items-center space-x-4">
                    <ImageWithFallback
                      src={animal.profilePicture}
                      alt={`${animal.name}'s profile picture`}
                      containerClassName="w-12 h-12 rounded-full overflow-hidden"
                      fallbackClassName="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"
                    />
                      <div>
                        <h4 className="font-semibold">{animal.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {animal.species} • {animal.sex}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Added {formatDistanceToNow(animal.createdAt)} ago
                      </p>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
              {animals.length > 5 && (
                <div className="text-center pt-4">
                  <Link href="/animals">
                    <Button variant="outline">View All Animals</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </ProtectedRoute>
  )
}