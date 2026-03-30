export type Origin =
  | 'netherlands'
  | 'ethiopia'
  | 'kenya'
  | 'saudi'
  | 'south_africa'
  | 'italy'
  | 'ecuador'
  | 'colombia'
  | 'other'

export interface Shipment {
  id: string
  batch_id: string
  arrival_date: string
  price_unit: string
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  variety: string
  stem_length: string | null
  color: string | null
  origin: Origin
  image_url: string | null
  active: boolean
  show_b2b: boolean
  show_b2c: boolean
  price?: number | null
  price_b2c?: number | null
  stock?: boolean | null
  created_at: string
}

export interface ShipmentProduct {
  id: string
  shipment_id: string
  product_id: string
  price: number
  price_b2c: number | null
  price_per_bunch: number | null
  stock: boolean
  units_per_box: number | null
  units_per_bunch: number | null
  created_at: string
}

export interface CatalogProduct {
  id: string
  shipment_product_id: string
  name: string
  variety: string
  stem_length: string | null
  color: string | null
  origin: Origin
  image_url: string | null
  price: number
  price_b2c: number | null
  price_per_bunch: number | null
  stock: boolean
  arrival_date: string
  units_per_box?: number | null
  units_per_bunch?: number | null
}

export interface IngestPayload {
  secret: string
  shipment: {
    batch_id: string
    arrival_date: string
    price_unit?: string
  }
  products: Array<{
    name: string
    variety: string
    origin: Origin
    stem_length?: string | null
    color?: string | null
    price: number
    price_b2c?: number | null
    stock: boolean
    show_b2b?: boolean
    show_b2c?: boolean
    units_per_box?: number | null
    units_per_bunch?: number | null
    image_url?: string | null
  }>
}

export interface IngestResult {
  success: boolean
  shipment_id: string
  batch_id: string
  products_created: number
  products_updated: number
  images_matched: number
  errors: string[]
}

export const ORIGIN_LABELS: Record<Origin, string> = {
  netherlands: 'Holland',
  ethiopia: 'Ethiopia',
  kenya: 'Kenya',
  saudi: 'Saudi Arabia',
  south_africa: 'South Africa',
  italy: 'Italy',
  ecuador: 'Ecuador',
  colombia: 'Colombia',
  other: 'Other'
}

export const ORIGIN_ISO: Record<Origin, string> = {
  netherlands: 'NL',
  ethiopia: 'ET',
  kenya: 'KE',
  saudi: 'SA',
  south_africa: 'ZA',
  italy: 'IT',
  ecuador: 'EC',
  colombia: 'CO',
  other: '—'
}
