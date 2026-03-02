import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  getAuthFromRequest,
  getBackendConfig,
  setAuthCookies,
} from '@/src/lib/lightServerAuth'

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const
type HttpMethod = (typeof ALLOWED_METHODS)[number]

interface ProxyRequestBody {
  method: string
  target_url: string
  data?: Record<string, unknown> | unknown[] | null
  /** When set, forward body as form-encoded (application/x-www-form-urlencoded) instead of JSON */
  content_type?: 'application/x-www-form-urlencoded'
}

function isAllowedMethod(method: string): method is HttpMethod {
  return ALLOWED_METHODS.includes(method.toUpperCase() as HttpMethod)
}

function buildTargetUrl(targetUrl: string): string {
  const { baseUrl } = getBackendConfig()
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    return targetUrl
  }
  const path = targetUrl.replace(/^\//, '')
  return `${baseUrl}/${path}`
}

/**
 * Light server proxy: single route that forwards requests to the main backend.
 * Body: { method, target_url, data? }
 * Relays response and preserves HTTP status codes.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
      msg: 'Only POST is allowed on this route.',
    })
  }

  let body: ProxyRequestBody
  try {
    body =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {}
  } catch {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      msg: 'Invalid JSON body.',
    })
  }

  const { method, target_url, data, content_type } = body

  if (!method || typeof method !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      msg: 'Missing or invalid "method" (e.g. GET, POST, PUT, DELETE).',
    })
  }

  if (!target_url || typeof target_url !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      msg: 'Missing or invalid "target_url" (API path or full URL).',
    })
  }

  if (!isAllowedMethod(method)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      msg: `Invalid "method". Allowed: ${ALLOWED_METHODS.join(', ')}.`,
    })
  }

  const url = buildTargetUrl(target_url)
  const useFormUrlEncoded = content_type === 'application/x-www-form-urlencoded'
  const methodsWithBody = ['POST', 'PUT', 'PATCH']
  const hasBody = methodsWithBody.includes(method.toUpperCase()) && data != null

  // Prefer token from httpOnly cookie (light server); fallback to Authorization header
  const { accessToken: cookieAccess } = getAuthFromRequest(req.headers.cookie)
  const authHeader = cookieAccess
    ? `Bearer ${cookieAccess}`
    : (req.headers.authorization as string | undefined)
  const headers: Record<string, string> = {
    ...(authHeader && { Authorization: authHeader }),
  }

  let bodyToSend: string | Record<string, unknown> | undefined
  if (hasBody) {
    if (useFormUrlEncoded && data && typeof data === 'object' && !Array.isArray(data)) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded'
      bodyToSend = new URLSearchParams(
        Object.fromEntries(
          Object.entries(data as Record<string, unknown>).map(([k, v]) => [
            k,
            String(v ?? ''),
          ])
        )
      ).toString()
    } else {
      headers['Content-Type'] = 'application/json'
      bodyToSend = data as Record<string, unknown>
    }
  }

  const doRequest = (accessToken?: string | null) =>
    axios({
      url,
      method: method.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS',
      headers: {
        ...headers,
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      ...(hasBody && bodyToSend !== undefined && { data: bodyToSend }),
      validateStatus: () => true,
    })

  try {
    let backendRes = await doRequest(cookieAccess)

    // On 401, try refresh (only when using cookie auth) and retry once
    if (backendRes.status === 401 && cookieAccess) {
      const { refreshToken } = getAuthFromRequest(req.headers.cookie)
      const { baseUrl } = getBackendConfig()
      if (refreshToken) {
        try {
          const refreshRes = await axios.post(
            `${baseUrl}/v3/auth/refresh-token`,
            { refreshToken },
            { validateStatus: () => true }
          )
          const refreshData = refreshRes.data as {
            success?: boolean
            accessToken?: string
            refreshToken?: string
            expiresIn?: string
            refreshExpiresIn?: string
          }
          if (refreshRes.status === 200 && refreshData?.accessToken) {
            const newRefresh = refreshData.refreshToken ?? refreshData.accessToken
            setAuthCookies(res, refreshData.accessToken, newRefresh)
            backendRes = await doRequest(refreshData.accessToken)
          }
        } catch (refreshErr) {
          console.error('[proxy] Token refresh failed:', refreshErr)
        }
      }
    }

    const status = backendRes.status
    const backendContentType = backendRes.headers['content-type']
    const isJson =
      typeof backendContentType === 'string' &&
      backendContentType.toLowerCase().includes('application/json')

    res.status(status)
    if (status === 204) {
      return res.end()
    }
    if (isJson) {
      res.setHeader('Content-Type', 'application/json')
      const data = backendRes.data
      // Normalize: main server may send "message" or "msg"; expose as "msg" so frontend can always read data.msg
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const payload = { ...data } as Record<string, unknown>
        if (!('msg' in payload) && 'message' in payload) {
          payload.msg = payload.message
        }
        return res.json(payload)
      }
      return res.json(data ?? null)
    }
    return res.send(
      typeof backendRes.data === 'string' ? backendRes.data : backendRes.data ?? ''
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[proxy] Forward error:', message)
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway',
      msg: 'Failed to reach the backend or relay the response.',
      details: process.env.NODE_ENV === 'development' ? message : undefined,
    })
  }
}
