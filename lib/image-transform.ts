interface TransformOptions {
  width?: number
  height?: number
  quality?: number
  resize?: 'cover' | 'contain' | 'fill'
}

const SUPABASE_OBJECT_SEGMENT = '/storage/v1/object/public/'
const SUPABASE_RENDER_SEGMENT = '/storage/v1/render/image/public/'

export function toTransformedImageUrl(src: string | null | undefined, options: TransformOptions): string | null {
  if (!src) return null
  if (!src.includes(SUPABASE_OBJECT_SEGMENT)) return src

  const [basePath, existingQuery] = src.split('?')
  const renderPath = basePath.replace(SUPABASE_OBJECT_SEGMENT, SUPABASE_RENDER_SEGMENT)
  const params = new URLSearchParams(existingQuery ?? '')

  if (options.width) params.set('width', String(options.width))
  if (options.height) params.set('height', String(options.height))
  if (options.quality) params.set('quality', String(options.quality))
  if (options.resize) params.set('resize', options.resize)

  const queryString = params.toString()
  return queryString ? `${renderPath}?${queryString}` : renderPath
}
