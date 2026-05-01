import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { SESSION_COOKIE } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
