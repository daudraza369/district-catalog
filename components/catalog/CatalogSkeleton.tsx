import { CATALOG_GRID_COLS } from '@/components/catalog/constants'
import Skeleton from '@/components/ui/Skeleton'

export default function CatalogSkeleton() {
  return (
    <div>
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className={`grid min-h-[108px] ${CATALOG_GRID_COLS} items-center py-2 ${
            index % 2 === 0 ? 'bg-brand-bg' : 'bg-brand-bg-secondary'
          } border-b border-[rgba(32,50,42,0.1)]`}
        >
          <div className="flex items-center justify-start">
            <Skeleton className="h-[88px] w-[88px]" />
          </div>
          <div className="space-y-2 pl-4 pr-2 md:pl-5 md:pr-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="max-md:hidden flex-col items-center justify-center gap-1 md:flex">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-2 w-16" />
          </div>
          <div className="max-md:hidden items-center justify-center md:flex">
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="flex items-center justify-end pr-4 md:pr-7">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

CatalogSkeleton.displayName = 'CatalogSkeleton'
