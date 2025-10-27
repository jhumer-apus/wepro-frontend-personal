export interface Company {
  _id: string
  name: string
  type: 'Tenant' | 'Customer' | 'Partner'
  username: string
  passwordHash: string
  packageId: {
    _id: string
    name: string
    type: string
    price: number
    tenantId: string
    isPublic: boolean
  }
  timezoneId: {
    _id: string
    value: string
    name: string
  }
  createdAt: string
  updatedAt: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  website?: string
  description?: string
}

export interface CompaniesResponse {
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
  data: Company[]
}
