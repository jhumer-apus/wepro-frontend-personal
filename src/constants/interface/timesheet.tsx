// Interfaces for timesheet data
export interface TimesheetUser {
  _id: string
  name: string
  type: string
  username: string
  passwordHash: string
  roleId?: {
    _id: string
    name: string
  }
  packageId?: {
    _id: string
    name: string
    type: string
  }
  timezoneId: string
  createdAt: string
  updatedAt: string
  status: string
}

export interface TimesheetFlags {
  autoClockedOut: boolean
  suspectedSpoof: boolean
}

export interface EditHistoryChange {
  old: any
  new: any
}

export interface EditHistoryEntry {
  _id: string
  by: string
  at: string
  changes: {
    clockInAt?: EditHistoryChange
    clockOutAt?: EditHistoryChange
    notes?: EditHistoryChange
    flags?: EditHistoryChange
    durationMs?: EditHistoryChange
  }
}

export interface Timesheet {
  flags: TimesheetFlags
  _id: string
  tenantId: string
  userId: TimesheetUser
  clockInAt: string
  clockOutAt: string | null
  durationMs: number
  source: string
  ip: string
  userAgent: string
  notes: string
  edited: boolean
  editHistory: EditHistoryEntry[]
  createdAt: string
  updatedAt: string
  __v: number
  geo?: {
    lat: number
    lng: number
    accuracy: number
  }
}

export interface TimesheetPagination {
  current: {
    page: number
    limit: number
  }
  total: number
  pages: number
}

// Admin endpoint response structure (when view_all_timesheets permission is true)
export interface AdminTimesheetApiResponse {
  success: boolean
  message: string
  count: number
  pagination: TimesheetPagination
  data: Timesheet[]
}

// Regular endpoint response structure (when view_all_timesheets permission is false)
export interface RegularTimesheetApiResponse {
  success: boolean
  message: string
  data: {
    timesheets: Timesheet[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

// Union type for both response structures
export type TimesheetApiResponse =
  | AdminTimesheetApiResponse
  | RegularTimesheetApiResponse

export interface ActiveUser {
  _id: string
  tenantId: string
  userId: {
    _id: string
    name: string
  }
  __v: number
  activeTimesheetId: {
    flags: {
      autoClockedOut: boolean
      suspectedSpoof: boolean
    }
    _id: string
    tenantId: string
    userId: string
    clockInAt: string
    clockOutAt: string | null
    durationMs: number
    source: string
    ip: string
    userAgent: string
    notes: string
    edited: boolean
    editHistory: EditHistoryEntry[]
    createdAt: string
    updatedAt: string
    __v: number
    geo?: {
      lat: number
      lng: number
      accuracy: number
    }
  }
  createdAt: string
  since: string
  status: string
  updatedAt: string
  durationSinceClockedIn: number
  durationSinceClockedInHours: number
}

export interface ActiveUsersApiResponse {
  success: boolean
  message: string
  data: {
    totalActive: number
    users: ActiveUser[]
  }
}
