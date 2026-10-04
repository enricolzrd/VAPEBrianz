'use client'

import type { Ref } from 'react'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { formatIDR, type CartItem, type Product } from '@/lib/pos-data'

type CartPanelProps = {
  ref?: Ref<HTMLElement>
  items: CartItem[]
  total: number
  itemCount: number
  onIncrement: (product: Product) => void
  onDecrement: (product: Product) => void
  onRemove: (productId: string) => void
  onClear: () => void
  onPay: () => void
}

export function CartPanel({
  ref,
  items,
  total,
  itemCount,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
  onPay,
}: CartPanelProps) {
  return (
    <aside
      ref={ref}
      aria-label="Cart"
      className="flex scroll-mt-4 flex-col border-t border-border bg-card lg:w-[30%] lg:min-w-80 lg:border-l lg:border-t-0"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Current Order</h2>
          <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            {itemCount}
          </span>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex-1 lg:overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 px-6 text-center">
            <ShoppingCart className="size-6 text-muted-foreground/60" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Cart is empty</p>
            <p className="text-xs text-muted-foreground/70">Tap a product to add it.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex flex-col gap-2.5 px-5 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{product.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatIDR(product.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(product.id)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Remove {product.name}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-border bg-background">
                    <button
                      type="button"
                      onClick={() => onDecrement(product)}
                      className="flex size-7 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Minus className="size-3.5" aria-hidden="true" />
                      <span className="sr-only">Decrease quantity</span>
                    </button>
                    <span className="w-8 text-center font-mono text-sm" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onIncrement(product)}
                      disabled={quantity >= product.stock}
                      className="flex size-7 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <Plus className="size-3.5" aria-hidden="true" />
                      <span className="sr-only">Increase quantity</span>
                    </button>
                  </div>
                  <p className="font-mono text-sm font-semibold">
                    {formatIDR(product.price * quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-4 border-t border-border p-5">
        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <dt>Items</dt>
            <dd className="font-mono">{itemCount}</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="font-medium">Total</dt>
            <dd className="font-mono text-2xl font-bold tracking-tight">{formatIDR(total)}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onPay}
          disabled={items.length === 0}
          className="h-14 rounded-xl bg-primary text-base font-bold tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          PAY
        </button>
      </div>
    </aside>
  )
}
