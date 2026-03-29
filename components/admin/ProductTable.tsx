'use client'

import { useEffect, useMemo, useState } from 'react'
import { type Product } from '@/lib/types'
import Image from 'next/image'
import OriginBadge from '@/components/catalog/OriginBadge'
import { type ImageRecord } from '@/components/admin/ImageLibrary'

interface ProductTableProps {
  products: Product[]
  images: ImageRecord[]
  activeShipmentId: string | null
  activateMissingOnly?: boolean
  onEdit: (product: Product) => void
  onDelete: (productId: string) => Promise<void>
  onToggleActive: (product: Product) => Promise<void>
  onToggleStock: (product: Product, stock: boolean, shipmentId: string | null) => Promise<void>
  onAssignImage: (product: Product, imageUrl: string | null) => Promise<void>
}

export default function ProductTable({
  products,
  images,
  activeShipmentId,
  activateMissingOnly = false,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleStock,
  onAssignImage
}: ProductTableProps) {
  const [search, setSearch] = useState('')
  const [missingOnly, setMissingOnly] = useState(false)
  const [assigningProduct, setAssigningProduct] = useState<Product | null>(null)

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
      <div className="overflow-hidden border border-brand-border">
      <table className="w-full border-collapse">
        <thead className="bg-brand-bg-secondary">
          <tr className="text-left text-[9px] uppercase tracking-[0.15em] text-brand-green/55">
            <th className="px-3 py-2">Image</th>
            <th className="px-3 py-2">Name / Variety</th>
            <th className="px-3 py-2">Origin</th>
            <th className="px-3 py-2">Stock</th>
            <th className="px-3 py-2">Active</th>
            <th className="px-3 py-2">Assign Image</th>
            <th className="px-3 py-2">Edit</th>
            <th className="px-3 py-2">Delete</th>
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
              <td className="px-3 py-2">
                <p className="text-[11px]">{product.name}</p>
                <p className="text-[10px] uppercase tracking-[0.08em] text-brand-green/65">{product.variety}</p>
              </td>
              <td className="px-3 py-2 text-[11px]">
                <OriginBadge origin={product.origin} />
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={() => onToggleStock(product, !(product.stock ?? false), activeShipmentId)}
                  className={`inline-flex h-6 w-11 items-center rounded-full border px-1 transition ${
                    product.stock ? 'justify-end border-brand-green bg-brand-green/15' : 'justify-start border-brand-border'
                  }`}
                >
                  <span className={`h-4 w-4 rounded-full ${product.stock ? 'bg-brand-green' : 'bg-brand-green/45'}`} />
                </button>
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={() => onToggleActive(product)}
                  className={`inline-flex h-6 w-11 items-center rounded-full border px-1 transition ${
                    product.active ? 'justify-end border-brand-green bg-brand-green/15' : 'justify-start border-brand-border'
                  }`}
                >
                  <span className={`h-4 w-4 rounded-full ${product.active ? 'bg-brand-green' : 'bg-brand-green/45'}`} />
                </button>
              </td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => setAssigningProduct(product)}
                  className="border border-brand-border px-2 py-1 text-[10px] uppercase tracking-[0.1em]"
                >
                  Assign Image
                </button>
              </td>
              <td className="px-3 py-2">
                <button onClick={() => onEdit(product)} className="border border-brand-border px-2 py-1 text-[10px] uppercase tracking-[0.1em]">
                  Edit
                </button>
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={() => {
                    if (window.confirm(`Delete ${product.name} ${product.variety}?`)) {
                      void onDelete(product.id)
                    }
                  }}
                  className="border border-rose-500 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-rose-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {assigningProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(32,50,42,0.35)] p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto border border-brand-border bg-brand-bg p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-xl text-brand-green">Assign Image: {assigningProduct.name}</h3>
              <button onClick={() => setAssigningProduct(null)} className="border border-brand-border px-2 py-1 text-[10px] uppercase tracking-[0.1em]">
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {images.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={async () => {
                    await onAssignImage(assigningProduct, image.image_url)
                    setAssigningProduct(null)
                  }}
                  className="border border-brand-border p-2 text-left"
                >
                  <Image src={image.image_url} alt={image.flower_name} width={120} height={120} className="h-24 w-full object-cover" unoptimized />
                  <p className="mt-1 text-[9px] uppercase tracking-[0.08em] text-brand-green/70">{image.flower_name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

ProductTable.displayName = 'ProductTable'
