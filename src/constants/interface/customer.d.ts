import { CommunicationActivity } from "./communication"
import { CallRecording } from "./callRecording"
import { JobActivityT } from "./jobActivity"
import { JobHistoryT } from "./job"
import { NoteT } from "./notes"

export interface CustomerT {
  id: string
  serialNumber?: number
  clientName?: string
  companyName?: string
  email?: string
  phoneNumber?: string
  addressUnit?: string
  location?: string
  sourceTitle: string
  jobHistory?: JonHistoryT[]
  jobActivities?: JobActivityT[]
  communications?: CommunicationActivity[]
  callRecordings?: CallRecording[]
  billingAddress?: string
  totalSpent?: number
  paymentMethod?: string
  notes?: NoteT[]
  status: 'active' | 'inactive'
}
