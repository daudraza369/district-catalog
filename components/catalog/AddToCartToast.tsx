'use client'

interface AddToCartToastProps {
  x: number
  y: number
}

export default function AddToCartToast({ x, y }: AddToCartToastProps) {
  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        transform: 'translateY(0)',
        animation: 'floatUp 600ms ease forwards'
      }}
      className="font-mono text-[12px] text-brand-green font-bold pointer-events-none z-50"
    >
      +1
    </div>
  )
}

AddToCartToast.displayName = 'AddToCartToast'
