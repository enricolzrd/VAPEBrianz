// ==========================================
// KONFIGURASI BASE URL BACKEND
// ==========================================
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

// ==========================================
// HELPER: AMBIL TOKEN DARI LOCALSTORAGE
// ==========================================
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("vb_token")
}

export function saveToken(token: string): void {
  localStorage.setItem("vb_token", token)
  // Simpan juga di cookie agar middleware Next.js bisa membaca
  document.cookie = `vb_token=${token}; path=/; max-age=${8 * 60 * 60}; SameSite=Strict`
}

export function removeToken(): void {
  localStorage.removeItem("vb_token")
  localStorage.removeItem("vb_user")
  // Hapus cookie
  document.cookie = "vb_token=; path=/; max-age=0"
}

export function saveUser(user: { username: string; role: string }): void {
  localStorage.setItem("vb_user", JSON.stringify(user))
}

export function getUser(): { username: string; role: string } | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("vb_user")
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// ==========================================
// HELPER: FETCH DENGAN TOKEN OTOMATIS
// ==========================================
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  // Otomatis menambahkan /api jika endpoint lupa ditulis dengan /api
  const cleanEndpoint = endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`

  const response = await fetch(`${BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers,
  })

  // Jika token expired/invalid, paksa logout
  if (response.status === 401) {
    removeToken()
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }

  return response
}

// ==========================================
// FUNGSI REGISTER (ADMIN ONLY)
// ==========================================
export async function registerUser(payload: {
  username: string
  password: string
  role: string
  name?: string
  email?: string
}): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, message: data.detail || "Registrasi gagal" }
    }

    return { success: true, message: data.message }
  } catch {
    return { success: false, message: "Tidak dapat terhubung ke server" }
  }
}

// ==========================================
// FUNGSI LOGIN
// ==========================================
export async function loginUser(
  username: string,
  password: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // PERBAIKAN 1: Menambahkan '/api' sebelum '/auth/login'
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, message: data.detail || "Login gagal" }
    }

    // PERBAIKAN 2: Mengambil token sesuai dengan format return backend Anda.
    // Jika backend mengembalikan field 'token', maka ganti menjadi data.token atau data.data.token
    const token = data.token || data.access_token || (data.data && data.data.token)
    const userData = data.user || data.data || { username, role: "user" }

    if (!token) {
      return { success: false, message: "Token tidak ditemukan dalam respon server" }
    }

    // Simpan token dan data user
    saveToken(token)
    saveUser({ username: userData.username, role: userData.role || "user" })

    return { success: true }
  } catch (error) {
    return { success: false, message: "Tidak dapat terhubung ke server" }
  }
}
