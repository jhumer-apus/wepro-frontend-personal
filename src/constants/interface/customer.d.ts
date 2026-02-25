export interface CustomerT {
  id: string
  serialNumber: number

  clientName?: string
  companyName?: string
  email?: string
  phoneNumber?: string

  sourceTitle: string

  // Physical Address
  apartmentUnit?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string

  // Business / Service Location (separate field)
  location?: string

  billingAddress?: string
  paymentMethod?: string

  jobHistory?: JonHistoryT[]
  jobActivities?: JobActivityT[]
  communications?: CommunicationActivity[]
  callRecordings?: CallRecording[]
  notes?: NoteT[]

  totalSpent?: number
}
