'use client'

import type { FormEvent, ReactNode } from 'react'
import { ModalActions, ModalShell } from './modal-shell'

type ConfirmDeleteModalProps = {
  title: string
  message: ReactNode
  blocked?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmDeleteModal({ title, message, blocked = false, onClose, onConfirm }: ConfirmDeleteModalProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!blocked) onConfirm()
  }

  return (
    <ModalShell title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
        <div className="text-sm leading-relaxed text-muted-foreground">{message}</div>
        <ModalActions submitLabel="Delete" destructive disabled={blocked} onCancel={onClose} />
      </form>
    </ModalShell>
  )
}
