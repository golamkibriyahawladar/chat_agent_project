import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const url = request.nextUrl.clone()

  // Case 1: If user is logged in and trying to access auth pages, redirect to dashboard
  if (user && (url.pathname.startsWith('/login') || url.pathname.startsWith('/signup'))) {
    url.pathname = '/dashboard'
    return Response.redirect(url)
  }

  // Case 2: If user is not logged in and trying to access protected pages, redirect to login
  if (!user && (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/admin'))) {
    url.pathname = '/login'
    return Response.redirect(url)
  }

  // Case 3: Public home page redirect to dashboard if logged in, or stay if not
  if (user && url.pathname === '/') {
    url.pathname = '/dashboard'
    return Response.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
