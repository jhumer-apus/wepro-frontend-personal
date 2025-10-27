export interface JobCategory {
  id: number
  name: string
  description: string
  color: string
  isActive: boolean
  jobTypes: JobType[]
}

export interface JobType {
  id: number
  name: string
  description: string
  estimatedDuration: number
  basePrice: number
  subTypes: SubType[]
}

export interface SubType {
  id: number
  name: string
  basePrice: number
  avgDuration: number
  specifications?: string
  subSubTypes?: SubType[]
}

export interface Industries {
  id: string
  name: string
  icon: string
  description: string
}

export interface TeamMember {
  type?: 'technician'
  id?: number
  username: string
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  memberType: string
  phoneMasking: boolean
  callRecording: boolean
  maskingCallerId: string
  noAnswerAlerts: boolean
  password?: string
  appUser: boolean
  status: string
  franchise: string
  payType: string
  payFee: string
  creditCardFee: string
  venmoFee: string
  additionalFee: string
  metroAreas: string[]
  color: string
  specialties?: string[]
  rating?: number
  completedJobs?: number
  joinDate?: string | Date
  customCommissions?: CustomCommission[]
  jobCapabilities?: JobCapabilities
  jobResponderRules?: JobResponderRule[]
  role?: string
  dialerEnabled?: boolean
  dialingCall?: string
}

export interface CustomCommission {
  id: number
  commissionFor: string
  sourceProvider: string
  jobCategory: string
  jobType: string
  type: string
  commissionType: string
  fees: string
}

export interface JobCapabilities {
  categories: number[]
  jobTypes: number[]
  subTypes: number[]
  subSubTypes: number[]
}

export interface JobResponderRule {
  id: number
  reminderAfterMinutes: number
  alertType: string
  smsReminder: boolean
  sendTo: string
  externalNumbers?: string[]
  isActive: boolean
  voiceTemplate?: string
}

export interface Permission {
  module: string
  permissions: string[]
  scope: {
    type: string
    value: string
  }
}

export interface Role {
  name: string
  permissions: Permission[]
}

export interface JobCapabilities {
  categories: number[]
  jobTypes: number[]
  subTypes: number[]
  subSubTypes: number[]
}

export interface Automotive {
  [key: string]: Record<string, string[]>
}

export interface ResponderForm {
  id?: number
  reminderAfterMinutes: number
  alertType: string
  smsReminder: boolean
  sendTo: string
  externalNumbers: string[]
  smsTemplate: string
  voiceTemplate: string
  isActive: boolean
}

export const industries: Industries[] = [
  {
    id: 'locksmith',
    name: 'Locksmith',
    icon: '🔐',
    description: 'Lock and key services',
  },
  {
    id: 'garage-door',
    name: 'Garage Door',
    icon: '🚪',
    description: 'Garage door repair and installation',
  },
  {
    id: 'hvac',
    name: 'HVAC',
    icon: '❄️',
    description: 'Heating, ventilation, and air conditioning',
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: '🔧',
    description: 'Water and drainage systems',
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: '⚡',
    description: 'Electrical systems and wiring',
  },
]

export const jobCategoriesByIndustry: Record<string, JobCategory[]> = {
  locksmith: [
    {
      id: 1,
      name: 'Emergency Services',
      description: 'Urgent lockout and emergency situations',
      color: '#EF4444',
      isActive: true,
      jobTypes: [
        {
          id: 1,
          name: 'Lockout Service',
          description: 'Customer locked out of property',
          estimatedDuration: 30,
          basePrice: 75,
          subTypes: [
            {
              id: 1,
              name: 'Residential Lockout',
              basePrice: 75,
              avgDuration: 25,
              subSubTypes: [
                {
                  id: 1,
                  name: 'House Front Door',
                  basePrice: 75,
                  avgDuration: 25,
                  specifications: 'Standard residential entry',
                },
                {
                  id: 2,
                  name: 'Apartment Unit',
                  basePrice: 70,
                  avgDuration: 20,
                  specifications: 'Multi-unit building access',
                },
                {
                  id: 3,
                  name: 'Back Door/Patio',
                  basePrice: 80,
                  avgDuration: 30,
                  specifications: 'Rear entry lockout',
                },
              ],
            },
            {
              id: 2,
              name: 'Commercial Lockout',
              basePrice: 100,
              avgDuration: 35,
              subSubTypes: [
                {
                  id: 4,
                  name: 'Office Building',
                  basePrice: 100,
                  avgDuration: 35,
                  specifications: 'Business hours lockout',
                },
                {
                  id: 5,
                  name: 'Retail Store',
                  basePrice: 120,
                  avgDuration: 40,
                  specifications: 'After hours emergency',
                },
                {
                  id: 6,
                  name: 'Warehouse',
                  basePrice: 150,
                  avgDuration: 50,
                  specifications: 'Industrial facility access',
                },
              ],
            },
            {
              id: 3,
              name: 'Automotive Lockout',
              basePrice: 85,
              avgDuration: 20,
              subSubTypes: [
                {
                  id: 7,
                  name: 'Mercedes SL (2014)',
                  basePrice: 120,
                  avgDuration: 30,
                  specifications: 'Mercedes SL class 2014 model year',
                },
                {
                  id: 8,
                  name: 'Mercedes SLS (2015)',
                  basePrice: 150,
                  avgDuration: 45,
                  specifications: 'Mercedes SLS class 2015 model year',
                },
                {
                  id: 9,
                  name: 'Toyota Camry (2018-2020)',
                  basePrice: 75,
                  avgDuration: 15,
                  specifications: 'Toyota Camry 2018-2020 models',
                },
                {
                  id: 10,
                  name: 'Ford F-150 (2019-2023)',
                  basePrice: 90,
                  avgDuration: 25,
                  specifications: 'Ford F-150 2019-2023 models',
                },
              ],
            },
          ],
        },
        {
          id: 2,
          name: 'Emergency Lock Repair',
          description: 'Broken or damaged lock repair',
          estimatedDuration: 45,
          basePrice: 125,
          subTypes: [
            {
              id: 4,
              name: 'Door Lock Repair',
              basePrice: 125,
              avgDuration: 45,
              subSubTypes: [
                {
                  id: 11,
                  name: 'Kwikset SmartCode 913',
                  basePrice: 125,
                  avgDuration: 45,
                  specifications: 'Kwikset electronic deadbolt model 913',
                },
                {
                  id: 12,
                  name: 'Schlage BE365',
                  basePrice: 140,
                  avgDuration: 50,
                  specifications: 'Schlage keypad deadbolt BE365 series',
                },
              ],
            },
            {
              id: 5,
              name: 'Deadbolt Repair',
              basePrice: 150,
              avgDuration: 50,
              subSubTypes: [
                {
                  id: 13,
                  name: 'Grade 1 Commercial',
                  basePrice: 180,
                  avgDuration: 60,
                  specifications: 'High-security commercial grade deadbolt',
                },
                {
                  id: 14,
                  name: 'Standard Residential',
                  basePrice: 130,
                  avgDuration: 40,
                  specifications: 'Standard home deadbolt repair',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Installation Services',
      description: 'New lock and security system installations',
      color: '#10B981',
      isActive: true,
      jobTypes: [
        {
          id: 3,
          name: 'Lock Installation',
          description: 'Install new locks and hardware',
          estimatedDuration: 60,
          basePrice: 150,
          subTypes: [
            {
              id: 6,
              name: 'Residential Lock Install',
              basePrice: 150,
              avgDuration: 60,
              subSubTypes: [
                {
                  id: 15,
                  name: 'Standard Deadbolt',
                  basePrice: 150,
                  avgDuration: 60,
                  specifications: 'Basic residential deadbolt installation',
                },
                {
                  id: 16,
                  name: 'Smart Lock Installation',
                  basePrice: 200,
                  avgDuration: 90,
                  specifications: 'Electronic/smart lock setup',
                },
              ],
            },
            {
              id: 7,
              name: 'Commercial Lock Install',
              basePrice: 200,
              avgDuration: 90,
              subSubTypes: [
                {
                  id: 17,
                  name: 'Access Control System',
                  basePrice: 300,
                  avgDuration: 120,
                  specifications: 'Commercial access control installation',
                },
                {
                  id: 18,
                  name: 'High-Security Lock',
                  basePrice: 250,
                  avgDuration: 100,
                  specifications: 'Grade 1 commercial lock installation',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  'garage-door': [
    {
      id: 10,
      name: 'Garage Door Services',
      description: 'Garage door repair and maintenance',
      color: '#8B5CF6',
      isActive: true,
      jobTypes: [
        {
          id: 20,
          name: 'Garage Door Repair',
          description: 'Fix broken garage doors',
          estimatedDuration: 90,
          basePrice: 200,
          subTypes: [
            {
              id: 30,
              name: 'Spring Replacement',
              basePrice: 150,
              avgDuration: 60,
              subSubTypes: [
                {
                  id: 40,
                  name: 'Torsion Spring',
                  basePrice: 150,
                  avgDuration: 60,
                  specifications: 'Heavy-duty torsion spring replacement',
                },
                {
                  id: 41,
                  name: 'Extension Spring',
                  basePrice: 120,
                  avgDuration: 45,
                  specifications: 'Standard extension spring replacement',
                },
              ],
            },
            {
              id: 31,
              name: 'Door Track Repair',
              basePrice: 180,
              avgDuration: 75,
              subSubTypes: [
                {
                  id: 42,
                  name: 'Track Alignment',
                  basePrice: 120,
                  avgDuration: 45,
                  specifications: 'Realign bent or misaligned tracks',
                },
                {
                  id: 43,
                  name: 'Track Replacement',
                  basePrice: 250,
                  avgDuration: 90,
                  specifications: 'Complete track system replacement',
                },
              ],
            },
            {
              id: 32,
              name: 'Opener Repair',
              basePrice: 200,
              avgDuration: 80,
              subSubTypes: [
                {
                  id: 44,
                  name: 'Belt Drive Repair',
                  basePrice: 180,
                  avgDuration: 70,
                  specifications: 'Belt drive opener troubleshooting',
                },
                {
                  id: 45,
                  name: 'Chain Drive Repair',
                  basePrice: 160,
                  avgDuration: 60,
                  specifications: 'Chain drive opener maintenance',
                },
                {
                  id: 46,
                  name: 'Screw Drive Repair',
                  basePrice: 200,
                  avgDuration: 80,
                  specifications: 'Screw drive opener service',
                },
              ],
            },
          ],
        },
        {
          id: 21,
          name: 'Garage Door Installation',
          description: 'Install new garage doors',
          estimatedDuration: 240,
          basePrice: 800,
          subTypes: [
            {
              id: 33,
              name: 'Residential Installation',
              basePrice: 800,
              avgDuration: 240,
              subSubTypes: [
                {
                  id: 47,
                  name: 'Single Car Garage',
                  basePrice: 600,
                  avgDuration: 180,
                  specifications: '8x7 or 9x7 single door installation',
                },
                {
                  id: 48,
                  name: 'Double Car Garage',
                  basePrice: 1000,
                  avgDuration: 300,
                  specifications: '16x7 double door installation',
                },
              ],
            },
            {
              id: 34,
              name: 'Commercial Installation',
              basePrice: 1500,
              avgDuration: 480,
              subSubTypes: [
                {
                  id: 49,
                  name: 'Roll-up Door',
                  basePrice: 1200,
                  avgDuration: 360,
                  specifications: 'Commercial roll-up door installation',
                },
                {
                  id: 50,
                  name: 'Sectional Door',
                  basePrice: 1800,
                  avgDuration: 600,
                  specifications: 'Heavy-duty sectional door installation',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hvac: [
    {
      id: 11,
      name: 'HVAC Services',
      description: 'Heating, ventilation, and air conditioning',
      color: '#06B6D4',
      isActive: true,
      jobTypes: [
        {
          id: 22,
          name: 'AC Repair',
          description: 'Air conditioning troubleshooting and repair',
          estimatedDuration: 120,
          basePrice: 250,
          subTypes: [
            {
              id: 35,
              name: 'Refrigerant Issues',
              basePrice: 200,
              avgDuration: 90,
              subSubTypes: [
                {
                  id: 51,
                  name: 'Low Refrigerant',
                  basePrice: 150,
                  avgDuration: 60,
                  specifications: 'Refrigerant recharge service',
                },
                {
                  id: 52,
                  name: 'Refrigerant Leak',
                  basePrice: 300,
                  avgDuration: 120,
                  specifications: 'Leak detection and repair',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    firstName: 'Mike',
    lastName: 'Rodriguez',
    phoneNumber: '+1 (555) 123-4567',
    email: 'mike.rodriguez@wepro.com',
    username: 'mike.rodriguez',
    memberType: 'technician',
    phoneMasking: true,
    callRecording: true,
    maskingCallerId: 'tech-number',
    noAnswerAlerts: true,
    appUser: true,
    status: 'active',
    franchise: 'Houston Central',
    payType: 'commission',
    payFee: '15',
    creditCardFee: '3.5',
    venmoFee: '1.0',
    additionalFee: '0',
    metroAreas: ['Houston', 'Cypress'],
    color: '#3B82F6',
    specialties: ['Plumbing', 'HVAC'],
    rating: 4.9,
    completedJobs: 847,
    joinDate: '2023-01-15',
    customCommissions: [
      {
        id: 1,
        commissionFor: 'Specific',
        sourceProvider: 'Google Ads',
        jobCategory: 'Emergency',
        jobType: 'Lockout',
        type: 'Residential',
        commissionType: 'Fixed Fee',
        fees: '10',
      },
      {
        id: 2,
        commissionFor: 'Specific',
        sourceProvider: 'Yelp',
        jobCategory: 'Installation',
        jobType: 'Lock Installation',
        type: 'Commercial',
        commissionType: 'Percentage',
        fees: '5',
      },
    ],
    jobCapabilities: {
      categories: [1], // Emergency Services only
      jobTypes: [1], // Lockout Service only
      subTypes: [1, 2], // Residential and Commercial Lockout
      subSubTypes: [1, 2, 4, 5], // House, Apartment, Office, Retail
    },
    jobResponderRules: [
      {
        id: 1,
        reminderAfterMinutes: 5,
        alertType: 'SMS / APP Notify',
        smsReminder: true,
        sendTo: 'Technician Number / APP',
        externalNumbers: [],
        isActive: true,
      },
      {
        id: 2,
        reminderAfterMinutes: 15,
        alertType: 'Phone Call',
        smsReminder: false,
        sendTo: 'External Phone Numbers',
        externalNumbers: ['+1 (555) 999-0001', '+1 (555) 999-0002'],
        voiceTemplate: 'Emergency Job Alert',
        isActive: true,
      },
    ],
  },
  {
    id: 2,
    firstName: 'Jennifer',
    lastName: 'Lee',
    phoneNumber: '+1 (555) 987-6543',
    email: 'jennifer.lee@wepro.com',
    username: 'jennifer.lee',
    memberType: 'technician',
    phoneMasking: false,
    callRecording: true,
    maskingCallerId: 'source-number',
    noAnswerAlerts: true,
    appUser: true,
    status: 'active',
    franchise: 'Dallas North',
    payType: 'flat-rate',
    payFee: '150',
    creditCardFee: '3.0',
    venmoFee: '1.5',
    additionalFee: '10',
    metroAreas: ['Dallas', 'Plano'],
    color: '#10B981',
    specialties: ['Electrical', 'Smart Home'],
    rating: 4.8,
    completedJobs: 623,
    joinDate: '2023-03-20',
    customCommissions: [
      {
        id: 1,
        commissionFor: 'Specific',
        sourceProvider: 'Direct Call',
        jobCategory: 'Repair',
        jobType: 'Electrical Repair',
        type: 'Residential',
        commissionType: 'Percentage',
        fees: '8',
      },
    ],
  },
  {
    id: 3,
    firstName: 'Sarah',
    lastName: 'Johnson',
    phoneNumber: '+1 (555) 456-7890',
    email: 'sarah.johnson@wepro.com',
    username: 'sarah.johnson',
    memberType: 'office',
    phoneMasking: false,
    callRecording: true,
    maskingCallerId: 'source-number',
    noAnswerAlerts: false,
    appUser: true,
    status: 'active',
    franchise: 'Houston Central',
    payType: 'flat-rate',
    payFee: '3500',
    creditCardFee: '0',
    venmoFee: '0',
    additionalFee: '0',
    metroAreas: ['Houston'],
    color: '#8B5CF6',
    role: 'Dispatcher',
    joinDate: '2023-02-10',
  },
  {
    id: 4,
    firstName: 'Jordan',
    lastName: 'Crutchfield',
    phoneNumber: '+1 (713) 459-1692',
    email: 'jordan@asapmktg.com',
    username: 'jordan1261',
    memberType: 'dispatcher',
    phoneMasking: false,
    callRecording: true,
    maskingCallerId: 'source-number',
    noAnswerAlerts: true,
    appUser: true,
    status: 'active',
    franchise: 'Houston Central',
    payType: 'flat-rate',
    payFee: '4000',
    creditCardFee: '0',
    venmoFee: '0',
    additionalFee: '0',
    metroAreas: ['Houston', 'Cypress', 'Katy'],
    color: '#F59E0B',
    role: 'Locksmith Field Manager',
    dialerEnabled: true,
    dialingCall: 'Both',
    joinDate: '2023-04-12',
  },
  {
    id: 5,
    firstName: 'Alex',
    lastName: 'Thompson',
    phoneNumber: '+1 (555) 321-9876',
    email: 'alex.thompson@wepro.com',
    username: 'alex.thompson',
    memberType: 'agent',
    phoneMasking: true,
    callRecording: true,
    maskingCallerId: 'tech-number',
    noAnswerAlerts: true,
    appUser: true,
    status: 'active',
    franchise: 'Dallas North',
    payType: 'commission',
    payFee: '12',
    creditCardFee: '2.5',
    venmoFee: '1.0',
    additionalFee: '5',
    metroAreas: ['Dallas', 'Irving'],
    color: '#EC4899',
    role: 'Customer Service Agent',
    dialerEnabled: true,
    dialingCall: 'Outbound',
    joinDate: '2023-05-18',
  },
]

export const roles: Role[] = [
  {
    name: 'Project Manager',
    permissions: [
      {
        module: 'M1',
        permissions: ['read', 'write'],
        scope: {
          type: 'region',
          value: 'houston',
        },
      },
      {
        module: 'M2',
        permissions: ['read'],
        scope: {
          type: 'region',
          value: 'houston',
        },
      },
      {
        module: 'M3',
        permissions: ['read', 'write', 'delete'],
        scope: {
          type: 'franchise',
          value: 'houston-central',
        },
      },
    ],
  },
  {
    name: 'Technician',
    permissions: [
      {
        module: 'M1',
        permissions: ['read'],
        scope: {
          type: 'region',
          value: 'houston',
        },
      },
      {
        module: 'M4',
        permissions: ['read', 'write'],
        scope: {
          type: 'franchise',
          value: 'houston-central',
        },
      },
    ],
  },
  {
    name: 'Dispatcher',
    permissions: [
      {
        module: 'M1',
        permissions: ['read', 'write'],
        scope: {
          type: 'region',
          value: 'houston',
        },
      },
      {
        module: 'M2',
        permissions: ['read', 'write'],
        scope: {
          type: 'region',
          value: 'houston',
        },
      },
      {
        module: 'M5',
        permissions: ['read', 'write', 'delete'],
        scope: {
          type: 'franchise',
          value: 'houston-central',
        },
      },
    ],
  },
  {
    name: 'Office Staff',
    permissions: [
      {
        module: 'M1',
        permissions: ['read'],
        scope: {
          type: 'region',
          value: 'houston',
        },
      },
      {
        module: 'M6',
        permissions: ['read', 'write'],
        scope: {
          type: 'franchise',
          value: 'houston-central',
        },
      },
    ],
  },
  {
    name: 'Admin',
    permissions: [
      {
        module: 'M1',
        permissions: ['read', 'write', 'delete'],
        scope: {
          type: 'global',
          value: 'all',
        },
      },
      {
        module: 'M2',
        permissions: ['read', 'write', 'delete'],
        scope: {
          type: 'global',
          value: 'all',
        },
      },
      {
        module: 'M3',
        permissions: ['read', 'write', 'delete'],
        scope: {
          type: 'global',
          value: 'all',
        },
      },
      {
        module: 'M4',
        permissions: ['read', 'write', 'delete'],
        scope: {
          type: 'global',
          value: 'all',
        },
      },
      {
        module: 'M5',
        permissions: ['read', 'write', 'delete'],
        scope: {
          type: 'global',
          value: 'all',
        },
      },
      {
        module: 'M6',
        permissions: ['read', 'write', 'delete'],
        scope: {
          type: 'global',
          value: 'all',
        },
      },
    ],
  },
]

export const franchises: Record<string, string | number>[] = [
  { id: 1, name: 'Houston Central', code: 'HTX-001' },
  { id: 2, name: 'Dallas North', code: 'DFW-002' },
  { id: 3, name: 'Austin Central', code: 'AUS-003' },
]

export const automotiveDatabase: Automotive = {
  'Mercedes-Benz': {
    'A-Class': ['2019', '2020', '2021', '2022', '2023', '2024'],
    'C-Class': [
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    'E-Class': [
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    'S-Class': [
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    SL: [
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    SLS: ['2011', '2012', '2013', '2014', '2015'],
    GLA: [
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    GLC: [
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    GLE: [
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    GLS: ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
  },
  BMW: {
    '1 Series': [
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    '2 Series': [
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    '3 Series': [
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    '4 Series': [
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    '5 Series': [
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    '7 Series': [
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    X1: [
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    X3: [
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    X5: [
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
  },
  Audi: {
    A3: [
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    A4: [
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    A6: [
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    A8: [
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Q3: [
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Q5: [
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Q7: [
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
  },
  Toyota: {
    Corolla: [
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Camry: [
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Prius: [
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    RAV4: [
      '2006',
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Highlander: [
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    '4Runner': [
      '2003',
      '2004',
      '2005',
      '2006',
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
  },
  Honda: {
    Civic: [
      '2006',
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Accord: [
      '2003',
      '2004',
      '2005',
      '2006',
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    'CR-V': [
      '2002',
      '2003',
      '2004',
      '2005',
      '2006',
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Pilot: [
      '2003',
      '2004',
      '2005',
      '2006',
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Odyssey: [
      '2005',
      '2006',
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
  },
  Ford: {
    'F-150': [
      '2004',
      '2005',
      '2006',
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Mustang: [
      '2005',
      '2006',
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Focus: [
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
    ],
    Escape: [
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Explorer: [
      '2006',
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Edge: [
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
  },
  Chevrolet: {
    Silverado: [
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Equinox: [
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Malibu: [
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Cruze: [
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
    ],
    Tahoe: [
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Suburban: [
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
  },
  Nissan: {
    Altima: [
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Sentra: [
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Rogue: [
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Pathfinder: [
      '2005',
      '2006',
      '2007',
      '2008',
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
    Murano: [
      '2009',
      '2010',
      '2011',
      '2012',
      '2013',
      '2014',
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ],
  },
}

// Metro area options
export const metroAreas: string[] = [
  'Houston',
  'Dallas',
  'Austin',
  'San Antonio',
  'Fort Worth',
  'El Paso',
  'Arlington',
  'Corpus Christi',
]

// Color options
export const colorOptions: string[] = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#14B8A6', // Teal
]

// Commission options
export const sourceProviders: string[] = [
  'Google Ads',
  'Yelp',
  'Facebook',
  'Direct Call',
  'Referral',
  'Website',
]
export const simpleJobCategories: string[] = [
  'Emergency',
  'Installation',
  'Repair',
  'Maintenance',
  'Inspection',
]
export const jobTypes: string[] = [
  'Lockout',
  'Lock Installation',
  'Key Duplication',
  'Lock Repair',
  'Safe Installation',
  'Electrical Repair',
  'HVAC Service',
]
export const typeOptions: string[] = ['Residential', 'Commercial', 'Automotive']
export const commissionTypes: string[] = ['Fixed Fee', 'Percentage']

// Job Responder options
export const alertTypes: string[] = ['SMS / APP Notify', 'Phone Call', 'Email']
export const sendToOptions: string[] = [
  'Technician Number / APP',
  'External Phone Numbers',
]
export const reminderMinutes: number[] = [1, 2, 3, 5, 10, 15, 30, 60]

// Templates (these would typically come from Settings)
export const voiceTemplates: Record<string, string | number>[] = [
  {
    id: 1,
    name: 'Emergency Job Alert',
    content:
      'Hello {technician_name}, you have an emergency job in {location}. Please respond immediately.',
  },
  {
    id: 2,
    name: 'Standard Job Reminder',
    content:
      'Hi {technician_name}, you have a pending job assignment. Please check your app.',
  },
  {
    id: 3,
    name: 'Urgent Follow-up',
    content:
      'This is an urgent reminder about your assigned job. Please respond within 5 minutes.',
  },
]

export const smsTemplates: Record<string, string | number>[] = [
  {
    id: 1,
    name: 'Quick Job Alert',
    content: 'New job assigned! Check app: {job_details}',
  },
  {
    id: 2,
    name: 'Reminder SMS',
    content: 'Job reminder: {job_type} at {location}. Respond ASAP.',
  },
  {
    id: 3,
    name: 'Escalation SMS',
    content: 'URGENT: Please respond to job assignment immediately.',
  },
]
