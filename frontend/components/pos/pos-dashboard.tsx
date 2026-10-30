'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, ShoppingBag } from 'lucide-react'
import {
  formatIDR,
  type CartItem,
  type Category,
  type Product,
} from '@/lib/pos-data'
import { Catalog } from './catalog'
import { CartPanel } from './cart-panel'
import { PaymentModal } from './payment-modal'
import { Sidebar } from './sidebar'

type SaleNotice = {
  total: number
}

export function PosDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('All')
  const [isPaying, setIsPaying] = useState(false)
  const [notice, setNotice] = useState<SaleNotice | null>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cartRef = useRef<HTMLElement>(null)

  const fetchProducts = useCallback(async () => {
    const token = localStorage.getItem('vb_token')
    try {
      const response = await fetch('http://127.0.0.1:8000/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()
      // Normalize: id → string, category object → string nama
      const normalized = (result.data ?? []).map((p: any) => ({
        id: String(p.id),
        name: p.name,
        category: p.category?.name ?? p.category ?? '',
        price: Number(p.price),
        stock: Number(p.stock),
      }))
      setProducts(normalized)
    } catch (error) {
      console.error('Gagal menarik data produk:', error)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        (query === '' || p.name.toLowerCase().includes(query)),
    )
  }, [products, search, category])

  const cartItems: CartItem[] = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => {
          const product = products.find((p) => String(p.id) === String(id))
          return product ? { product, quantity } : null
        })
        .filter((item): item is CartItem => item !== null),
    [cart, products],
  )

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  function setQuantity(product: Product, quantity: number) {
    setCart((prev) => {
      const next = { ...prev }
      const clamped = Math.min(Math.max(quantity, 0), product.stock)
      if (clamped === 0) delete next[product.id]
      else next[product.id] = clamped
      return next
    })
  }

  function addToCart(product: Product) {
    setQuantity(product, (cart[product.id] ?? 0) + 1)
  }

  function removeFromCart(productId: string) {
    setCart((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  function handleConfirmPayment() {
    setNotice({ total })
    setCart({})
    setIsPaying(false)
    fetchProducts()

    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(null), 4000)
  }

  const formattedCartItems = useMemo(
    () =>
      cartItems.map((item) => ({
        product_id: Number(item.product.id),
        quantity: item.quantity,
      })),
    [cartItems],
  )

  return (
    <div className="flex min-h-dvh flex-col md:flex-row lg:h-dvh">
      <Sidebar activeHref="/" />

      <div className="flex min-w-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <Catalog
          products={filteredProducts}
          cart={cart}
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          onAdd={addToCart}
        />

        <CartPanel
          ref={cartRef}
          items={cartItems}
          total={total}
          itemCount={itemCount}
          onIncrement={(p) => setQuantity(p, (cart[p.id] ?? 0) + 1)}
          onDecrement={(p) => setQuantity(p, (cart[p.id] ?? 0) - 1)}
          onRemove={removeFromCart}
          onClear={() => setCart({})}
          onPay={() => setIsPaying(true)}
        />

        {itemCount > 0 && (
          <div className="sticky bottom-0 z-20 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => cartRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="flex w-full items-center justify-between rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="size-4" aria-hidden="true" />
                {itemCount} item{itemCount > 1 ? 's' : ''}
              </span>
              <span className="font-mono">{formatIDR(total)}</span>
            </button>
          </div>
        )}
      </div>

      {isPaying && (
        <PaymentModal
          total={total}
          itemCount={itemCount}
          cartItems={formattedCartItems}
          onClose={() => setIsPaying(false)}
          onConfirm={handleConfirmPayment}
        />
      )}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        {notice && (
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-primary/30 bg-card px-4 py-3 text-sm shadow-2xl shadow-black/40 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
            <div>
              <p className="font-medium">Payment successful</p>
              <p className="text-muted-foreground">
                <span className="font-mono text-foreground">{formatIDR(notice.total)}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
