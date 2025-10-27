export interface Industry {
  _id: string
  name: string
  isP1: boolean
  tenant_id: {
    _id: string
  }
  createdBy: {
    _id: string
  }
  active: boolean
  createdAt: string
  updatedAt: string
  code: string
  parent_code?: string
  description?: string
  __v: number
}

export interface IndustriesResponse {
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
    next: {
      page: number
      limit: number
    }
  }
  data: Industry[]
}
