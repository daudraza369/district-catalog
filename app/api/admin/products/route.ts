import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { type Origin } from '@/lib/types'
import { apiError, sanitizeText } from '@/lib/api'
import { validateAdminRequest } from '@/lib/auth'
import { catalogCache } from '@/lib/catalog-cache'

const ORIGINS: Origin[] = ['netherlands', 'ethiopia', 'kenya', 'saudi', 'south_africa', 'italy', 'ecuador', 'colombia', 'other']

export async function GET(request: NextRequest) {
  try {
    const unauthorized = validateAdminRequest(request)
    if (unauthorized) {
      return unauthorized
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })

    if (error) {
      return apiError(500, 'Failed to fetch products', 'DB_QUERY_FAILED', error.message)
    }

    const products = data ?? []
    const { data: activeShipment } = await supabase
      .from('shipments')
      .select('id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (activeShipment) {
      const { data: shipmentProducts } = await supabase
        .from('shipment_products')
        .select('product_id, price, price_b2c, stock')
        .eq('shipment_id', activeShipment.id)

      const shipmentMap = new Map<string, { price: number; price_b2c: number | null; stock: boolean }>()
      for (const row of shipmentProducts ?? []) {
        shipmentMap.set(String(row.product_id), {
          price: Number(row.price),
          price_b2c: row.price_b2c === null ? null : Number(row.price_b2c),
          stock: Boolean(row.stock)
        })
      }

      for (const product of products) {
        const shipmentData = shipmentMap.get(product.id as string)
        product.price = shipmentData?.price ?? null
        product.price_b2c = shipmentData?.price_b2c ?? null
        product.stock = shipmentData?.stock ?? null
      }
    }

    return NextResponse.json({ products })
  } catch (error) {
    return apiError(500, 'Internal server error', 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
  }
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = validateAdminRequest(request)
    if (unauthorized) {
      return unauthorized
    }

    const body = (await request.json()) as {
      name?: string
      variety?: string
      stem_length?: string | null
      color?: string | null
      origin?: Origin
      price?: number
      stock?: boolean
      units_per_box?: number | null
      units_per_bunch?: number | null
      image_url?: string | null
      active?: boolean
      show_b2b?: boolean
      show_b2c?: boolean
      price_b2c?: number
    }

    const name = typeof body.name === 'string' ? sanitizeText(body.name) : ''
    const variety = typeof body.variety === 'string' ? sanitizeText(body.variety) : ''
    const stemLength = typeof body.stem_length === 'string' ? sanitizeText(body.stem_length) : null
    const color = typeof body.color === 'string' ? sanitizeText(body.color) : null
    const price = typeof body.price === 'number' ? body.price : NaN
    const stock = typeof body.stock === 'boolean' ? body.stock : true

    if (!name || !variety || !body.origin || !ORIGINS.includes(body.origin) || Number.isNaN(price) || price < 0) {
      return apiError(400, 'Invalid product payload', 'VALIDATION_ERROR')
    }
    if (body.units_per_box !== undefined && body.units_per_box !== null && (!Number.isInteger(body.units_per_box) || body.units_per_box < 0)) {
      return apiError(400, 'Invalid units_per_box value', 'VALIDATION_ERROR')
    }
    if (body.units_per_bunch !== undefined && body.units_per_bunch !== null && (!Number.isInteger(body.units_per_bunch) || body.units_per_bunch < 0)) {
      return apiError(400, 'Invalid units_per_bunch value', 'VALIDATION_ERROR')
    }

    const supabase = createAdminClient()
    let existingQuery = supabase.from('products').select('*').eq('name', name).eq('variety', variety)
    if (stemLength) {
      existingQuery = existingQuery.eq('stem_length', stemLength)
    } else {
      existingQuery = existingQuery.is('stem_length', null)
    }
    const { data: existingProduct, error: existingProductError } = await existingQuery.maybeSingle()
    if (existingProductError) {
      return apiError(500, 'Failed to load product', 'DB_QUERY_FAILED', existingProductError.message)
    }

    let product = existingProduct
    if (!product) {
      const { data: createdProduct, error: createProductError } = await supabase
        .from('products')
        .insert({
          name,
          variety,
          stem_length: stemLength,
          color,
          origin: body.origin,
          image_url: typeof body.image_url === 'string' ? sanitizeText(body.image_url) : null,
          active: body.active ?? true,
          show_b2b: body.show_b2b ?? true,
          show_b2c: body.show_b2c ?? true
        })
        .select('*')
        .single()

      if (createProductError || !createdProduct) {
        return apiError(500, 'Failed to create product', 'DB_QUERY_FAILED', createProductError?.message)
      }
      product = createdProduct
    } else {
      const { data: updatedProduct, error: updateProductError } = await supabase
        .from('products')
        .update({
          color,
          origin: body.origin,
          image_url: typeof body.image_url === 'string' ? sanitizeText(body.image_url) : body.image_url,
          active: body.active ?? true,
          show_b2b: body.show_b2b ?? product.show_b2b ?? true,
          show_b2c: body.show_b2c ?? product.show_b2c ?? true
        })
        .eq('id', product.id)
        .select('*')
        .single()
      if (updateProductError || !updatedProduct) {
        return apiError(500, 'Failed to update product', 'DB_QUERY_FAILED', updateProductError?.message)
      }
      product = updatedProduct
    }

    const { data: activeShipment, error: activeShipmentError } = await supabase
      .from('shipments')
      .select('id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (activeShipmentError) {
      return apiError(500, 'Failed to load active shipment', 'DB_QUERY_FAILED', activeShipmentError.message)
    }
    if (!activeShipment) {
      return apiError(400, 'No active shipment found', 'ACTIVE_SHIPMENT_REQUIRED')
    }

    const { data: existingShipmentProduct, error: existingShipmentProductError } = await supabase
      .from('shipment_products')
      .select('id')
      .eq('shipment_id', activeShipment.id)
      .eq('product_id', product.id)
      .maybeSingle()
    if (existingShipmentProductError) {
      return apiError(500, 'Failed to check shipment product', 'DB_QUERY_FAILED', existingShipmentProductError.message)
    }

    if (existingShipmentProduct) {
      const { error: updateShipmentProductError } = await supabase
        .from('shipment_products')
        .update({
          price,
          price_b2c: typeof body.price_b2c === 'number' ? body.price_b2c : price * 10,
          stock,
          units_per_box: body.units_per_box ?? null,
          units_per_bunch: body.units_per_bunch ?? null
        })
        .eq('id', existingShipmentProduct.id)
      if (updateShipmentProductError) {
        return apiError(500, 'Failed to update shipment product', 'DB_QUERY_FAILED', updateShipmentProductError.message)
      }
    } else {
      const { error: createShipmentProductError } = await supabase.from('shipment_products').insert({
        shipment_id: activeShipment.id,
        product_id: product.id,
        price,
        price_b2c: typeof body.price_b2c === 'number' ? body.price_b2c : price * 10,
        stock,
        units_per_box: body.units_per_box ?? null,
        units_per_bunch: body.units_per_bunch ?? null
      })
      if (createShipmentProductError) {
        return apiError(500, 'Failed to create shipment product', 'DB_QUERY_FAILED', createShipmentProductError.message)
      }
    }

    catalogCache.clear()

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    return apiError(500, 'Internal server error', 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
  }
}
