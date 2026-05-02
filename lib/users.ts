import { sql } from './db'
import { hash, compare } from 'bcryptjs'
import type { User } from './types'

const RESERVED = new Set(['admin', 'api', '_next', 'login', 'static', 'public'])

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    username: row.username as string,
    displayName: (row.display_name as string) || '',
    bio: (row.bio as string) || '',
    isAdmin: row.is_admin as boolean,
    createdAt: String(row.created_at),
  }
}

export async function getAllUsers(): Promise<User[]> {
  const { rows } = await sql`
    SELECT id, username, display_name, bio, is_admin, created_at
    FROM users ORDER BY created_at ASC
  `
  return rows.map(rowToUser)
}

export async function getUserById(id: string): Promise<User | null> {
  const { rows } = await sql`
    SELECT id, username, display_name, bio, is_admin, created_at
    FROM users WHERE id = ${id}
  `
  return rows.length ? rowToUser(rows[0]) : null
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const { rows } = await sql`
    SELECT id, username, display_name, bio, is_admin, created_at
    FROM users WHERE username = ${username}
  `
  return rows.length ? rowToUser(rows[0]) : null
}

export async function verifyPassword(username: string, password: string): Promise<User | null> {
  const { rows } = await sql`SELECT * FROM users WHERE username = ${username}`
  if (!rows.length) return null
  const valid = await compare(password, rows[0].password_hash as string)
  if (!valid) return null
  return rowToUser(rows[0])
}

export async function createUser(data: {
  username: string
  password: string
  displayName?: string
  bio?: string
  isAdmin?: boolean
}): Promise<User> {
  if (RESERVED.has(data.username.toLowerCase())) throw new Error('Nombre de usuario reservado')
  const passwordHash = await hash(data.password, 10)
  const { rows } = await sql`
    INSERT INTO users (username, display_name, bio, password_hash, is_admin)
    VALUES (${data.username}, ${data.displayName ?? data.username}, ${data.bio ?? ''}, ${passwordHash}, ${data.isAdmin ?? false})
    RETURNING id, username, display_name, bio, is_admin, created_at
  `
  return rowToUser(rows[0])
}

export async function updateUser(
  id: string,
  data: { displayName?: string; bio?: string; password?: string; isAdmin?: boolean }
): Promise<User | null> {
  if (data.password) {
    const passwordHash = await hash(data.password, 10)
    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${id}`
  }
  if (data.displayName !== undefined || data.bio !== undefined || data.isAdmin !== undefined) {
    await sql`
      UPDATE users SET
        display_name = COALESCE(${data.displayName ?? null}, display_name),
        bio          = COALESCE(${data.bio ?? null}, bio),
        is_admin     = COALESCE(${data.isAdmin ?? null}, is_admin)
      WHERE id = ${id}
    `
  }
  return getUserById(id)
}

export async function deleteUser(id: string): Promise<boolean> {
  const { rowCount } = await sql`DELETE FROM users WHERE id = ${id}`
  return (rowCount ?? 0) > 0
}

async function uniqueUsername(base: string): Promise<string> {
  const clean = base.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 28) || 'user'
  const candidate = RESERVED.has(clean) ? `u${clean}` : clean
  const { rows } = await sql`SELECT id FROM users WHERE username = ${candidate}`
  if (!rows.length) return candidate
  return `${candidate.slice(0, 24)}${Math.floor(1000 + Math.random() * 9000)}`
}

export async function upsertGoogleUser(data: {
  googleId: string
  email: string
  name: string
}): Promise<User> {
  const { rows: existing } = await sql`
    SELECT id, username, display_name, bio, is_admin, created_at
    FROM users WHERE google_id = ${data.googleId}
  `
  if (existing.length) return rowToUser(existing[0])

  const username = await uniqueUsername(data.email.split('@')[0])
  const displayName = data.name || username
  const { rows } = await sql`
    INSERT INTO users (username, display_name, bio, google_id, is_admin)
    VALUES (${username}, ${displayName}, '', ${data.googleId}, FALSE)
    RETURNING id, username, display_name, bio, is_admin, created_at
  `
  return rowToUser(rows[0])
}

export async function getUsersWithPreview(): Promise<(User & { previewUrl: string | null; workCount: number })[]> {
  const { rows } = await sql`
    SELECT
      u.id, u.username, u.display_name, u.bio, u.is_admin, u.created_at,
      (
        SELECT COALESCE(w.image_url, w.after_image_url)
        FROM works w
        WHERE w.user_id = u.id
        ORDER BY w.order_index ASC, w.created_at DESC
        LIMIT 1
      ) AS preview_url,
      (SELECT COUNT(*)::int FROM works w WHERE w.user_id = u.id) AS work_count
    FROM users u
    ORDER BY u.created_at ASC
  `
  return rows.map(row => ({
    ...rowToUser(row),
    previewUrl: (row.preview_url as string | null) ?? null,
    workCount: (row.work_count as number) ?? 0,
  }))
}
