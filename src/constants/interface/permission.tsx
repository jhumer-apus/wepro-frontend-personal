// Permission interface definitions
export interface Permission {
  module: string
  permissions: string[]
  scope: {
    type: string
    value: string
  }
}

// Permission scope types
export interface PermissionScope {
  type: string
  value: string
}

// Permission action types
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'manage'
