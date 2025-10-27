// Service Package interfaces
export interface ServicePackageCreatedBy {
  _id: string
  name: string
  username: string
}

export interface ServicePackageFormattedPricing {
  chargeModel: string
  chargeAmount: number
  minimumMonthlySpend: number
  description: string
  chargeOver: number
}

export interface ServicePackage {
  _id: string
  title: string
  description: string
  chargeModel: string
  chargeAmount: number
  chargeOver: number
  minimumMonthlySpend: number
  features: string[]
  isActive: boolean
  isPublic: boolean
  createdByTenantId: string
  createdBy: ServicePackageCreatedBy
  createdAt: string
  updatedAt: string
  packageCode: string
  __v: number
  formattedPricing: ServicePackageFormattedPricing
  id: string
}

export interface ServicePackagesPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ServicePackagesResponse {
  success: boolean
  message: string
  data: {
    data: ServicePackage[]
    pagination: ServicePackagesPagination
  }
}
