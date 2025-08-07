'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimalFormData, AnimalSpecies, getWeightUnits, getHeightUnits } from '@/types/animal'
import { createAnimalWithAudit } from '@/lib/firestore'
import { ArrowLeft, Plus, Heart } from 'lucide-react'
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

const BREED_OPTIONS: Record<AnimalSpecies, string[]> = {
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
    weight: undefined,
    weightUnit: 'kg',
    height: undefined,
    heightUnit: 'cm',
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customBreed, setCustomBreed] = useState('')
  const [customSpecies, setCustomSpecies] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      // Clean up the data - remove empty fields
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
        today.setHours(23, 59, 59, 999) // Set to end of today
        
        if (birthDate > today) {
          setError('Date of birth cannot be in the future')
          return
        }
      }
      
      // Remove empty optional fields and undefined values
      Object.keys(cleanedData).forEach(key => {
        if (key !== 'name' && key !== 'species' && 
            (cleanedData[key as keyof AnimalFormData] === '' || 
             cleanedData[key as keyof AnimalFormData] === undefined)) {
          delete cleanedData[key as keyof AnimalFormData]
        }
      })
      
      // Ensure we have at least a default date of birth if not provided
      if (!cleanedData.dateOfBirth) {
        cleanedData.dateOfBirth = new Date().toISOString().split('T')[0]
      }
      
      const { animalId, slug } = await createAnimalWithAudit(
        user.uid, 
        cleanedData,
        user.displayName || undefined,
        user.email || undefined
      )
      router.push(`/animals/${slug}`)
    } catch (error: any) {
      setError(error.message || 'Failed to create animal')
    } finally {
      setLoading(false)
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
      // Reset breed and sex when species changes
      ...(name === 'species' ? { breed: '', sex: getDefaultSex(value) } : {})
    }))
    
    // Reset custom breed when species changes or breed is not "Other"
    if (name === 'species' || (name === 'breed' && value !== 'Other')) {
      setCustomBreed('')
    }
    
    // Reset custom species when species is not "Other"
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Modern Header */}
      <header className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="w-full px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/animals" className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to Animals</span>
              </Link>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Animal</h1>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Heart className="h-4 w-4" />
                <span>Create Profile</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 rounded-2xl mb-4 border border-emerald-200/50 dark:border-emerald-700/30">
                <Plus className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Animal Profile</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Add a new animal to your collection. Only name and species are required to get started.
              </p>
            </div>
          </div>

          {/* Form Card */}
          <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    {error}
                  </div>
                )}

                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Basic Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Animal Name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="e.g., Buddy, Luna, Charlie"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="species" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Species *
                      </label>
                      <select
                        id="species"
                        name="species"
                        value={formData.species}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 mt-2"
                          required
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="breed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Breed
                      </label>
                      {formData.species === 'other' ? (
                        <input
                          id="breed"
                          name="breed"
                          type="text"
                          value={formData.breed}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Enter breed for your custom species..."
                        />
                      ) : (
                        <>
                          <select
                            id="breed"
                            name="breed"
                            value={BREED_OPTIONS[formData.species as AnimalSpecies]?.includes(formData.breed || '') ? formData.breed || '' : ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 mt-2"
                            />
                          )}
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="sex" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sex
                      </label>
                      <select
                        id="sex"
                        name="sex"
                        value={formData.sex}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {(SEX_OPTIONS[formData.species as AnimalSpecies] || SEX_OPTIONS.other).map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date of Birth
                      </label>
                      <input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Color
                      </label>
                      <input
                        id="color"
                        name="color"
                        type="text"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="e.g., Brown, Black & White"
                      />
                    </div>

                    {/* Weight and Height Fields */}
                    <div className="lg:col-span-2">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                              placeholder="Weight"
                            />
                            <select
                              name="weightUnit"
                              value={formData.weightUnit}
                              onChange={handleInputChange}
                              className="w-28 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              {getWeightUnits(formData.species).map(unit => (
                                <option key={unit.value} value={unit.value}>
                                  {unit.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                              placeholder="Height"
                            />
                            <select
                              name="heightUnit"
                              value={formData.heightUnit}
                              onChange={handleInputChange}
                              className="w-28 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

                    <div className="space-y-2">
                      <label htmlFor="microchipNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Microchip Number
                      </label>
                      <input
                        id="microchipNumber"
                        name="microchipNumber"
                        type="text"
                        value={formData.microchipNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="15-digit number"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Registration Number
                      </label>
                      <input
                        id="registrationNumber"
                        name="registrationNumber"
                        type="text"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Breed registry number"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Additional Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Profile Picture
                      </label>
                      <ImageUpload
                        currentImageUrl={formData.profilePicture}
                        onImageUpload={handleImageUpload}
                        onImageRemove={handleImageRemove}
                        userId={user?.uid || ''}
                        animalId="new"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="markings" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Markings & Distinctive Features
                      </label>
                      <textarea
                        id="markings"
                        name="markings"
                        value={formData.markings}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Describe any distinctive markings, scars, or features..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Additional Notes
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Any additional information about this animal..."
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {loading ? 'Creating...' : 'Create Animal Profile'}
                  </Button>
                  <Link href="/animals">
                    <Button type="button" variant="outline" className="px-8 py-3 rounded-xl border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}