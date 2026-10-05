// ==========================================
// KONFIGURASI BASE URL BACKEND
// ==========================================
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

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

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Jika token expired/invalid, paksa logout
  if (response.status === 401) {
    removeToken()
    window.location.href = "/login"
  }

  return response
}

// ==========================================
// FUNGSI LOGIN
// ==========================================
export async function loginUser(
  username: string,
  password: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, message: data.detail || "Login gagal" }
    }

    // Simpan token dan data user
    saveToken(data.access_token)
    saveUser({ username: data.username, role: data.role })

    return { success: true }
  } catch {
    return { success: false, message: "Tidak dapat terhubung ke server" }
  }
}
