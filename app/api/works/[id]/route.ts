import { NextRequest, NextResponse } from 'next/server'
import { getWork, updateWork, deleteWork } from '@/lib/data'
import { getSession } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const work = await getWork(id, session.userId)
  if (!work) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(work)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const data = await request.json()

  if (data.categories !== undefined) {
    data.categories = Array.isArray(data.categories)
      ? data.categories.map((c: string) => c.trim()).filter(Boolean)
      : String(data.categories).split(';').map((c: string) => c.trim()).filter(Boolean)
  }

  // Allow explicit null to unassign collection
  if ('collectionId' in data) {
    data.collectionId = data.collectionId ?? null
  }

  const work = await updateWork(id, session.userId, data)
  if (!work) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(work)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const deleted = await deleteWork(id, session.userId)
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
