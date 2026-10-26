import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Ambil token dari Cookies yang diset dari halaman login
  const token = request.cookies.get('token')?.value
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')

  // Jika tidak ada token dan user mencoba mengakses dashboard, tendang ke login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Jika sudah ada token tapi user mencoba masuk ke halaman login, tendang ke dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Konfigurasi ini menentukan rute Next.js mana saja yang dijaga oleh middleware
export const config = {
  matcher: [
    /*
     * Mengecek semua rute halaman kecuali:
     * - api (API routes frontend)
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico (ikon web)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}