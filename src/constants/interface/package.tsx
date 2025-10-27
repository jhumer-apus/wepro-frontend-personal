// User interfaces used in package
export interface CreatedBy {
  _id: string
  name: string
  username: string
}

export interface TenantId {
  _id: string
  name: string
  type: string
  username: string
}

export interface Package {
  _id: string
  name: string
  type: 'P2' | 'P3' | 'P4'
  interval: 'Yearly' | 'Monthly' | 'Weekly'
  price: number
  limits: {
    users: number
    numbers: number
    minutes: number
    sms: number
    whatsappSms: number
    emails: number
  }
  additionalPricing: {
    userMonthly: number
    numberMonthly: number
    perMinute: number
    perSms: number
    perWhatsappSms: number
    perEmail: number
  }
  createdBy: CreatedBy
  tenantId: TenantId
  isPublic: boolean
  createdAt: string
  updatedAt: string
  modules: import('./module').Module[]
}

// Package interface for creation/editing (used in create.tsx)
export interface CreatePackage {
  _id: string
  name: string
  type: 'P2' | 'P3' | 'P4'
  interval: 'Yearly' | 'Monthly' | 'Weekly'
  price: number
  modules: {
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
  }[]
  limits: {
    users: number
    numbers: number
    minutes: number
    sms: number
    whatsappSms: number
    emails: number
  }
  additionalPricing: {
    userMonthly: number
    numberMonthly: number
    perMinute: number
    perSms: number
    perWhatsappSms: number
    perEmail: number
  }
  createdBy: string
  createdAt: Date
}

// Simple Package interface for basic package data (used in sourceProviders)
export interface SimplePackage {
  _id: string
  name: string
  type: string
  price: number
  tenantId: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface PackagesResponse {
  success: boolean
  message: string
  count: number
  pagination: {
    current: {
      page: number
      limit: number
    }
    total: number
    pages: number
  }
  data: Package[]
}
