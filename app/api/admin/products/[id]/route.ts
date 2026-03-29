import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { type Origin } from '@/lib/types'
import { apiError, sanitizeText } from '@/lib/api'
import { validateAdminRequest } from '@/lib/auth'

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

    const body = (await request.json()) as { stock?: boolean; shipment_id?: string; image_url?: string | null }
    const supabase = createAdminClient()

    if (typeof body.image_url !== 'undefined') {
      const { error: imageUpdateError } = await supabase
        .from('products')
        .update({ image_url: body.image_url ? sanitizeText(body.image_url) : null })
        .eq('id', params.id)
      if (imageUpdateError) {
        return apiError(500, 'Failed to update product image', 'DB_QUERY_FAILED', imageUpdateError.message)
      }
    }

    if (typeof body.stock === 'boolean') {
      let shipmentId = body.shipment_id
      if (!shipmentId) {
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
        shipmentId = String(activeShipment.id)
      }

      const { error: stockError } = await supabase
        .from('shipment_products')
        .update({ stock: body.stock })
        .eq('shipment_id', shipmentId)
        .eq('product_id', params.id)
      if (stockError) {
        return apiError(500, 'Failed to update stock', 'DB_QUERY_FAILED', stockError.message)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(500, 'Internal server error', 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
  }
}
