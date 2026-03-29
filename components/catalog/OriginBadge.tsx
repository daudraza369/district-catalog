'use client'

import Image from 'next/image'
import { ORIGIN_LABELS, type Origin } from '@/lib/types'

export function OriginBadge({ origin }: { origin: Origin }) {
  const hasFile = ['netherlands', 'kenya', 'saudi', 'ethiopia', 'colombia'].includes(origin)

  return (
    <div className="flex items-center justify-center">
      {hasFile ? (
        <Image src={`/origins/${origin}.svg`} alt={ORIGIN_LABELS[origin]} width={64} height={64} className="opacity-80" />
      ) : (
        <svg viewBox="0 0 24 24" fill="none" width="64" height="64" opacity="0.4">
          <path d="M12 3C7 3 4 7 4 11C4 17 12 21 12 21C12 21 20 17 20 11C20 7 17 3 12 3Z" stroke="#20322a" strokeWidth="1.2" />
          <line x1="12" y1="3" x2="12" y2="21" stroke="#20322a" strokeWidth="0.8" />
        </svg>
      )}
    </div>
  )
}

OriginBadge.displayName = 'OriginBadge'
export default OriginBadge
