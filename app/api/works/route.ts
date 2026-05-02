import { NextRequest, NextResponse } from 'next/server'
import { getWorksByUserId, createWork } from '@/lib/data'
import { getSession } from '@/lib/auth'

function parseCategories(raw: unknown): string[] {
  if (Array.isArray(raw)) return (raw as string[]).map(c => String(c).trim()).filter(Boolean)
  if (typeof raw === 'string') return raw.split(';').map(c => c.trim()).filter(Boolean)
  return []
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getWorksByUserId(session.userId))
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await request.json()
  try {
    const work = await createWork(session.userId, {
      title: data.title ?? '',
      description: data.description ?? '',
      categories: parseCategories(data.categories),
      type: data.type ?? 'single',
      imageUrl: data.imageUrl ?? null,
      beforeImageUrl: data.beforeImageUrl ?? null,
      afterImageUrl: data.afterImageUrl ?? null,
      order: data.order ?? 0,
      collectionId: data.collectionId ?? null,
    })
    return NextResponse.json(work, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('works_user_lower_title_idx') || msg.includes('unique')) {
      return NextResponse.json({ error: 'Ya tenés un trabajo con ese título' }, { status: 409 })
    }
    throw e
  }
}
