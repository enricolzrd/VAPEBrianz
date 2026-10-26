'use client'

import { useState, type FormEvent } from 'react'
import type { MasterCategory, MasterProduct, ProductInput } from '@/lib/master-data'

type Props = {
  product?: MasterProduct
  categories: MasterCategory[]
  onClose: () => void
  onSubmit: (values: ProductInput) => void
}

export function ProductFormModal({ product, categories, onClose, onSubmit }: Props) {
  const [name, setName] = useState(product?.name || '')
  const [categoryId, setCategoryId] = useState(product?.categoryId || '')
  const [price, setPrice] = useState(product?.price?.toString() || '')
  const [stock, setStock] = useState(product?.stock?.toString() || '')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!categoryId) {
      setError('Choose a category.')
      return
    }

    onSubmit({
      name,
      categoryId,
      price: Number(price),
      stock: Number(stock),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{product ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-sm text-muted-foreground">{product ? 'Update product details.' : 'Add an item to the catalog.'}</p>
          </div>
          <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Category</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 ${error ? 'border-destructive focus:border-destructive focus:ring-destructive' : 'border-input focus:border-primary focus:ring-primary'}`}
            >
              <option value="">Select category</option>
              {(categories || []).map((c: any) => {
                const validId = String(c.id || c.category_id || c.name)
                return (
                  <option key={validId} value={validId} className="text-foreground">
                    {c.name}
                  </option>
                )
              })}
            </select>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Price</label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Stock</label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="mt-2 flex gap-3">
            <button type="button" onClick={onClose} className="h-10 flex-1 rounded-lg border border-input font-medium hover:bg-secondary">
              Cancel
            </button>
            <button type="submit" className="h-10 flex-1 rounded-lg bg-primary font-bold text-primary-foreground">
              {product ? 'Save' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}