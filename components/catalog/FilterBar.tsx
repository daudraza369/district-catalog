'use client'

import { ORIGIN_LABELS, type Origin } from '@/lib/types'

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  origin: string
  onOriginChange: (value: string) => void
  flowerType: string
  onFlowerTypeChange: (value: string) => void
  stockOnly: boolean
  onStockToggle: () => void
  origins: Origin[]
  flowerTypes: string[]
  totalCount: number
  filteredCount: number
  mode: 'b2b' | 'b2c'
  isB2B: boolean
  onExportPDF: () => void
}

export default function FilterBar({
  search,
  onSearchChange,
  origin,
  onOriginChange,
  flowerType,
  onFlowerTypeChange,
  stockOnly,
  onStockToggle,
  origins,
  flowerTypes,
  totalCount,
  filteredCount,
  mode,
  isB2B,
  onExportPDF
}: FilterBarProps) {
  return (
    <section data-mode={mode} className="sticky top-0 z-40 border-b border-[rgba(32,50,42,0.12)] bg-brand-bg/90 px-4 py-4 backdrop-blur-md">
      <div className="relative">
        <label htmlFor="catalog-search" className="sr-only">
          Search flower name
        </label>
        <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-40" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="#20322a" strokeWidth="1.2" />
          <path d="M9.5 9.5L13 13" stroke="#20322a" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <input
          id="catalog-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="SEARCH FLOWER NAME..."
          className="h-10 w-full border border-brand-border bg-brand-bg pl-10 pr-3 text-[11px] uppercase tracking-[0.08em] text-brand-green outline-none placeholder:text-brand-green/45 focus-brand focus:border-brand-border-strong"
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label htmlFor="catalog-origin" className="sr-only">
          Filter by origin
        </label>
        <select
          id="catalog-origin"
          value={origin}
          onChange={(event) => onOriginChange(event.target.value || '')}
          className="h-9 flex-1 min-w-0 border border-brand-border bg-brand-bg px-3 text-[11px] uppercase tracking-[0.1em] text-brand-green outline-none focus-brand"
        >
          <option value="">ALL ORIGINS</option>
          {origins.map((originOption) => (
            <option key={originOption} value={originOption}>
              {ORIGIN_LABELS[originOption]}
            </option>
          ))}
        </select>

        <label htmlFor="catalog-flower-type" className="sr-only">
          Filter by flower type
        </label>
        <select
          id="catalog-flower-type"
          value={flowerType}
          onChange={(event) => onFlowerTypeChange(event.target.value || '')}
          className="h-9 flex-1 min-w-0 border border-brand-border bg-brand-bg px-3 text-[11px] uppercase tracking-[0.1em] text-brand-green outline-none focus-brand"
        >
          <option value="">ALL FLOWERS</option>
          {flowerTypes.map((flowerType) => (
            <option key={flowerType} value={flowerType}>
              {flowerType}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onStockToggle}
          aria-label="Toggle in-stock products only"
          className={`h-9 flex-1 min-w-0 border px-4 text-[11px] uppercase tracking-[0.1em] transition-colors ${
            stockOnly
              ? 'border-brand-green bg-brand-green text-brand-bg'
              : 'border-brand-border bg-brand-bg text-brand-green/65 hover:border-brand-border-strong'
          }`}
        >
          <span className="mr-2 inline-block text-[10px]">●</span>IN STOCK ONLY
        </button>

        {isB2B ? (
          <button
            type="button"
            onClick={onExportPDF}
            className="h-9 border border-brand-green px-4 text-[10px] uppercase tracking-[0.1em] text-brand-green"
          >
            EXPORT PDF
          </button>
        ) : null}

        <span className="w-full text-right text-[10px] uppercase tracking-[0.1em] text-brand-green/55">
          {filteredCount} OF {totalCount} PRODUCTS
        </span>
      </div>
    </section>
  )
}

FilterBar.displayName = 'FilterBar'
