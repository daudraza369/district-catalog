'use client'

import Image from 'next/image'
import b2bIcon from '@/Icons/B2b.svg'
import exportIcon from '@/Icons/Export.svg'

interface CatalogHeaderProps {
  mode: 'b2b' | 'b2c'
  onB2BLogout: () => void
  onB2BAccess: () => void
  onExportPDF: () => void
}

export function CatalogHeader({ mode, onB2BLogout, onB2BAccess, onExportPDF }: CatalogHeaderProps) {
  return (
    <div className="mt-2 flex items-center justify-between border-y border-brand-green/10 px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-brand-green/55">Inventory Live</span>
        </div>
        {mode === 'b2b' ? (
          <button
            type="button"
            onClick={onB2BLogout}
            className="flex items-center gap-1 border border-brand-green/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-brand-green/50 transition-colors hover:text-brand-green/80"
          >
            ● B2B · PER STEM <span aria-hidden>✕</span>
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onB2BAccess}
          title="B2B Wholesale Access"
          aria-label="B2B Wholesale Access"
          className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-brand-green/50 transition-colors hover:text-brand-green"
        >
          <Image src={b2bIcon} alt="" width={15} height={15} aria-hidden className="opacity-80" />
        </button>

        <button
          type="button"
          onClick={onExportPDF}
          title="Export PDF"
          aria-label="Export PDF"
          className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-brand-green/50 transition-colors hover:text-brand-green"
        >
          <Image src={exportIcon} alt="" width={15} height={15} aria-hidden className="opacity-80" />
        </button>
      </div>
    </div>
  )
}

CatalogHeader.displayName = 'CatalogHeader'
export default CatalogHeader
