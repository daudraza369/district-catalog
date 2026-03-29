'use client'

interface PriceDisplayProps {
  price: number
  pricePerBunch?: number | null
  mode?: 'b2b' | 'b2c'
  className?: string
  currencyClassName?: string
  amountClassName?: string
}

export default function PriceDisplay({ price, pricePerBunch, mode = 'b2b', className, currencyClassName, amountClassName }: PriceDisplayProps) {
  const displayPrice = mode === 'b2c' ? (pricePerBunch ?? price * 10) : price
  return (
    <span className={`inline-flex items-baseline justify-end ${className ?? ''}`.trim()}>
      <span className={`mr-[5px] text-[11px] tracking-[0.05em] text-brand-green/45 ${currencyClassName ?? ''}`.trim()}>SAR</span>
      <span className={`text-[13px] font-medium text-brand-green md:text-[17px] ${amountClassName ?? ''}`.trim()}>
        {displayPrice.toFixed(2)}
        {mode === 'b2c' ? ' / bunch' : ''}
      </span>
    </span>
  )
}

PriceDisplay.displayName = 'PriceDisplay'
