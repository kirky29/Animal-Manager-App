'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimalFormData, AnimalSpecies } from '@/types/animal'
import { createAnimal } from '@/lib/firestore'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ImageUpload } from '@/components/ui/image-upload'

const ANIMAL_SPECIES: { value: AnimalSpecies; label: string }[] = [
  { value: 'horse', label: 'Horse' },
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'pig', label: 'Pig' },
  { value: 'goat', label: 'Goat' },
  { value: 'llama', label: 'Llama' },
  { value: 'alpaca', label: 'Alpaca' },
  { value: 'ferret', label: 'Ferret' },
  { value: 'parrot', label: 'Parrot' },
  { value: 'bird-of-prey', label: 'Bird of Prey' },
  { value: 'chicken', label: 'Chicken' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'sheep', label: 'Sheep' },
  { value: 'cow', label: 'Cow' },
  { value: 'other', label: 'Other' },
]

export default function NewAnimalPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState<AnimalFormData>({
    name: '',
    species: 'dog',
    breed: '',
    dateOfBirth: '',
    dateOfDeath: '',
    sex: 'male',
    color: '',
    markings: '',
    microchipNumber: '',
    registrationNumber: '',
    profilePicture: '',
    notes: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      // Remove empty fields and dateOfDeath if not provided
      const cleanedData = { ...formData }
      if (!cleanedData.dateOfDeath) {
        delete cleanedData.dateOfDeath
      }
      
      const animalId = await createAnimal(user.uid, cleanedData)
      router.push(`/animals/${animalId}`)
    } catch (error: any) {
      setError(error.message || 'Failed to create animal')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/animals">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Animals
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Animal</h1>
          <p className="text-muted-foreground">
            Create a profile for your animal
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Animal Information</CardTitle>
          <CardDescription>
            Fill in the details about your animal. Required fields are marked with *
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label htmlFor="species" className="block text-sm font-medium mb-2">
                  Species *
                </label>
                <select
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  {ANIMAL_SPECIES.map(species => (
                    <option key={species.value} value={species.value}>
                      {species.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="breed" className="block text-sm font-medium mb-2">
                  Breed
                </label>
                <input
                  id="breed"
                  name="breed"
                  type="text"
                  value={formData.breed}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="sex" className="block text-sm font-medium mb-2">
                  Sex *
                </label>
                <select
                  id="sex"
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-2">
                  Date of Birth *
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label htmlFor="dateOfDeath" className="block text-sm font-medium mb-2">
                  Date of Death
                </label>
                <input
                  id="dateOfDeath"
                  name="dateOfDeath"
                  type="date"
                  value={formData.dateOfDeath}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium mb-2">
                  Color
                </label>
                <input
                  id="color"
                  name="color"
                  type="text"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="microchipNumber" className="block text-sm font-medium mb-2">
                  Microchip Number
                </label>
                <input
                  id="microchipNumber"
                  name="microchipNumber"
                  type="text"
                  value={formData.microchipNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium mb-2">
                Registration Number
              </label>
              <input
                id="registrationNumber"
                name="registrationNumber"
                type="text"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Profile Picture
              </label>
              <ImageUpload
                currentImageUrl={formData.profilePicture}
                onImageUpload={(url) => setFormData(prev => ({ ...prev, profilePicture: url }))}
                onImageRemove={() => setFormData(prev => ({ ...prev, profilePicture: '' }))}
                userId={user?.uid || ''}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="markings" className="block text-sm font-medium mb-2">
                Markings & Distinctive Features
              </label>
              <textarea
                id="markings"
                name="markings"
                value={formData.markings}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Describe any distinctive markings, scars, or features..."
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Any additional information about this animal..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Animal'}
              </Button>
              <Link href="/animals">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}