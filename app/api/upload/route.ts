import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json()) as HandleUploadBody

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
        maximumSizeInBytes: 50 * 1024 * 1024, // 50MB
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(json)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 })
  }
}
