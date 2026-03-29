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
  mode
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

      <div className="mt-2 grid grid-cols-2 gap-2 md:flex md:gap-3">
        <label htmlFor="catalog-flower-type" className="sr-only">
          Filter by flower type
        </label>
        <select
          id="catalog-flower-type"
          value={flowerType}
          onChange={(event) => onFlowerTypeChange(event.target.value)}
          className="col-span-1 h-9 border border-brand-green/20 bg-[#f4f3ee] px-2 font-mono text-[10px] uppercase tracking-[0.15em] text-brand-green/70 outline-none cursor-pointer truncate"
        >
          <option value="">ALL FLOWERS</option>
          {flowerTypes.map((flowerType) => (
            <option key={flowerType} value={flowerType}>
              {flowerType}
            </option>
          ))}
        </select>

        <label htmlFor="catalog-origin" className="sr-only">
          Filter by origin
        </label>
        <select
          id="catalog-origin"
          value={origin}
          onChange={(event) => onOriginChange(event.target.value)}
          className="col-span-1 h-9 border border-brand-green/20 bg-[#f4f3ee] px-2 font-mono text-[10px] uppercase tracking-[0.15em] text-brand-green/70 outline-none cursor-pointer"
        >
          <option value="">ALL ORIGINS</option>
          {origins.map((originOption) => (
            <option key={originOption} value={originOption}>
              {ORIGIN_LABELS[originOption]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onStockToggle}
          aria-label="Toggle in-stock products only"
          className={`col-span-2 md:col-span-1 h-9 flex items-center justify-center gap-2 border px-3 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
            stockOnly
              ? 'bg-brand-green text-[#fbfbf8] border-brand-green'
              : 'border-brand-green/20 text-brand-green/60 hover:border-brand-green/40'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${stockOnly ? 'bg-[#fbfbf8]' : 'bg-brand-green/40'}`} />
          In Stock Only
        </button>

        <div className="col-span-2 flex items-center justify-end">
          <span className="font-mono text-[10px] tracking-[0.08em] text-brand-green/45 md:uppercase md:tracking-[0.1em] md:text-brand-green/40">
            <span className="md:hidden">Showing {filteredCount}/{totalCount}</span>
            <span className="hidden md:inline">{filteredCount} of {totalCount} products</span>
          </span>
        </div>
      </div>
    </section>
  )
}

FilterBar.displayName = 'FilterBar'
