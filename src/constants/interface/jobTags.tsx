export interface JobTag {
  _id: string
  name: string
  description?: string
  background_color?: string
  /** Alias for background_color used in dummy data */
  color?: string
  text_color: string
  category?: string
  is_active: boolean
  usage_count?: number
  created_by?: string
  tenant_id?: {
    _id: string
    name: string
    username: string
  }
  isP1?: boolean
  createdBy?: {
    _id: string
    name: string
    username: string
  }
  createdAt: string
  updatedAt: string
  code?: string
  __v?: number
  id?: string
}

export interface JobTagsResponse {
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
  data: JobTag[]
}
