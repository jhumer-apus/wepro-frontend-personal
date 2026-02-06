import { JobStat } from '@/src/constants/interface/dashboard'
import Lucide, {
  Briefcase,
  PhoneIncoming,
  CheckCircle,
} from 'lucide-react'

export const jobsStats: JobStat[] = [
  {
    name: 'Total Jobs',
    value: '247',
    change: '+18.2%',
    changeType: 'positive' as const,
    icon: Briefcase,
    subtitle: 'This month',
  },
  {
    name: 'First Time Callers',
    value: '43',
    change: '+8.5%',
    changeType: 'positive' as const,
    icon: PhoneIncoming,
    subtitle: 'This week',
  },
  {
    name: 'Completed Jobs',
    value: '12',
    change: '+4',
    changeType: 'positive' as const,
    icon: CheckCircle,
    subtitle: 'vs yesterday',
  },
]

export const topSources: Record<string, string | number>[] = [
  {
    name: 'Same Day Garage',
    value: 45.2,
    count: 89,
    revenue: '$43,210',
  },
  {
    name: 'Garage Door Repair',
    value: 28.7,
    count: 56,
    revenue: '$28,940',
  },
  {
    name: 'Same Day Air Duct',
    value: 15.8,
    count: 31,
    revenue: '$15,830',
  },
  {
    name: 'Appliance Service',
    value: 10.3,
    count: 20,
    revenue: '$10,980',
  },
  {
    name: 'Locksmith 24/7',
    value: 8.4,
    count: 18,
    revenue: '$9,210',
  },
  {
    name: 'Emergency Dispatch',
    value: 6.7,
    count: 14,
    revenue: '$7,450',
  },
]

export const revenueData: Record<string, string | number>[] = [
  {
    name: 'Total Revenue',
    value: '$156,847',
    change: '+23.5%',
    changeType: 'positive' as const,
  },
  {
    name: 'Total Profit',
    value: '$47,354',
    change: '+18.2%',
    changeType: 'positive' as const,
  },
]

export const salesMetrics: Record<string, string | number>[] = [
  {
    name: 'Average Ticket',
    value: '$485',
    change: '+12.5%',
    changeType: 'positive' as const,
  },
  {
    name: 'Jobs Completed',
    value: '23',
    change: '+3',
    changeType: 'positive' as const,
  },
  {
    name: 'Cancellation Rate',
    value: '68.5%',
    change: '+5.2%',
    changeType: 'positive' as const,
    subtitle: '5 out of total 52 jobs',
  },
]

export const upcomingAppointments: Record<string, string>[] = [
  {
    customer: 'David Chen',
    service: 'HVAC Maintenance',
    time: '2:00 PM',
    address: '456 Oak Ave, Suburbs',
    status: 'confirmed',
    technician: 'Lisa M.',
    priority: 'medium',
    duration: '2h',
    value: '$380',
  },
  {
    customer: 'Emma Wilson',
    service: 'Electrical Inspection',
    time: '4:15 PM',
    address: '789 Pine St, Uptown',
    status: 'pending',
    technician: 'Alex K.',
    priority: 'low',
    duration: '1.5h',
    value: '$220',
  },
  {
    customer: 'Robert Davis',
    service: 'Plumbing Repair',
    time: '6:30 PM',
    address: '321 Elm St, Downtown',
    status: 'confirmed',
    technician: 'Mike R.',
    priority: 'high',
    duration: '3h',
    value: '$650',
  },
]

export const topTechnicians: Record<string, string | number>[] = [
  {
    name: 'Mike Rodriguez',
    totalJobs: 10,
    completedJobs: 3,
    cancellationRate: 10,
    revenue: '$1,099.00',
    rating: 4.9,
    status: 'Available',
  },
  {
    name: 'Lisa Martinez',
    totalJobs: 3,
    completedJobs: 2,
    cancellationRate: 0,
    revenue: '$400.00',
    rating: 4.8,
    status: 'Available',
  },
  {
    name: 'Alex Kim',
    totalJobs: 1,
    completedJobs: 1,
    cancellationRate: 0,
    revenue: '$265.00',
    rating: 4.7,
    status: 'Offline',
  },
  {
    name: 'Sarah Johnson',
    totalJobs: 4,
    completedJobs: 1,
    cancellationRate: 50,
    revenue: '$180.00',
    rating: 4.8,
    status: 'Offline',
  },
  {
    name: 'Dispatch Peer Asaf6',
    totalJobs: 2,
    completedJobs: 0,
    cancellationRate: 0,
    revenue: '$0.00',
    rating: 4.6,
    status: 'WA Group',
  },
  {
    name: 'Cameron Reed',
    totalJobs: 3,
    completedJobs: 3,
    cancellationRate: 0,
    revenue: '$850.00',
    rating: 4.9,
    status: 'Available',
  },
]

export const aiInsights: Record<string, string>[] = [
  {
    title: 'Peak Performance Detected',
    description:
      'Your busiest time is 2-4 PM with 85% technician utilization. Consider scheduling 2 additional technicians during this window.',
    type: 'optimization',
    impact: '+$3,200 potential revenue',
    confidence: '94%',
  },
  {
    title: 'Customer Satisfaction Alert',
    description:
      'Mrs. Anderson (Job #4521) rated her experience 2/5 stars. AI recommends immediate follow-up call within 2 hours.',
    type: 'attention',
    impact: 'Prevent negative reviews',
    confidence: '89%',
  },
  {
    title: 'Revenue Opportunity',
    description:
      '3 customers in the Heights area need similar garage door services this week. Bundle pricing available.',
    type: 'opportunity',
    impact: '+$450 potential',
    confidence: '87%',
  },
]
