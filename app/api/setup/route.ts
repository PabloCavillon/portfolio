import { NextResponse } from 'next/server'
import { initDB } from '@/lib/db'

export async function GET() {
  try {
    await initDB()
    return NextResponse.json({ ok: true, message: 'Base de datos inicializada correctamente' })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
