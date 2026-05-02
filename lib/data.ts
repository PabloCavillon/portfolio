import { sql } from './db'
import type { Work } from './types'

// @vercel/postgres typed params as Primitive; pg driver serializes JS arrays fine at runtime
const pgArr = (a: string[]) => a as unknown as string

function rowToWork(row: Record<string, unknown>): Work {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    description: (row.description as string) || '',
    categories: Array.isArray(row.categories) ? (row.categories as string[]) : [],
    type: row.type as 'single' | 'before-after',
    imageUrl: (row.image_url as string | null) ?? null,
    beforeImageUrl: (row.before_image_url as string | null) ?? null,
    afterImageUrl: (row.after_image_url as string | null) ?? null,
    order: row.order_index as number,
    collectionId: (row.collection_id as string | null) ?? null,
    createdAt: String(row.created_at),
  }
}

export async function getAllWorks(): Promise<(Work & { username: string; displayName: string })[]> {
  const { rows } = await sql`
    SELECT w.*, u.username, u.display_name
    FROM works w JOIN users u ON w.user_id = u.id
    ORDER BY w.order_index ASC, w.created_at DESC
  `
  return rows.map(row => ({
    ...rowToWork(row),
    username: row.username as string,
    displayName: (row.display_name as string) || (row.username as string),
  }))
}

export async function getWorksByUserId(userId: string): Promise<Work[]> {
  const { rows } = await sql`
    SELECT * FROM works WHERE user_id = ${userId}
    ORDER BY order_index ASC, created_at DESC
  `
  return rows.map(rowToWork)
}

export async function getWorksByUsername(username: string): Promise<Work[]> {
  const { rows } = await sql`
    SELECT w.* FROM works w
    JOIN users u ON w.user_id = u.id
    WHERE u.username = ${username}
    ORDER BY w.order_index ASC, w.created_at DESC
  `
  return rows.map(rowToWork)
}

export async function getWork(id: string, userId: string): Promise<Work | null> {
  const { rows } = await sql`
    SELECT * FROM works WHERE id = ${id} AND user_id = ${userId}
  `
  return rows.length ? rowToWork(rows[0]) : null
}

export async function createWork(userId: string, data: Omit<Work, 'id' | 'userId' | 'createdAt'>): Promise<Work> {
  const { rows } = await sql`
    INSERT INTO works (user_id, title, description, categories, type, image_url, before_image_url, after_image_url, order_index, collection_id)
    VALUES (${userId}, ${data.title}, ${data.description}, ${pgArr(data.categories)}, ${data.type},
            ${data.imageUrl}, ${data.beforeImageUrl}, ${data.afterImageUrl}, ${data.order}, ${data.collectionId ?? null})
    RETURNING *
  `
  return rowToWork(rows[0])
}

export async function updateWork(id: string, userId: string, data: Partial<Omit<Work, 'id' | 'userId' | 'createdAt'>>): Promise<Work | null> {
  const existing = await getWork(id, userId)
  if (!existing) return null

  const merged = {
    title: data.title ?? existing.title,
    description: data.description ?? existing.description,
    categories: data.categories ?? existing.categories,
    type: data.type ?? existing.type,
    imageUrl: 'imageUrl' in data ? data.imageUrl : existing.imageUrl,
    beforeImageUrl: 'beforeImageUrl' in data ? data.beforeImageUrl : existing.beforeImageUrl,
    afterImageUrl: 'afterImageUrl' in data ? data.afterImageUrl : existing.afterImageUrl,
    order: data.order ?? existing.order,
    collectionId: 'collectionId' in data ? data.collectionId : existing.collectionId,
  }

  const { rows } = await sql`
    UPDATE works SET
      title            = ${merged.title},
      description      = ${merged.description},
      categories       = ${pgArr(merged.categories)},
      type             = ${merged.type},
      image_url        = ${merged.imageUrl},
      before_image_url = ${merged.beforeImageUrl},
      after_image_url  = ${merged.afterImageUrl},
      order_index      = ${merged.order},
      collection_id    = ${merged.collectionId ?? null}
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `
  return rows.length ? rowToWork(rows[0]) : null
}

export async function deleteWork(id: string, userId: string): Promise<boolean> {
  const { rowCount } = await sql`DELETE FROM works WHERE id = ${id} AND user_id = ${userId}`
  return (rowCount ?? 0) > 0
}

export async function getWorksByCollectionId(collectionId: string): Promise<Work[]> {
  const { rows } = await sql`
    SELECT * FROM works WHERE collection_id = ${collectionId}
    ORDER BY order_index ASC, created_at DESC
  `
  return rows.map(rowToWork)
}
