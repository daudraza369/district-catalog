import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { type Origin } from '@/lib/types'
import { apiError, sanitizeText } from '@/lib/api'
import { validateAdminRequest } from '@/lib/auth'
import { catalogCache } from '@/lib/catalog-cache'

const ORIGINS: Origin[] = ['netherlands', 'ethiopia', 'kenya', 'saudi', 'south_africa', 'italy', 'ecuador', 'colombia', 'other']

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      image_url?: string | null
      active?: boolean
    }

    if (body.origin && !ORIGINS.includes(body.origin)) {
      return apiError(400, 'Invalid origin value', 'VALIDATION_ERROR')
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('products')
      .update({
        name: typeof body.name === 'string' ? sanitizeText(body.name) : undefined,
        variety: typeof body.variety === 'string' ? sanitizeText(body.variety) : undefined,
        stem_length: typeof body.stem_length === 'string' ? sanitizeText(body.stem_length) : body.stem_length,
        color: typeof body.color === 'string' ? sanitizeText(body.color) : body.color,
        origin: body.origin,
        image_url: typeof body.image_url === 'string' ? sanitizeText(body.image_url) : body.image_url,
        active: body.active
      })
      .eq('id', params.id)
      .select('*')
      .maybeSingle()

    if (error) {
      return apiError(500, 'Failed to update product', 'DB_QUERY_FAILED', error.message)
    }
    if (!data) {
      return apiError(404, 'Product not found', 'NOT_FOUND')
    }

    catalogCache.clear()

    return NextResponse.json({ product: data })
  } catch (error) {
    return apiError(500, 'Internal server error', 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const unauthorized = validateAdminRequest(request)
    if (unauthorized) {
      return unauthorized
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.from('products').delete().eq('id', params.id).select('id').maybeSingle()

    if (error) {
      return apiError(500, 'Failed to delete product', 'DB_QUERY_FAILED', error.message)
    }
    if (!data) {
      return apiError(404, 'Product not found', 'NOT_FOUND')
    }

    catalogCache.clear()

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(500, 'Internal server error', 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const unauthorized = validateAdminRequest(request)
    if (unauthorized) {
      return unauthorized
    }

    const body = (await request.json()) as {
      stock?: boolean
      shipment_id?: string
      image_url?: string | null
      show_b2b?: boolean
      show_b2c?: boolean
      price?: number
      price_b2c?: number | null
    }
    const supabase = createAdminClient()
    let didUpdate = false

    if (typeof body.image_url !== 'undefined') {
      const { error: imageUpdateError } = await supabase
        .from('products')
        .update({ image_url: body.image_url ? sanitizeText(body.image_url) : null })
        .eq('id', params.id)
      if (imageUpdateError) {
        return apiError(500, 'Failed to update product image', 'DB_QUERY_FAILED', imageUpdateError.message)
      }
      didUpdate = true
    }

    if (typeof body.show_b2b === 'boolean' || typeof body.show_b2c === 'boolean') {
      const { error: visibilityUpdateError } = await supabase
        .from('products')
        .update({
          show_b2b: typeof body.show_b2b === 'boolean' ? body.show_b2b : undefined,
          show_b2c: typeof body.show_b2c === 'boolean' ? body.show_b2c : undefined
        })
        .eq('id', params.id)
      if (visibilityUpdateError) {
        return apiError(500, 'Failed to update visibility', 'DB_QUERY_FAILED', visibilityUpdateError.message)
      }
      didUpdate = true
    }

    if (typeof body.stock === 'boolean' || typeof body.price === 'number' || typeof body.price_b2c === 'number' || body.price_b2c === null) {
      const { data: activeShipment, error: activeShipmentError } = await supabase
        .from('shipments')
        .select('id')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (activeShipmentError || !activeShipment) {
        return apiError(400, 'Active shipment not found', 'ACTIVE_SHIPMENT_REQUIRED')
      }
      const shipmentId = String(activeShipment.id)

      const shipmentUpdate: {
        stock?: boolean
        price?: number
        price_b2c?: number | null
      } = {}
      if (typeof body.stock === 'boolean') shipmentUpdate.stock = body.stock
      if (typeof body.price === 'number') shipmentUpdate.price = body.price
      if (typeof body.price_b2c === 'number' || body.price_b2c === null) shipmentUpdate.price_b2c = body.price_b2c

      const { error: stockError } = await supabase
        .from('shipment_products')
        .update(shipmentUpdate)
        .eq('shipment_id', shipmentId)
        .eq('product_id', params.id)
      if (stockError) {
        return apiError(500, 'Failed to update shipment product', 'DB_QUERY_FAILED', stockError.message)
      }
      didUpdate = true
    }

    if (didUpdate) {
      catalogCache.clear()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(500, 'Internal server error', 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
  }
}
