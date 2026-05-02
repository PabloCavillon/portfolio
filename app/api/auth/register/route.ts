import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/users'
import { createSessionToken, SESSION_COOKIE } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { username, displayName, password } = await request.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Usuario y contraseña son requeridos' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
  }

  try {
    const user = await createUser({ username, displayName: displayName || username, password })
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
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al crear cuenta'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
