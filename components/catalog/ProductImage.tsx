'use client'

import Image from 'next/image'
import { toTransformedImageUrl } from '@/lib/image-transform'

interface ProductImageProps {
  src: string | null
  alt: string
  priority?: boolean
}

export default function ProductImage({ src, alt, priority = false }: ProductImageProps) {
  const thumbnailSrc = toTransformedImageUrl(src, {
    width: 192,
    height: 192,
    quality: 65,
    resize: 'cover'
  })

  if (!src) {
    return (
      <div className="flex h-[96px] w-[96px] items-center justify-center bg-[var(--brand-skeleton-base)]" role="img" aria-label="Product image placeholder">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 opacity-30">
          <circle cx="20" cy="20" r="4" stroke="#20322a" strokeWidth="1.5" />
          <circle cx="20" cy="11" r="3.5" stroke="#20322a" strokeWidth="1.2" />
          <circle cx="20" cy="29" r="3.5" stroke="#20322a" strokeWidth="1.2" />
          <circle cx="11.5" cy="15.5" r="3.5" stroke="#20322a" strokeWidth="1.2" />
          <circle cx="28.5" cy="15.5" r="3.5" stroke="#20322a" strokeWidth="1.2" />
          <circle cx="11.5" cy="24.5" r="3.5" stroke="#20322a" strokeWidth="1.2" />
          <circle cx="28.5" cy="24.5" r="3.5" stroke="#20322a" strokeWidth="1.2" />
        </svg>
      </div>
    )
  }

  return (
    <div className="h-[96px] w-[96px] overflow-hidden">
      <Image
        src={thumbnailSrc ?? src}
        alt={alt}
        width={96}
        height={96}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        quality={60}
        className="h-full w-full object-cover"
        sizes="96px"
        unoptimized
      />
    </div>
  )
}

ProductImage.displayName = 'ProductImage'
