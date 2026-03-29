import { NextResponse } from 'next/server'

export interface ApiErrorShape {
  error: string
  code: string
  details?: unknown
}

export function apiError(status: number, error: string, code: string, details?: unknown) {
  const payload: ApiErrorShape = { error, code }
  if (details !== undefined) {
    payload.details = details
  }
  return NextResponse.json(payload, { status })
}

export function sanitizeText(input: string): string {
  return input.trim().replace(/\s+/g, ' ')
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}
