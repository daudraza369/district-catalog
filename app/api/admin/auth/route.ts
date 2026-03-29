import { NextRequest, NextResponse } from 'next/server'
import { apiError, sanitizeText } from '@/lib/api'
import { getEnv } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { password?: string }
    if (!body.password) {
      return apiError(400, 'Password is required', 'VALIDATION_ERROR')
    }

    if (sanitizeText(body.password) !== getEnv().ADMIN_PASSWORD) {
      return apiError(401, 'Unauthorized', 'UNAUTHORIZED')
    }

    return NextResponse.json({ success: true, token: 'admin_authenticated' })
  } catch (error) {
    return apiError(500, 'Internal server error', 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
  }
}
