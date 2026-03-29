import { type NextRequest, NextResponse } from 'next/server'
import { getEnv } from '@/lib/env'

export function validateAdminRequest(request: NextRequest): NextResponse | null {
  const auth = request.headers.get('authorization')
  const token = auth?.replace('Bearer ', '').trim()
  if (token !== getEnv().ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }
  return null
}
