'use client'

import Image from 'next/image'
import { ORIGIN_LABELS, type CatalogProduct } from '@/lib/types'
import { useCart } from '@/components/catalog/CartContext'

interface ProductDetailPanelProps {
  product: CatalogProduct | null
  onClose: () => void
  mode: 'b2b' | 'b2c'
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <p className="text-[10px] uppercase tracking-[0.1em] text-brand-green/50">{label}</p>
      <p className="text-[12px] uppercase tracking-[0.08em] text-brand-green">{value}</p>
    </>
  )
}

export default function ProductDetailPanel({ product, onClose, mode }: ProductDetailPanelProps) {
  const isOpen = Boolean(product)
  const { addToCart, removeFromCart, cartItems } = useCart()
  const cartItem = product ? cartItems.find((item) => item.product_id === product.id) : null
  const hasOriginFile = product ? ['netherlands', 'kenya', 'saudi', 'ethiopia', 'colombia'].includes(product.origin) : false

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
      <button
        type="button"
        aria-label="Close product details"
        className="absolute inset-0 bg-[rgba(32,50,42,0.3)]"
        onClick={onClose}
      />

      <aside
        className={`absolute bottom-0 left-0 right-0 w-full h-[70vh] border border-[rgba(32,50,42,0.15)] bg-[#fbfbf8] p-4 transition-transform duration-300 ease-in-out md:bottom-0 md:left-auto md:right-0 md:top-0 md:h-full md:w-[360px] md:p-5 ${
          isOpen ? 'translate-y-0 md:translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'
        }`}
      >
        {product ? (
          <div className="h-full overflow-auto pb-3">
            <div className="w-8 h-1 rounded-full bg-brand-green/20 mx-auto mb-4 md:hidden" />
            <button
              type="button"
              aria-label="Close panel"
              onClick={onClose}
              className="absolute right-4 top-4 text-[18px] leading-none text-brand-green/60 hover:text-brand-green"
            >
              ×
            </button>

            <div className="mb-4 overflow-hidden bg-[var(--brand-skeleton-base)] md:mx-auto md:h-[200px] md:w-[200px]">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={`${product.name} ${product.variety}`}
                  width={600}
                  height={600}
                  className="h-[220px] w-full object-cover md:h-[200px] md:w-[200px]"
                  unoptimized
                />
              ) : (
                <div className="flex h-[220px] w-full items-center justify-center md:h-[200px] md:w-[200px]">
                  <span className="text-[11px] uppercase tracking-[0.1em] text-brand-green/40">No Image</span>
                </div>
              )}
            </div>

            <div>
              <h2 className="font-display text-[24px] font-bold leading-tight text-brand-green">{product.variety}</h2>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-brand-green/50">{product.name}</p>
            </div>

            <div className="my-4 border-t border-[rgba(32,50,42,0.15)]" />

            <div className="grid grid-cols-[1fr_1fr] gap-x-4 gap-y-2">
              <DetailRow
                label="Arrival"
                value={product.arrival_date ? new Date(product.arrival_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—'}
              />
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-[0.1em] text-brand-green/50">Origin</p>
                <div className="mt-1 flex items-center gap-2">
                  {hasOriginFile ? (
                    <Image src={`/origins/${product.origin}.svg`} alt={ORIGIN_LABELS[product.origin]} width={28} height={28} className="opacity-75" />
                  ) : null}
                  <span className="font-mono text-[12px] text-brand-green">{ORIGIN_LABELS[product.origin]}</span>
                </div>
              </div>
              {product.stem_length ? <DetailRow label="Stem Length" value={product.stem_length} /> : null}
              <DetailRow
                label={mode === 'b2b' ? 'Price Per Stem' : 'Price Per Bunch'}
                value={`SAR ${(mode === 'b2c' ? product.price_per_bunch ?? product.price * 10 : product.price).toFixed(2)}`}
              />
              <DetailRow label="Stock" value={product.stock ? 'YES' : 'NO'} />
              {product.color ? <DetailRow label="Color" value={product.color} /> : null}
              {'units_per_box' in product && product.units_per_box !== null ? <DetailRow label="Units Per Box" value={String(product.units_per_box)} /> : null}
              {'units_per_bunch' in product && product.units_per_bunch !== null ? <DetailRow label="Units Per Bunch" value={String(product.units_per_bunch)} /> : null}
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => {
                  addToCart(product)
                  onClose()
                }}
                className="h-12 w-full bg-[#20322a] text-[#fbfbf8] font-mono text-[11px] uppercase tracking-[0.1em]"
              >
                {cartItem ? `IN YOUR ORDER (${cartItem.quantity})` : 'ADD TO ORDER'}
              </button>
              {cartItem ? (
                <button
                  type="button"
                  onClick={() => removeFromCart(product.id)}
                  className="text-[10px] uppercase tracking-[0.08em] text-brand-green/55 underline"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  )
}

ProductDetailPanel.displayName = 'ProductDetailPanel'
