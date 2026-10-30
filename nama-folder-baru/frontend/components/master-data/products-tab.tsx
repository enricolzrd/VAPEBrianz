'use client'

import { useMemo, useState } from 'react'
import { formatIDR } from '@/lib/pos-data'
import { LOW_STOCK_THRESHOLD, type MasterCategory, type MasterProduct, type ProductInput } from '@/lib/master-data'
import { cn } from '@/lib/utils'
import { ConfirmDeleteModal } from './confirm-delete-modal'
import { ProductFormModal } from './product-form-modal'
import { ActionBar, EmptyRow, RowActions, tdClass, thClass } from './table-parts'

type ProductsTabProps = {
  products: any[]
  categories: MasterCategory[]
  onAdd: (values: ProductInput) => void
  onUpdate: (id: string, values: ProductInput) => void
  onDelete: (id: string) => void
}

type ModalState =
  | { type: 'add' }
  | { type: 'edit'; product: MasterProduct }
  | { type: 'delete'; product: MasterProduct }
  | null

export function ProductsTab({ products: rawProducts, categories, onAdd, onUpdate, onDelete }: ProductsTabProps) {
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<ModalState>(null)

  // Normalize backend snake_case fields ke MasterProduct shape
  const products: MasterProduct[] = rawProducts.map((p) => ({
    id: String(p.id),
    name: p.name,
    categoryId: String(p.category_id ?? p.categoryId ?? p.category?.id ?? ''),
    price: Number(p.price),
    stock: Number(p.stock),
  }))

  const categoryNames = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  )

  const query = search.trim().toLowerCase()
  const filtered = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (categoryNames.get(p.categoryId) ?? '').toLowerCase().includes(query),
      )
    : products

  return (
    <div className="flex flex-col gap-4">
      <ActionBar
        searchId="product-search"
        searchLabel="Search products or category"
        search={search}
        onSearchChange={setSearch}
        addLabel="Add New Product"
        onAdd={() => setModal({ type: 'add' })}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <caption className="sr-only">Products</caption>
            <thead className="border-b border-border bg-background/40">
              <tr>
                <th scope="col" className={thClass}>Product Name</th>
                <th scope="col" className={thClass}>Category</th>
                <th scope="col" className={cn(thClass, 'text-right')}>Price (Rp)</th>
                <th scope="col" className={cn(thClass, 'text-right')}>Stock</th>
                <th scope="col" className={cn(thClass, 'w-24 text-right')}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <EmptyRow colSpan={5} message={query ? `No products match "${search.trim()}".` : 'No products yet.'} />
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-secondary/40">
                    <td className={cn(tdClass, 'font-medium')}>{p.name}</td>
                    <td className={tdClass}>
                      <span className="inline-flex rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
                        {categoryNames.get(p.categoryId) ?? 'Uncategorized'}
                      </span>
                    </td>
                    <td className={cn(tdClass, 'text-right font-mono')}>{formatIDR(p.price)}</td>
                    <td className={cn(tdClass, 'text-right')}>
                      <StockValue stock={p.stock} />
                    </td>
                    <td className="px-2 py-1.5">
                      <RowActions
                        itemName={p.name}
                        onEdit={() => setModal({ type: 'edit', product: p })}
                        onDelete={() => setModal({ type: 'delete', product: p })}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal?.type === 'add' && <ProductFormModal categories={categories} onClose={() => setModal(null)} onSubmit={(values) => { onAdd(values); setModal(null) }} />}
      {modal?.type === 'edit' && <ProductFormModal product={modal.product} categories={categories} onClose={() => setModal(null)} onSubmit={(values) => { onUpdate(modal.product.id, values); setModal(null) }} />}
      {modal?.type === 'delete' && <ConfirmDeleteModal title="Delete Product" message={<>Remove <span className="font-medium text-foreground">{modal.product.name}</span> from the catalog? This cannot be undone.</>} onClose={() => setModal(null)} onConfirm={() => { onDelete(modal.product.id); setModal(null) }} />}
    </div>
  )
}

function StockValue({ stock }: { stock: number }) {
  if (stock === 0) return <span className="font-mono text-destructive">Out</span>
  return <span className={cn('font-mono', stock <= LOW_STOCK_THRESHOLD ? 'text-amber-400' : 'text-foreground')}>{stock}</span>
}