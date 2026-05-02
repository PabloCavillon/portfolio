import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { User } from './types'

export const SESSION_COOKIE = 'portfolio_session'

export interface SessionPayload {
  userId: string
  username: string
  isAdmin: boolean
}

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(user: User): Promise<string> {
  return new SignJWT({ userId: user.id, username: user.username, isAdmin: user.isAdmin })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}
