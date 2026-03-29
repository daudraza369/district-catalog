import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { getEnv } from '@/lib/env'

export async function GET(request: NextRequest) {
  const unauthorized = validateAdminRequest(request)
  if (unauthorized) {
    return unauthorized
  }

  return NextResponse.json({
    ingest_secret: getEnv().INGEST_SECRET
  })
}
