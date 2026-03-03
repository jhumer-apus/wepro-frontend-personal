import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import config from '@/src/config'
import { store } from '@/src/store'
import { logout } from '@/src/store/slices/authSlice'

/**
 * API client: all requests go to the light server (proxy).
 * Auth is handled server-side via httpOnly cookies; no tokens on frontend.
 * Every request is transformed into POST /api/proxy with { method, target_url, data }.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api/proxy',
  timeout: config.api.timeout,
  withCredentials: true, // send cookies (session) with every request
})

// Transform any request into the proxy envelope: POST /api/proxy with { method, target_url, data }
apiClient.interceptors.request.use(
  reqConfig => {
    const method = (reqConfig.method ?? 'get').toUpperCase()
    const targetUrl = reqConfig.url ?? ''

    // ============ method, target, data should exist in the request body ============
    const isProxyEnvelope =
      typeof reqConfig.data === 'object' &&
      reqConfig.data !== null &&
      'method' in reqConfig.data &&
      'target_url' in reqConfig.data
    if (isProxyEnvelope) {
      // Already in envelope form (e.g. manual proxy call)
      if (process.env.NODE_ENV === 'development') {
        console.log('API Request (proxy):', reqConfig.data?.method, reqConfig.data?.target_url)
      }
      return reqConfig
    }
    const envelope = {
      method,
      target_url: targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`,
      ...(reqConfig.data !== undefined && method !== 'GET' && { data: reqConfig.data }),
    }
    return {
      ...reqConfig,
      method: 'POST',
      url: '',
      data: envelope,
    }
  },
  error => Promise.reject(error)
)

// Response interceptor: log and redirect to login on 401 (session invalid after proxy refresh attempt)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', { status: response.status, url: response.config.url })
    }
    return response
  },
  error => {
    if (error.response) {
      const { status, data } = error.response
      console.log({ status, data }, 'error')
      if (status === 401 && typeof window !== 'undefined') {
        store.dispatch(logout())
        window.location.href = '/login'
      }
      if (status === 403) console.error('Access forbidden:', data)
      if (status >= 500) console.error('Server error:', data)
    } else if (error.request) {
      console.error('Network error:', error.request)
    } else {
      console.error('API error:', error.message)
    }
    return Promise.reject(error)
  }
)

/** Call light server to clear httpOnly auth cookies. Use before dispatching logout(). */
export async function clearServerSession(): Promise<void> {
  try {
    await axios.post('/api/auth/logout', {}, { withCredentials: true })
  } catch {
    // Best effort; clear client state anyway
  }
}

// API service methods
export const apiService = {
  // GET request
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return apiClient.get<T>(url, config)
  },

  // POST request
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return apiClient.post<T>(url, data, config)
  },

  // PUT request
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return apiClient.put<T>(url, data, config)
  },

  // PATCH request
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return apiClient.patch<T>(url, data, config)
  },

  // DELETE request
  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return apiClient.delete<T>(url, config)
  },

  // Spam Protection methods
  getSpamProtection: (filters?: {
    page?: number
    limit?: number
    sortBy?: string
  }) => {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)

    const queryString = params.toString()
    const url = `/v3/wepro-phone/spam-protection${queryString ? `?${queryString}` : ''}`

    return apiClient.get(url)
  },

  getSpamProtectionById: (id: string) => {
    return apiClient.get(`/v3/wepro-phone/spam-protection/${id}`)
  },

  deleteSpamProtection: (id: string) => {
    return apiClient.delete(`/v3/wepro-phone/spam-protection/${id}`)
  },

  createSpamProtection: (data: {
    title: string
    protection: string
    greeting: string
    sourceSelectionType: 'all' | 'specific'
    sourceCodes: string[]
    voiceId: string
    voiceSettings: {
      stability: number
      similarity_boost: number
      style: number
      use_speaker_boost: boolean
    }
  }) => {
    return apiClient.post('/v3/wepro-phone/spam-protection', data)
  },

  regenerateSpamProtectionAudio: (id: string) => {
    return apiClient.post(
      `/v3/wepro-phone/spam-protection/${id}/regenerate-audio`
    )
  },

  updateSpamProtection: (
    id: string,
    data: {
      title: string
      protection: string
      greeting: string
      sourceSelectionType: 'all' | 'specific'
      sourceCodes: string[]
      voiceId: string
      voiceSettings: {
        stability: number
        similarity_boost: number
        style: number
        use_speaker_boost: boolean
      }
    }
  ) => {
    return apiClient.put(`/v3/wepro-phone/spam-protection/${id}`, data)
  },

  getSpamProtectionStatistics: (filters?: {
    startDate?: string
    endDate?: string
  }) => {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)

    const queryString = params.toString()
    const url = `/v3/wepro-phone/spam-protection/statistics${queryString ? `?${queryString}` : ''}`

    return apiClient.get(url)
  },

  getPhoneNumberById: (id: string) => {
    return apiClient.get(`/v3/wepro-phone/phone-numbers/${id}`)
  },

  getPhoneNumberStatistics: (filters?: {
    startDate?: string
    endDate?: string
  }) => {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)

    const queryString = params.toString()
    const url = `/v3/wepro-phone/phone-numbers/statistics${queryString ? `?${queryString}` : ''}`

    return apiClient.get(url)
  },

  getAvailablePhoneNumbers: (filters: {
    country?: string
    locality?: string
    areaCode?: string
    numberType?: string
    contains?: string
    smsEnabled?: boolean
    mmsEnabled?: boolean
    voiceEnabled?: boolean
    limit?: number
  }) => {
    const params = new URLSearchParams()
    if (filters.country && filters.country.trim())
      params.append('country', filters.country.trim())
    if (filters.locality && filters.locality.trim())
      params.append('locality', filters.locality.trim())
    if (filters.areaCode && filters.areaCode.trim())
      params.append('areaCode', filters.areaCode.trim())
    if (
      filters.numberType &&
      filters.numberType.trim() &&
      filters.numberType !== 'all'
    )
      params.append('numberType', filters.numberType.trim())
    if (filters.contains && filters.contains.trim())
      params.append('contains', filters.contains.trim())
    if (filters.smsEnabled === true) params.append('smsEnabled', 'true')
    if (filters.mmsEnabled === true) params.append('mmsEnabled', 'true')
    if (filters.voiceEnabled === true) params.append('voiceEnabled', 'true')
    if (filters.limit && filters.limit > 0)
      params.append('limit', filters.limit.toString())

    const queryString = params.toString()
    const url = `/v3/wepro-phone/phone-numbers/available${queryString ? `?${queryString}` : ''}`

    return apiClient.get(url)
  },

  purchasePhoneNumber: (data: {
    phoneNumber: string
    numberType: string
    friendlyName: string
  }) => {
    return apiClient.post('/v3/wepro-phone/phone-numbers/purchase', data)
  },

  // Service Packages methods
  getServicePackages: (filters?: {
    page?: number
    limit?: number
    search?: string
    tenantId?: string
  }) => {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.tenantId) params.append('tenantId', filters.tenantId)

    const queryString = params.toString()
    const url = `/v3/answering-services/packages${queryString ? `?${queryString}` : ''}`

    return apiClient.get(url)
  },

  getServicePackageById: (id: string) => {
    return apiClient.get(`/v3/answering-services/packages/${id}`)
  },

  createServicePackage: (data: {
    title: string
    description: string
    chargeModel: string
    chargeAmount: number
    chargeOver: number
    minimumMonthlySpend: number
    features: string[]
    isActive: boolean
    isPublic: boolean
  }) => {
    return apiClient.post('/v3/answering-services/packages', data)
  },

  updateServicePackage: (
    id: string,
    data: {
      title: string
      description: string
      chargeModel: string
      chargeAmount: number
      chargeOver: number
      minimumMonthlySpend: number
      features: string[]
      isActive: boolean
      isPublic: boolean
    }
  ) => {
    return apiClient.put(`/v3/answering-services/packages/${id}`, data)
  },

  deleteServicePackage: (id: string) => {
    return apiClient.delete(`/v3/answering-services/packages/${id}`)
  },

  // Stripe Accounts methods
  getStripeAccounts: (filters?: {
    page?: number
    limit?: number
  }) => {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const queryString = params.toString()
    const url = `/v3/stripe-accounts${queryString ? `?${queryString}` : ''}`

    return apiClient.get(url)
  },
}

export default apiClient
