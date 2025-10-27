export interface CustomJobField {
  _id: string
  name: string
  field_type: string
  placeholder: string
  display_order: number
  section: string
  isP1: boolean
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
  description: string
  help_text: string
  createdAt: string
  updatedAt: string
  code: string
  options: any[]
  id: string
  requirement: {
    is_required: boolean
    required_message: string
    required_conditions: any
    is_custom_requirement: boolean
  }
  validation_rules: {
    min_length?: number
    max_length?: number
    pattern?: string
    pattern_message?: string
  }
}

export interface CustomJobFieldsResponse {
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
  data: CustomJobField[]
}
