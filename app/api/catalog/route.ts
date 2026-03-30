import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { type CatalogProduct, type Origin, type Shipment } from '@/lib/types'
import { apiError } from '@/lib/api'
import { getFlowerImagePath } from '@/lib/flower-images'
import { CATALOG_CACHE_TTL_MS, catalogCache, getCatalogCacheKey } from '@/lib/catalog-cache'

type QueryRow = {
  id: string
  price: number
  price_b2c: number | null
  stock: boolean
  units_per_box: number | null
  units_per_bunch: number | null
  products:
    | {
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
      }
    | Array<{
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
      }>
    | null
  shipments: Shipment[] | Shipment | null
}

type RowProduct = {
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
}

function getProductValue(row: QueryRow): RowProduct | null {
  const products = row.products
  if (!products) return null
  if (Array.isArray(products)) {
    return products[0] ?? null
  }
  return products
}

function getShipmentValue(row: QueryRow): Shipment | null {
  const shipments = row.shipments
  if (!shipments) return null
  if (Array.isArray(shipments)) return shipments[0] ?? null
  return shipments
}

function isOrigin(value: string): value is Origin {
  return ['netherlands', 'ethiopia', 'kenya', 'saudi', 'south_africa', 'italy', 'ecuador', 'colombia', 'other'].includes(value)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const searchParams = request.nextUrl.searchParams
    const mode = (searchParams.get('mode') === 'b2b' ? 'b2b' : 'b2c') as 'b2b' | 'b2c'
    const cacheKey = getCatalogCacheKey(mode, searchParams)
    const cached = catalogCache.get(cacheKey)
    if (cached && Date.now() - cached.cachedAt < CATALOG_CACHE_TTL_MS) {
      return NextResponse.json({
        shipment: cached.shipment,
        products: cached.products,
        total: cached.total
      })
    }

    const shipmentId = searchParams.get('shipment_id')
    const origin = searchParams.get('origin')
    const stockParam = searchParams.get('stock')
    const flowerType = searchParams.get('flower_type')?.trim() ?? ''
    const search = searchParams.get('search')?.trim().toLowerCase() ?? ''

    let query = supabase
      .from('shipment_products')
      .select(`
        id,
        price,
        price_b2c,
        stock,
        units_per_box,
        units_per_bunch,
        products (
          id,
          name,
          variety,
          stem_length,
          color,
          origin,
          image_url,
          active,
          show_b2b,
          show_b2c
        ),
        shipments!inner (
          id,
          batch_id,
          arrival_date,
          price_unit,
          is_active,
          created_at
        )
      `)
      .eq('products.active', true)
      .order('name', { ascending: true, referencedTable: 'products' })
      .order('variety', { ascending: true, referencedTable: 'products' })

    if (shipmentId) {
      query = query.eq('shipments.id', shipmentId)
    } else {
      query = query.eq('shipments.is_active', true)
    }

    const start = Date.now()
    const { data, error } = await query
    console.log(`Supabase query took ${Date.now() - start}ms`)
    if (error) {
      return apiError(500, 'Failed to load catalog products', 'DB_QUERY_FAILED', error.message)
    }
    const rows = (data ?? []) as unknown as QueryRow[]
    const visibilityByShipmentProductId = new Map<string, { show_b2b: boolean; show_b2c: boolean }>()
    for (const row of rows) {
      const product = getProductValue(row)
      if (product) {
        visibilityByShipmentProductId.set(row.id, { show_b2b: product.show_b2b, show_b2c: product.show_b2c })
      }
    }
    let shipment: Shipment | null = rows[0] ? getShipmentValue(rows[0]) : null
    if (!shipment) {
      const shipmentLookup = shipmentId
        ? await supabase.from('shipments').select('*').eq('id', shipmentId).maybeSingle()
        : await supabase
            .from('shipments')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

      if (shipmentLookup.error) {
        return apiError(500, 'Failed to load shipment', 'DB_QUERY_FAILED', shipmentLookup.error.message)
      }
      shipment = (shipmentLookup.data as Shipment | null) ?? null
    }

    if (!shipment) {
      return NextResponse.json({ shipment: null, products: [], total: 0 })
    }
    const stockFilter = stockParam === null ? null : stockParam === 'true'
    const normalizedOrigin = origin && isOrigin(origin) ? origin : null
    const catalogProducts: CatalogProduct[] = rows
      .map((row) => ({ row, product: getProductValue(row) }))
      .filter((entry) => Boolean(entry.product))
      .map((row) => {
        const product = row.product!
        return {
          id: product.id,
          shipment_product_id: row.row.id,
          name: product.name,
          variety: product.variety,
          stem_length: product.stem_length ?? null,
          color: product.color ?? null,
          origin: product.origin,
          image_url: product.image_url ?? null,
          price: Number(row.row.price),
          price_b2c: row.row.price_b2c !== null ? Number(row.row.price_b2c) : Number(row.row.price) * 10,
          price_per_bunch: row.row.price_b2c !== null ? Number(row.row.price_b2c) : Number(row.row.price) * 10,
          stock: row.row.stock,
          arrival_date: getShipmentValue(row.row)?.arrival_date ?? '',
          units_per_box: row.row.units_per_box ?? null,
          units_per_bunch: row.row.units_per_bunch ?? null
        }
      })
      .filter((row) => (normalizedOrigin ? row.origin === normalizedOrigin : true))
      .filter((row) => (flowerType ? row.name === flowerType : true))
      .filter((row) => (stockFilter === null ? true : row.stock === stockFilter))
      .filter((row) => (search ? `${row.name} ${row.variety}`.toLowerCase().includes(search) : true))
      .filter((rowWithMode) => {
        const visibility = visibilityByShipmentProductId.get(rowWithMode.shipment_product_id)
        if (!visibility) return false
        return mode === 'b2b' ? visibility.show_b2b === true : visibility.show_b2c === true
      })

    for (const product of catalogProducts) {
      if (!product.image_url) {
        product.image_url = getFlowerImagePath(product.name, product.variety)
      }
    }

    const missingNames = Array.from(
      new Set(catalogProducts.filter((item) => !item.image_url).map((item) => item.name.trim()).filter(Boolean))
    )
    if (missingNames.length > 0) {
      const { data: imageRows, error: imageError } = await supabase
        .from('image_library')
        .select('flower_name, image_url')
        .in('flower_name', missingNames)

      if (!imageError) {
        const imageMap = new Map<string, string>()
        for (const row of imageRows ?? []) {
          imageMap.set(String(row.flower_name).toLowerCase(), String(row.image_url))
        }

        for (const product of catalogProducts) {
          if (!product.image_url) {
            product.image_url = imageMap.get(product.name.toLowerCase()) ?? null
          }
        }
      }
    }

    const responsePayload = {
      shipment,
      products: catalogProducts,
      total: catalogProducts.length
    }

    catalogCache.set(cacheKey, { ...responsePayload, cachedAt: Date.now() })

    return NextResponse.json(responsePayload)
  } catch (error) {
    return apiError(500, 'Internal server error', 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
  }
}
