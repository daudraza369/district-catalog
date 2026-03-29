'use client'

import { FormEvent, useState } from 'react'
import { type CatalogProduct, type Shipment } from '@/lib/types'
import { formatArrivalDate } from '@/lib/utils'

interface ShipmentWithCount extends Shipment {
  shipment_products?: Array<{ count: number }>
}

interface ShipmentListProps {
  shipments: ShipmentWithCount[]
  authHeaders: Record<string, string>
  onSetActive: (shipmentId: string) => Promise<void>
  onDelete: (shipmentId: string) => Promise<void>
  onCreated: () => Promise<void>
  onToast?: (type: 'success' | 'error', message: string) => void
}

interface ShipmentProductsResponse {
  products: CatalogProduct[]
}

export default function ShipmentList({ shipments, authHeaders, onSetActive, onDelete, onCreated, onToast }: ShipmentListProps) {
  const [batchId, setBatchId] = useState('')
  const [arrivalDate, setArrivalDate] = useState('')
  const [priceUnit, setPriceUnit] = useState<'per_stem' | 'per_bunch'>('per_stem')
  const [expanded, setExpanded] = useState<Record<string, CatalogProduct[]>>({})
  const [priceDrafts, setPriceDrafts] = useState<Record<string, Record<string, number>>>({})

  const createShipment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!batchId.trim() || !arrivalDate) return

    const response = await fetch('/api/admin/shipments', {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batch_id: batchId.trim(),
        arrival_date: arrivalDate,
        price_unit: priceUnit,
        is_active: false
      })
    })
    if (!response.ok) {
      onToast?.('error', 'Failed to create shipment')
      return
    }
    setBatchId('')
    setArrivalDate('')
    setPriceUnit('per_stem')
    await onCreated()
    onToast?.('success', 'Shipment created')
  }

  const toggleProducts = async (shipmentId: string) => {
    if (expanded[shipmentId]) {
      const next = { ...expanded }
      delete next[shipmentId]
      setExpanded(next)
      return
    }
    await loadShipmentProducts(shipmentId)
  }

  const loadShipmentProducts = async (shipmentId: string) => {
    const response = await fetch(`/api/catalog?shipment_id=${shipmentId}`, { cache: 'no-store' })
    if (!response.ok) return
    const data = (await response.json()) as ShipmentProductsResponse
    setExpanded((prev) => ({ ...prev, [shipmentId]: data.products ?? [] }))
    setPriceDrafts((prev) => ({
      ...prev,
      [shipmentId]: Object.fromEntries((data.products ?? []).map((product) => [product.id, product.price]))
    }))
  }

  const saveAllPrices = async (shipmentId: string) => {
    const draft = priceDrafts[shipmentId]
    if (!draft) return
    const updates = Object.entries(draft).map(([product_id, price]) => ({ product_id, price }))
    const response = await fetch(`/api/admin/shipments/${shipmentId}/prices`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    })
    if (!response.ok) {
      onToast?.('error', 'Failed to save shipment prices')
      return
    }
    onToast?.('success', 'Shipment prices updated')
    await loadShipmentProducts(shipmentId)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={createShipment} className="grid gap-3 border border-brand-border bg-brand-bg-secondary p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
        <input value={batchId} onChange={(event) => setBatchId(event.target.value)} placeholder="Batch ID" className="h-10 border border-brand-border bg-brand-bg px-3 text-[11px] uppercase tracking-[0.1em] outline-none focus-brand" required />
        <input type="date" value={arrivalDate} onChange={(event) => setArrivalDate(event.target.value)} className="h-10 border border-brand-border bg-brand-bg px-3 text-[11px] uppercase tracking-[0.1em] outline-none focus-brand" required />
        <select value={priceUnit} onChange={(event) => setPriceUnit(event.target.value as 'per_stem' | 'per_bunch')} className="h-10 border border-brand-border bg-brand-bg px-3 text-[11px] uppercase tracking-[0.1em] outline-none focus-brand">
          <option value="per_stem">Per Stem</option>
          <option value="per_bunch">Per Bunch</option>
        </select>
        <button type="submit" className="h-10 border border-brand-green bg-brand-green px-4 text-[11px] uppercase tracking-[0.1em] text-brand-bg">
          CREATE SHIPMENT
        </button>
      </form>
      {shipments.map((shipment) => (
        <article key={shipment.id} className="border border-brand-border bg-brand-bg p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-[16px] font-bold text-brand-green">Batch {shipment.batch_id}</h3>
              <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-brand-green/70">Arrival {formatArrivalDate(shipment.arrival_date)}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-brand-green/50">{(shipment.shipment_products?.[0]?.count ?? 0).toString()} PRODUCTS</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-brand-border px-3 py-2 text-[10px] uppercase tracking-[0.1em] text-brand-green/70">{shipment.price_unit === 'per_bunch' ? 'PER BUNCH' : 'PER STEM'}</span>
              {shipment.is_active ? (
                <span className="rounded-full border border-brand-green bg-brand-green px-3 py-2 text-[10px] uppercase tracking-[0.1em] text-brand-bg">ACTIVE</span>
              ) : null}
              <button
                onClick={async () => {
                  await onSetActive(shipment.id)
                  onToast?.('success', 'Catalog updated to this shipment')
                }}
                className="border border-brand-border px-3 py-2 text-[10px] uppercase tracking-[0.1em]"
              >
                Set Active
              </button>
              <button onClick={() => toggleProducts(shipment.id)} className="border border-brand-border px-3 py-2 text-[10px] uppercase tracking-[0.1em]">
                {expanded[shipment.id] ? 'Hide Products' : 'View Products'}
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete shipment ${shipment.batch_id}? This removes linked shipment products.`)) {
                    void onDelete(shipment.id)
                  }
                }}
                className="border border-rose-500 px-3 py-2 text-[10px] uppercase tracking-[0.1em] text-rose-600"
              >
                Delete Shipment
              </button>
            </div>
          </div>

          {expanded[shipment.id] ? (
            <div className="mt-3 overflow-hidden border border-brand-border">
              <table className="w-full border-collapse">
                <thead className="bg-brand-bg-secondary text-left text-[9px] uppercase tracking-[0.12em] text-brand-green/55">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Variety</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2">Stock</th>
                  </tr>
                </thead>
                <tbody className="block max-h-[300px] overflow-y-auto">
                  {expanded[shipment.id].map((product) => (
                    <tr key={product.shipment_product_id} className="grid grid-cols-[1fr_1fr_120px_90px] border-t border-brand-border text-[11px]">
                      <td className="px-3 py-2">{product.name}</td>
                      <td className="px-3 py-2 uppercase tracking-[0.08em] text-brand-green/65">{product.variety}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={priceDrafts[shipment.id]?.[product.id] ?? product.price}
                          onChange={(event) => {
                            const value = Number(event.target.value)
                            setPriceDrafts((prev) => ({
                              ...prev,
                              [shipment.id]: {
                                ...(prev[shipment.id] ?? {}),
                                [product.id]: Number.isFinite(value) ? value : 0
                              }
                            }))
                          }}
                          className="h-8 w-full border border-brand-border bg-brand-bg px-2 text-[11px]"
                        />
                      </td>
                      <td className="px-3 py-2 uppercase">{product.stock ? 'YES' : 'NO'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end p-3">
                <button
                  type="button"
                  onClick={() => saveAllPrices(shipment.id)}
                  className="border border-brand-green bg-brand-green px-3 py-2 text-[10px] uppercase tracking-[0.1em] text-brand-bg"
                >
                  Save All Prices
                </button>
              </div>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  )
}

ShipmentList.displayName = 'ShipmentList'
