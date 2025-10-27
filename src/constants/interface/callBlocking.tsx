export interface CallBlockingRule {
  _id: string
  phoneNumber?: string
  pattern?: string
  blockingType: 'number' | 'pattern'
  blockType: 'permanent' | 'temporary'
  reason: string
  sourceCodes: string[]
  status: 'active' | 'inactive'
  notes?: string
  tags: string[]
  blockedCount: number
  tenantId: {
    _id: string
    name: string
    username: string
  }
  byTenantId: {
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
  isCurrentlyActive: boolean
  id: string
  expiresAt?: string
}

export interface CallBlockingResponse {
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
  data: CallBlockingRule[]
}

export interface CallBlockingFilters {
  page?: number
  limit?: number
  sort?: string
  search?: string
  status?: string
  blockingType?: string
}

export interface CallBlockingStatistics {
  summary: {
    totalRules: number
    activeRules: number
    inactiveRules: number
    expiredRules: number
    totalBlockedCalls: number
  }
  byType: {
    pattern: number
    number: number
  }
  byReason: {
    spam: number
    telemarketing: number
    fraud: number
    wrong_number: number
    harassment?: number
    other?: number
  }
  byBlockType: {
    permanent: number
    temporary: number
  }
  topBlockedNumbers: Array<{
    _id: string
    phoneNumber?: string
    pattern?: string
    reason: string
    blockedCount: number
    isCurrentlyActive: boolean
    id: string
  }>
}

export interface CallBlockingStatisticsResponse {
  success: boolean
  message: string
  data: CallBlockingStatistics
}

export interface SpamProtectionRule {
  _id: string
  title: string
  protection: string
  greeting: string
  voiceId: string
  status: 'active' | 'failed' | 'pending'
  sourceSelectionType: 'all' | 'specific'
  sourceCodes: string[]
  usageCount: number
  tenantId: {
    _id: string
    name: string
    type: string
  }
  byTenantId: {
    _id: string
    name: string
    type: string
  }
  createdBy: {
    _id: string
    type: string
  }
  createdAt: string
  updatedAt: string
  code: string
  processedAt?: string
  processingError?: string
  voiceSettings?: {
    stability: number
    similarity_boost: number
    style: number
    use_speaker_boost: boolean
  }
}

export interface SpamProtectionResponse {
  success: boolean
  message: string
  data: {
    count: number
    pagination: {
      current: number
      limit: number
      total: number
      pages: number
    }
    data: SpamProtectionRule[]
  }
}

export interface SpamProtectionFilters {
  page?: number
  limit?: number
  sortBy?: string
}

export interface SpamProtectionStatistics {
  summary: {
    totalRules: number
    activeRules: number
    processingRules: number
    failedRules: number
    inactiveRules: number
    totalUsage: number
  }
  byProtection: {
    [key: string]: number
  }
  bySourceType: {
    specific: number
    all: number
  }
  mostUsedRules: Array<{
    _id: string
    title: string
    protection: string
    usageCount: number
    code: string
  }>
}

export interface SpamProtectionStatisticsResponse {
  success: boolean
  message: string
  data: SpamProtectionStatistics
}

export interface PhoneNumber {
  _id: string
  phoneNumber: string
  twilioPhoneNumberSid: string
  twilioAccountSid: string
  twimlAppId: string
  msgServiceId: string
  addressId: string | null
  numberType: 'local' | 'toll-free' | 'mobile'
  status: 'unassigned' | 'assigned' | 'active' | 'inactive'
  assignedSource?: string
  purchasedAt: string
  monthlyCharge: number
  country: string
  region: string | null
  locality: string | null
  postalCode: string | null
  friendlyName: string
  totalCallsReceived: number
  totalSmsReceived: number
  tenantId: {
    _id: string
    name: string
    type: string
  }
  byTenantId: {
    _id: string
    name: string
    type: string
  }
  createdBy: {
    _id: string
    type: string
  }
  createdAt: string
  updatedAt: string
  code: string
  formattedPhoneNumber: string
  isCurrentlyActive: boolean
  id: string
  capabilities: {
    voice: boolean
    sms: boolean
    mms: boolean
    fax: boolean
  }
}

export interface PhoneNumberResponse {
  success: boolean
  message: string
  data: {
    count: number
    pagination: {
      current: number
      limit: number
      total: number
      pages: number
    }
    data: PhoneNumber[]
  }
}

export interface PhoneNumberFilters {
  page?: number
  limit?: number
  sortBy?: string
  startDate?: string
  endDate?: string
}

export interface PhoneNumberStatistics {
  summary: {
    totalNumbers: number
    assignedNumbers: number
    unassignedNumbers: number
    activeNumbers: number
    totalCalls: number
    totalSms: number
  }
  byCountry: {
    [key: string]: number
  }
  byNumberType: {
    local: number
    'toll-free': number
    mobile: number
  }
  mostUsedNumbers: Array<{
    id: string
    phoneNumber: string
    friendlyName: string
    code: string
    totalCallsReceived: number
    totalSmsReceived: number
    lastUsedAt: string
    assignedSource: string
  }>
}

export interface PhoneNumberStatisticsResponse {
  success: boolean
  message: string
  data: PhoneNumberStatistics
}

export interface AvailablePhoneNumber {
  phoneNumber: string
  friendlyName: string
  locality: string | null
  region: string
  country: string
  postalCode: string | null
  areaCode: string
  numberType: 'local' | 'toll-free' | 'mobile'
  capabilities: {
    voice: boolean
    sms: boolean
    mms: boolean
    fax: boolean
  }
  monthlyCharge: number
  addressRequirements: string | null
}

export interface AvailablePhoneNumbersResponse {
  success: boolean
  message: string
  data: {
    availableNumbers: AvailablePhoneNumber[]
    count: number
    searchCriteria: {
      country: string
    }
  }
}
