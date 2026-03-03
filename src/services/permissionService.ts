import { UserData } from '../store/slices/userSlice'

/**
 * Check if a user has a specific permission
 * @param userData - The user data object containing permissions
 * @param moduleCode - The module code to check
 * @param key - The permission key to check (e.g., 'create', 'view', 'edit', 'delete')
 * @returns true if the permission exists, false otherwise
 */
export const isAllowed = (
  userData: UserData | null,
  moduleCode: string,
  key: string
): boolean => {
  if (
    !userData ||
    !userData.permissions ||
    !Array.isArray(userData.permissions)
  ) {
    return false
  }

  return userData.permissions.some(
    permission => permission.moduleCode === moduleCode && permission.key === key
  )
}

/**
 * Check if a user has any permission for a specific module
 * @param userData - The user data object containing permissions
 * @param moduleCode - The module code to check
 * @returns true if the user has any permission for the module, false otherwise
 */
export const hasModuleAccess = (
  userData: UserData | null,
  moduleCode: string
): boolean => {
  if (
    !userData ||
    !userData.permissions ||
    !Array.isArray(userData.permissions)
  ) {
    return false
  }

  return userData.permissions.some(
    permission => permission.moduleCode === moduleCode
  )
}

/**
 * Get all permissions for a specific module
 * @param userData - The user data object containing permissions
 * @param moduleCode - The module code to get permissions for
 * @returns Array of permission keys for the module
 */
export const getModulePermissions = (
  userData: UserData | null,
  moduleCode: string
): string[] => {
  if (
    !userData ||
    !userData.permissions ||
    !Array.isArray(userData.permissions)
  ) {
    return []
  }

  return userData.permissions
    .filter(permission => permission.moduleCode === moduleCode)
    .map(permission => permission.key)
}

/**
 * Check if a user has multiple specific permissions for a module
 * @param userData - The user data object containing permissions
 * @param moduleCode - The module code to check
 * @param keys - Array of permission keys to check
 * @returns true if the user has all the specified permissions, false otherwise
 */
export const hasAllPermissions = (
  userData: UserData | null,
  moduleCode: string,
  keys: string[]
): boolean => {
  if (
    !userData ||
    !userData.permissions ||
    !Array.isArray(userData.permissions)
  ) {
    return false
  }

  return keys.every(key =>
    userData.permissions.some(
      permission =>
        permission.moduleCode === moduleCode && permission.key === key
    )
  )
}

export const getAllModules = (
  userData: UserData | null
): Array<{ code: string }> => {
  if (!userData || !userData.modules || !Array.isArray(userData.modules)) {
    return []
  }

  return userData.modules
}
