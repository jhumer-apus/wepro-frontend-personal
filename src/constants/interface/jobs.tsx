export type Job = {
  id: string
  clientName: string
  jobCategory: string
  jobType: string
  distance: number
  revenue: number
  status: string
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
