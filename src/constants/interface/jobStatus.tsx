export interface JobStatus {
  _id: string
  name: string
  parent_code: string | null
  isP1: boolean
  background_color: string
  text_color: string
  tenant_id: {
    _id: string
    name: string
    username: string
  }
  createdBy: {
    _id: string
    name: string
    username: string
  }
  level: number
  description: string
  createdAt: string
  updatedAt: string
  code: string
  visibility: {
    show_technicians: boolean
    show_dispatch: boolean
    is_custom: boolean
  }
}

export interface JobStatusesResponse {
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
  data: JobStatus[]
}
