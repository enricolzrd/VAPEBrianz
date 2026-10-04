'use client'

import { useState, type FormEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import type { MasterCategory, MasterProduct, ProductInput } from '@/lib/master-data'
import { ModalActions, ModalShell, fieldClass } from './modal-shell'

type ProductFormModalProps = {
  product?: MasterProduct
  categories: MasterCategory[]
  onClose: () => void
  onSubmit: (values: ProductInput) => void
}

type Errors = Partial<Record<'name' | 'categoryId' | 'price' | 'stock', string>>

export function ProductFormModal({ product, categories, onClose, onSubmit }: ProductFormModalProps) {
  const isEdit = Boolean(product)
  const [name, setName] = useState(product?.name ?? '')
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [stock, setStock] = useState(product ? String(product.stock) : '')
  const [errors, setErrors] = useState<Errors>({})

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next: Errors = {}
    if (!name.trim()) next.name = 'Product name is required.'
    if (!categories.some((c) => c.id === categoryId)) next.categoryId = 'Choose a category.'
    if (!price || Number(price) <= 0) next.price = 'Price must be greater than 0.'
    if (stock === '') next.stock = 'Stock is required.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    onSubmit({
      name: name.trim(),
      categoryId,
      price: Number(price),
      stock: Number(stock),
    })
  }

  return (
    <ModalShell
      title={isEdit ? 'Edit Product' : 'Add New Product'}
      description={isEdit ? 'Update product details and stock.' : 'Add an item to the VapeBrianz catalog.'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 p-6">
        <Field id="product-name" label="Name" error={errors.name}>
          <input
            id="product-name"
            type="text"
            autoFocus
            autoComplete="off"
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Foom Icy Mango 30ml Salt"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'product-name-error' : undefined}
            className={fieldClass}
          />
        </Field>

        <Field id="product-category" label="Category" error={errors.categoryId}>
          <div className="relative">
            <select
              id="product-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              aria-invalid={Boolean(errors.categoryId)}
              aria-describedby={errors.categoryId ? 'product-category-error' : undefined}
              className={`${fieldClass} appearance-none pr-9 ${categoryId ? '' : 'text-muted-foreground'}`}
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="text-foreground">
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field id="product-price" label="Price" error={errors.price}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Rp
              </span>
              <input
                id="product-price"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={price ? Number(price).toLocaleString('id-ID') : ''}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="0"
                aria-invalid={Boolean(errors.price)}
                aria-describedby={errors.price ? 'product-price-error' : undefined}
                className={`${fieldClass} pl-10 font-mono`}
              />
            </div>
          </Field>

          <Field id="product-stock" label="Stock" error={errors.stock}>
            <input
              id="product-stock"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={stock}
              onChange={(e) => setStock(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="0"
              aria-invalid={Boolean(errors.stock)}
              aria-describedby={errors.stock ? 'product-stock-error' : undefined}
              className={`${fieldClass} font-mono`}
            />
          </Field>
        </div>

        <ModalActions submitLabel={isEdit ? 'Save Changes' : 'Add Product'} onCancel={onClose} />
      </form>
    </ModalShell>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
