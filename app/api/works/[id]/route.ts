import { NextRequest, NextResponse } from 'next/server'
import { getWork, updateWork, deleteWork } from '@/lib/data'
import { getSession } from '@/lib/auth'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const work = await getWork(id)
  if (!work) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(work)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const data = await request.json()
  const work = await updateWork(id, data)
  if (!work) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(work)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const deleted = await deleteWork(id)
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
