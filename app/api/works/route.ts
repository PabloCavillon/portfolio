import { NextRequest, NextResponse } from 'next/server'
import { getWorks, createWork } from '@/lib/data'
import { getSession } from '@/lib/auth'

export async function GET() {
  const works = await getWorks()
  return NextResponse.json(works)
}

export async function POST(request: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await request.json()
  const work = await createWork({
    title: data.title ?? '',
    description: data.description ?? '',
    category: data.category ?? '',
    type: data.type ?? 'single',
    imageUrl: data.imageUrl ?? null,
    beforeImageUrl: data.beforeImageUrl ?? null,
    afterImageUrl: data.afterImageUrl ?? null,
    order: data.order ?? 0,
  })

  return NextResponse.json(work, { status: 201 })
}
