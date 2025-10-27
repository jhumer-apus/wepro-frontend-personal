// Module interface based on API schema
export interface ModulePermission {
  _id: string
  moduleCode: string
  key: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface Module {
  _id: string
  name: string
  code: string
}

// Extended Module interface with additional properties
export interface ExtendedModule extends Module {
  isP1Module: boolean
  active: boolean
  createdAt: string
  updatedAt: string
  permissions: ModulePermission[]
}

// Module interface for packages (used in create.tsx and view.tsx)
export interface PackageModule {
  _id: string
  packageId: string
  moduleCode: string
  createdAt: string
  updatedAt: string
  module: {
    _id: string
    name: string
    isP1Module: boolean
    active: boolean
    code: string
  }
}

// Module interface used in package view
export interface Module {
  _id: string
  packageId: string
  moduleCode: string
  createdAt: string
  updatedAt: string
  module: {
    _id: string
    name: string
    isP1Module: boolean
    active: boolean
    code: string
  }
}
