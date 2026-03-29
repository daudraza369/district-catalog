'use client'

import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch } from 'react'
import { type CatalogProduct } from '@/lib/types'
import { type CartItem } from '@/lib/cart'

interface CartContextValue {
  cartItems: CartItem[]
  addToCart: (product: CatalogProduct) => void
  addToCartWithPosition: (product: CatalogProduct, x: number, y: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  clearCart: () => void
  itemCount: number
  toasts: Array<{ id: string; x: number; y: number }>
}

type CartAction =
  | { type: 'add'; item: CartItem }
  | { type: 'toast'; toast: { id: string; x: number; y: number } }
  | { type: 'removeToast'; id: string }
  | { type: 'remove'; productId: string }
  | { type: 'updateQty'; productId: string; qty: number }
  | { type: 'clear' }
  | { type: 'hydrate'; items: CartItem[] }

const CartContext = createContext<CartContextValue | null>(null)

interface CartState {
  items: CartItem[]
  toasts: Array<{ id: string; x: number; y: number }>
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find((item) => item.product_id === action.item.product_id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) => (item.product_id === action.item.product_id ? { ...item, quantity: item.quantity + 1 } : item))
        }
      }
      return { ...state, items: [...state.items, action.item] }
    }
    case 'toast':
      return { ...state, toasts: [...state.toasts, action.toast] }
    case 'removeToast':
      return { ...state, toasts: state.toasts.filter((toast) => toast.id !== action.id) }
    case 'remove':
      return { ...state, items: state.items.filter((item) => item.product_id !== action.productId) }
    case 'updateQty':
      return {
        ...state,
        items: state.items.map((item) =>
          item.product_id === action.productId ? { ...item, quantity: Math.max(1, action.qty) } : item
        )
      }
    case 'clear':
      return { ...state, items: [] }
    case 'hydrate':
      return { ...state, items: action.items }
    default:
      return state
  }
}

function toCartItem(product: CatalogProduct): CartItem {
  return {
    product_id: product.id,
    name: product.name,
    variety: product.variety,
    origin: product.origin,
    price: product.price,
    quantity: 1,
    mode: 'order_now',
    image_url: product.image_url
  }
}

function pushToast(dispatch: Dispatch<CartAction>, x: number, y: number) {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  dispatch({ type: 'toast', toast: { id, x, y } })
  window.setTimeout(() => {
    dispatch({ type: 'removeToast', id })
  }, 650)
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], toasts: [] })

  useEffect(() => {
    const raw = sessionStorage.getItem('catalog_cart')
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as CartItem[]
      if (Array.isArray(parsed)) dispatch({ type: 'hydrate', items: parsed })
    } catch {
      // ignore invalid cart storage
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem('catalog_cart', JSON.stringify(state.items))
  }, [state.items])

  const value = useMemo<CartContextValue>(
    () => ({
      cartItems: state.items,
      addToCart: (product) => {
        dispatch({ type: 'add', item: toCartItem(product) })
      },
      addToCartWithPosition: (product, x, y) => {
        dispatch({ type: 'add', item: toCartItem(product) })
        pushToast(dispatch, x, y)
      },
      removeFromCart: (productId) => dispatch({ type: 'remove', productId }),
      updateQuantity: (productId, qty) => dispatch({ type: 'updateQty', productId, qty }),
      clearCart: () => dispatch({ type: 'clear' }),
      itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
      toasts: state.toasts
    }),
    [state.items, state.toasts]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
