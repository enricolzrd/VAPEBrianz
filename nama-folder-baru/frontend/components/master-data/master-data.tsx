'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { getUser } from '@/lib/api'
import { CategoriesTab } from './categories-tab'
import { ProductsTab } from './products-tab'
import { UsersTab } from './users-tab'

type TabId = 'products' | 'categories' | 'users'

export function MasterData() {
  const [activeTab, setActiveTab] = useState<TabId>('products')
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  // Deteksi role setelah mount — localStorage hanya tersedia di browser
  useEffect(() => {
    const currentUser = getUser()
    setIsAdmin(currentUser?.role === 'admin')
  }, [])

  const TABS = [
    { id: 'products' as TabId, label: 'Products' },
    { id: 'categories' as TabId, label: 'Categories' },
    ...(isAdmin ? [{ id: 'users' as TabId, label: 'Users' }] : []),
  ]
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ products: null, categories: null, users: null })

  // --- 1. FUNGSI TARIK DATA (GET) ---
  async function fetchMasterData() {
    const token = localStorage.getItem('vb_token')
    const headers = { 'Authorization': `Bearer ${token}` }
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/products', { headers }),
        fetch('http://127.0.0.1:8000/api/categories', { headers })
      ])
      const prodData = await prodRes.json()
      const catData = await catRes.json()
      setProducts(prodData.data ?? [])
      setCategories(catData.data ?? [])
    } catch (error) {
      console.error("Gagal mengambil master data:", error)
    }
  }

  async function fetchUsers() {
    const token = localStorage.getItem('vb_token')
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.data ?? data ?? [])
      }
    } catch (error) {
      console.error("Gagal mengambil data users:", error)
    }
  }

  useEffect(() => {
    fetchMasterData()
  }, [])

  useEffect(() => {
    if (isAdmin) fetchUsers()
  }, [isAdmin])

  const productCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of products) {
      const catId = p.category?.id || p.categoryId || p.category_id
      if (catId) counts.set(String(catId), (counts.get(String(catId)) ?? 0) + 1)
    }
    return counts
  }, [products])

  const counts: Record<TabId, number> = { products: products.length, categories: categories.length, users: users.length }

  function handleTabKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const index = TABS.findIndex((t) => t.id === activeTab)
    const next = TABS[(index + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length].id
    setActiveTab(next)
    tabRefs.current[next]?.focus()
  }

  // --- HELPER UNTUK HEADER API ---
  const getApiHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('vb_token')}`
  })

  // --- 2. FUNGSI PRODUK (POST, PUT, DELETE) ---
  async function handleAddProduct(values: any) {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/products', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ name: values.name, price: values.price, stock: values.stock, category_id: values.categoryId })
      })
      if (res.ok) fetchMasterData()
      else alert('Gagal menambah produk.')
    } catch (e) { console.error(e) }
  }

  async function handleUpdateProduct(id: string, values: any) {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/products/${id}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify({ name: values.name, price: values.price, stock: values.stock, category_id: values.categoryId })
      })
      if (res.ok) fetchMasterData()
      else alert('Gagal mengupdate produk.')
    } catch (e) { console.error(e) }
  }

  async function handleDeleteProduct(id: string) {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/products/${id}`, {
        method: 'DELETE',
        headers: getApiHeaders()
      })
      if (res.ok) fetchMasterData()
      else alert('Gagal menghapus produk.')
    } catch (e) { console.error(e) }
  }

  // --- 3. FUNGSI KATEGORI (POST, PUT, DELETE) ---
  async function handleAddCategory(name: string) {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/categories', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ name })
      })
      if (res.ok) fetchMasterData()
      else alert('Gagal menambah kategori.')
    } catch (e) { console.error(e) }
  }

  async function handleRenameCategory(id: string, name: string) {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/categories/${id}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify({ name })
      })
      if (res.ok) fetchMasterData()
      else alert('Gagal mengubah kategori.')
    } catch (e) { console.error(e) }
  }

  async function handleDeleteCategory(id: string) {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/categories/${id}`, {
        method: 'DELETE',
        headers: getApiHeaders()
      })
      if (res.ok) fetchMasterData()
      else alert('Gagal menghapus kategori.')
    } catch (e) { console.error(e) }
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
                ref={(el) => { tabRefs.current[tab.id] = el }}
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
            onAdd={handleAddProduct}
            onUpdate={handleUpdateProduct}
            onDelete={handleDeleteProduct}
          />
        ) : activeTab === 'categories' ? (
          <CategoriesTab
            categories={categories}
            productCounts={productCounts}
            onAdd={handleAddCategory}
            onRename={handleRenameCategory}
            onDelete={handleDeleteCategory}
          />
        ) : (
          <UsersTab users={users} onRefresh={fetchUsers} />
        )}
      </div>
    </main>
  )
}