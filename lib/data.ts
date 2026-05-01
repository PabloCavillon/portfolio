import { promises as fs } from 'fs'
import path from 'path'
import type { Work } from './types'

const DATA_FILE = path.join(process.cwd(), 'data', 'works.json')

export async function getWorks(): Promise<Work[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    const works: Work[] = JSON.parse(raw)
    return works.sort(
      (a, b) => a.order - b.order || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch {
    return []
  }
}

async function saveWorks(works: Work[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(works, null, 2))
}

export async function getWork(id: string): Promise<Work | null> {
  const works = await getWorks()
  return works.find(w => w.id === id) ?? null
}

export async function createWork(data: Omit<Work, 'id' | 'createdAt'>): Promise<Work> {
  const works = await getWorks()
  const work: Work = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  works.push(work)
  await saveWorks(works)
  return work
}

export async function updateWork(id: string, data: Partial<Omit<Work, 'id' | 'createdAt'>>): Promise<Work | null> {
  const works = await getWorks()
  const i = works.findIndex(w => w.id === id)
  if (i === -1) return null
  works[i] = { ...works[i], ...data }
  await saveWorks(works)
  return works[i]
}

export async function deleteWork(id: string): Promise<boolean> {
  const works = await getWorks()
  const i = works.findIndex(w => w.id === id)
  if (i === -1) return false
  works.splice(i, 1)
  await saveWorks(works)
  return true
}
