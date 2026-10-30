'use client'

import { Plus, Search, X } from 'lucide-react'
import { CATEGORIES, formatIDR, type Category, type Product } from '@/lib/pos-data'
import { cn } from '@/lib/utils'

type CatalogProps = {
  products: Product[] // Dikembalikan agar menerima dari pos-dashboard
  cart: Record<string, number>
  search: string
  onSearchChange: (value: string) => void
  category: Category
  onCategoryChange: (value: Category) => void
  onAdd: (product: Product) => void
}

export function Catalog({
  products,
  cart,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  onAdd,
}: CatalogProps) {

  // Filter produk dengan pengamanan objek kategori
  const filteredProducts = products.filter((product) => {
    const categoryName = (product.category as any)?.name || product.category

    const matchesCategory = category === 'All' || categoryName === category
    const matchesSearch =
      search === '' || product.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main className="flex min-w-0 flex-col lg:w-[70%] lg:overflow-hidden">
      <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border bg-background/95 px-4 py-4 backdrop-blur md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-lg bg-primary font-mono text-sm font-bold text-primary-foreground md:hidden"
            >
              VB
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-semibold tracking-tight">
                <span className="md:hidden">VapeBrianz</span>
                <span className="hidden md:inline">Cashier</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                <span className="md:hidden">Point of Sale</span>
                <span className="hidden md:inline">New sale</span>
              </p>
            </div>
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">
            {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>

        <div role="group" aria-label="Filter by category" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
          {CATEGORIES.map((c) => {
            const active = c === category
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => onCategoryChange(c)}
                className={cn(
                  'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground',
                )}
              >
                {c}
              </button>
            )
          })}
        </div>
      </header>

      <div className="flex-1 p-4 md:p-6 lg:overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-center">
            <p className="text-sm font-medium">No products found</p>
            <p className="text-xs text-muted-foreground">Try another keyword or category.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} inCart={cart[product.id] ?? 0} onAdd={onAdd} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}

function ProductCard({
  product,
  inCart,
  onAdd,
}: {
  product: Product
  inCart: number
  onAdd: (product: Product) => void
}) {
  const available = product.stock - inCart
  const soldOut = product.stock === 0
  const maxed = available <= 0
  const lowStock = !soldOut && product.stock <= 5

  return (
    <button
      type="button"
      disabled={maxed}
      onClick={() => onAdd(product)}
      className={cn(
        'group flex h-full w-full flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-all',
        inCart > 0 ? 'border-primary/50' : 'border-border',
        maxed
          ? 'cursor-not-allowed opacity-50'
          : 'hover:border-primary/60 hover:bg-accent/60 active:scale-[0.98]',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {(product.category as any)?.name || product.category}
          </p>
          <p className="mt-1 text-sm font-medium leading-snug text-pretty">{product.name}</p>
        </div>
        {inCart > 0 && (
          <span className="shrink-0 rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary">
            {`×${inCart}`}
          </span>
        )}
      </div>

      <div className="mt-auto flex flex-col items-start gap-1">
        <p className="font-mono text-base font-semibold">{formatIDR(product.price)}</p>
        <p
          className={cn(
            'text-xs',
            soldOut ? 'text-destructive' : lowStock ? 'text-amber-400' : 'text-muted-foreground',
          )}
        >
          {soldOut ? 'Out of stock' : `Stock: ${product.stock}`}
        </p>
      </div>
      <span
        aria-hidden="true"
        className="mt-auto self-end flex size-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-disabled:bg-secondary group-disabled:text-muted-foreground"
      >
        <Plus className="size-4" />
      </span>
      <span className="sr-only">Add {product.name} to cart</span>
    </button>
  )
}