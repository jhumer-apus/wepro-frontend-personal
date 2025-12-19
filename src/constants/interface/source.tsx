export interface Source {
  _id: string
  name: string
  status: string
  weproUsername: string
  email: string
  phoneNumber: string
  address: string
  addressLine2?: string
  city: string
  state: string
  zipCode: string
  country: string
  addressId: string
  lat: number
  lng: number
  franchiseCode: string
  industryId: string
  transactionPayFee: string
  phoneMasking: string
  callRouting: string
  tenantId: {
    _id: string
    name: string
    username: string
  }
  byTenantId: {
    _id: string
    name: string
    username: string
  }
  createdBy: {
    _id: string
    name: string
    username: string
  }
  createdAt: string
  updatedAt: string
  code: string
}

export interface SourcesResponse {
  success: boolean
  message: string
  count: number
  pagination: {
    current?: {
      page: number
      limit: number
    }
    page?: number
    limit?: number
    total: number
    pages: number
  }
  data: Source[]
}

export interface SourceFormData {
  name: string
  status: string
  weproUsername: string
  email: string
  phoneNumber: string
  address: string
  addressLine2?: string
  city: string
  state: string
  zipCode: string
  country: string
  addressId: string
  lat: number
  lng: number
  franchiseCode: string
  industryId: string
  transactionPayFee: string
  phoneMasking: string
  callRouting: string
  clientTenantId?: string
}
