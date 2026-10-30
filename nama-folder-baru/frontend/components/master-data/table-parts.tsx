import { Pencil, Plus, Search, Trash2 } from 'lucide-react'

export function ActionBar({
  searchId,
  searchLabel,
  search,
  onSearchChange,
  addLabel,
  onAdd,
}: {
  searchId: string
  searchLabel: string
  search: string
  onSearchChange: (value: string) => void
  addLabel: string
  onAdd: () => void
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <label htmlFor={searchId} className="sr-only">
          {searchLabel}
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id={searchId}
          type="search"
          autoComplete="off"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchLabel}
          className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98]"
      >
        <Plus className="size-4" aria-hidden="true" />
        {addLabel}
      </button>
    </div>
  )
}

export function RowActions({
  itemName,
  onEdit,
  onDelete,
}: {
  itemName: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={onEdit}
        title="Edit"
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Pencil className="size-4" aria-hidden="true" />
        <span className="sr-only">Edit {itemName}</span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        title="Delete"
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        <span className="sr-only">Delete {itemName}</span>
      </button>
    </div>
  )
}

export const thClass =
  'px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground'
export const tdClass = 'px-4 py-3'

export function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-muted-foreground">
        {message}
      </td>
    </tr>
  )
}
