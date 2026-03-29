'use client'

import { useEffect, useMemo, useState } from 'react'
import CatalogHeader from '@/components/catalog/CatalogHeader'
import FilterBar from '@/components/catalog/FilterBar'
import ProductRow from '@/components/catalog/ProductRow'
import ProductDetailPanel from '@/components/catalog/ProductDetailPanel'
import AddToCartToast from '@/components/catalog/AddToCartToast'
import CartBar from '@/components/catalog/CartBar'
import { CATALOG_HEADER_COLS } from '@/components/catalog/constants'
import { useCart } from '@/components/catalog/CartContext'
import { ORIGIN_LABELS, type CatalogProduct, type Origin } from '@/lib/types'

interface CatalogClientProps {
  allProducts: CatalogProduct[]
}

const ORIGINS = Object.keys(ORIGIN_LABELS) as Origin[]

export default function CatalogClient({ allProducts }: CatalogClientProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [mode, setMode] = useState<'b2b' | 'b2c'>(() =>
    typeof window !== 'undefined' && sessionStorage.getItem('b2b_authenticated') === 'true' ? 'b2b' : 'b2c'
  )
  const [search, setSearch] = useState('')
  const [origin, setOrigin] = useState('')
  const [flowerType, setFlowerType] = useState('')
  const [stockOnly, setStockOnly] = useState(false)
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

  const handleExportPDF = () => {
    const params = new URLSearchParams()
    params.set('mode', mode)
    if (origin) params.set('origin', origin)
    if (flowerType) params.set('flower_type', flowerType)
    if (stockOnly) params.set('stock', 'true')
    if (search.trim()) params.set('search', search.trim())
    window.open(`/api/catalog/export?${params.toString()}`, '_blank')
  }

  useEffect(() => {
    if (selectedIndex === null) return
    if (filteredProducts.length === 0 || selectedIndex > filteredProducts.length - 1) {
      setSelectedIndex(null)
    }
  }, [filteredProducts, selectedIndex])

  return (
    <>
      <CatalogHeader
        mode={mode}
        onB2BLogout={() => {
          sessionStorage.removeItem('b2b_authenticated')
          setMode('b2c')
        }}
        onB2BAccess={() => {
          window.location.href = '/b2b'
        }}
        onExportPDF={handleExportPDF}
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
      />
      <div className={`${CATALOG_HEADER_COLS} grid items-end border-b border-brand-green/10 bg-[#f4f3ee] px-0 py-2.5`}>
        <p className="col-span-2 pl-4 text-[9px] uppercase tracking-[0.15em] text-brand-green/50">Variety / Flower Type</p>
        <p className="hidden md:block text-center text-[9px] uppercase tracking-[0.15em] text-brand-green/50">Origin</p>
        <p className="hidden md:block text-center text-[9px] uppercase tracking-[0.15em] text-brand-green/50">Stock</p>
        <p className="pr-3 text-right font-mono text-[8px] tracking-[0.08em] text-brand-green/55 md:pr-7 md:text-[9px] md:uppercase md:tracking-[0.15em] md:text-brand-green/50">
          <span className="whitespace-nowrap md:hidden">{mode === 'b2b' ? 'PRICE/STEM' : 'PRICE/BUNCH'}</span>
          <span className="hidden md:inline">{mode === 'b2b' ? 'Price Per Stem' : 'Price Per Bunch'}</span>
        </p>
      </div>

      <section>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <ProductRow
              key={product.shipment_product_id}
              product={product}
              mode={mode}
              index={index}
              priority={index < 6}
              onOpenDetail={() => setSelectedIndex(index)}
            />
          ))
        ) : (
          <div className="px-4 py-20 text-center text-[11px] uppercase tracking-[0.12em] text-brand-green/55">No products match your filters.</div>
        )}
      </section>

      <ProductDetailPanel
        products={filteredProducts}
        selectedIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onNext={() => setSelectedIndex((prev) => (prev === null ? null : Math.min(prev + 1, filteredProducts.length - 1)))}
        onPrev={() => setSelectedIndex((prev) => (prev === null ? null : Math.max(prev - 1, 0)))}
        mode={mode}
      />
      <CartBar mode={mode} />

      {toasts.map((toast) => (
        <AddToCartToast key={toast.id} x={toast.x} y={toast.y} />
      ))}
    </>
  )
}

CatalogClient.displayName = 'CatalogClient'
