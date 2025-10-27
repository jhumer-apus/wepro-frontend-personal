export interface Franchise {
  _id: string
  name: string
  code: string
  ownerName: string
  status: string
  weproUsername: string
  isPrimary: boolean
  email: string
  phoneNumber: string
  address: string
  addressLine2: string
  city: string
  state: string
  zipCode: string
  country: string
  addressId: string
  lat: number
  lng: number
  createdBy: {
    _id: string
    name: string
    username: string
  }
  tenantId: {
    _id: string
    name: string
    username: string
  }
  createdAt: string
  updatedAt: string
}

export interface FranchisesResponse {
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
  data: Franchise[]
}
