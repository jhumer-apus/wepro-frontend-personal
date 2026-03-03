export type Job = {
  id: string
  clientName: string
  companyName?: string
  phoneNumber?: string
  email?: string
  location?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  jobCategory: string
  jobType: string
  jobDescription?: string
  distance: number
  revenue: number
  status: string
  priority?: string
  assignedTechnician?: string
  technicianAvatar?: string
  startDate?: string
  startTime?: string
  estimatedDuration?: string
  actualStartTime?: string
  estimatedEndTime?: string
  actualEndTime?: string
  source?: string
  jobTags?: string[]
  noteTags?: string[]
  customerRating?: number
  lastUpdated?: string
  createdAt?: string
  updatedAt?: string
  photos?: string[]
  notes?: string
  partsNeeded?: string[]
  specialInstructions?: string
}

export type JobStatus =
  | 'Pending'
  | 'Rejected'
  | 'No Answer'
  | 'Canceled'
  | 'Done'
  | 'In Progress'
  | 'Submitted'
  | 'Appointments'
  | 'Not Confirmed'
  | 'Confirmed'
  | 'Follow Up'
  | 'Scheduled'
  | 'Completed'
