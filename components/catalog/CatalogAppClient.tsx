'use client'

import CatalogClient from '@/components/catalog/CatalogClient'
import { CartProvider } from '@/components/catalog/CartContext'
import { type CatalogProduct } from '@/lib/types'

interface CatalogAppClientProps {
  products: CatalogProduct[]
}

export default function CatalogAppClient({ products }: CatalogAppClientProps) {
  return (
    <CartProvider>
      <CatalogClient allProducts={products} />
    </CartProvider>
  )
}

CatalogAppClient.displayName = 'CatalogAppClient'
