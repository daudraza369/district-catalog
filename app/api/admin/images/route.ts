import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { apiError, sanitizeText } from '@/lib/api'
import { validateAdminRequest } from '@/lib/auth'

function sanitizeFlowerName(raw: string): string {
  const stripped = raw.replace(/<[^>]*>/g, '')
  return sanitizeText(stripped).slice(0, 100)
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = validateAdminRequest(request)
    if (unauthorized) {
      return unauthorized
    }

    const formData = await request.formData()
    const flowerName = formData.get('flower_name')
    const image = formData.get('image')

    if (typeof flowerName !== 'string' || !(image instanceof File)) {
      return apiError(400, 'flower_name and image are required', 'VALIDATION_ERROR')
    }

    const cleanedFlowerName = sanitizeFlowerName(flowerName)
    if (!cleanedFlowerName) {
      return apiError(400, 'flower_name is required', 'VALIDATION_ERROR')
    }

    const adminClient = createAdminClient()
    const ext = image.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const baseName = image.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/\s+/g, '-')
    const flowerSlug = cleanedFlowerName.toLowerCase().replace(/\s+/g, '-')
    const storagePath = `${Date.now()}-${flowerSlug}-${baseName}.${ext}`
    const arrayBuffer = await image.arrayBuffer()

    const { error: uploadError } = await adminClient.storage
      .from('flower-images')
      .upload(storagePath, arrayBuffer, { contentType: image.type, upsert: false })

    if (uploadError) {
      return apiError(500, 'Failed to upload image to storage', 'STORAGE_UPLOAD_FAILED', uploadError.message)
    }

    const { data: publicData } = adminClient.storage.from('flower-images').getPublicUrl(storagePath)
    const publicUrl = publicData.publicUrl

    const { data: record, error: dbError } = await adminClient
      .from('image_library')
      .insert({
        flower_name: cleanedFlowerName,
        image_url: publicUrl,
        storage_path: storagePath
      })
      .select('*')
      .single()

    if (dbError) {
      return apiError(500, 'Failed to save image metadata', 'DB_QUERY_FAILED', dbError.message)
    }

    return NextResponse.json({ image: record, public_url: publicUrl }, { status: 201 })
  } catch (error) {
    return apiError(500, 'Internal server error', 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
  }
}

export async function GET(request: NextRequest) {
  try {
    const unauthorized = validateAdminRequest(request)
    if (unauthorized) {
      return unauthorized
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient.from('image_library').select('*').order('created_at', { ascending: false })
    if (error) {
      return apiError(500, 'Failed to fetch image library', 'DB_QUERY_FAILED', error.message)
    }
    return NextResponse.json({ images: data ?? [] })
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
      return apiError(400, 'Image id is required', 'VALIDATION_ERROR')
    }

    const adminClient = createAdminClient()
    const { data: record, error: getError } = await adminClient
      .from('image_library')
      .select('id, storage_path')
      .eq('id', id)
      .maybeSingle()

    if (getError) {
      return apiError(500, 'Failed to fetch image record', 'DB_QUERY_FAILED', getError.message)
    }
    if (!record) {
      return apiError(404, 'Image not found', 'NOT_FOUND')
    }

    await adminClient.storage.from('flower-images').remove([String(record.storage_path)])

    const { error: deleteError } = await adminClient.from('image_library').delete().eq('id', id)
    if (deleteError) {
      return apiError(500, 'Failed to delete image record', 'DB_QUERY_FAILED', deleteError.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(500, 'Internal server error', 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
  }
}
