import { NextRequest, NextResponse } from 'next/server'
import { upsertGoogleUser } from '@/lib/users'
import { createSessionToken, SESSION_COOKIE } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const storedState = request.cookies.get('google_oauth_state')?.value

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL('/admin/login?error=oauth', request.url))
  }

  const callbackUrl = new URL('/api/auth/google/callback', request.url).toString()

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/admin/login?error=oauth', request.url))
  }

  const { access_token } = await tokenRes.json()

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!profileRes.ok) {
    return NextResponse.redirect(new URL('/admin/login?error=oauth', request.url))
  }

  const { id, email, name } = await profileRes.json()

  try {
    const user = await upsertGoogleUser({ googleId: id, email, name })
    const token = await createSessionToken(user)

    const response = NextResponse.redirect(new URL('/admin', request.url))
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    response.cookies.delete('google_oauth_state')
    return response
  } catch {
    return NextResponse.redirect(new URL('/admin/login?error=oauth', request.url))
  }
}
