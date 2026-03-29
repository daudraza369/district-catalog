'use client'

import { FormEvent, useState } from 'react'
import { type Origin, ORIGIN_LABELS, type Product } from '@/lib/types'
import { type ImageRecord } from '@/components/admin/ImageLibrary'
import Image from 'next/image'
import { getFlowerImagePath } from '@/lib/flower-images'

interface ProductFormProps {
  initial?: Partial<Product>
  images: ImageRecord[]
  onSubmit: (values: {
    name: string
    variety: string
    stem_length: string | null
    color: string | null
    origin: Origin
    price: number
    stock: boolean
    image_url: string | null
    active: boolean
  }) => Promise<void>
}

export default function ProductForm({ initial, images, onSubmit }: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [variety, setVariety] = useState(initial?.variety ?? '')
  const [stemLength, setStemLength] = useState(initial?.stem_length ?? '')
  const [color, setColor] = useState(initial?.color ?? '')
  const [origin, setOrigin] = useState<Origin>(initial?.origin ?? 'other')
  const [price, setPrice] = useState<number>(0)
  const [stock, setStock] = useState(true)
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [active, setActive] = useState(initial?.active ?? true)
  const [selectedImageId, setSelectedImageId] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    await onSubmit({
      name,
      variety,
      stem_length: stemLength || null,
      color: color || null,
      origin,
      price,
      stock,
      image_url: imageUrl || null,
      active
    })
    setSaving(false)
    if (!initial?.id) {
      setName('')
      setVariety('')
      setStemLength('')
      setColor('')
      setImageUrl('')
      setOrigin('other')
      setPrice(0)
      setStock(true)
      setActive(true)
      setSelectedImageId('')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 border border-brand-border bg-brand-bg p-4">
      <h3 className="font-display text-xl text-brand-green">{initial?.id ? 'Edit Product' : 'Add Product'}</h3>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Flower name"
        className="h-10 w-full border border-brand-border bg-transparent px-3 text-[11px] uppercase tracking-[0.08em] outline-none focus-brand"
        required
      />
      <input
        value={variety}
        onChange={(event) => setVariety(event.target.value)}
        placeholder="Variety"
        className="h-10 w-full border border-brand-border bg-transparent px-3 text-[11px] uppercase tracking-[0.08em] outline-none focus-brand"
        required
      />
      <input
        value={stemLength}
        onChange={(event) => setStemLength(event.target.value)}
        placeholder="e.g. 50cm"
        className="h-10 w-full border border-brand-border bg-transparent px-3 text-[11px] uppercase tracking-[0.08em] outline-none focus-brand"
      />
      <input
        value={color}
        onChange={(event) => setColor(event.target.value)}
        placeholder="e.g. Red, White, Pink"
        className="h-10 w-full border border-brand-border bg-transparent px-3 text-[11px] tracking-[0.08em] outline-none focus-brand"
      />
      <p className="text-[10px] uppercase tracking-[0.1em] text-brand-green/50">This will appear below the name in the catalog</p>
      <select
        value={origin}
        onChange={(event) => setOrigin(event.target.value as Origin)}
        className="h-10 w-full border border-brand-border bg-transparent px-3 text-[11px] uppercase tracking-[0.08em] outline-none focus-brand"
      >
        {Object.entries(ORIGIN_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <div className="pt-1">
        <p className="text-[9px] uppercase tracking-[0.12em] text-brand-green/50">PRODUCT IMAGE</p>
        <p className="mt-1 text-[9px] text-brand-green/45">Upload via Image Library tab, then select here or use Auto Match</p>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          value={Number.isFinite(price) ? price : 0}
          onChange={(event) => setPrice(Number(event.target.value))}
          placeholder="Price Per Stem"
          type="number"
          min={0}
          step={0.01}
          className="h-10 w-full border border-brand-border bg-transparent px-3 text-[11px] tracking-[0.08em] outline-none focus-brand"
          required
        />
        <label className="flex items-center gap-2 border border-brand-border px-3 text-[10px] uppercase tracking-[0.1em]">
          <input type="checkbox" checked={stock} onChange={(event) => setStock(event.target.checked)} />
          Stock Available
        </label>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="Image URL"
          className="h-10 w-full border border-brand-border bg-transparent px-3 text-[11px] uppercase tracking-[0.08em] outline-none focus-brand"
        />
        <div className="h-10 w-10 overflow-hidden bg-[var(--brand-skeleton-base)]">
          {imageUrl ? <Image src={imageUrl} alt="Selected product image" width={40} height={40} className="h-10 w-10 object-cover" unoptimized /> : null}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <select
          value={selectedImageId}
          onChange={(event) => {
            const value = event.target.value
            setSelectedImageId(value)
            const selected = images.find((image) => image.id === value)
            if (selected) setImageUrl(selected.image_url)
          }}
          className="h-10 w-full border border-brand-border bg-transparent px-3 text-[11px] uppercase tracking-[0.08em] outline-none focus-brand"
        >
          <option value="">Select from image library</option>
          {images.map((image) => (
            <option key={image.id} value={image.id}>
              {image.flower_name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            const localMatch = getFlowerImagePath(name)
            if (localMatch) {
              setImageUrl(localMatch)
              setSelectedImageId('')
              return
            }

            const supabaseMatch = images.find((image) => image.flower_name.toLowerCase().includes(name.toLowerCase()))
            if (supabaseMatch) {
              setImageUrl(supabaseMatch.image_url)
              setSelectedImageId(supabaseMatch.id)
            }
          }}
          title="Automatically finds an image from your library that matches this flower name"
          className="h-10 border border-brand-border px-3 text-[10px] uppercase tracking-[0.1em]"
        >
          Auto Match
        </button>
      </div>
      <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em]">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
        Active
      </label>
      <button type="submit" disabled={saving} className="h-10 border border-brand-green bg-brand-green px-4 text-[11px] uppercase tracking-[0.1em] text-brand-bg">
        {saving ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}

ProductForm.displayName = 'ProductForm'
