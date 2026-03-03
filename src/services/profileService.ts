import { apiService } from './api'
import { ProfileApiResponse } from '@/src/constants/interface/profile'

export const profileService = {
  // Get user profile
  getProfile: async (): Promise<ProfileApiResponse> => {
    const response = await apiService.get<ProfileApiResponse>('/v3/profile')
    return response.data
  },

  // Update user profile
  updateProfile: async (data: {
    name: string
    username: string
    timezoneId: string
  }): Promise<any> => {
    const response = await apiService.put('/v3/profile', data)
    return response.data
  },
}
