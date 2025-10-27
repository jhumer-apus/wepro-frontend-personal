import { AnsweringService } from '@/src/constants/interface/answeringService'

export const dummyAnsweringServices: AnsweringService[] = [
  {
    _id: '1',
    serviceName: 'Premium Answering Service',
    package: 'Premium Package',
    currentSubscribers: 45,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    _id: '2',
    serviceName: 'Basic Call Handling',
    package: 'Basic Package',
    currentSubscribers: 23,
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
  },
  {
    _id: '3',
    serviceName: '24/7 Emergency Service',
    package: 'Emergency Package',
    currentSubscribers: 12,
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
  },
  {
    _id: '4',
    serviceName: 'Multi-Language Support',
    package: 'International Package',
    currentSubscribers: 8,
    createdAt: '2024-02-10T00:00:00.000Z',
    updatedAt: '2024-02-10T00:00:00.000Z',
  },
  {
    _id: '5',
    serviceName: 'Appointment Scheduling',
    package: 'Scheduling Package',
    currentSubscribers: 31,
    createdAt: '2024-02-15T00:00:00.000Z',
    updatedAt: '2024-02-15T00:00:00.000Z',
  },
]

export const answeringServicePackages = [
  { value: 'Basic Package', label: 'Basic Package' },
  { value: 'Premium Package', label: 'Premium Package' },
  { value: 'Emergency Package', label: 'Emergency Package' },
  { value: 'International Package', label: 'International Package' },
  { value: 'Scheduling Package', label: 'Scheduling Package' },
]
