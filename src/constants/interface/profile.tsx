export interface Permission {
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
  isP1Module: boolean
  active: boolean
  createdAt: string
  updatedAt: string
  code: string
  permissions: Permission[]
}

export interface Timezone {
  _id: string
  value: string
  name: string
}

export interface Profile {
  _id: string
  name: string
  type: string
  username: string
  passwordHash: string
  timezoneId: Timezone
  createdAt: string
  updatedAt: string
  tenantId: string
  modules: Module[]
  permissions: Permission[]
}

export interface ProfileApiResponse {
  success: boolean
  message: string
  data: Profile
}
