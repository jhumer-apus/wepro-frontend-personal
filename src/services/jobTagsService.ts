import { apiService } from './api'
import { JobTagsResponse, JobTag } from '@/src/constants/interface/jobTags'

export interface GetJobTagsParams {
  page?: number
  limit?: number
  tenantId: string
  search?: string
  isP1?: boolean
}

export interface CreateJobTagData {
  name: string
  description?: string
  background_color: string
  text_color: string
}

export interface UpdateJobTagData extends Partial<CreateJobTagData> {
  id: string
}

export const jobTagsService = {
  getJobTags: async (params: GetJobTagsParams): Promise<JobTagsResponse> => {
    const { page = 1, limit = 10, tenantId, search, isP1 } = params

    // Use P1 endpoint if user has P1 permissions
    const baseUrl = isP1 ? '/v3/job-tags/p1' : '/v3/job-tags'
    let url = `${baseUrl}?page=${page}&limit=${limit}&tenantId=${tenantId}`

    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }

    const response = await apiService.get<JobTagsResponse>(url)
    return response.data
  },

  createJobTag: async (data: CreateJobTagData): Promise<JobTag> => {
    const response = await apiService.post<{
      success: boolean
      data: JobTag
      message: string
    }>('/job-tags', data)
    return response.data.data
  },

  updateJobTag: async (data: UpdateJobTagData): Promise<JobTag> => {
    const { id, ...updateData } = data
    const response = await apiService.put<{
      success: boolean
      data: JobTag
      message: string
    }>(`/v3/job-tags/${id}`, updateData)
    return response.data.data
  },

  deleteJobTag: async (id: string): Promise<void> => {
    await apiService.delete(`/v3/job-tags/${id}`)
  },
}
