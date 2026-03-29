'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import CatalogHeader from '@/components/catalog/CatalogHeader'
import FilterBar from '@/components/catalog/FilterBar'
import ProductRow from '@/components/catalog/ProductRow'
import ProductDetailPanel from '@/components/catalog/ProductDetailPanel'
import AddToCartToast from '@/components/catalog/AddToCartToast'
import CartBar from '@/components/catalog/CartBar'
import { CATALOG_HEADER_COLS } from '@/components/catalog/constants'
import { useCart } from '@/components/catalog/CartContext'
import { ORIGIN_LABELS, type CatalogProduct, type Origin, type Shipment } from '@/lib/types'

interface CatalogClientProps {
  shipment: Shipment | null
  allProducts: CatalogProduct[]
}

const ORIGINS = Object.keys(ORIGIN_LABELS) as Origin[]

export default function CatalogClient({ shipment, allProducts }: CatalogClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null)
  const [mode, setMode] = useState<'b2b' | 'b2c'>(() =>
    typeof window !== 'undefined' && sessionStorage.getItem('b2b_authenticated') === 'true' ? 'b2b' : 'b2c'
  )
  const [search, setSearch] = useState('')
  const [origin, setOrigin] = useState('')
  const [flowerType, setFlowerType] = useState('')
  const [stockOnly, setStockOnly] = useState(false)
  const [visibleCount, setVisibleCount] = useState(30)
  const { toasts } = useCart()

  useEffect(() => {
    const isB2B = sessionStorage.getItem('b2b_authenticated') === 'true'
    setMode(isB2B ? 'b2b' : 'b2c')
  }, [])

  const flowerTypes = useMemo(() => Array.from(new Set(allProducts.map((p) => p.name))).sort(), [allProducts])

  const filteredProducts = useMemo(() => {
    let results = allProducts

    if (origin) {
      results = results.filter((p) => p.origin === origin)
    }

    if (flowerType) {
      results = results.filter((p) => p.name === flowerType)
    }

    if (stockOnly) {
      results = results.filter((p) => p.stock === true)
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      results = results.filter((p) => p.name.toLowerCase().includes(q) || p.variety.toLowerCase().includes(q))
    }

    return results
  }, [allProducts, origin, flowerType, stockOnly, search])

  const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount])

  useEffect(() => {
    setVisibleCount(30)
  }, [origin, flowerType, stockOnly, search])

  const handleExportPDF = () => {
    const params = new URLSearchParams()
    if (origin) params.set('origin', origin)
    if (flowerType) params.set('flower_type', flowerType)
    if (stockOnly) params.set('stock', 'true')
    if (search.trim()) params.set('search', search.trim())
    window.open(`/api/catalog/export?${params.toString()}`, '_blank')
  }

  return (
    <>
      <CatalogHeader
        inventoryLive={Boolean(shipment)}
        mode={mode}
        onB2BModeClick={() => {
          sessionStorage.removeItem('b2b_authenticated')
          window.location.reload()
        }}
      />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        origin={origin}
        onOriginChange={setOrigin}
        flowerType={flowerType}
        onFlowerTypeChange={setFlowerType}
        stockOnly={stockOnly}
        onStockToggle={() => setStockOnly((prev) => !prev)}
        origins={ORIGINS}
        flowerTypes={flowerTypes}
        totalCount={allProducts.length}
        filteredCount={filteredProducts.length}
        mode={mode}
        isB2B={mode === 'b2b'}
        onExportPDF={handleExportPDF}
      />
      <div className={`${CATALOG_HEADER_COLS} grid items-end border-b border-brand-green/10 bg-[#f4f3ee] px-0 py-2.5`}>
        <div className="w-full" />
        <p className="pl-4 md:pl-0 text-[9px] uppercase tracking-[0.12em] text-brand-green/50">Variety / Flower Type</p>
        <p className="hidden md:block text-center text-[9px] uppercase tracking-[0.12em] text-brand-green/50">Origin</p>
        <p className="hidden md:block text-center text-[9px] uppercase tracking-[0.12em] text-brand-green/50">Stock</p>
        <p className="pr-4 md:pr-7 text-right text-[9px] uppercase tracking-[0.12em] text-brand-green/50">{mode === 'b2b' ? 'Price Per Stem' : 'Price Per Bunch'}</p>
      </div>

      <section>
        {filteredProducts.length > 0 ? (
          visibleProducts.map((product, index) => (
            <ProductRow
              key={product.shipment_product_id}
              product={product}
              mode={mode}
              index={index}
              priority={index < 6}
              onOpenDetail={() => setSelectedProduct(product)}
            />
          ))
        ) : (
          <div className="px-4 py-20 text-center text-[11px] uppercase tracking-[0.12em] text-brand-green/55">No products match your filters.</div>
        )}
      </section>
      {visibleCount < filteredProducts.length && (
        <div className="flex justify-center py-8">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 30)}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-brand-green/60 border border-brand-green/20 px-6 py-3 hover:text-brand-green hover:border-brand-green/40 transition-colors"
          >
            LOAD MORE · {filteredProducts.length - visibleCount} REMAINING
          </button>
        </div>
      )}

      <div className="px-4 py-8 text-center">
        <Link href="/b2b" className="font-mono text-[9px] uppercase tracking-[0.08em] text-brand-green/40 hover:text-brand-green/55">
          Wholesale access
        </Link>
      </div>

      <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} mode={mode} />
      <CartBar mode={mode} />

      {toasts.map((toast) => (
        <AddToCartToast key={toast.id} x={toast.x} y={toast.y} />
      ))}
    </>
  )
}

CatalogClient.displayName = 'CatalogClient'
