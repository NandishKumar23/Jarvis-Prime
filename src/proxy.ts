import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

// Match all routes except:
// - Static files (files with extensions)
// - Next.js internals (_next)
// - Public assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc.)
     */
    String.raw`/((?!api/auth|_next/static|_next/image|favicon.ico|.*\..*$).*)`,
  ],
}

// Proxy function for Next.js 16
export default function proxy(request: NextRequest) {
  // @ts-expect-error - NextAuth's auth works as middleware
  return auth(request)
}
