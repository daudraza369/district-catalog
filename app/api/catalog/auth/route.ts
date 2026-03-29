import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { password?: string }
  const success = body.password === process.env.B2B_PASSWORD
  return NextResponse.json({ success, mode: success ? 'b2b' : 'b2c' })
}
