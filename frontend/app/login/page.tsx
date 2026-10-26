'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Kembalikan ke format JSON
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Ambil token dari berbagai kemungkinan struktur data FastAPI Anda
        const tokenAsli = 
          data.access_token || 
          data.token || 
          data.data?.access_token || 
          data.data?.token ||
          data.data; // Jika backend langsung mengirim {"data": "eyJhbG..."}

        // JIKA TOKEN MASIH KOSONG, TAHAN LAYAR AGAR TIDAK KEDIP
        if (!tokenAsli || tokenAsli === 'undefined') {
          alert("Struktur API salah! Isi dari backend: " + JSON.stringify(data))
          setLoading(false)
          return 
        }

        // Jika token benar-benar ada, baru simpan dan pindah halaman
        localStorage.setItem('token', tokenAsli)
        document.cookie = `token=${tokenAsli}; path=/; max-age=86400`
        window.location.href = '/'
        
      } else {
        setError(data.detail || 'Login gagal. Periksa username dan password Anda.')
      }
    } catch (err) {
      console.error('Error jaringan:', err)
      setError('Gagal terhubung ke server backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">

        {/* Logo & Judul */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary font-mono text-lg font-bold text-primary-foreground">
            VB
          </div>
          <h1 className="text-xl font-semibold tracking-tight">VapeBrianz POS</h1>
          <p className="mt-1 text-sm text-muted-foreground">Masuk untuk melanjutkan</p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
              disabled={loading}
              className="h-10 rounded-lg border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              disabled={loading}
              className="h-10 rounded-lg border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            />
          </div>

          {/* Pesan Error */}
          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 rounded-xl bg-primary text-sm font-bold tracking-wide text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

      </div>
    </div>
  )
}