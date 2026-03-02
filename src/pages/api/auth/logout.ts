import type { NextApiRequest, NextApiResponse } from 'next'
import { clearAuthCookies } from '@/src/lib/lightServerAuth'

/**
 * Light server logout: clears httpOnly auth cookies.
 * Frontend should also clear Redux auth state and redirect to /login.
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'POST, GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  clearAuthCookies(res)
  return res.status(200).json({ success: true })
}
