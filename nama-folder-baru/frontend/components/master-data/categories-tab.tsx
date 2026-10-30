'use client'

import { useState } from 'react'
import type { MasterCategory } from '@/lib/master-data'
import { cn } from '@/lib/utils'
import { CategoryFormModal } from './category-form-modal'
import { ConfirmDeleteModal } from './confirm-delete-modal'
import { ActionBar, EmptyRow, RowActions, tdClass, thClass } from './table-parts'

type CategoriesTabProps = {
  categories: MasterCategory[]
  productCounts: Map<string, number>
  onAdd: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

type ModalState =
  | { type: 'add' }
  | { type: 'edit'; category: MasterCategory }
  | { type: 'delete'; category: MasterCategory }
  | null

export function CategoriesTab({ categories: rawCategories, productCounts, onAdd, onRename, onDelete }: CategoriesTabProps) {
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<ModalState>(null)

  // Normalize backend fields ke MasterCategory shape
  const categories: MasterCategory[] = rawCategories.map((c) => ({
    id: String(c.id),
    name: c.name,
  }))

  const query = search.trim().toLowerCase()
  const filtered = query ? categories.filter((c) => c.name.toLowerCase().includes(query)) : categories
  const existingNames = categories.map((c) => c.name)

  const deleteCount = modal?.type === 'delete' ? (productCounts.get(modal.category.id) ?? 0) : 0

  return (
    <div className="flex flex-col gap-4">
      <ActionBar
        searchId="category-search"
        searchLabel="Search categories"
        search={search}
        onSearchChange={setSearch}
        addLabel="Add New Category"
        onAdd={() => setModal({ type: 'add' })}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <caption className="sr-only">Categories</caption>
            <thead className="border-b border-border bg-background/40">
              <tr>
                <th scope="col" className={thClass}>Category Name</th>
                <th scope="col" className={cn(thClass, 'text-right')}>Total Products</th>
                <th scope="col" className={cn(thClass, 'w-24 text-right')}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <EmptyRow colSpan={3} message={query ? `No categories match "${search.trim()}".` : 'No categories yet.'} />
              ) : (
                filtered.map((c) => {
                  const count = productCounts.get(c.id) ?? 0
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-secondary/40">
                      <td className={cn(tdClass, 'font-medium')}>
                        <span className="flex items-center gap-2.5">
                          <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
                          {c.name}
                        </span>
                      </td>
                      <td className={cn(tdClass, 'text-right font-mono')}>
                        {count}
                        <span className="ml-1 font-sans text-xs text-muted-foreground">
                          {count === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <RowActions
                          itemName={c.name}
                          onEdit={() => setModal({ type: 'edit', category: c })}
                          onDelete={() => setModal({ type: 'delete', category: c })}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground" aria-live="polite">
          Showing {filtered.length} of {categories.length} categories
        </p>
      </div>

      {modal?.type === 'add' && (
        <CategoryFormModal existingNames={existingNames} onClose={() => setModal(null)} onSubmit={(name) => { onAdd(name); setModal(null) }} />
      )}
      {modal?.type === 'edit' && (
        <CategoryFormModal category={modal.category} existingNames={existingNames} onClose={() => setModal(null)} onSubmit={(name) => { onRename(modal.category.id, name); setModal(null) }} />
      )}
      {modal?.type === 'delete' && (
        <ConfirmDeleteModal
          title="Delete Category"
          blocked={deleteCount > 0}
          message={
            deleteCount > 0 ? (
              <><span className="font-medium text-foreground">{modal.category.name}</span> still has {deleteCount} product{deleteCount > 1 ? 's' : ''}. Move or delete them before removing this category.</>
            ) : (
              <>Delete the <span className="font-medium text-foreground">{modal.category.name}</span> category? This cannot be undone.</>
            )
          }
          onClose={() => setModal(null)}
          onConfirm={() => { onDelete(modal.category.id); setModal(null) }}
        />
      )}
    </div>
  )
}