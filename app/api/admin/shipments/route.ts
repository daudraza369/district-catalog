import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { apiError, isValidDateString, sanitizeText } from '@/lib/api'
import { validateAdminRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const unauthorized = validateAdminRequest(request)
    if (unauthorized) {
      return unauthorized
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('shipments')
      .select('*, shipment_products(count)')
      .order('arrival_date', { ascending: false })

    if (error) {
      return apiError(500, 'Failed to fetch shipments', 'DB_QUERY_FAILED', error.message)
    }

    return NextResponse.json({ shipments: data ?? [] })
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
      batch_id?: string
      arrival_date?: string
      price_unit?: string
      is_active?: boolean
    }

    const batchId = typeof body.batch_id === 'string' ? sanitizeText(body.batch_id) : ''
    if (!batchId || !body.arrival_date || !isValidDateString(body.arrival_date)) {
      return apiError(400, 'batch_id and valid arrival_date are required', 'VALIDATION_ERROR')
    }

    const supabase = createAdminClient()
    if (body.is_active) {
      await supabase.from('shipments').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000')
    }

    const { data, error } = await supabase
      .from('shipments')
      .insert({
        batch_id: batchId,
        arrival_date: body.arrival_date,
        price_unit: body.price_unit ?? 'per_stem',
        is_active: body.is_active ?? false
      })
      .select('*')
      .single()

    if (error) {
      return apiError(500, 'Failed to create shipment', 'DB_QUERY_FAILED', error.message)
    }

    return NextResponse.json({ shipment: data }, { status: 201 })
  } catch (error) {
    return apiError(500, 'Internal server error', 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const unauthorized = validateAdminRequest(request)
    if (unauthorized) {
      return unauthorized
    }

    const body = (await request.json()) as {
      id?: string
      set_active?: boolean
      is_active?: boolean
      batch_id?: string
      arrival_date?: string
      price_unit?: string
    }

    if (!body.id) {
      return apiError(400, 'Shipment id is required', 'VALIDATION_ERROR')
    }

    const supabase = createAdminClient()
    const shouldActivate = body.set_active === true || body.is_active === true

    if (shouldActivate) {
      await supabase.from('shipments').update({ is_active: false }).neq('id', body.id)
    }

    const { data, error } = await supabase
      .from('shipments')
      .update({
        batch_id: typeof body.batch_id === 'string' ? sanitizeText(body.batch_id) : undefined,
        arrival_date: body.arrival_date && isValidDateString(body.arrival_date) ? body.arrival_date : undefined,
        price_unit: body.price_unit,
        is_active: shouldActivate ? true : undefined
      })
      .eq('id', body.id)
      .select('*')
      .maybeSingle()

    if (error) {
      return apiError(500, 'Failed to update shipment', 'DB_QUERY_FAILED', error.message)
    }
    if (!data) {
      return apiError(404, 'Shipment not found', 'NOT_FOUND')
    }

    return NextResponse.json({ shipment: data })
  } catch (error) {
    return apiError(500, 'Internal server error', 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const unauthorized = validateAdminRequest(request)
    if (unauthorized) {
      return unauthorized
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return apiError(400, 'Shipment id is required', 'VALIDATION_ERROR')
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.from('shipments').delete().eq('id', id).select('id').maybeSingle()

    if (error) {
      return apiError(500, 'Failed to delete shipment', 'DB_QUERY_FAILED', error.message)
    }
    if (!data) {
      return apiError(404, 'Shipment not found', 'NOT_FOUND')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(500, 'Internal server error', 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
  }
}
