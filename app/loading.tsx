import CatalogSkeleton from '@/components/catalog/CatalogSkeleton'

export default function Loading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[900px] bg-brand-bg">
      <CatalogSkeleton />
    </main>
  )
}
