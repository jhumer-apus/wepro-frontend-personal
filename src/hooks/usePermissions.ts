import { useSelector } from 'react-redux'
import { useCallback } from 'react'
import { RootState } from '../store'
import {
  isAllowed,
  hasModuleAccess,
  getModulePermissions,
  hasAllPermissions,
  getAllModules,
} from '../services/permissionService'

/**
 * Custom hook for permission checking
 * Automatically gets user data from Redux store
 */
export const usePermissions = () => {
  const userData = useSelector((state: RootState) => state.user.data)

  /**
   * Check if current user has a specific permission
   * @param moduleCode - The module code to check
   * @param key - The permission key to check
   * @returns true if the permission exists, false otherwise
   */
  const checkPermission = useCallback(
    (moduleCode: string, key: string): boolean => {
      return isAllowed(userData, moduleCode, key)
    },
    [userData]
  )

  /**
   * Check if current user has access to a specific module
   * @param moduleCode - The module code to check
   * @returns true if the user has any permission for the module, false otherwise
   */
  const checkModuleAccess = useCallback(
    (moduleCode: string): boolean => {
      return hasModuleAccess(userData, moduleCode)
    },
    [userData]
  )

  /**
   * Get all permissions for a specific module for current user
   * @param moduleCode - The module code to get permissions for
   * @returns Array of permission keys for the module
   */
  const getPermissions = useCallback(
    (moduleCode: string): string[] => {
      return getModulePermissions(userData, moduleCode)
    },
    [userData]
  )

  /**
   * Check if current user has multiple specific permissions for a module
   * @param moduleCode - The module code to check
   * @param keys - Array of permission keys to check
   * @returns true if the user has all the specified permissions, false otherwise
   */
  const checkAllPermissions = useCallback(
    (moduleCode: string, keys: string[]): boolean => {
      return hasAllPermissions(userData, moduleCode, keys)
    },
    [userData]
  )

  /**
   * Get the current user's type
   * @returns The user type string or null if no user data
   */
  const getUserType = useCallback((): string | null => {
    return userData?.type || null
  }, [userData])

  const isSuperAdmin = useCallback(
    (moduleCode: string): boolean => {
      if (userData?.type === 'P1') {
        return true
      }
      if (userData?.type === 'P5') {
        return getAllModules(userData).find(val => val.code === moduleCode)
          ? true
          : false
      }

      return false
    },
    [userData]
  )

  return {
    checkPermission,
    checkModuleAccess,
    getPermissions,
    checkAllPermissions,
    getUserType,
    isSuperAdmin,
    userData,
  }
}
