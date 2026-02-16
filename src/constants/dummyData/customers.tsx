import { CustomerT } from "@/src/constants/interface/customer"
import { JobHistoryT } from "../interface/job"

export interface Notes {
  id: string
  date: string
  author: string
  type: string
  content: string
}

export interface JobHistory {
  id: string
  date: string
  type: string
  status: string
  amount: number
  tech: string
  rating: number
  notes: string
  description?: string
}


export const jobActivitiesMockData = [
  {
    id: "act-001",
    type: "payment_added",
    title: "Job Payment Added",
    amount: 3.09,
    cost: 3.0,
    method: "Cash",
    paymentStatus: "Paid",
    jobId: "Job-2058",
    addedBy: "Dev Company",
    createdAt: "2026-02-06T06:47:00",
  },
  {
    id: "act-002",
    type: "payment_updated",
    title: "Job Payment Updated",
    amount: 3.09,
    cost: 4.0,
    method: "Cash",
    paymentStatus: "Paid",
    jobId: "Job-2058",
    addedBy: "Dev Company",
    createdAt: "2026-02-06T06:44:00",
  },
  {
    id: "act-003",
    type: "payment_added",
    title: "Job Payment Added",
    amount: 3.09,
    cost: 4.0,
    method: "Cash",
    paymentStatus: "Paid",
    jobId: "Job-2058",
    addedBy: "Dev Company",
    createdAt: "2026-02-06T06:44:00",
  },
  {
    id: "act-004",
    type: "payment_updated",
    title: "Job Payment Updated",
    amount: 3.09,
    cost: 4.0,
    method: "Cash",
    paymentStatus: "Paid",
    jobId: "Job-2058",
    addedBy: "Dev Company",
    createdAt: "2026-02-06T06:44:00",
  },
  {
    id: "act-005",
    type: "payment_added",
    title: "Job Payment Added",
    amount: 3.09,
    cost: 4.0,
    method: "Cash",
    paymentStatus: "Paid",
    jobId: "Job-2058",
    addedBy: "Dev Company",
    createdAt: "2026-02-06T06:44:00",
  },
]

export const jobHistoryMockData: JobHistoryT[] = [
  {
    id: 'JOB-2024-001',
    date: '2024-03-15',
    type: 'Plumbing Repair',
    status: 'completed',
    amount: 350,
    tech: 'Mike Rodriguez',
    description: 'Fixed kitchen sink leak',
    rating: 5,
    notes: 'Customer very satisfied with quick service',
  },
  {
    id: 'JOB-2024-002',
    date: '2024-03-10',
    type: 'HVAC Maintenance',
    status: 'completed',
    amount: 200,
    tech: 'Jennifer Lee',
    description: 'Annual AC tune-up and filter replacement',
    rating: 5,
    notes: 'Recommended filter replacement in 3 months',
  },
  {
    id: 'JOB-2024-003',
    date: '2024-02-28',
    type: 'Electrical Work',
    status: 'completed',
    amount: 450,
    tech: 'Alex Thompson',
    description: 'Installed new ceiling fan in master bedroom',
    rating: 4,
    notes: 'Minor delay due to permit requirements',
  },
]

export const callRecordingsMockData = [
  {
    id: '1',
    date: '2024-03-15 2:15 PM',
    duration: '5:23',
    type: 'Follow-up Call',
    quality: 'HD',
    notes: 'Customer satisfaction call',
    url: '#',
  },
  {
    id: '2',
    date: '2024-03-13 11:30 AM',
    duration: '8:45',
    type: 'Service Request',
    quality: 'HD',
    notes: 'Initial plumbing issue report',
    url: '#',
  },
]

export const communicationsMockData = [
  {
    id: '1',
    type: 'message',
    date: '2024-03-16 10:30 AM',
    direction: 'incoming',
    content:
      'Thanks for the quick service! When can you come back for the follow-up?',
    channel: 'WhatsApp',
  },
  {
    id: '2',
    type: 'call',
    date: '2024-03-15 2:15 PM',
    direction: 'outgoing',
    duration: '5:23',
    content: 'Follow-up call regarding plumbing repair satisfaction',
    channel: 'Phone',
    recordingUrl: '#',
  },
  {
    id: '3',
    type: 'email',
    date: '2024-03-14 9:00 AM',
    direction: 'outgoing',
    content: "Appointment confirmation for tomorrow's plumbing repair",
    channel: 'Email',
  },
  {
    id: '4',
    type: 'message',
    date: '2024-03-13 4:45 PM',
    direction: 'incoming',
    content:
      'Hi! I have a leak under my kitchen sink. Can someone come take a look?',
    channel: 'SMS',
  },
]

export const notesMockData = [
  {
    id: '1',
    date: '2024-03-15',
    author: 'Mike Rodriguez',
    type: 'Service Note',
    content:
      'Customer has two dogs that are friendly but may bark during service. Gate code is 1234. Prefers morning appointments between 8-11 AM.',
  },
  {
    id: '2',
    date: '2024-03-10',
    author: 'Jennifer Lee',
    type: 'Maintenance Note',
    content:
      "HVAC system is well-maintained. Recommended annual service. Customer agreed to schedule next year's maintenance.",
  },
  {
    id: '3',
    date: '2024-02-28',
    author: 'Alex Thompson',
    type: 'Installation Note',
    content:
      'Electrical work completed successfully. Customer was happy with the ceiling fan installation. Minor delay due to permit requirements but explained to customer.',
  },
]

export const customersMockData: CustomerT[] = [
  {
    id: "cst-001",
    serialNumber: 1,
    clientName: "Juan Dela Cruz",
    companyName: "ABC Solutions Inc.",
    sourceTitle: "Website Inquiry",
    email: "juan.delacruz@abcsolutions.com",
    phoneNumber: "+63 912 345 6789",

    apartmentUnit: "Unit 502, ABC Tower",
    city: "Makati City",
    state: "Metro Manila",
    country: "Philippines",
    zipCode: "1226",

    location: "Metro Manila - Makati Service Area",

    totalSpent: 1250.75,
    billingAddress: "",
    paymentMethod: "Visa ending in 1234",

    jobHistory: jobHistoryMockData,
    jobActivities: jobActivitiesMockData,
    communications: communicationsMockData,
    callRecordings: callRecordingsMockData,
    notes: notesMockData,
  },
  {
    id: "cst-002",
    serialNumber: 2,
    clientName: "Maria Santos",
    companyName: "BrightTech Corp",
    sourceTitle: "Facebook Ads",
    email: "maria.santos@brighttech.ph",
    phoneNumber: "+63 917 888 1234",

    apartmentUnit: "3rd Floor, BrightTech Building",
    city: "Quezon City",
    state: "Metro Manila",
    country: "Philippines",
    zipCode: "1105",

    location: "Metro Manila - QC Zone",

    totalSpent: 980.5,
    billingAddress: "",
    paymentMethod: "Mastercard ending in 5678",

    jobHistory: jobHistoryMockData,
    jobActivities: jobActivitiesMockData,
    communications: communicationsMockData,
    callRecordings: callRecordingsMockData,
    notes: notesMockData,
  },
  {
    id: "cst-003",
    serialNumber: 3,
    clientName: "James Lee",
    companyName: "Lee Trading",
    sourceTitle: "Referral",
    email: "james.lee@leetrading.com",
    phoneNumber: "+63 905 456 7890",

    apartmentUnit: "Warehouse 2, Industrial Park",
    city: "Cebu City",
    state: "Cebu",
    country: "Philippines",
    zipCode: "6000",

    location: "Cebu Main Service Area",

    totalSpent: 1500.0,
    billingAddress: "",
    paymentMethod: "PayPal (ending in 1234)",

    jobHistory: jobHistoryMockData,
    jobActivities: jobActivitiesMockData,
    communications: communicationsMockData,
    callRecordings: callRecordingsMockData,
    notes: notesMockData,
  },
  {
    id: "cst-004",
    serialNumber: 4,
    clientName: "Angela Cruz",
    companyName: "NextGen Marketing",
    sourceTitle: "Email Campaign",
    email: "angela.cruz@nextgen.ph",
    phoneNumber: "+63 926 234 5678",

    apartmentUnit: "Suite 1201, Skyline Tower",
    city: "Taguig City",
    state: "Metro Manila",
    country: "Philippines",
    zipCode: "1634",

    location: "BGC Business District",

    totalSpent: 750.25,
    billingAddress: "",
    paymentMethod: "Visa ending in 4321",

    jobHistory: jobHistoryMockData,
    jobActivities: jobActivitiesMockData,
    communications: communicationsMockData,
    callRecordings: callRecordingsMockData,
  },
  {
    id: "cst-005",
    serialNumber: 5,
    clientName: "Robert Tan",
    companyName: "Tan Holdings",
    sourceTitle: "Walk-in Client",
    email: "robert.tan@tanholdings.com",
    phoneNumber: "+63 998 765 4321",

    apartmentUnit: "Office 7B, Tan Plaza",
    city: "Davao City",
    state: "Davao del Sur",
    country: "Philippines",
    zipCode: "8000",

    location: "Davao South Service Area",

    totalSpent: 500.0,
    billingAddress: "",
    paymentMethod: "Mastercard ending in 8765",

    jobHistory: jobHistoryMockData,
    jobActivities: jobActivitiesMockData,
    communications: communicationsMockData,
    callRecordings: callRecordingsMockData,
    notes: notesMockData,
  },
]

