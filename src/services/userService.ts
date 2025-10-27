import { apiService } from './api'
import { UsersApiResponse } from '@/src/constants/interface/users'

export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
}

export const userService = {
  getUsers: async (params: GetUsersParams = {}): Promise<UsersApiResponse> => {
    const { page = 1, limit = 10, search } = params

    let url = `/v1/users?page=${page}&limit=${limit}`

    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }

    const response = await apiService.get<UsersApiResponse>(url)
    return response.data
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiService.delete(`/v1/users/${userId}`)
  },
}
