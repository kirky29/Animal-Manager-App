'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getAnimals } from '@/lib/firestore'
import { Animal } from '@/types/animal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function DebugPage() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnimals = async () => {
      if (user) {
        try {
          const userAnimals = await getAnimals(user.uid)
          console.log('Debug - Animals fetched:', userAnimals)
          setAnimals(userAnimals)
        } catch (error) {
          console.error('Debug - Error fetching animals:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchAnimals()
  }, [user])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Debug Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>User Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User ID: {user?.uid || 'Not logged in'}</p>
          <p>Email: {user?.email || 'Not logged in'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Animals ({animals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {animals.length === 0 ? (
            <p>No animals found</p>
          ) : (
            <div className="space-y-4">
              {animals.map((animal) => (
                <div key={animal.id} className="border p-4 rounded">
                  <h3 className="font-bold">{animal.name}</h3>
                  <p>ID: {animal.id}</p>
                  <p>Species: {animal.species}</p>
                  <p>Owner ID: {animal.ownerId}</p>
                  <div className="mt-2 space-x-2">
                    <Link href={`/animals/${animal.id}`}>
                      <Button size="sm">View Profile</Button>
                    </Link>
                    <Link href={`/animals/${animal.id}/edit`}>
                      <Button size="sm" variant="outline">Edit</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 