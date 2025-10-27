import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import config from '@/src/config'
import { store } from '@/src/store'
import { logout, refreshTokens } from '@/src/store/slices/authSlice'

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    // Add auth token from Redux store if available
    const state = store.getState()
    const accessToken = state.auth.tokens?.accessToken

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      })
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      })
    }

    return response
  },
  async error => {
    const originalRequest = error.config

    // Handle common errors
    if (error.response) {
      const { status, data } = error.response
      console.log({ status, data }, 'error')

      // Handle 401 Unauthorized
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          // Get refresh token from Redux store
          const state = store.getState()
          const refreshToken = state.auth.tokens?.refreshToken

          if (refreshToken) {
            // Attempt to refresh the token
            const refreshResponse = await axios.post(
              `${config.api.baseUrl}/v1/auth/refresh-token`,
              {
                refreshToken: refreshToken,
              }
            )

            if (refreshResponse.data.success) {
              const {
                accessToken,
                expiresIn,
                refreshExpiresIn,
                refreshToken: newRefreshToken,
              } = refreshResponse.data

              // Update tokens in Redux store
              store.dispatch(
                refreshTokens({
                  accessToken,
                  expiresIn,
                  refreshExpiresIn,
                  refreshToken: newRefreshToken,
                })
              )

              // Update the original request with new token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`

              // Retry the original request
              return apiClient(originalRequest)
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          // If refresh fails, logout the user and redirect to login
          if (typeof window !== 'undefined') {
            store.dispatch(logout())
            window.location.href = '/login'
          }
        }
      }

      // Handle 403 Forbidden
      if (status === 403) {
        console.error('Access forbidden:', data)
      }

      // Handle 500 Server Error
      if (status >= 500) {
        console.error('Server error:', data)
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request)
    } else {
      // Other error
      console.error('API error:', error.message)
    }

    return Promise.reject(error)
  }
)

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
    const url = `/v1/wepro-phone/spam-protection${queryString ? `?${queryString}` : ''}`

    return apiClient.get(url)
  },

  getSpamProtectionById: (id: string) => {
    return apiClient.get(`/v1/wepro-phone/spam-protection/${id}`)
  },

  deleteSpamProtection: (id: string) => {
    return apiClient.delete(`/v1/wepro-phone/spam-protection/${id}`)
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
    return apiClient.post('/v1/wepro-phone/spam-protection', data)
  },

  regenerateSpamProtectionAudio: (id: string) => {
    return apiClient.post(
      `/v1/wepro-phone/spam-protection/${id}/regenerate-audio`
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
    return apiClient.put(`/v1/wepro-phone/spam-protection/${id}`, data)
  },

  getSpamProtectionStatistics: (filters?: {
    startDate?: string
    endDate?: string
  }) => {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)

    const queryString = params.toString()
    const url = `/v1/wepro-phone/spam-protection/statistics${queryString ? `?${queryString}` : ''}`

    return apiClient.get(url)
  },

  getPhoneNumberById: (id: string) => {
    return apiClient.get(`/v1/wepro-phone/phone-numbers/${id}`)
  },

  getPhoneNumberStatistics: (filters?: {
    startDate?: string
    endDate?: string
  }) => {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)

    const queryString = params.toString()
    const url = `/v1/wepro-phone/phone-numbers/statistics${queryString ? `?${queryString}` : ''}`

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
    const url = `/v1/wepro-phone/phone-numbers/available${queryString ? `?${queryString}` : ''}`

    return apiClient.get(url)
  },

  purchasePhoneNumber: (data: {
    phoneNumber: string
    numberType: string
    friendlyName: string
  }) => {
    return apiClient.post('/v1/wepro-phone/phone-numbers/purchase', data)
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
    const url = `/v1/answering-services/packages${queryString ? `?${queryString}` : ''}`

    return apiClient.get(url)
  },

  getServicePackageById: (id: string) => {
    return apiClient.get(`/v1/answering-services/packages/${id}`)
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
    return apiClient.post('/v1/answering-services/packages', data)
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
    return apiClient.put(`/v1/answering-services/packages/${id}`, data)
  },

  deleteServicePackage: (id: string) => {
    return apiClient.delete(`/v1/answering-services/packages/${id}`)
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
    const url = `/v1/stripe-accounts${queryString ? `?${queryString}` : ''}`

    return apiClient.get(url)
  },
}

export default apiClient
