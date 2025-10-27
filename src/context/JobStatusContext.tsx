import React, { createContext, useContext, useState } from 'react'

export interface JobStatus {
  id: number
  name: string
  color: string
  parent: number | null
  showApp: boolean
  showLeads: boolean
  showDispatch: boolean
}

const initialStatuses: JobStatus[] = [
  {
    id: 1,
    name: 'Pending',
    color: '#8B5CF6',
    parent: null,
    showApp: true,
    showLeads: true,
    showDispatch: true,
  },
  {
    id: 2,
    name: 'Rejected',
    color: '#2563EB',
    parent: null,
    showApp: true,
    showLeads: true,
    showDispatch: true,
  },
  {
    id: 3,
    name: 'No Answer',
    color: '#F59E42',
    parent: null,
    showApp: true,
    showLeads: true,
    showDispatch: true,
  },
  {
    id: 4,
    name: 'Canceled',
    color: '#EF4444',
    parent: null,
    showApp: true,
    showLeads: true,
    showDispatch: true,
  },
  {
    id: 5,
    name: 'Done',
    color: '#22C55E',
    parent: null,
    showApp: true,
    showLeads: true,
    showDispatch: true,
  },
  {
    id: 6,
    name: 'In Progress',
    color: '#3B82F6',
    parent: null,
    showApp: true,
    showLeads: true,
    showDispatch: true,
  },
  {
    id: 7,
    name: 'Submitted',
    color: '#FBBF24',
    parent: null,
    showApp: true,
    showLeads: true,
    showDispatch: true,
  },
  {
    id: 8,
    name: 'Appointments',
    color: '#22C55E',
    parent: null,
    showApp: true,
    showLeads: true,
    showDispatch: true,
  },
  {
    id: 9,
    name: 'Not Confirmed',
    color: '#EF4444',
    parent: null,
    showApp: true,
    showLeads: true,
    showDispatch: true,
  },
  {
    id: 10,
    name: 'Confirmed',
    color: '#22C55E',
    parent: null,
    showApp: true,
    showLeads: true,
    showDispatch: true,
  },
  {
    id: 11,
    name: 'Follow Up',
    color: '#FBBF24',
    parent: null,
    showApp: true,
    showLeads: true,
    showDispatch: true,
  },
]

interface JobStatusContextType {
  jobStatuses: JobStatus[]
  setJobStatuses: React.Dispatch<React.SetStateAction<JobStatus[]>>
}

const JobStatusContext = createContext<JobStatusContextType | undefined>(
  undefined
)

export const JobStatusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [jobStatuses, setJobStatuses] = useState<JobStatus[]>(initialStatuses)
  return (
    <JobStatusContext.Provider value={{ jobStatuses, setJobStatuses }}>
      {children}
    </JobStatusContext.Provider>
  )
}

export function useJobStatuses() {
  const ctx = useContext(JobStatusContext)
  if (!ctx)
    throw new Error('useJobStatuses must be used within a JobStatusProvider')
  return ctx
}
