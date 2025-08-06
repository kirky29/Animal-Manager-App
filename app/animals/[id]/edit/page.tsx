'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimalFormData, AnimalSpecies, getWeightUnits, getHeightUnits } from '@/types/animal'
import { getAnimal, updateAnimalWithAudit } from '@/lib/firestore'
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

const BREED_OPTIONS: Record<AnimalSpecies | 'other', string[]> = {
  dog: [
    'Labrador Retriever',
    'Golden Retriever',
    'German Shepherd',
    'French Bulldog',
    'Bulldog',
    'Poodle',
    'Beagle',
    'Rottweiler',
    'German Shorthaired Pointer',
    'Yorkshire Terrier',
    'Dachshund',
    'Siberian Husky',
    'Great Dane',
    'Boxer',
    'Australian Shepherd',
    'Border Collie',
    'Shih Tzu',
    'Boston Terrier',
    'Pomeranian',
    'Australian Cattle Dog',
    'Other'
  ],
  cat: [
    'Domestic Shorthair',
    'Domestic Longhair',
    'Maine Coon',
    'Persian',
    'Ragdoll',
    'British Shorthair',
    'Abyssinian',
    'Siamese',
    'Scottish Fold',
    'Sphynx',
    'American Shorthair',
    'Bengal',
    'Russian Blue',
    'Munchkin',
    'Norwegian Forest Cat',
    'Birman',
    'Oriental Shorthair',
    'Devon Rex',
    'Cornish Rex',
    'Manx',
    'Other'
  ],
  horse: [
    'Quarter Horse',
    'Thoroughbred',
    'Arabian',
    'Paint Horse',
    'Appaloosa',
    'Tennessee Walking Horse',
    'Miniature Horse',
    'Mustang',
    'Clydesdale',
    'Friesian',
    'Andalusian',
    'Warmblood',
    'Draft Horse',
    'Pony',
    'Shetland Pony',
    'Welsh Pony',
    'Icelandic Horse',
    'Morgan',
    'Standardbred',
    'Percheron',
    'Other'
  ],
  cow: [
    'Holstein',
    'Angus',
    'Hereford',
    'Jersey',
    'Guernsey',
    'Brahman',
    'Charolais',
    'Limousin',
    'Simmental',
    'Texas Longhorn',
    'Highland Cattle',
    'Dexter',
    'Belted Galloway',
    'Brown Swiss',
    'Ayrshire',
    'Other'
  ],
  pig: [
    'Yorkshire',
    'Landrace',
    'Duroc',
    'Hampshire',
    'Berkshire',
    'Poland China',
    'Chester White',
    'Spotted',
    'Pietrain',
    'Large Black',
    'Mangalitsa',
    'Kunekune',
    'American Guinea Hog',
    'Ossabaw Island Hog',
    'Other'
  ],
  goat: [
    'Nubian',
    'Alpine',
    'Saanen',
    'LaMancha',
    'Oberhasli',
    'Toggenburg',
    'Nigerian Dwarf',
    'Pygmy',
    'Boer',
    'Angora',
    'Cashmere',
    'Kiko',
    'Spanish',
    'Myotonic',
    'Other'
  ],
  sheep: [
    'Suffolk',
    'Dorper',
    'Katahdin',
    'Romney',
    'Merino',
    'Corriedale',
    'Jacob',
    'Border Leicester',
    'Rambouillet',
    'Hampshire',
    'Columbia',
    'Tunis',
    'Icelandic',
    'Babydoll Southdown',
    'Other'
  ],
  rabbit: [
    'Holland Lop',
    'Netherland Dwarf',
    'Mini Rex',
    'Lionhead',
    'Flemish Giant',
    'New Zealand',
    'Californian',
    'Dutch',
    'English Angora',
    'Jersey Wooly',
    'Mini Lop',
    'Rex',
    'Himalayan',
    'Polish',
    'English Lop',
    'French Lop',
    'Havana',
    'Silver Marten',
    'Other'
  ],
  chicken: [
    'Rhode Island Red',
    'Leghorn',
    'Plymouth Rock',
    'Orpington',
    'Wyandotte',
    'Australorp',
    'Sussex',
    'Brahma',
    'Cochin',
    'Silkie',
    'Araucana',
    'Marans',
    'Polish',
    'Bantam',
    'Easter Egger',
    'Cornish Cross',
    'Other'
  ],
  llama: [
    'Classic',
    'Wooly',
    'Suri',
    'Silky',
    'Other'
  ],
  alpaca: [
    'Huacaya',
    'Suri',
    'Other'
  ],
  ferret: [
    'Domestic Ferret',
    'Angora Ferret',
    'Other'
  ],
  parrot: [
    'African Grey',
    'Macaw',
    'Cockatoo',
    'Amazon',
    'Conure',
    'Cockatiel',
    'Lovebird',
    'Budgerigar',
    'Caique',
    'Eclectus',
    'Quaker Parrot',
    'Senegal Parrot',
    'Other'
  ],
  'bird-of-prey': [
    'Red-tailed Hawk',
    'Peregrine Falcon',
    'Great Horned Owl',
    'Barn Owl',
    'Cooper\'s Hawk',
    'Sharp-shinned Hawk',
    'Kestrel',
    'Screech Owl',
    'Barred Owl',
    'Other'
  ],
  other: ['Other']
}

const SEX_OPTIONS: Record<AnimalSpecies | 'other', { value: string; label: string }[]> = {
  dog: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'neutered', label: 'Neutered Male' },
    { value: 'spayed', label: 'Spayed Female' },
    { value: 'other', label: 'Other' }
  ],
  cat: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'neutered', label: 'Neutered Male' },
    { value: 'spayed', label: 'Spayed Female' },
    { value: 'other', label: 'Other' }
  ],
  horse: [
    { value: 'stallion', label: 'Stallion (Intact Male)' },
    { value: 'gelding', label: 'Gelding (Castrated Male)' },
    { value: 'mare', label: 'Mare (Female)' },
    { value: 'filly', label: 'Filly (Young Female)' },
    { value: 'colt', label: 'Colt (Young Male)' },
    { value: 'other', label: 'Other' }
  ],
  cow: [
    { value: 'bull', label: 'Bull (Intact Male)' },
    { value: 'steer', label: 'Steer (Castrated Male)' },
    { value: 'cow', label: 'Cow (Female)' },
    { value: 'heifer', label: 'Heifer (Young Female)' },
    { value: 'calf', label: 'Calf (Young)' },
    { value: 'other', label: 'Other' }
  ],
  pig: [
    { value: 'boar', label: 'Boar (Intact Male)' },
    { value: 'barrow', label: 'Barrow (Castrated Male)' },
    { value: 'sow', label: 'Sow (Female)' },
    { value: 'gilt', label: 'Gilt (Young Female)' },
    { value: 'piglet', label: 'Piglet (Young)' },
    { value: 'other', label: 'Other' }
  ],
  goat: [
    { value: 'buck', label: 'Buck (Male)' },
    { value: 'wether', label: 'Wether (Castrated Male)' },
    { value: 'doe', label: 'Doe (Female)' },
    { value: 'kid', label: 'Kid (Young)' },
    { value: 'other', label: 'Other' }
  ],
  sheep: [
    { value: 'ram', label: 'Ram (Male)' },
    { value: 'wether', label: 'Wether (Castrated Male)' },
    { value: 'ewe', label: 'Ewe (Female)' },
    { value: 'lamb', label: 'Lamb (Young)' },
    { value: 'other', label: 'Other' }
  ],
  chicken: [
    { value: 'rooster', label: 'Rooster (Male)' },
    { value: 'capon', label: 'Capon (Castrated Male)' },
    { value: 'hen', label: 'Hen (Female)' },
    { value: 'pullet', label: 'Pullet (Young Female)' },
    { value: 'cockerel', label: 'Cockerel (Young Male)' },
    { value: 'chick', label: 'Chick (Young)' },
    { value: 'other', label: 'Other' }
  ],
  rabbit: [
    { value: 'buck', label: 'Buck (Male)' },
    { value: 'doe', label: 'Doe (Female)' },
    { value: 'kit', label: 'Kit (Young)' },
    { value: 'other', label: 'Other' }
  ],
  llama: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'gelding', label: 'Gelding (Castrated Male)' },
    { value: 'cria', label: 'Cria (Young)' },
    { value: 'other', label: 'Other' }
  ],
  alpaca: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'gelding', label: 'Gelding (Castrated Male)' },
    { value: 'cria', label: 'Cria (Young)' },
    { value: 'other', label: 'Other' }
  ],
  ferret: [
    { value: 'hob', label: 'Hob (Male)' },
    { value: 'jill', label: 'Jill (Female)' },
    { value: 'kit', label: 'Kit (Young)' },
    { value: 'other', label: 'Other' }
  ],
  parrot: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'unknown', label: 'Unknown/Unsexed' },
    { value: 'other', label: 'Other' }
  ],
  'bird-of-prey': [
    { value: 'male', label: 'Male (Tiercel)' },
    { value: 'female', label: 'Female' },
    { value: 'unknown', label: 'Unknown/Unsexed' },
    { value: 'other', label: 'Other' }
  ],
  other: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'hermaphrodite', label: 'Hermaphrodite' },
    { value: 'unknown', label: 'Unknown' },
    { value: 'other', label: 'Other' }
  ]
}

export default function EditAnimalPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const animalId = params.id as string

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
    weight: undefined,
    weightUnit: 'kg',
    height: undefined,
    heightUnit: 'cm',
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [customBreed, setCustomBreed] = useState('')
  const [customSpecies, setCustomSpecies] = useState('')
  const [originalProfilePicture, setOriginalProfilePicture] = useState<string>('')

  useEffect(() => {
    const loadAnimal = async () => {
      if (!user || !animalId) {
        router.push('/animals')
        return
      }

      try {
        const animal = await getAnimal(animalId)
        if (!animal) {
          router.push('/animals')
          return
        }

        // Check ownership
        if (animal.ownerId !== user.uid) {
          router.push('/animals')
          return
        }

        // Convert to form data
        setFormData({
          name: animal.name,
          species: animal.species,
          breed: animal.breed || '',
          dateOfBirth: animal.dateOfBirth.toISOString().split('T')[0],
          dateOfDeath: animal.dateOfDeath ? animal.dateOfDeath.toISOString().split('T')[0] : '',
          sex: animal.sex,
          color: animal.color || '',
          markings: animal.markings || '',
          microchipNumber: animal.microchipNumber || '',
          registrationNumber: animal.registrationNumber || '',
          profilePicture: animal.profilePicture || '',
          notes: animal.notes || '',
          weight: animal.weight,
          weightUnit: animal.weightUnit || 'kg',
          height: animal.height,
          heightUnit: animal.heightUnit || 'cm',
        })
        setOriginalProfilePicture(animal.profilePicture || '')
        
        // Handle custom species and breed
        if (animal.species === 'other') {
          setCustomSpecies(animal.species)
        }
        if (animal.breed === 'Other') {
          setCustomBreed(animal.breed)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error loading animal:', error)
        router.push('/animals')
      }
    }

    loadAnimal()
  }, [user, animalId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')

    try {
      // Clean up the data
      const cleanedData = { ...formData }
      
      // Use custom species if "other" is selected and custom species is provided
      if (formData.species === 'other' && customSpecies.trim()) {
        cleanedData.species = customSpecies.trim().toLowerCase().replace(/\s+/g, '-') as AnimalSpecies
      }
      
      // Use custom breed if "Other" is selected and custom breed is provided
      if (formData.breed === 'Other' && customBreed.trim()) {
        cleanedData.breed = customBreed.trim()
      }
      
      // Validate date of birth is not in the future
      if (cleanedData.dateOfBirth) {
        const birthDate = new Date(cleanedData.dateOfBirth)
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        
        if (birthDate > today) {
          setError('Date of birth cannot be in the future')
          return
        }
      }
      
      // Remove undefined values to prevent Firestore errors
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key as keyof typeof cleanedData] === undefined) {
          delete cleanedData[key as keyof typeof cleanedData]
        }
      })
      
      if (!cleanedData.dateOfDeath) {
        delete cleanedData.dateOfDeath
      }
      
      await updateAnimalWithAudit(
        animalId, 
        cleanedData, 
        user.uid,
        user.displayName || undefined,
        user.email || undefined,
        originalProfilePicture
      )
      router.push(`/animals/${animalId}`)
    } catch (error: any) {
      setError(error.message || 'Failed to update animal')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    // Get the first sex option for the selected species
    const getDefaultSex = (species: string) => {
      const sexOptions = SEX_OPTIONS[species as AnimalSpecies] || SEX_OPTIONS.other
      return sexOptions[0]?.value || 'male'
    }
    
    // Handle number inputs
    let processedValue: string | number | undefined = value
    if (type === 'number') {
      if (value === '') {
        processedValue = undefined
      } else {
        const numValue = parseFloat(value)
        processedValue = isNaN(numValue) ? undefined : numValue
      }
    }
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: processedValue,
      // Reset breed and sex when species changes (only if it's a valid option)
      ...(name === 'species' ? { 
        breed: '', 
        sex: SEX_OPTIONS[value as AnimalSpecies]?.find(opt => opt.value === prev.sex) ? prev.sex : getDefaultSex(value)
      } : {})
    }))
    
    // Reset custom breed when species changes or breed is not "Other"
    if (name === 'species' || (name === 'breed' && value !== 'Other')) {
      setCustomBreed('')
    }
    
    // Reset custom species when species is not "other"
    if (name === 'species' && value !== 'other') {
      setCustomSpecies('')
    }
  }

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, profilePicture: imageUrl }))
  }

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, profilePicture: '' }))
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading animal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link href={`/animals/${animalId}`}>
              <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/15 px-3 py-2 rounded-lg transition-all duration-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <div className="hidden sm:block text-white/60 text-sm">
              Editing {formData.name}
            </div>
          </div>
          
          {/* Title Section */}
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Edit Animal</h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Update {formData.name}'s information - all fields can be modified
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Animal Information</CardTitle>
            <CardDescription>
              Update the details about your animal. Only name and species are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {ANIMAL_SPECIES.map(species => (
                    <option key={species.value} value={species.value}>
                      {species.label}
                    </option>
                  ))}
                </select>
                {formData.species === 'other' && (
                  <input
                    type="text"
                    placeholder="Enter custom species..."
                    value={customSpecies}
                    onChange={(e) => setCustomSpecies(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring mt-2"
                    required
                  />
                )}
              </div>

              <div>
                <label htmlFor="breed" className="block text-sm font-medium mb-2">
                  Breed
                </label>
                {formData.species === 'other' ? (
                  <input
                    id="breed"
                    name="breed"
                    type="text"
                    value={formData.breed}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter breed for your custom species..."
                  />
                ) : (
                  <>
                    <select
                      id="breed"
                      name="breed"
                      value={BREED_OPTIONS[formData.species as AnimalSpecies]?.includes(formData.breed || '') ? formData.breed || '' : ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a breed...</option>
                      {BREED_OPTIONS[formData.species as AnimalSpecies]?.map(breed => (
                        <option key={breed} value={breed}>
                          {breed}
                        </option>
                      ))}
                    </select>
                    {formData.breed === 'Other' && (
                      <input
                        type="text"
                        placeholder="Enter custom breed..."
                        value={customBreed}
                        onChange={(e) => setCustomBreed(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring mt-2"
                      />
                    )}
                  </>
                )}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {(SEX_OPTIONS[formData.species as AnimalSpecies] || SEX_OPTIONS.other).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Weight and Height Fields */}
              <div className="col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium mb-2">
                      Weight
                    </label>
                    <div className="flex space-x-3">
                      <input
                        id="weight"
                        name="weight"
                        type="number"
                        step="0.1"
                        value={formData.weight || ''}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Weight"
                      />
                      <select
                        name="weightUnit"
                        value={formData.weightUnit}
                        onChange={handleInputChange}
                        className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {getWeightUnits(formData.species).map(unit => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="height" className="block text-sm font-medium mb-2">
                      Height
                    </label>
                    <div className="flex space-x-3">
                      <input
                        id="height"
                        name="height"
                        type="number"
                        step="0.1"
                        value={formData.height || ''}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Height"
                      />
                      <select
                        name="heightUnit"
                        value={formData.heightUnit}
                        onChange={handleInputChange}
                        className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {getHeightUnits(formData.species).map(unit => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Breed registry number"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Additional Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Profile Picture
                </label>
                <ImageUpload
                  currentImageUrl={formData.profilePicture}
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  userId={user?.uid || ''}
                  animalId={animalId}
                  disabled={saving}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional information about this animal..."
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={saving} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href={`/animals/${animalId}`}>
                <Button type="button" variant="outline" className="px-6 py-3">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}