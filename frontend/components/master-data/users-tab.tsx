'use client'

import { useState } from 'react'
import { UserPlus, ShieldCheck, User } from 'lucide-react'
import { UserFormModal } from './user-form-modal'

type UserRow = {
  id: number
  username: string
  name: string | null
  email: string | null
  role: string
  is_active: boolean
}

type UsersTabProps = {
  users: UserRow[]
  onRefresh: () => void
}

export function UsersTab({ users, onRefresh }: UsersTabProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {users.length} user terdaftar
        </p>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <UserPlus className="size-4" aria-hidden="true" />
          Tambah User
        </button>
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Username</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Nama</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Belum ada user terdaftar.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold uppercase">
                        {user.username.slice(0, 2)}
                      </div>
                      {user.username}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {user.name ?? <span className="italic opacity-50">—</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {user.email ?? <span className="italic opacity-50">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-primary/15 text-primary'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {user.role === 'admin' ? (
                        <ShieldCheck className="size-3" aria-hidden="true" />
                      ) : (
                        <User className="size-3" aria-hidden="true" />
                      )}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${
                        user.is_active
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-destructive'}`}
                        aria-hidden="true"
                      />
                      {user.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal register */}
      {showModal && (
        <UserFormModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            onRefresh()
          }}
        />
      )}
    </div>
  )
}
