import { apiService } from './api'
import {
  CallBlockingResponse,
  CallBlockingFilters,
  CallBlockingStatisticsResponse,
} from '@/src/constants/interface/callBlocking'

export const callBlockingService = {
  // Get call blocking rules
  getCallBlockingRules: async (
    filters: CallBlockingFilters = {}
  ): Promise<CallBlockingResponse> => {
    const params = new URLSearchParams()

    // Set default values
    params.append('page', (filters.page || 1).toString())
    params.append('limit', (filters.limit || 10).toString())
    params.append('sort', filters.sort || '-createdAt')

    // Add optional filters
    if (filters.search) {
      params.append('search', filters.search)
    }
    if (filters.status) {
      params.append('status', filters.status)
    }
    if (filters.blockingType) {
      params.append('blockingType', filters.blockingType)
    }

    const response = await apiService.get<CallBlockingResponse>(
      `/v1/wepro-phone/call-blocking?${params.toString()}`
    )

    return response.data
  },

  // Create a new call blocking rule
  createCallBlockingRule: async (data: {
    phoneNumber?: string
    pattern?: string
    blockingType: 'number' | 'pattern'
    blockType: 'permanent' | 'temporary'
    reason: string
    sourceCodes: string[]
    notes?: string
    tags?: string[]
  }) => {
    const response = await apiService.post(
      '/v1/wepro-phone/call-blocking',
      data
    )
    return response.data
  },

  // Update a call blocking rule
  updateCallBlockingRule: async (
    id: string,
    data: Partial<{
      phoneNumber?: string
      pattern?: string
      blockingType: 'number' | 'pattern'
      blockType: 'permanent' | 'temporary'
      reason: string
      sourceCodes: string[]
      status: 'active' | 'inactive'
      notes?: string
      tags?: string[]
    }>
  ) => {
    const response = await apiService.put(
      `/v1/wepro-phone/call-blocking/${id}`,
      data
    )
    return response.data
  },

  // Delete a call blocking rule
  deleteCallBlockingRule: async (id: string) => {
    const response = await apiService.delete(
      `/v1/wepro-phone/call-blocking/${id}`
    )
    return response.data
  },

  // Toggle rule status (activate/deactivate)
  toggleRuleStatus: async (id: string, status: 'active' | 'inactive') => {
    const response = await apiService.patch(
      `/v1/wepro-phone/call-blocking/${id}/status`,
      { status }
    )
    return response.data
  },

  // Get call blocking statistics
  getCallBlockingStatistics:
    async (): Promise<CallBlockingStatisticsResponse> => {
      const response = await apiService.get<CallBlockingStatisticsResponse>(
        '/v1/wepro-phone/call-blocking/statistics'
      )
      return response.data
    },
}
