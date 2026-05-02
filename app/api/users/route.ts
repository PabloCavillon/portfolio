import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getAllUsers, createUser } from '@/lib/users'

export async function GET() {
  const session = await getSession()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json(await getAllUsers())
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const data = await request.json()
  if (!data.username || !data.password) {
    return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 })
  }

  try {
    const user = await createUser({
      username: data.username,
      password: data.password,
      displayName: data.displayName || data.username,
      bio: data.bio || '',
      isAdmin: data.isAdmin || false,
    })
    return NextResponse.json(user, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error al crear usuario' }, { status: 400 })
  }
}
