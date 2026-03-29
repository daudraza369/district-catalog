'use client'

import { useState, type MouseEvent } from 'react'
import Image from 'next/image'
import { ORIGIN_LABELS, type CatalogProduct, type Origin } from '@/lib/types'
import ProductImage from '@/components/catalog/ProductImage'
import OriginBadge from '@/components/catalog/OriginBadge'
import StockIndicator from '@/components/catalog/StockIndicator'
import { CATALOG_GRID_COLS } from '@/components/catalog/constants'
import { useCart } from '@/components/catalog/CartContext'

interface ProductRowProps {
  product: CatalogProduct
  index: number
  mode: 'b2b' | 'b2c'
  onOpenDetail?: () => void
  priority?: boolean
}

const ORIGIN_TO_FILE: Record<Origin, string> = {
  netherlands: 'netherlands',
  kenya: 'kenya',
  saudi: 'saudi',
  ethiopia: 'ethiopia',
  colombia: 'colombia',
  south_africa: 'other',
  italy: 'other',
  ecuador: 'other',
  other: 'other'
}

function MobileOriginBadge({ origin }: { origin: Origin }) {
  return (
    <div className="flex items-center gap-1">
      <Image
        src={`/origins/${ORIGIN_TO_FILE[origin] ?? 'other'}.svg`}
        alt={ORIGIN_LABELS[origin]}
        width={18}
        height={18}
        className="opacity-60"
      />
      <span className="text-[7px] uppercase tracking-[0.08em] text-brand-green/50 font-mono">{ORIGIN_LABELS[origin]}</span>
    </div>
  )
}

export default function ProductRow({ product, index, mode, onOpenDetail, priority = false }: ProductRowProps) {
  const { addToCartWithPosition, cartItems } = useCart()
  const [flashAdded, setFlashAdded] = useState(false)
  const cartItem = cartItems.find((item) => item.product_id === product.id)
  const cartQuantity = cartItem?.quantity ?? 0
  const isInCart = cartQuantity > 0

  const handleAdd = (event: MouseEvent<HTMLElement>) => {
    const x = event.clientX || window.innerWidth / 2
    const y = event.clientY || window.innerHeight / 2
    addToCartWithPosition(product, x, y)
    setFlashAdded(true)
    window.setTimeout(() => setFlashAdded(false), 220)
  }

  return (
    <article
      className={`${CATALOG_GRID_COLS} group grid min-h-[108px] relative cursor-pointer select-none items-center border-b border-[rgba(32,50,42,0.1)] py-2 transition-colors duration-150 ${
        flashAdded ? 'bg-brand-green/10' : isInCart ? 'bg-brand-green/5' : index % 2 === 0 ? 'bg-brand-bg' : 'bg-brand-bg-secondary'
      } ${isInCart ? 'border-l-2 border-l-brand-green' : ''} hover:bg-[#eae9e2] active:bg-brand-green/10`}
      style={{ animation: `fadeIn 200ms ease ${index * 35}ms both` }}
      onClick={(event) => {
        if (window.innerWidth < 768) {
          handleAdd(event)
        }
      }}
    >
      <div
        className="relative flex h-full items-center justify-start cursor-zoom-in"
        onClick={(event) => {
          event.stopPropagation()
          onOpenDetail?.()
        }}
      >
        <ProductImage src={product.image_url} alt={`${product.name} ${product.variety}`} priority={priority} />
        {isInCart ? (
          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-brand-green flex items-center justify-center">
            <span className="text-[9px] font-mono text-brand-bg font-bold">{cartQuantity}</span>
          </div>
        ) : null}
      </div>
      <div className="flex h-full flex-col justify-center pl-4 pr-2 md:pl-5 md:pr-4">
        <h3 suppressHydrationWarning className="font-display text-[16px] md:text-[18px] font-bold text-brand-green leading-tight">
          {product.variety}
        </h3>
        <p className="mt-0.5 text-[10px] md:text-[11px] uppercase tracking-[0.08em] text-brand-green/50">
          {product.stem_length ? `${product.name} · ${product.stem_length}` : product.name}
        </p>
        <div className="mt-1 flex items-center gap-2 md:hidden">
          <MobileOriginBadge origin={product.origin} />
          {!product.stock && (
            <span className="text-[8px] uppercase tracking-[0.08em] text-rose-500 font-mono">
              Out of stock
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            handleAdd(event)
          }}
          className="mt-2 hidden items-center gap-1 border border-brand-green/30 px-2 py-1 text-[9px] uppercase tracking-[0.1em] font-mono text-brand-green transition-colors hover:bg-brand-green hover:text-brand-bg md:flex md:opacity-0 md:group-hover:opacity-100"
        >
          + ADD TO ORDER
        </button>
      </div>
      <div className="hidden h-full items-center justify-center md:flex">
        <OriginBadge origin={product.origin} />
      </div>
      <div className="hidden h-full items-center justify-center text-center md:flex">
        <StockIndicator stock={product.stock} />
      </div>
      <div className="flex h-full items-center justify-end pr-4 md:pr-7">
        <div className="flex items-baseline gap-1">
          <span className="hidden md:inline text-[10px] text-brand-green/40 font-mono mr-0.5">SAR</span>
          <span className="font-mono text-[15px] md:text-[17px] font-[500] text-brand-green">
            {mode === 'b2c' ? (product.price_per_bunch ?? product.price * 10).toFixed(2) : product.price.toFixed(2)}
          </span>
        </div>
      </div>
    </article>
  )
}

ProductRow.displayName = 'ProductRow'
