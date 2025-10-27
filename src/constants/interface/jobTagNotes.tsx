export interface JobTagNote {
  _id: string
  title: string
  content: string
  job_tag_code: string
  display_order: number
  tenant_id: {
    _id: string
    name: string
    username: string
  }
  isP1: boolean
  createdBy: {
    _id: string
    name: string
    username: string
  }
  createdAt: string
  updatedAt: string
  code: string
  __v: number
  id: string
}

export interface JobTagNotesResponse {
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
  data: JobTagNote[]
}
