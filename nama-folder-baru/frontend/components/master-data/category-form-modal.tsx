'use client'

import { useState, type FormEvent } from 'react'
import type { MasterCategory } from '@/lib/master-data'
import { ModalActions, ModalShell, fieldClass } from './modal-shell'

type CategoryFormModalProps = {
  category?: MasterCategory
  existingNames: string[]
  onClose: () => void
  onSubmit: (name: string) => void
}

export function CategoryFormModal({ category, existingNames, onClose, onSubmit }: CategoryFormModalProps) {
  const isEdit = Boolean(category)
  const [name, setName] = useState(category?.name ?? '')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setError('Category name is required.')
    const taken = existingNames.some(
      (n) => n.toLowerCase() === trimmed.toLowerCase() && n !== category?.name,
    )
    if (taken) return setError('A category with this name already exists.')
    onSubmit(trimmed)
  }

  return (
    <ModalShell
      title={isEdit ? 'Edit Category' : 'Add New Category'}
      description={isEdit ? 'Renaming updates every product in this category.' : 'Group products for faster filtering at the cashier.'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category-name" className="text-sm font-medium">
            Category Name
          </label>
          <input
            id="category-name"
            type="text"
            autoFocus
            autoComplete="off"
            maxLength={40}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError('')
            }}
            placeholder="e.g. Pod Cartridge"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'category-name-error' : undefined}
            className={fieldClass}
          />
          {error && (
            <p id="category-name-error" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <ModalActions submitLabel={isEdit ? 'Save Changes' : 'Add Category'} onCancel={onClose} />
      </form>
    </ModalShell>
  )
}
