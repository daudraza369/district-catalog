'use client'

import { type DragEvent, FormEvent, useMemo, useState } from 'react'
import Image from 'next/image'
import { FLOWER_IMAGE_MAP } from '@/lib/flower-images'

export interface ImageRecord {
  id: string
  flower_name: string
  image_url: string
  storage_path?: string
}

interface ImageLibraryProps {
  images: ImageRecord[]
  onUploadComplete: () => Promise<void>
  adminPassword: string
  onToast?: (type: 'success' | 'error', message: string) => void
}

export default function ImageLibrary({ images, onUploadComplete, adminPassword, onToast }: ImageLibraryProps) {
  const [file, setFile] = useState<File | null>(null)
  const [flowerName, setFlowerName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [successToast, setSuccessToast] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file || !flowerName.trim()) return
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum is 5MB.')
      onToast?.('error', 'File too large. Maximum is 5MB.')
      return
    }
    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('flower_name', flowerName.trim())
    formData.append('image', file)

    const response = await fetch('/api/admin/images', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminPassword}` },
      body: formData
    })

    setUploading(false)
    if (!response.ok) {
      setError('Upload failed. Check storage bucket permissions.')
      onToast?.('error', 'Upload failed. Check storage bucket permissions.')
      return
    }

    setFlowerName('')
    setFile(null)
    await onUploadComplete()
    setSuccessToast('Image uploaded successfully.')
    onToast?.('success', 'Image uploaded successfully')
    setTimeout(() => setSuccessToast(''), 2200)
  }

  const deleteImage = async (id: string) => {
    const response = await fetch(`/api/admin/images?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminPassword}` }
    })
    if (!response.ok) {
      setError('Failed to delete image.')
      onToast?.('error', 'Failed to delete image.')
      return
    }
    await onUploadComplete()
    setDeleteConfirmId(null)
    setSuccessToast('Image deleted.')
    onToast?.('success', 'Image deleted')
    setTimeout(() => setSuccessToast(''), 2200)
  }

  const uploadLabel = useMemo(() => {
    if (!file) return 'Drop image here or click to upload'
    return `Selected: ${file.name}`
  }, [file])

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const dropped = event.dataTransfer.files?.[0] ?? null
    if (dropped) setFile(dropped)
  }

  const localAssets = Object.entries(FLOWER_IMAGE_MAP)

  return (
    <div className="space-y-4">
      <section className="border border-brand-border bg-brand-bg p-4">
        <h3 className="text-[10px] uppercase tracking-[0.12em] text-brand-green/65">LOCAL ASSET LIBRARY</h3>
        <p className="mt-2 text-[10px] text-brand-green/55">
          These images are built into the app and auto-match by flower name automatically.
        </p>
        {localAssets.length === 0 ? (
          <p className="mt-3 text-[10px] uppercase tracking-[0.1em] text-brand-green/45">No local image mappings configured yet.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {localAssets.map(([flowerName, imagePath]) => (
              <article key={flowerName} className="border border-brand-border bg-brand-bg p-2">
                <Image src={imagePath} alt={flowerName} width={220} height={220} className="aspect-square h-auto w-full object-cover" />
                <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-brand-green/65">{flowerName}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <form onSubmit={handleUpload} className="border border-brand-border bg-brand-bg p-4">
        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center border border-dashed bg-brand-bg-secondary px-6 py-8 text-center ${
            successToast ? 'border-green-600' : error ? 'border-brand-rose' : 'border-[rgba(32,50,42,0.3)]'
          }`}
        >
          <input type="file" accept="image/*" className="hidden" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22" className="mb-3 opacity-60">
            <line x1="12" y1="17" x2="12" y2="5" stroke="#20322a" strokeWidth="1.4" />
            <path d="M8 9L12 5L16 9" stroke="#20322a" strokeWidth="1.4" fill="none" />
            <line x1="5" y1="20" x2="19" y2="20" stroke="#20322a" strokeWidth="1.2" />
          </svg>
          <p className="text-[10px] uppercase tracking-[0.15em] text-brand-green/55">DROP IMAGE HERE OR CLICK TO UPLOAD</p>
          <p className="mt-2 text-[9px] text-brand-green/35">PNG, JPG up to 5MB</p>
        </label>
        {file ? <p className="mt-3 text-[10px] uppercase tracking-[0.1em] text-brand-green/55">{uploadLabel}</p> : null}

        {file ? (
          <div className="mt-4">
            <p className="mb-2 text-[9px] uppercase tracking-[0.12em] text-brand-green/50">FLOWER NAME FOR AUTO-MATCHING</p>
            <input
              value={flowerName}
              onChange={(event) => setFlowerName(event.target.value)}
              placeholder="e.g. Roses"
              className="h-11 w-full border border-brand-border bg-transparent px-[14px] py-[10px] text-[12px] outline-none placeholder:text-brand-green/40"
            />
          </div>
        ) : null}
        {error ? <p className="mt-3 text-[10px] uppercase tracking-[0.1em] text-brand-rose">{error}</p> : null}
        {successToast ? <p className="mt-3 text-[10px] uppercase tracking-[0.1em] text-green-700">IMAGE UPLOADED SUCCESSFULLY</p> : null}
        <button
          type="submit"
          disabled={uploading}
          className="mt-4 h-11 w-full border border-brand-green bg-brand-green px-4 text-[11px] uppercase tracking-[0.1em] text-brand-bg transition-colors hover:bg-[#2e4a3e]"
        >
          {uploading ? 'UPLOADING...' : 'UPLOAD TO LIBRARY'}
        </button>
      </form>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-brand-border bg-brand-bg-secondary py-14">
          <svg viewBox="0 0 24 24" fill="none" width="24" height="24" className="opacity-45">
            <line x1="12" y1="17" x2="12" y2="5" stroke="#20322a" strokeWidth="1.4" />
            <path d="M8 9L12 5L16 9" stroke="#20322a" strokeWidth="1.4" fill="none" />
            <line x1="5" y1="20" x2="19" y2="20" stroke="#20322a" strokeWidth="1.2" />
          </svg>
          <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-brand-green/45">NO IMAGES IN LIBRARY YET</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {images.map((image) => (
            <article key={image.id} className="group relative border border-brand-border bg-brand-bg p-2">
              <Image src={image.image_url} alt={image.flower_name} width={220} height={220} className="aspect-square h-auto w-full object-cover" unoptimized />
              <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-brand-green/65">{image.flower_name}</p>

              {deleteConfirmId === image.id ? (
                <div className="absolute inset-x-2 top-2 border border-brand-border bg-brand-bg p-2 text-[10px]">
                  <p className="mb-2 uppercase tracking-[0.1em] text-brand-green/65">Delete this image?</p>
                  <div className="flex gap-2">
                    <button onClick={() => void deleteImage(image.id)} className="flex-1 border border-rose-500 px-2 py-1 uppercase tracking-[0.08em] text-rose-600">
                      Confirm
                    </button>
                    <button onClick={() => setDeleteConfirmId(null)} className="flex-1 border border-brand-border px-2 py-1 uppercase tracking-[0.08em]">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirmId(image.id)}
                  className="absolute right-3 top-3 hidden h-6 w-6 items-center justify-center bg-[rgba(32,50,42,0.7)] text-sm text-white group-hover:flex"
                  aria-label="Delete image"
                >
                  ×
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

ImageLibrary.displayName = 'ImageLibrary'
