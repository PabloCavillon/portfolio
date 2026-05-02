import { sql } from '@vercel/postgres'
import { hash } from 'bcryptjs'

export { sql }

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) UNIQUE NOT NULL,
      display_name VARCHAR(100) NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      password_hash TEXT,
      google_id TEXT UNIQUE,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS works (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      categories TEXT[] NOT NULL DEFAULT '{}',
      type VARCHAR(20) NOT NULL DEFAULT 'single',
      image_url TEXT,
      before_image_url TEXT,
      after_image_url TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS works_user_id_idx ON works(user_id)`

  // Migrations for existing databases
  await sql`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE`

  // Seed initial admin if no users exist
  const { rowCount } = await sql`SELECT id FROM users LIMIT 1`
  if ((rowCount ?? 0) === 0) {
    const username = process.env.ADMIN_USERNAME ?? 'admin'
    const password = process.env.ADMIN_PASSWORD
    if (password) {
      const passwordHash = await hash(password, 10)
      await sql`
        INSERT INTO users (username, display_name, password_hash, is_admin)
        VALUES (${username}, ${username}, ${passwordHash}, TRUE)
        ON CONFLICT (username) DO NOTHING
      `
    }
  }
}
