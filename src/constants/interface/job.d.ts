export interface JobActivityT {
  id: string
  type: "payment_added" | "status_update" | "note"
  title: string
  description: string
  amount?: number
  cost?: number
  method?: "Cash" | "Card" | "Bank"
  status?: "Paid" | "Pending" | "Failed"
  jobId: string
  addedBy: string
  createdAt: string
}

export type JobHistoryT = {
  id: string
  date: string
  type: string
  status: string
  amount: number
  tech: string
  description: string
  rating: number
  notes: string
}
