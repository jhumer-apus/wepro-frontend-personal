import { apiService } from './api'
import { Role, RoleManagementResponse } from '@/src/constants/interface/role'

// Role Management API service
export const roleManagementService = {
  // Get all roles for a tenant
  getRoles: async (tenantId: string): Promise<Role[]> => {
    try {
      const response = await apiService.get<RoleManagementResponse>(
        `/v3/role-management?tenantId=${tenantId}`
      )

      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to fetch roles')
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      throw error
    }
  },

  // Get a specific role by ID
  getRoleById: async (roleId: string, tenantId: string): Promise<Role> => {
    try {
      const response = await apiService.get<RoleManagementResponse>(
        `/v3/role-management?tenantId=${tenantId}&roleId=${roleId}`
      )

      if (response.data.success && response.data.data.length > 0) {
        return response.data.data[0]
      } else {
        throw new Error('Role not found')
      }
    } catch (error) {
      console.error('Error fetching role:', error)
      throw error
    }
  },

  // Create a new role
  createRole: async (
    roleData: Omit<Role, '_id'>,
    tenantId: string
  ): Promise<Role> => {
    try {
      const response = await apiService.post<RoleManagementResponse>(
        `/v3/role-management?tenantId=${tenantId}`,
        roleData
      )

      if (response.data.success) {
        return response.data.data[0]
      } else {
        throw new Error(response.data.message || 'Failed to create role')
      }
    } catch (error) {
      console.error('Error creating role:', error)
      throw error
    }
  },

  // Update an existing role
  updateRole: async (
    roleId: string,
    roleData: Partial<Role>,
    tenantId: string
  ): Promise<Role> => {
    try {
      const response = await apiService.put<RoleManagementResponse>(
        `/v3/role-management/${roleId}?tenantId=${tenantId}`,
        roleData
      )

      if (response.data.success) {
        return response.data.data[0]
      } else {
        throw new Error(response.data.message || 'Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      throw error
    }
  },

  // Delete a role
  deleteRole: async (roleId: string, tenantId: string): Promise<void> => {
    try {
      const response = await apiService.delete<RoleManagementResponse>(
        `/v3/role-management/${roleId}?tenantId=${tenantId}`
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete role')
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      throw error
    }
  },
}
