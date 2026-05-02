import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function GET(request: NextRequest) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.redirect(new URL('/admin/login?error=oauth_config', request.url))
  }

  const state = randomBytes(16).toString('hex')
  const callbackUrl = new URL('/api/auth/google/callback', request.url).toString()

  const googleUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID)
  googleUrl.searchParams.set('redirect_uri', callbackUrl)
  googleUrl.searchParams.set('response_type', 'code')
  googleUrl.searchParams.set('scope', 'openid email profile')
  googleUrl.searchParams.set('state', state)
  googleUrl.searchParams.set('prompt', 'select_account')

  const response = NextResponse.redirect(googleUrl)
  response.cookies.set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 300,
    path: '/',
  })
  return response
}
