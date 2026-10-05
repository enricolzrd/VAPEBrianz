import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Route yang tidak perlu login
const PUBLIC_ROUTES = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Lewati public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // Cek token di cookie (disimpan saat login)
  const token = request.cookies.get('vb_token')?.value

  // Tidak ada token → redirect ke login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Middleware berjalan di semua route kecuali asset statis
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)'],
}
