import { NextResponse } from 'next/server'

// Auth callback no longer needed (Supabase removed)
// Redirect to dashboard if somehow reached
export async function GET(request: Request) {
  const url = new URL(request.url)
  return NextResponse.redirect(new URL('/dashboard', url.origin))
}
