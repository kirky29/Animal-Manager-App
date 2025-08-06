import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle redirects from old ID-based URLs to new slug-based URLs
  // This will help with SEO and user experience during the transition
  if (pathname.startsWith('/animals/') && pathname.split('/').length === 3) {
    const animalId = pathname.split('/')[2]
    
    // Check if this looks like a Firestore ID (alphanumeric, 20+ characters)
    if (animalId && /^[a-zA-Z0-9]{20,}$/.test(animalId)) {
      // This is likely an old ID-based URL, redirect to the new format
      // We'll redirect to the animals list page since we can't generate the slug without the animal data
      const newUrl = new URL('/animals', request.url)
      return NextResponse.redirect(newUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}