'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, PawPrint, Shield, Smartphone } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p>Loading application...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Heart className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Animal Manager
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Keep track of your beloved animals with comprehensive health records, 
            growth tracking, and beautiful profiles. Perfect for horses, dogs, cats, 
            and many other species.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your animals
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <PawPrint className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Comprehensive Profiles</CardTitle>
                <CardDescription>
                  Track birth dates, weights, heights, medical records, and more for each animal
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your animal data is securely stored with Firebase and only accessible by you
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Smartphone className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Mobile Responsive</CardTitle>
                <CardDescription>
                  Access your animal records from any device, anywhere, anytime
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Supported Animals Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">
            Support for All Your Animals
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you have horses, dogs, cats, or more exotic animals like llamas, 
            alpacas, or birds of prey, Animal Manager adapts to your needs.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
            {[
              'Horses', 'Dogs', 'Cats', 'Pigs', 'Goats', 'Llamas',
              'Alpacas', 'Ferrets', 'Parrots', 'Birds of Prey', 'Chickens', 'And More...'
            ].map((animal) => (
              <div key={animal} className="p-3 bg-muted rounded-lg">
                {animal}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}