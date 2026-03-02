/**
 * Light server auth: cookie-based token storage.
 * Only used in API routes (server). Tokens never go to the client.
 */

import type { NextApiResponse } from 'next'

const COOKIE_ACCESS = 'wepro_access_token'
const COOKIE_REFRESH = 'wepro_refresh_token'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {}
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, ...v] = part.trim().split('=')
    if (key && v.length) acc[decodeURIComponent(key)] = decodeURIComponent(v.join('=').trim())
    return acc
  }, {})
}

export function getAuthFromRequest(cookieHeader: string | undefined): {
  accessToken: string | null
  refreshToken: string | null
} {
  const cookies = parseCookies(cookieHeader)
  return {
    accessToken: cookies[COOKIE_ACCESS] ?? null,
    refreshToken: cookies[COOKIE_REFRESH] ?? null,
  }
}

export function setAuthCookies(
  res: NextApiResponse,
  accessToken: string,
  refreshToken: string
): void {
  res.setHeader('Set-Cookie', [
    `${COOKIE_ACCESS}=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_OPTIONS.maxAge}${COOKIE_OPTIONS.secure ? '; Secure' : ''}`,
    `${COOKIE_REFRESH}=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_OPTIONS.maxAge}${COOKIE_OPTIONS.secure ? '; Secure' : ''}`,
  ])
}

export function clearAuthCookies(res: NextApiResponse): void {
  res.setHeader('Set-Cookie', [
    `${COOKIE_ACCESS}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    `${COOKIE_REFRESH}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  ])
}

export function getBackendConfig(): { baseUrl: string; apiKey?: string } {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001/api').replace(/\/$/, '')
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY
  return { baseUrl, apiKey }
}
