import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  getBackendConfig,
  setAuthCookies,
} from '@/src/lib/lightServerAuth'

/**
 * Light server login: credentials stay on server, tokens stored in httpOnly cookies.
 * Frontend never sees accessToken or refreshToken.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { username, password, deviceToken } = req.body ?? {}
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      msg: 'Missing username or password',
    })
  }

  const { baseUrl, apiKey } = getBackendConfig()
  const loginUrl = `${baseUrl}/v3/auth/login`
  const loginHeaders: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  if (apiKey) {
    loginHeaders.Authorization = `Bearer ${apiKey}`
  }

  try {
    const loginRes = await axios.post(
      loginUrl,
      new URLSearchParams({
        username: String(username),
        password: String(password),
        deviceToken: deviceToken != null ? String(deviceToken) : '',
      }).toString(),
      {
        headers: loginHeaders,
        validateStatus: () => true,
      }
    )

    if (loginRes.status !== 200) {
      const data = loginRes.data as { msg?: string; message?: string }
      return res.status(loginRes.status).json({
        success: false,
        msg: data?.msg ?? data?.message ?? 'Login failed',
      })
    }

    const data = loginRes.data as {
      accessToken: string
      refreshToken?: string
      expiresIn?: string
      refreshExpiresIn?: string
    }
    const accessToken = data.accessToken
    const refreshToken = data.refreshToken ?? data.accessToken

    if (!accessToken) {
      return res.status(502).json({
        success: false,
        msg: 'Backend did not return tokens',
      })
    }

    setAuthCookies(res, accessToken, refreshToken)

    // Optionally fetch profile and return it (no tokens)
    try {
      const profileRes = await axios.get(`${baseUrl}/v3/technicians/users/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        validateStatus: () => true,
      })
      const profileData = profileRes.data
      return res.status(200).json({
        success: true,
        profile: profileData?.profile ?? profileData,
        status: profileData?.status,
      })
    } catch {
      return res.status(200).json({ success: true })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed'
    console.error('[auth/login]', message)
    return res.status(502).json({
      success: false,
      msg: 'Unable to reach auth service',
      ...(process.env.NODE_ENV === 'development' && { details: message }),
    })
  }
}
