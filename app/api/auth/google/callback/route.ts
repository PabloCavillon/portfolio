import { NextRequest, NextResponse } from 'next/server'
import { upsertGoogleUser } from '@/lib/users'
import { createSessionToken, SESSION_COOKIE } from '@/lib/auth'

function getBaseUrl(request: NextRequest): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '')
  const proto = request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol.replace(':', '')
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? new URL(request.url).host
  return `${proto}://${host}`
}

function errRedirect(request: NextRequest, code: string) {
  return NextResponse.redirect(new URL(`/admin/login?error=${code}`, request.url))
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const googleError = searchParams.get('error')
  const storedState = request.cookies.get('google_oauth_state')?.value

  // Google returned an error (e.g. access_denied)
  if (googleError) return errRedirect(request, `google_${googleError}`)

  if (!code || !state || state !== storedState) {
    return errRedirect(request, 'state_mismatch')
  }

  const callbackUrl = `${getBaseUrl(request)}/api/auth/google/callback`

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
    const body = await tokenRes.text()
    console.error('[google-callback] token error:', body)
    return errRedirect(request, 'token_exchange')
  }

  const { access_token } = await tokenRes.json()

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!profileRes.ok) return errRedirect(request, 'profile_fetch')

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
  } catch (e) {
    console.error('[google-callback] upsert error:', e)
    return errRedirect(request, 'db_error')
  }
}
