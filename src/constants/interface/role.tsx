import { Permission } from './permission'

// Role interface definitions
export interface Role {
  _id: string
  name: string
  permissions: Permission[]
  isFeatured?: boolean
  createdAt?: string
  updatedAt?: string
}

// Simple Role interface for basic role data
export interface SimpleRole {
  _id: string
  name: string
}

export interface RoleManagementResponse {
  success: boolean
  data: Role[]
  message?: string
}
