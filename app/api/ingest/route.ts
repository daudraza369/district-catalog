import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase'
import { type IngestPayload, type IngestResult, type Origin } from '@/lib/types'
import { apiError, isValidDateString, sanitizeText } from '@/lib/api'
import { getEnv } from '@/lib/env'

const ORIGINS: Origin[] = ['netherlands', 'ethiopia', 'kenya', 'saudi', 'south_africa', 'italy', 'ecuador', 'colombia', 'other']
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10
const requestTracker = new Map<string, { count: number; resetAt: number }>()

function getBearerToken(header: string | null): string | null {
  if (!header || !header.startsWith('Bearer ')) {
    return null
  }
  return header.slice(7).trim()
}

function validateSecret(provided: string): boolean {
  const secret = getEnv().INGEST_SECRET
  if (provided.length !== secret.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(secret))
}

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

function checkRateLimit(request: NextRequest): { limited: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const key = getClientIp(request)
  const current = requestTracker.get(key)
  if (!current || current.resetAt < now) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS
    requestTracker.set(key, { count: 1, resetAt })
    return { limited: false, remaining: RATE_LIMIT_MAX - 1, resetAt }
  }
  current.count += 1
  requestTracker.set(key, current)
  return { limited: current.count > RATE_LIMIT_MAX, remaining: Math.max(0, RATE_LIMIT_MAX - current.count), resetAt: current.resetAt }
}

interface PayloadValidationResult {
  ok: boolean
  errors: string[]
}

function validatePayload(payload: unknown): payload is IngestPayload {
  return validatePayloadDetailed(payload).ok
}

function validatePayloadDetailed(payload: unknown): PayloadValidationResult {
  const errors: string[] = []
  if (!payload || typeof payload !== 'object') {
    return { ok: false, errors: ['Payload must be an object'] }
  }

  const value = payload as IngestPayload
  if (!value.shipment || typeof value.shipment !== 'object') {
    errors.push('shipment is required')
  } else {
    if (!value.shipment.batch_id || typeof value.shipment.batch_id !== 'string') errors.push('shipment.batch_id is required')
    if (!value.shipment.arrival_date || typeof value.shipment.arrival_date !== 'string' || !isValidDateString(value.shipment.arrival_date)) {
      errors.push('shipment.arrival_date must be a valid YYYY-MM-DD date')
    }
  }

  if (!Array.isArray(value.products) || value.products.length === 0) {
    errors.push('products must be a non-empty array')
  } else {
    value.products.forEach((item, index) => {
      if (!item.name || typeof item.name !== 'string') errors.push(`products[${index}].name is required`)
      if (!item.variety || typeof item.variety !== 'string') errors.push(`products[${index}].variety is required`)
      if (!ORIGINS.includes(item.origin)) errors.push(`products[${index}].origin must be one of allowed values`)
      if (typeof item.price !== 'number' || Number.isNaN(item.price) || item.price < 0) errors.push(`products[${index}].price must be a non-negative number`)
      if (typeof item.stock !== 'boolean') errors.push(`products[${index}].stock must be boolean`)
      if (item.units_per_box !== undefined && item.units_per_box !== null && (!Number.isInteger(item.units_per_box) || item.units_per_box < 0)) {
        errors.push(`products[${index}].units_per_box must be a non-negative integer or null`)
      }
      if (item.units_per_bunch !== undefined && item.units_per_bunch !== null && (!Number.isInteger(item.units_per_bunch) || item.units_per_bunch < 0)) {
        errors.push(`products[${index}].units_per_bunch must be a non-negative integer or null`)
      }
    })
  }

  return { ok: errors.length === 0, errors }
}

export async function POST(request: NextRequest) {
  try {
    const rate = checkRateLimit(request)
    if (rate.limited) {
      return NextResponse.json(
        { error: 'Too Many Requests', code: 'RATE_LIMITED' },
        { status: 429, headers: { 'X-RateLimit-Limit': String(RATE_LIMIT_MAX), 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(rate.resetAt) } }
      )
    }

    const token = getBearerToken(request.headers.get('authorization'))
    if (!token || !validateSecret(token)) {
      return apiError(401, 'Unauthorized', 'UNAUTHORIZED')
    }

    const payload = (await request.json()) as unknown
    const validation = validatePayloadDetailed(payload)
    if (!validation.ok || !validatePayload(payload)) {
      return apiError(400, 'Invalid ingest payload', 'VALIDATION_ERROR', validation.errors)
    }

    const supabase = createAdminClient()
    const errors: string[] = [...validation.errors]
    let productsCreated = 0
    let productsUpdated = 0
    let imagesMatched = 0

    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .insert({
        batch_id: payload.shipment.batch_id,
        arrival_date: payload.shipment.arrival_date,
        price_unit: payload.shipment.price_unit ?? 'per_stem',
        is_active: true
      })
      .select('*')
      .single()

    if (shipmentError || !shipment) {
      return apiError(500, 'Failed to create shipment', 'DB_QUERY_FAILED', shipmentError?.message)
    }

    await supabase.from('shipments').update({ is_active: false }).neq('id', shipment.id)
    await supabase.from('shipments').update({ is_active: true }).eq('id', shipment.id)

    for (const item of payload.products) {
      try {
        const productName = sanitizeText(item.name)
        const varietyName = sanitizeText(item.variety)
        const stemLength = typeof item.stem_length === 'string' ? sanitizeText(item.stem_length) : null
        const color = typeof item.color === 'string' ? sanitizeText(item.color) : null

        let existingProductQuery = supabase.from('products').select('*').eq('name', productName).eq('variety', varietyName)
        if (stemLength) {
          existingProductQuery = existingProductQuery.eq('stem_length', stemLength)
        } else {
          existingProductQuery = existingProductQuery.is('stem_length', null)
        }

        const { data: existingProduct } = await existingProductQuery.maybeSingle()

        let productId = existingProduct?.id as string | undefined
        let imageUrl = item.image_url ?? null

        if (!imageUrl) {
          const { data: imageMatch } = await supabase
            .from('image_library')
            .select('image_url')
            .ilike('flower_name', productName)
            .limit(1)
            .maybeSingle()

          if (imageMatch?.image_url) {
            imageUrl = imageMatch.image_url as string
            imagesMatched += 1
          }
        }

        if (!productId) {
          const { data: createdProduct, error: createError } = await supabase
            .from('products')
            .insert({
              name: productName,
              variety: varietyName,
              stem_length: stemLength,
              color,
              origin: item.origin,
              image_url: imageUrl,
              active: true
            })
            .select('id')
            .single()

          if (createError || !createdProduct) {
            errors.push(`Failed creating product ${productName} ${varietyName}`)
            continue
          }
          productId = createdProduct.id as string
          productsCreated += 1
        } else {
          await supabase
            .from('products')
            .update({
              origin: item.origin,
              image_url: imageUrl,
              stem_length: stemLength,
              color
            })
            .eq('id', productId)
          productsUpdated += 1
        }

        const { error: shipmentProductError } = await supabase.from('shipment_products').insert({
          shipment_id: shipment.id,
          product_id: productId,
          price: item.price,
          stock: item.stock,
          units_per_box: item.units_per_box ?? null,
          units_per_bunch: item.units_per_bunch ?? null
        })

        if (shipmentProductError) {
          errors.push(`Failed adding ${productName} to shipment`)
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : `Unknown error for ${item.name}`)
      }
    }

    const result: IngestResult = {
      success: errors.length === 0,
      shipment_id: shipment.id as string,
      batch_id: shipment.batch_id as string,
      products_created: productsCreated,
      products_updated: productsUpdated,
      images_matched: imagesMatched,
      errors
    }

    return NextResponse.json(result)
  } catch (error) {
    return apiError(500, 'Internal server error', 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
  }
}
