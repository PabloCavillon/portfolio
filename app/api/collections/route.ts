import { NextRequest, NextResponse } from 'next/server'
import { getCollectionsByUserId, createCollection } from '@/lib/collections'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getCollectionsByUserId(session.userId))
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await request.json()
  if (!data.name?.trim()) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })

  try {
    const collection = await createCollection(session.userId, {
      name: data.name.trim(),
      description: data.description?.trim() ?? '',
    })
    return NextResponse.json(collection, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('collections_user_name_unique') || msg.includes('unique')) {
      return NextResponse.json({ error: 'Ya tenés una colección con ese nombre' }, { status: 409 })
    }
    throw e
  }
}
