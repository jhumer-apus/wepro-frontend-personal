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
  jobHistory?: JobHistory[]
}
