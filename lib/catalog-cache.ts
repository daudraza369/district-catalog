import { type CatalogProduct, type Shipment } from '@/lib/types'

export interface CatalogCacheEntry {
  shipment: Shipment | null
  products: CatalogProduct[]
  total: number
  cachedAt: number
}

export const catalogCache = new Map<string, CatalogCacheEntry>()

export const CATALOG_CACHE_TTL_MS = 60_000

export function getCatalogCacheKey(mode: 'b2b' | 'b2c', search: URLSearchParams): string {
  const params = new URLSearchParams(search)
  params.set('mode', mode)
  return params.toString()
}
