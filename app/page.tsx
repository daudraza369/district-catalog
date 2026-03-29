import { headers } from 'next/headers'
import { Suspense } from 'react'
import CatalogClient from '@/components/catalog/CatalogClient'
import CatalogSkeleton from '@/components/catalog/CatalogSkeleton'
import ErrorState from '@/components/catalog/ErrorState'
import { CartProvider } from '@/components/catalog/CartContext'
import { type CatalogProduct, type Shipment } from '@/lib/types'

interface CatalogResponse {
  shipment: Shipment | null
  products: CatalogProduct[]
  total: number
  error?: string
}

async function loadCatalog(): Promise<CatalogResponse> {
  try {
    const headerStore = headers()
    const host = headerStore.get('host') ?? 'localhost:3000'
    const protocol = headerStore.get('x-forwarded-proto') ?? 'http'
    const baseUrl = `${protocol}://${host}`
    const response = await fetch(`${baseUrl}/api/catalog`, { cache: 'no-store' })

    if (!response.ok) {
      return { shipment: null, products: [], total: 0, error: 'Unable to load catalog' }
    }
    return (await response.json()) as CatalogResponse
  } catch {
    return { shipment: null, products: [], total: 0, error: 'Unable to load catalog' }
  }
}

async function CatalogContent() {
  const catalog = await loadCatalog()

  if (catalog.error) {
    return <ErrorState title="Unable to load catalog" message="Please try again or contact support" />
  }

  if (!catalog.shipment) {
    return <ErrorState title="No active shipment" message="The catalog will appear here once a shipment is marked as active" />
  }

  return (
    <>
      <CartProvider>
        <CatalogClient
          shipment={catalog.shipment}
          allProducts={catalog.products}
        />
      </CartProvider>
    </>
  )
}

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[900px] border-t border-brand-border bg-brand-bg pb-10">
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogContent />
      </Suspense>
    </main>
  )
}
