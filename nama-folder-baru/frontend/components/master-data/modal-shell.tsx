'use client'

import { useEffect, useEffectEvent, useId, type ReactNode } from 'react'
import { X } from 'lucide-react'

type ModalShellProps = {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}

export function ModalShell({ title, description, onClose, children }: ModalShellProps) {
  const titleId = useId()
  const descriptionId = useId()

  const handleEscape = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  })

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative w-full max-w-md rounded-t-2xl border border-border bg-popover shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:rounded-2xl sm:zoom-in-95 sm:slide-in-from-bottom-0"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const fieldClass =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 aria-[invalid=true]:border-destructive'

export function ModalActions({
  submitLabel,
  onCancel,
  destructive = false,
  disabled = false,
}: {
  submitLabel: string
  onCancel: () => void
  destructive?: boolean
  disabled?: boolean
}) {
  return (
    <div className="flex gap-2 pt-1">
      <button
        type="button"
        onClick={onCancel}
        className="h-11 flex-1 rounded-xl border border-border bg-background text-sm font-medium transition-colors hover:bg-secondary"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={disabled}
        className={
          destructive
            ? 'h-11 flex-1 rounded-xl bg-destructive text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50'
            : 'h-11 flex-1 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50'
        }
      >
        {submitLabel}
      </button>
    </div>
  )
}
