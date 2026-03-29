import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { apiError } from '@/lib/api'
import { validateAdminRequest } from '@/lib/auth'

interface PriceUpdate {
  product_id: string
  price: number
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const unauthorized = validateAdminRequest(request)
    if (unauthorized) return unauthorized

    const body = (await request.json()) as { updates?: PriceUpdate[] }
    if (!Array.isArray(body.updates) || body.updates.length === 0) {
      return apiError(400, 'Invalid price updates payload', 'VALIDATION_ERROR')
    }

    const supabase = createAdminClient()
    const tasks = body.updates.map((update) =>
      supabase
        .from('shipment_products')
        .update({ price: update.price })
        .eq('shipment_id', params.id)
        .eq('product_id', update.product_id)
    )

    const results = await Promise.all(tasks)
    const failed = results.find((result) => result.error)
    if (failed?.error) {
      return apiError(500, 'Failed to update shipment prices', 'DB_QUERY_FAILED', failed.error.message)
    }

    return NextResponse.json({ success: true, updated: body.updates.length })
  } catch (error) {
    return apiError(500, 'Internal server error', 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
  }
}
