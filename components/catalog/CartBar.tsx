'use client'

import { useState } from 'react'
import { useCart } from '@/components/catalog/CartContext'
import Image from 'next/image'

interface CartBarProps {
  mode: 'b2b' | 'b2c'
}

export default function CartBar({ mode }: CartBarProps) {
  const { cartItems, itemCount, removeFromCart, updateQuantity, clearCart } = useCart()
  const [expanded, setExpanded] = useState(false)

  if (itemCount === 0) return null

  const estimated = cartItems.reduce((sum, item) => {
    const unit = mode === 'b2c' ? item.price * 10 : item.price
    return sum + unit * item.quantity
  }, 0)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex h-[56px] w-full items-center justify-between bg-[#20322a] px-4 text-[#fbfbf8] transition-transform duration-300"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.12em]">YOUR ORDER · {itemCount} ITEMS</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em]">REVIEW &amp; SEND →</span>
      </button>

      <div
        className={`bg-[#20322a] text-[#fbfbf8] transition-transform duration-300 ease-in-out ${
          expanded ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: expanded ? '65vh' : '0px', overflow: expanded ? 'auto' : 'hidden' }}
      >
        <div className="space-y-3 p-4 pb-5">
          {cartItems.map((item) => (
            <div key={item.product_id} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 border-b border-white/15 pb-3">
              <div className="h-10 w-10 overflow-hidden bg-white/5">
                {item.image_url ? (
                  <Image src={item.image_url} alt={`${item.name} ${item.variety}`} width={40} height={40} className="h-10 w-10 object-cover" unoptimized />
                ) : (
                  <div className="h-10 w-10 bg-white/10" />
                )}
              </div>
              <div>
                <p className="text-[13px] text-[#fbfbf8]">{item.variety}</p>
                <p className="text-[10px] uppercase tracking-[0.08em] text-white/60">{item.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                  className="h-6 w-6 border border-white/20 text-[14px] text-white/70 flex items-center justify-center transition-colors hover:border-white/60"
                >
                  −
                </button>
                <span className="font-mono text-[13px] text-white min-w-[20px] text-center">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                  className="h-6 w-6 border border-white/20 text-[14px] text-white/70 flex items-center justify-center transition-colors hover:border-white/60"
                >
                  +
                </button>
                <span className="font-mono text-[11px] text-white/80 min-w-[70px] text-right">
                  SAR {(mode === 'b2c' ? item.price * 10 : item.price).toFixed(2)}
                </span>
                <button type="button" onClick={() => removeFromCart(item.product_id)} className="text-[9px] uppercase tracking-[0.08em] text-white/60">
                  Remove
                </button>
              </div>
            </div>
          ))}

          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/60 text-center">
            {itemCount} ITEMS · SAR {estimated.toFixed(2)} ESTIMATED
          </p>

          <button
            type="button"
            disabled
            title="COMING SOON"
            data-coming-soon="true"
            className="h-12 w-full bg-[#25d366] text-[11px] uppercase tracking-[0.1em] text-white flex items-center justify-center gap-2 font-mono disabled:opacity-95"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.121.553 4.12 1.519 5.865L.057 23.428a.75.75 0 00.918.899l5.649-1.479A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.75 9.75 0 110-19.5 9.75 9.75 0 010 19.5z" />
            </svg>
            SEND ORDER VIA WHATSAPP
          </button>
          <button
            type="button"
            onClick={clearCart}
            className="block mx-auto text-[9px] uppercase tracking-[0.08em] text-white/40 font-mono"
          >
            CLEAR ORDER
          </button>
        </div>
      </div>
    </div>
  )
}

CartBar.displayName = 'CartBar'
