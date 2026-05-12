import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  // Auth routes: redirect to dashboard if already logged in
  if (token && request.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Protected routes: redirect to login if no token
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
