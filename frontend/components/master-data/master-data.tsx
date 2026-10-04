'use client'

import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  INITIAL_MASTER_CATEGORIES,
  INITIAL_MASTER_PRODUCTS,
  type MasterCategory,
  type MasterProduct,
  type ProductInput,
} from '@/lib/master-data'
import { cn } from '@/lib/utils'
import { CategoriesTab } from './categories-tab'
import { ProductsTab } from './products-tab'

const TABS = [
  { id: 'products', label: 'Products' },
  { id: 'categories', label: 'Categories' },
] as const
type TabId = (typeof TABS)[number]['id']

export function MasterData() {
  const [activeTab, setActiveTab] = useState<TabId>('products')
  const [products, setProducts] = useState<MasterProduct[]>(INITIAL_MASTER_PRODUCTS)
  const [categories, setCategories] = useState<MasterCategory[]>(INITIAL_MASTER_CATEGORIES)
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ products: null, categories: null })

  const productCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of products) counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1)
    return counts
  }, [products])

  const counts: Record<TabId, number> = { products: products.length, categories: categories.length }

  function handleTabKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const index = TABS.findIndex((t) => t.id === activeTab)
    const next = TABS[(index + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length].id
    setActiveTab(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <header className="border-b border-border px-4 pt-4 md:px-6">
        <div className="pb-3">
          <h1 className="text-lg font-semibold tracking-tight">Master Data</h1>
          <p className="text-sm text-muted-foreground">Manage products and categories used at the cashier</p>
        </div>

        <div role="tablist" aria-label="Master data sections" className="-mb-px flex gap-1">
          {TABS.map((tab) => {
            const selected = tab.id === activeTab
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el
                }}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={handleTabKeyDown}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-t-md',
                  selected
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'rounded-md px-1.5 py-0.5 font-mono text-[11px]',
                    selected ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground',
                  )}
                >
                  {counts[tab.id]}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="p-4 md:p-6"
      >
        {activeTab === 'products' ? (
          <ProductsTab
            products={products}
            categories={categories}
            onAdd={(values: ProductInput) =>
              setProducts((prev) => [{ id: crypto.randomUUID(), ...values }, ...prev])
            }
            onUpdate={(id, values) =>
              setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...values } : p)))
            }
            onDelete={(id) => setProducts((prev) => prev.filter((p) => p.id !== id))}
          />
        ) : (
          <CategoriesTab
            categories={categories}
            productCounts={productCounts}
            onAdd={(name) => setCategories((prev) => [...prev, { id: crypto.randomUUID(), name }])}
            onRename={(id, name) =>
              setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
            }
            onDelete={(id) => setCategories((prev) => prev.filter((c) => c.id !== id))}
          />
        )}
      </div>
    </main>
  )
}
