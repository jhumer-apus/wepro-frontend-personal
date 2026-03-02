import { apiService } from './api'
import { Source, SourcesResponse } from '@/src/constants/interface/source'

export interface SourcesQueryParams {
  page?: number
  limit?: number
  sort?: string
  search?: string
}

export const sourcesService = {
  // Get all sources with pagination
  getSources: async (
    params: SourcesQueryParams = {}
  ): Promise<SourcesResponse> => {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.sort) queryParams.append('sort', params.sort)
    if (params.search) queryParams.append('search', params.search)

    const url = `/v3/sources${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await apiService.get<SourcesResponse>(url)
    return response.data
  },

  // Get a single source by ID
  getSourceById: async (id: string): Promise<Source> => {
    const response = await apiService.get<{ success: boolean; data: Source }>(
      `/v3/sources/${id}`
    )
    return response.data.data
  },

  // Create a new source
  createSource: async (sourceData: Partial<Source>): Promise<Source> => {
    const response = await apiService.post<{ success: boolean; data: Source }>(
      '/v3/sources',
      sourceData
    )
    return response.data.data
  },

  // Update an existing source
  updateSource: async (
    id: string,
    sourceData: Partial<Source>
  ): Promise<Source> => {
    const response = await apiService.put<{ success: boolean; data: Source }>(
      `/v3/sources/${id}`,
      sourceData
    )
    return response.data.data
  },

  // Delete a source
  deleteSource: async (id: string): Promise<void> => {
    await apiService.delete(`/v3/sources/${id}`)
  },
}
