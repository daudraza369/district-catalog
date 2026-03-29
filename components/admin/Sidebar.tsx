'use client'

type AdminTab = 'dashboard' | 'products' | 'shipments' | 'images' | 'ingest'

interface SidebarProps {
  activeTab: AdminTab
  onTabChange: (tab: AdminTab) => void
}

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'products', label: 'Products' },
  { id: 'shipments', label: 'Shipments' },
  { id: 'images', label: 'Image Library' },
  { id: 'ingest', label: 'Ingest' }
]

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="min-h-screen w-64 border-r border-brand-border bg-brand-green px-6 py-8 text-brand-bg">
      <div className="mb-10 border border-brand-bg/35 p-3 text-center font-display text-xs uppercase tracking-[0.2em]">District Flowers</div>
      <nav className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full border-l-[3px] px-3 py-3 text-left text-[11px] uppercase tracking-[0.12em] transition-colors ${
              activeTab === tab.id
                ? 'border-l-brand-lavender border-y-brand-bg/10 border-r-brand-bg/10 bg-[rgba(255,255,255,0.08)] text-brand-bg'
                : 'border-l-transparent border-y-brand-bg/10 border-r-brand-bg/10 text-brand-bg/70 hover:text-brand-bg'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

Sidebar.displayName = 'Sidebar'

export type { AdminTab }
