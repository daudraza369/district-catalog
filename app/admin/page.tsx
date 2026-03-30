'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Sidebar, { type AdminTab } from '@/components/admin/Sidebar'
import PasswordGate from '@/components/admin/PasswordGate'
import ProductForm from '@/components/admin/ProductForm'
import ProductTable from '@/components/admin/ProductTable'
import ShipmentList from '@/components/admin/ShipmentList'
import ImageLibrary, { type ImageRecord } from '@/components/admin/ImageLibrary'
import { type Product, type Shipment } from '@/lib/types'
import { formatArrivalDate } from '@/lib/utils'
import Skeleton from '@/components/ui/Skeleton'

interface ShipmentWithCount extends Shipment {
  shipment_products?: Array<{ count: number }>
}

interface ToastState {
  type: 'success' | 'error'
  message: string
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [shipments, setShipments] = useState<ShipmentWithCount[]>([])
  const [images, setImages] = useState<ImageRecord[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [shipmentsLoading, setShipmentsLoading] = useState(false)
  const [imagesLoading, setImagesLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [ingestSecret, setIngestSecret] = useState('')
  const [revealSecret, setRevealSecret] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [activateMissingOnly, setActivateMissingOnly] = useState(false)

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_authenticated') === 'true'
    const storedPassword = localStorage.getItem('admin_password') ?? ''
    if (isAuth && storedPassword) {
      setAuthenticated(true)
      setAdminPassword(storedPassword)
    }
  }, [])

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${adminPassword}`
    }),
    [adminPassword]
  )

  const loadProducts = useCallback(async () => {
    setProductsLoading(true)
    const response = await fetch('/api/admin/products', { headers: authHeaders, cache: 'no-store' })
    if (response.ok) {
      const data = (await response.json()) as { products: Product[] }
      setProducts(data.products)
    }
    setProductsLoading(false)
  }, [authHeaders])

  const loadShipments = useCallback(async () => {
    setShipmentsLoading(true)
    const response = await fetch('/api/admin/shipments', { headers: authHeaders, cache: 'no-store' })
    if (response.ok) {
      const data = (await response.json()) as { shipments: ShipmentWithCount[] }
      setShipments(data.shipments)
    }
    setShipmentsLoading(false)
  }, [authHeaders])

  const loadImages = useCallback(async () => {
    setImagesLoading(true)
    const response = await fetch('/api/admin/images', { headers: authHeaders, cache: 'no-store' })
    if (response.ok) {
      const data = (await response.json()) as { images: ImageRecord[] }
      setImages(data.images)
    }
    setImagesLoading(false)
  }, [authHeaders])

  const loadConfig = useCallback(async () => {
    const response = await fetch('/api/admin/config', { headers: authHeaders, cache: 'no-store' })
    if (response.ok) {
      const data = (await response.json()) as { ingest_secret: string }
      setIngestSecret(data.ingest_secret)
    }
  }, [authHeaders])

  const pushToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    if (type === 'success') {
      setTimeout(() => setToast(null), 3000)
    }
  }, [])

  useEffect(() => {
    if (!authenticated || !adminPassword) return
    void loadProducts()
    void loadShipments()
    void loadImages()
    void loadConfig()
  }, [authenticated, adminPassword, loadConfig, loadImages, loadProducts, loadShipments])

  if (!authenticated) {
    return <PasswordGate onAuthenticated={(password) => { setAuthenticated(true); setAdminPassword(password) }} />
  }

  const activeShipment = shipments.find((shipment) => shipment.is_active)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const productsWithoutImage = products.filter((product) => !product.image_url).length
  const lastIngest = shipments[0]?.created_at ?? null

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 bg-brand-bg px-8 py-8">
        {activeTab === 'dashboard' ? (
          <section className="space-y-4">
            <h1 className="font-display text-4xl text-brand-green">Dashboard</h1>
            <article className="border border-brand-border bg-brand-bg-secondary p-5">
              <h2 className="font-display text-2xl text-brand-green">Active Shipment</h2>
              {activeShipment ? (
                <p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-brand-green/65">
                  Batch {activeShipment.batch_id} · Arrival {formatArrivalDate(activeShipment.arrival_date)} · Products{' '}
                  {activeShipment.shipment_products?.[0]?.count ?? 0} · Last Updated{' '}
                  {new Date(activeShipment.created_at).toLocaleString('en-US')}
                </p>
              ) : (
                <p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-brand-green/65">No active shipment set.</p>
              )}
            </article>
            <div className="grid gap-4 md:grid-cols-2">
              <article className="border border-brand-border bg-brand-bg p-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-brand-green/55">Total Products in Library</p>
                <p className="mt-2 font-display text-4xl text-brand-green">{products.length}</p>
              </article>
              <article className="border border-brand-border bg-brand-bg p-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-brand-green/55">Products in Active Shipment</p>
                <p className="mt-2 font-display text-4xl text-brand-green">{activeShipment?.shipment_products?.[0]?.count ?? 0}</p>
              </article>
              <article className="border border-brand-border bg-brand-bg p-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-brand-green/55">Total Images Uploaded</p>
                <p className="mt-2 font-display text-4xl text-brand-green">{images.length}</p>
              </article>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('products')
                  setActivateMissingOnly(true)
                }}
                className="border border-brand-border bg-brand-bg p-4 text-left"
              >
                <p className="text-[10px] uppercase tracking-[0.12em] text-brand-green/55">Products with No Image</p>
                <p className="mt-2 font-display text-4xl text-brand-green">{productsWithoutImage}</p>
              </button>
              <article className="border border-brand-border bg-brand-bg p-4 md:col-span-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-brand-green/55">Last Ingest</p>
                <p className="mt-2 text-[12px] uppercase tracking-[0.08em] text-brand-green/75">
                  {lastIngest ? new Date(lastIngest).toLocaleString('en-US') : 'No ingest yet'}
                </p>
              </article>
            </div>
          </section>
        ) : null}

        {activeTab === 'products' ? (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h1 className="font-display text-4xl text-brand-green">Products</h1>
              <button
                onClick={() => {
                  setEditingProduct(null)
                  setShowForm(true)
                  setActivateMissingOnly(false)
                }}
                className="border border-brand-green bg-brand-green px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-brand-bg"
              >
                Add Product
              </button>
            </div>
            <ProductTable
              products={products}
              activeShipmentId={activeShipment?.id ?? null}
              activateMissingOnly={activateMissingOnly}
              onEdit={(product) => {
                setEditingProduct(product)
                setShowForm(true)
                setActivateMissingOnly(false)
              }}
              onDelete={async (productId) => {
                const response = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE', headers: authHeaders })
                if (!response.ok) {
                  pushToast('error', 'Failed to delete product')
                  return
                }
                await loadProducts()
                pushToast('success', 'Product deleted')
              }}
              onPatch={async (productId, payload) => {
                const response = await fetch(`/api/admin/products/${productId}`, {
                  method: 'PATCH',
                  headers: { ...authHeaders, 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                })
                if (!response.ok) {
                  pushToast('error', 'Failed to update product')
                  return false
                }
                await loadProducts()
                pushToast('success', 'Product updated')
                return true
              }}
            />
            {productsLoading ? (
              <div className="mt-3 space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : null}

            {showForm ? (
              <div className="fixed right-0 top-0 h-screen w-full max-w-md border-l border-brand-border bg-brand-bg-secondary p-4 shadow-xl">
                <button onClick={() => setShowForm(false)} className="mb-3 border border-brand-border px-3 py-2 text-[10px] uppercase tracking-[0.1em]">
                  Close
                </button>
                <ProductForm
                  initial={editingProduct ?? undefined}
                  images={images}
                  onSubmit={async (values) => {
                    if (editingProduct) {
                      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
                        method: 'PUT',
                        headers: { ...authHeaders, 'Content-Type': 'application/json' },
                        body: JSON.stringify(values)
                      })
                      if (!response.ok) {
                        pushToast('error', 'Failed to update product')
                        return
                      }
                      pushToast('success', 'Product updated')
                    } else {
                      const response = await fetch('/api/admin/products', {
                        method: 'POST',
                        headers: { ...authHeaders, 'Content-Type': 'application/json' },
                        body: JSON.stringify(values)
                      })
                      if (!response.ok) {
                        pushToast('error', 'Failed to create product')
                        return
                      }
                      pushToast('success', 'Product created')
                    }
                    await loadProducts()
                    await loadShipments()
                    setShowForm(false)
                  }}
                />
              </div>
            ) : null}
          </section>
        ) : null}

        {activeTab === 'shipments' ? (
          <section className="space-y-4">
            <h1 className="font-display text-4xl text-brand-green">Shipments</h1>
            <ShipmentList
              shipments={shipments}
              authHeaders={authHeaders}
              onSetActive={async (shipmentId) => {
                const response = await fetch('/api/admin/shipments', {
                  method: 'PATCH',
                  headers: { ...authHeaders, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: shipmentId, is_active: true })
                })
                if (!response.ok) {
                  pushToast('error', 'Failed to set active shipment')
                  return
                }
                await loadShipments()
              }}
              onDelete={async (shipmentId) => {
                const response = await fetch(`/api/admin/shipments?id=${shipmentId}`, {
                  method: 'DELETE',
                  headers: authHeaders
                })
                if (!response.ok) {
                  pushToast('error', 'Failed to delete shipment')
                  return
                }
                await loadShipments()
                pushToast('success', 'Shipment deleted')
              }}
              onCreated={loadShipments}
              onToast={pushToast}
            />
            {shipmentsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 w-full" />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {activeTab === 'images' ? (
          <section className="space-y-4">
            <h1 className="font-display text-4xl text-brand-green">Image Library</h1>
            <ImageLibrary images={images} adminPassword={adminPassword} onUploadComplete={loadImages} onToast={pushToast} />
            {imagesLoading ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-square w-full" />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {activeTab === 'ingest' ? (
          <section className="space-y-4">
            <h1 className="font-display text-4xl text-brand-green">Ingest</h1>
            <article className="border border-brand-border bg-brand-bg-secondary p-4">
              <p className="text-[10px] uppercase tracking-[0.1em] text-brand-green/55">Endpoint</p>
              <p className="mt-1 text-[12px]">{`${appUrl}/api/ingest`}</p>
              <p className="mt-4 text-[10px] uppercase tracking-[0.1em] text-brand-green/55">INGEST_SECRET</p>
              <div className="mt-1 flex items-center gap-3">
                <code className="border border-brand-border bg-brand-bg px-2 py-1 text-[11px]">
                  {revealSecret ? ingestSecret : `${'*'.repeat(Math.max(8, ingestSecret.length || 12))}`}
                </code>
                <button onClick={() => setRevealSecret((value) => !value)} className="border border-brand-border px-2 py-1 text-[10px] uppercase tracking-[0.1em]">
                  {revealSecret ? 'Hide' : 'Reveal'}
                </button>
              </div>
            </article>

            <article className="border border-brand-border bg-brand-bg p-4">
              <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-brand-green/55">AI Prompt Template</p>
              <pre className="overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-brand-green/80">
{`You are processing a District Flowers wholesale shipment document.

Extract ALL products from the attached document and POST them to the catalog API.

IMPORTANT MAPPING RULES:
- Use "Flower Type (District)" column as the name
- Use "Variety Name (District)" column as the variety
- Use "COO" column for origin — map as follows:
  Ethiopia → ethiopia
  Kenya → kenya
  Netherlands → netherlands
  Saudi Arabia → saudi
  South Africa → south_africa
  Italy → italy
  Ecuador → ecuador
  Colombia → colombia
- Use "Specification" column as stem_length (e.g. "50cm")
- Include both visibility toggles:
  show_b2b: true
  show_b2c: true
- Set stock: true for available products, false when unavailable
- Include dual pricing:
  price: per stem
  price_b2c: per bunch (typically price * 10)
- Use "Units Per Box" as units_per_box
- Use "Units Per Bunch / Stem" as units_per_bunch

POST to:
${appUrl || '[NEXT_PUBLIC_APP_URL]'}/api/ingest

Headers:
  Authorization: Bearer [INGEST_SECRET]
  Content-Type: application/json

Body:
{
  "shipment": {
    "batch_id": "[extract date as batch ID e.g. 03-19-26]",
    "arrival_date": "[date in YYYY-MM-DD format]",
    "price_unit": "per_stem"
  },
  "products": [
    {
      "name": "[Flower Type District]",
      "variety": "[Variety Name District]",
      "origin": "[mapped origin value]",
      "stem_length": "[Specification value]",
      "price": 1.60,
      "price_b2c": 16.00,
      "stock": true,
      "show_b2b": true,
      "show_b2c": true,
      "units_per_box": [number or null],
      "units_per_bunch": [number or null]
    }
  ]
}

Extract every row from the document as a separate product entry. Do not skip any rows.
Make the POST request with the Authorization header.`}
              </pre>
            </article>
          </section>
        ) : null}

        {toast ? (
          <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.08em] ${toast.type === 'success' ? 'bg-brand-green text-brand-bg' : 'bg-brand-rose text-white'}`}>
            <span>{toast.type === 'success' ? '✓' : '✕'}</span>
            <span>{toast.message}</span>
            {toast.type === 'error' ? (
              <button onClick={() => setToast(null)} className="ml-2 border border-white/40 px-2 py-1 text-[10px]">
                Close
              </button>
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  )
}
