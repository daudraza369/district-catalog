'use client'

import { cn } from '@/lib/utils'

interface StockIndicatorProps {
  stock: boolean
}

export default function StockIndicator({ stock }: StockIndicatorProps) {
  return (
    <span className={cn('text-[12px] uppercase tracking-[0.02em]', stock ? 'font-medium text-brand-green' : 'font-normal text-brand-green/40 line-through')}>
      {stock ? 'YES' : 'NO'}
    </span>
  )
}

StockIndicator.displayName = 'StockIndicator'
