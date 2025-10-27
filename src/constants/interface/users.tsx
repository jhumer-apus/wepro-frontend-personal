export interface User {
  _id: string
  name: string
  type: string
  username: string
  passwordHash: string
  status: 'Pending' | 'Active' | 'Inactive' | 'Suspended' | 'Deleted'
  roleId?: {
    _id: string
    name: string
  }
  timezoneId: {
    _id: string
    value: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export interface PaginationInfo {
  current: {
    page: number
    limit: number
  }
  total: number
  pages: number
}

export interface UsersApiResponse {
  success: boolean
  message: string
  count: number
  pagination: PaginationInfo
  data: User[]
}

// UserData interface for detailed user information
export interface UserData {
  _id: string
  name: string
  type: string
  username: string
  passwordHash: string
  status: 'Pending' | 'Active' | 'Inactive' | 'Suspended' | 'Deleted'
  roleId: {
    _id: string
    name: string
  }
  timezoneId: {
    _id: string
    value: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

// ApiResponse interface for user data API responses
export interface ApiResponse {
  success: boolean
  message: string
  data: UserData
}
