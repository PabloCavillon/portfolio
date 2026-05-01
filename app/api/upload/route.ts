import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { promises as fs } from 'fs'
import path from 'path'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Archivo demasiado grande (máx 10MB)' }, { status: 400 })
  }

  const ext = path.extname(file.name) || '.jpg'
  const filename = `${crypto.randomUUID()}${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')

  await fs.mkdir(uploadDir, { recursive: true })
  await fs.writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/uploads/${filename}` })
}
