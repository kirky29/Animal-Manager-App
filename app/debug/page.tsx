'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { getAnimals } from '@/lib/firestore'
import { Animal } from '@/types/animal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DebugPage() {
  const { user, loading } = useAuth()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [animalsLoading, setAnimalsLoading] = useState(false)

  useEffect(() => {
    const fetchAnimals = async () => {
      if (user) {
        setAnimalsLoading(true)
        try {
          const userAnimals = await getAnimals(user.uid)
          setAnimals(userAnimals)
        } catch (error) {
          console.error('Error fetching animals:', error)
        } finally {
          setAnimalsLoading(false)
        }
      }
    }

    fetchAnimals()
  }, [user])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Debug Information</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? 'Logged In' : 'Not Logged In'}</p>
            {user && (
              <p><strong>User ID:</strong> {user.uid}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Animals in Database</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Loading Animals:</strong> {animalsLoading ? 'Yes' : 'No'}</p>
            <p><strong>Number of Animals:</strong> {animals.length}</p>
            {animals.length > 0 && (
              <div>
                <p><strong>Animals:</strong></p>
                <ul className="list-disc list-inside">
                  {animals.map(animal => (
                    <li key={animal.id}>
                      {animal.name} ({animal.species}) - ID: {animal.id}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Link href="/auth/login">
          <Button>Go to Login</Button>
        </Link>
        <Link href="/animals/new">
          <Button variant="outline">Add Test Animal</Button>
        </Link>
        <Link href="/animals">
          <Button variant="outline">View Animals</Button>
        </Link>
      </div>
    </div>
  )
} 