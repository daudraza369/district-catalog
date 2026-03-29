import { type Origin, ORIGIN_LABELS } from '@/lib/types'

export function formatSarPrice(value: number): string {
  return `SAR ${value.toFixed(2)}`
}

export function formatArrivalDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  })
}

export function normalizeOrigin(value: string): Origin {
  const normalized = value.toLowerCase().trim().replace(/\s+/g, '_')
  if (normalized in ORIGIN_LABELS) {
    return normalized as Origin
  }
  return 'other'
}

export function cn(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(' ')
}
