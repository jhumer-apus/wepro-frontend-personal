export interface Customer {
  id: string
  serialNumber?: number
  email?: string
  clientName?: string
  companyName?: string
  sourceTitle: string
  phoneNumber?: string
  addressUnit?: string
  location?: string
  jobHistory?: JobHistory[]
}


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

export interface Communication {
  id: string
  type: string
  date: string
  direction: string
  content: string
  channel: string
  duration?: string
  recordingUrl?: string
}

export interface CallRecording {
  id: string
  date: string
  duration: string
  type: string
  quality: string
  notes: string
  url: string
}

// Mock customer data
export const customersMockData: Customer[] = [
  {
    id: "cst-001",
    serialNumber: 1,
    clientName: "Juan Dela Cruz",
    companyName: "ABC Solutions Inc.",
    sourceTitle: "Website Inquiry",
    email: "juan.delacruz@abcsolutions.com",
    phoneNumber: "+63 912 345 6789",
    addressUnit: "Unit 502, ABC Tower",
    location: "Makati City, Philippines",
  },
  {
    id: "cst-002",
    serialNumber: 2,
    clientName: "Maria Santos",
    companyName: "BrightTech Corp",
    sourceTitle: "Facebook Ads",
    email: "maria.santos@brighttech.ph",
    phoneNumber: "+63 917 888 1234",
    addressUnit: "3rd Floor, BrightTech Building",
    location: "Quezon City, Philippines",
  },
  {
    id: "cst-003",
    serialNumber: 3,
    clientName: "James Lee",
    companyName: "Lee Trading",
    sourceTitle: "Referral",
    email: "james.lee@leetrading.com",
    phoneNumber: "+63 905 456 7890",
    addressUnit: "Warehouse 2, Industrial Park",
    location: "Cebu City, Philippines",
  },
  {
    id: "cst-004",
    serialNumber: 4,
    clientName: "Angela Cruz",
    companyName: "NextGen Marketing",
    sourceTitle: "Email Campaign",
    email: "angela.cruz@nextgen.ph",
    phoneNumber: "+63 926 234 5678",
    addressUnit: "Suite 1201, Skyline Tower",
    location: "BGC, Taguig City",
  },
  {
    id: "cst-005",
    serialNumber: 5,
    clientName: "Robert Tan",
    companyName: "Tan Holdings",
    sourceTitle: "Walk-in Client",
    email: "robert.tan@tanholdings.com",
    phoneNumber: "+63 998 765 4321",
    addressUnit: "Office 7B, Tan Plaza",
    location: "Davao City, Philippines",
  },
]


// Mock detailed customer data for profile view
export const mockCustomerDetails: Customer = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '(555) 123-4567',
  alternatePhone: '(555) 123-4568',
  address: '123 Oak Street, Los Angeles, CA 90210',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
  joinDate: '2024-01-15',
  totalJobs: 8,
  totalSpent: 4250,
  lastContact: '2 days ago',
  status: 'active',
  rating: 5,
  tags: ['VIP', 'Repeat Customer'],
  customerNotes: 'Prefers morning appointments. Has two dogs. Gate code: 1234',
  propertyType: 'Single Family Home',
  preferredTech: 'Mike Rodriguez',
  emergencyContact: 'John Johnson - (555) 123-4569',
  billingAddress: 'Same as service address',
  paymentMethod: 'Credit Card ending in 4532',

  jobHistory: [
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
  ],

  communications: [
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
  ],

  callRecordings: [
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
  ],

  notes: [
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
  ],
}
