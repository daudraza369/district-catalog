'use client'

import Image from 'next/image'
import logo from '../../logo.svg'

interface CatalogHeaderProps {
  inventoryLive: boolean
  mode: 'b2b' | 'b2c'
  onB2BModeClick: () => void
}

export default function CatalogHeader({ inventoryLive, mode, onB2BModeClick }: CatalogHeaderProps) {
  return (
    <header className="border-b border-brand-border-strong px-4 pt-8">
      <div className="flex items-center gap-3 border-b border-brand-border-strong pb-5 sm:gap-6">
        <div className="flex items-center flex-shrink-0">
          <Image
            src={logo}
            alt="District Flowers logo"
            width={64}
            height={64}
            className="h-11 w-auto object-contain md:h-14"
            priority
          />
        </div>

        <div className="flex-1 min-w-0 px-1 text-right sm:px-0">
          <div className="overflow-hidden">
            <h1 className="font-display font-bold uppercase text-brand-green leading-none tracking-[0.1em] text-[18px] sm:text-[24px] md:text-[34px] lg:text-[42px] whitespace-nowrap overflow-hidden text-ellipsis">
              Wholesale Flowers
            </h1>
          </div>
        </div>
      </div>

      <div className="py-4 text-[11px] uppercase tracking-[0.12em] text-brand-green/65">
        <p className="flex flex-wrap items-center gap-2">
          <span className={inventoryLive ? 'text-green-500' : 'text-amber-500'}>●</span>INVENTORY LIVE
          {mode === 'b2b' ? (
            <button
              type="button"
              onClick={onB2BModeClick}
              className="inline-flex items-center gap-1 rounded-full border border-brand-green/20 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-brand-green/60"
            >
              <span className="text-green-500">●</span>B2B MODE — PER STEM
            </button>
          ) : null}
        </p>
      </div>
    </header>
  )
}

CatalogHeader.displayName = 'CatalogHeader'
