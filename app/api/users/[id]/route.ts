import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { updateUser, deleteUser } from '@/lib/users'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (id !== session.userId && !session.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const data = await request.json()
  const updates: Parameters<typeof updateUser>[1] = {}

  if (data.displayName !== undefined) updates.displayName = data.displayName
  if (data.bio !== undefined) updates.bio = data.bio
  if (data.password) updates.password = data.password
  // Only admins can change isAdmin, and only for other users
  if (data.isAdmin !== undefined && session.isAdmin && id !== session.userId) {
    updates.isAdmin = data.isAdmin
  }

  const user = await updateUser(id, updates)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  if (id === session.userId) {
    return NextResponse.json({ error: 'No podés eliminar tu propia cuenta' }, { status: 400 })
  }

  const deleted = await deleteUser(id)
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
