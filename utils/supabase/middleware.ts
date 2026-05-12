// Supabase removed — stub to prevent broken imports
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export function createClient(request: NextRequest) {
  return { supabase: null, response: NextResponse.next() }
}
