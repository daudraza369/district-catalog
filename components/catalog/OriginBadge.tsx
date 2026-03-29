'use client'

import Image from 'next/image'
import { ORIGIN_LABELS, type Origin } from '@/lib/types'

export function OriginBadge({ origin }: { origin: Origin }) {
  const hasFile = ['netherlands', 'kenya', 'saudi', 'ethiopia', 'colombia'].includes(origin)

  return (
    <div className="flex min-h-16 flex-col items-center justify-center gap-1.5">
      {hasFile ? (
        <Image
          src={`/origins/${origin === 'saudi' ? 'saudi' : origin}.svg`}
          alt={ORIGIN_LABELS[origin]}
          width={56}
          height={56}
          className="opacity-75"
        />
      ) : (
        <svg viewBox="0 0 24 24" fill="none" width="56" height="56" opacity="0.5">
          <path
            d="M12 3C7 3 4 7 4 11C4 17 12 21 12 21C12 21 20 17 20 11C20 7 17 3 12 3Z"
            stroke="#20322a"
            strokeWidth="1.2"
            fill="none"
          />
          <line x1="12" y1="3" x2="12" y2="21" stroke="#20322a" strokeWidth="0.8" />
          <path d="M4 11Q8 9 12 11Q16 13 20 11" stroke="#20322a" strokeWidth="0.8" fill="none" />
        </svg>
      )}
      <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-brand-green/50 text-center mt-[2px]">{ORIGIN_LABELS[origin]}</span>
    </div>
  )
}

OriginBadge.displayName = 'OriginBadge'
export default OriginBadge
