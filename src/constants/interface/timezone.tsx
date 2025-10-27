// Timezone interface definitions
export interface Timezone {
  _id: string
  location: string
  value: string
  name: string
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

// Simple Timezone interface for basic timezone data
export interface SimpleTimezone {
  _id: string
  value: string
  name: string
}

// Simple Timezone interface for basic timezone data (used in sourceProviders)
export interface SimpleTimezone {
  _id: string
  location: string
  value: string
  name: string
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface TimezoneResponse {
  success: boolean
  data: Timezone[]
  message?: string
}
