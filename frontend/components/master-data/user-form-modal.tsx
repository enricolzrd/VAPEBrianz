'use client'

import { useState, type FormEvent } from 'react'
import { ModalActions, ModalShell, fieldClass } from './modal-shell'
import { registerUser } from '@/lib/api'

type UserFormModalProps = {
  onClose: () => void
  onSuccess: () => void
}

const ROLES = [
  { value: 'kasir', label: 'Kasir' },
  { value: 'admin', label: 'Admin' },
]

export function UserFormModal({ onClose, onSuccess }: UserFormModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('kasir')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!username.trim()) return setError('Username wajib diisi.')
    if (password.length < 6) return setError('Password minimal 6 karakter.')

    setLoading(true)
    const result = await registerUser({
      username: username.trim(),
      password,
      role,
      name: name.trim() || undefined,
      email: email.trim() || undefined,
    })
    setLoading(false)

    if (!result.success) {
      setError(result.message ?? 'Terjadi kesalahan.')
      return
    }

    onSuccess()
    onClose()
  }

  return (
    <ModalShell
      title="Tambah User Baru"
      description="Akun baru akan langsung aktif dan bisa digunakan untuk login."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 p-6">

        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-username" className="text-sm font-medium">
            Username <span className="text-destructive">*</span>
          </label>
          <input
            id="reg-username"
            type="text"
            autoFocus
            autoComplete="off"
            maxLength={50}
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError('') }}
            placeholder="Masukkan username"
            aria-invalid={Boolean(error && !username)}
            className={fieldClass}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-password" className="text-sm font-medium">
            Password <span className="text-destructive">*</span>
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            maxLength={100}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            placeholder="Minimal 6 karakter"
            aria-invalid={Boolean(error && password.length < 6)}
            className={fieldClass}
          />
        </div>

        {/* Nama (opsional) */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-name" className="text-sm font-medium">
            Nama Lengkap <span className="text-muted-foreground text-xs font-normal">(opsional)</span>
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Brian Santoso"
            className={fieldClass}
          />
        </div>

        {/* Email (opsional) */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-email" className="text-sm font-medium">
            Email <span className="text-muted-foreground text-xs font-normal">(opsional)</span>
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            maxLength={100}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. brian@vapebrianz.id"
            className={fieldClass}
          />
        </div>

        {/* Role */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-role" className="text-sm font-medium">
            Role
          </label>
          <select
            id="reg-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={fieldClass}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error message */}
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <ModalActions
          submitLabel={loading ? 'Menyimpan...' : 'Tambah User'}
          onCancel={onClose}
          disabled={loading}
        />
      </form>
    </ModalShell>
  )
}
