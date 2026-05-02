import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/users'
import { createSessionToken, SESSION_COOKIE } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  const user = await verifyPassword(username, password)
  if (!user) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
  }

  const token = await createSessionToken(user)
  const response = NextResponse.json({ success: true })

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}
