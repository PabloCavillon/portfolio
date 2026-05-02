import { sql } from './db'
import type { Collection } from './types'
import { toSlug } from './utils'

function rowToCollection(row: Record<string, unknown>): Collection {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    description: (row.description as string) || '',
    orderIndex: (row.order_index as number) ?? 0,
    workCount: (row.work_count as number) ?? 0,
    createdAt: String(row.created_at),
  }
}

export async function getCollectionsByUserId(userId: string): Promise<Collection[]> {
  const { rows } = await sql`
    SELECT c.*, COUNT(w.id)::int AS work_count
    FROM collections c
    LEFT JOIN works w ON w.collection_id = c.id
    WHERE c.user_id = ${userId}
    GROUP BY c.id
    ORDER BY c.order_index ASC, c.created_at DESC
  `
  return rows.map(rowToCollection)
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  const { rows } = await sql`
    SELECT c.*, COUNT(w.id)::int AS work_count
    FROM collections c
    LEFT JOIN works w ON w.collection_id = c.id
    WHERE c.id = ${id}
    GROUP BY c.id
  `
  return rows.length ? rowToCollection(rows[0]) : null
}

export async function createCollection(userId: string, data: { name: string; description?: string }): Promise<Collection> {
  const { rows } = await sql`
    INSERT INTO collections (user_id, name, description)
    VALUES (${userId}, ${data.name}, ${data.description ?? ''})
    RETURNING *, 0 AS work_count
  `
  return rowToCollection(rows[0])
}

export async function getCollectionBySlug(userId: string, slug: string): Promise<Collection | null> {
  const collections = await getCollectionsByUserId(userId)
  return collections.find(c => toSlug(c.name) === slug) ?? null
}

export async function deleteCollection(id: string, userId: string): Promise<boolean> {
  const { rowCount } = await sql`DELETE FROM collections WHERE id = ${id} AND user_id = ${userId}`
  return (rowCount ?? 0) > 0
}
