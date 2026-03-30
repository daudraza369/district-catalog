'use client'

import { useEffect, useMemo, useState } from 'react'
import { type Product } from '@/lib/types'
import Image from 'next/image'
import OriginBadge from '@/components/catalog/OriginBadge'

interface ProductTableProps {
  products: Product[]
  activeShipmentId: string | null
  activateMissingOnly?: boolean
  onEdit: (product: Product) => void
  onDelete: (productId: string) => Promise<void>
  onPatch: (productId: string, payload: Record<string, unknown>) => Promise<boolean>
}

export default function ProductTable({
  products,
  activeShipmentId,
  activateMissingOnly = false,
  onEdit,
  onDelete,
  onPatch
}: ProductTableProps) {
  const [search, setSearch] = useState('')
  const [missingOnly, setMissingOnly] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [draftPrice, setDraftPrice] = useState('')
  const [lastSavedField, setLastSavedField] = useState<string | null>(null)

  useEffect(() => {
    if (activateMissingOnly) setMissingOnly(true)
  }, [activateMissingOnly])

  const missingCount = useMemo(() => products.filter((product) => !product.image_url).length, [products])
  const filtered = useMemo(
    () =>
      products.filter((product) => {
        if (missingOnly && product.image_url) return false
        if (!search.trim()) return true
        const q = search.toLowerCase().trim()
        return `${product.name} ${product.variety}`.toLowerCase().includes(q)
      }),
    [missingOnly, products, search]
  )

  return (
    <div className="space-y-3">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="SEARCH BY NAME OR VARIETY..."
        className="h-10 w-full border border-brand-border bg-brand-bg px-3 text-[11px] uppercase tracking-[0.1em] outline-none focus-brand"
      />
      <div>
        <button
          type="button"
          onClick={() => setMissingOnly((value) => !value)}
          className={`border px-3 py-2 text-[10px] uppercase tracking-[0.1em] ${
            missingOnly ? 'border-brand-green bg-brand-green text-brand-bg' : 'border-brand-border text-brand-green/70'
          }`}
        >
          Missing Images ({missingCount})
        </button>
      </div>
      <div className="overflow-auto border border-brand-border">
      <table className="w-full min-w-[1180px] border-collapse">
        <thead className="bg-brand-bg-secondary">
          <tr className="text-left text-[9px] uppercase tracking-[0.15em] text-brand-green/55">
            <th className="px-3 py-2">Image</th>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Variety</th>
            <th className="px-3 py-2">Origin</th>
            <th className="px-3 py-2">B2B</th>
            <th className="px-3 py-2">B2C</th>
            <th className="px-3 py-2">Stem Price</th>
            <th className="px-3 py-2">Bunch Price</th>
            <th className="px-3 py-2">Stock</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((product, index) => (
            <tr key={product.id} className={index % 2 === 0 ? 'bg-brand-bg' : 'bg-brand-bg-secondary'}>
              <td className="px-3 py-2">
                {product.image_url ? (
                  <Image src={product.image_url} alt={`${product.name} ${product.variety}`} width={44} height={44} className="h-11 w-11 object-cover" unoptimized />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center bg-[var(--brand-skeleton-base)]">
                    <svg viewBox="0 0 40 40" fill="none" width="18" height="18" opacity="0.3">
                      <circle cx="20" cy="20" r="4" stroke="#20322a" strokeWidth="1.5" />
                      <circle cx="20" cy="12" r="3" stroke="#20322a" strokeWidth="1.2" />
                      <circle cx="20" cy="28" r="3" stroke="#20322a" strokeWidth="1.2" />
                      <circle cx="12" cy="16" r="3" stroke="#20322a" strokeWidth="1.2" />
                      <circle cx="28" cy="16" r="3" stroke="#20322a" strokeWidth="1.2" />
                      <circle cx="12" cy="24" r="3" stroke="#20322a" strokeWidth="1.2" />
                      <circle cx="28" cy="24" r="3" stroke="#20322a" strokeWidth="1.2" />
                    </svg>
                  </div>
                )}
              </td>
              <td className="px-3 py-2 text-[11px]">{product.name}</td>
              <td className="px-3 py-2 text-[10px] uppercase tracking-[0.08em] text-brand-green/65">{product.variety}</td>
              <td className="px-3 py-2 text-[11px]">
                <OriginBadge origin={product.origin} />
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={async () => {
                    await onPatch(product.id, { show_b2b: !product.show_b2b })
                  }}
                  className={`border px-2 py-1 text-[9px] uppercase tracking-[0.1em] ${
                    product.show_b2b ? 'border-brand-green bg-brand-green text-brand-bg' : 'border-brand-border text-brand-green/55'
                  }`}
                >
                  B2B
                </button>
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={async () => {
                    await onPatch(product.id, { show_b2c: !product.show_b2c })
                  }}
                  className={`border px-2 py-1 text-[9px] uppercase tracking-[0.1em] ${
                    product.show_b2c ? 'border-brand-green bg-brand-green text-brand-bg' : 'border-brand-border text-brand-green/55'
                  }`}
                >
                  B2C
                </button>
              </td>
              <td className="px-3 py-2">
                {editingField === `${product.id}:price` ? (
                  <input
                    autoFocus
                    value={draftPrice}
                    onChange={(event) => setDraftPrice(event.target.value)}
                    onBlur={async () => {
                      const next = Number(draftPrice)
                      if (!Number.isNaN(next)) {
                        const ok = await onPatch(product.id, { price: next, shipment_id: activeShipmentId ?? undefined })
                        if (ok) {
                          setLastSavedField(`${product.id}:price`)
                        }
                      }
                      setEditingField(null)
                    }}
                    onKeyDown={async (event) => {
                      if (event.key !== 'Enter') return
                      const next = Number(draftPrice)
                      if (!Number.isNaN(next)) {
                        const ok = await onPatch(product.id, { price: next, shipment_id: activeShipmentId ?? undefined })
                        if (ok) setLastSavedField(`${product.id}:price`)
                      }
                      setEditingField(null)
                    }}
                    className="h-8 w-[88px] border border-brand-border bg-brand-bg px-2 text-[11px]"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingField(`${product.id}:price`)
                      setDraftPrice(String(product.price ?? 0))
                    }}
                    className="font-mono text-[11px] text-brand-green"
                  >
                    SAR {(product.price ?? 0).toFixed(2)}
                  </button>
                )}
                {lastSavedField === `${product.id}:price` ? <span className="ml-1 text-[11px] text-green-600">✓</span> : null}
              </td>
              <td className="px-3 py-2">
                {editingField === `${product.id}:price_b2c` ? (
                  <input
                    autoFocus
                    value={draftPrice}
                    onChange={(event) => setDraftPrice(event.target.value)}
                    onBlur={async () => {
                      const next = Number(draftPrice)
                      if (!Number.isNaN(next)) {
                        const ok = await onPatch(product.id, { price_b2c: next, shipment_id: activeShipmentId ?? undefined })
                        if (ok) setLastSavedField(`${product.id}:price_b2c`)
                      }
                      setEditingField(null)
                    }}
                    onKeyDown={async (event) => {
                      if (event.key !== 'Enter') return
                      const next = Number(draftPrice)
                      if (!Number.isNaN(next)) {
                        const ok = await onPatch(product.id, { price_b2c: next, shipment_id: activeShipmentId ?? undefined })
                        if (ok) setLastSavedField(`${product.id}:price_b2c`)
                      }
                      setEditingField(null)
                    }}
                    className="h-8 w-[88px] border border-brand-border bg-brand-bg px-2 text-[11px]"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingField(`${product.id}:price_b2c`)
                      setDraftPrice(String(product.price_b2c ?? (product.price ?? 0) * 10))
                    }}
                    className="font-mono text-[11px] text-brand-green"
                  >
                    SAR {(product.price_b2c ?? (product.price ?? 0) * 10).toFixed(2)}
                  </button>
                )}
                {lastSavedField === `${product.id}:price_b2c` ? <span className="ml-1 text-[11px] text-green-600">✓</span> : null}
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={async () => {
                    await onPatch(product.id, { stock: !(product.stock ?? false), shipment_id: activeShipmentId ?? undefined })
                  }}
                  className={`border px-2 py-1 text-[10px] uppercase tracking-[0.1em] ${
                    product.stock ? 'border-brand-green bg-brand-green text-brand-bg' : 'border-brand-border text-brand-green/55'
                  }`}
                >
                  {product.stock ? 'YES' : 'NO'}
                </button>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    title="Edit"
                    className="border border-brand-border px-2 py-1 text-[11px] text-brand-green"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete ${product.name} ${product.variety}?`)) {
                        void onDelete(product.id)
                      }
                    }}
                    title="Delete"
                    className="border border-rose-500 px-2 py-1 text-[11px] text-rose-600"
                  >
                    🗑
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}

ProductTable.displayName = 'ProductTable'
