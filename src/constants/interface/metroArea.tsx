export interface MetroArea {
  _id: string
  name: string
  zipcode: string
  radius: number
  radius_unit: string
  addressId: string
  latitude: number
  longitude: number
  text_color: string
  background_color: string
  is_advance_area_select: boolean
  polygon_coordinates?: Array<{
    lat: number
    lng: number
    _id?: string
  }>
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
  createdAt: string
  updatedAt: string
  code: string
}

export interface MetroAreasResponse {
  success: boolean
  message: string
  count: number
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  data: MetroArea[]
}
