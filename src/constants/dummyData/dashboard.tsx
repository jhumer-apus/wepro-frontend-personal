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
    name: 'New Clients',
    value: '43',
    change: '+8.5%',
    changeType: 'positive' as const,
    icon: PhoneIncoming,
    subtitle: 'This week',
  },
  {
    name: 'Completed Today',
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
    name: 'Conversion Rate',
    value: '68.5%',
    change: '+5.2%',
    changeType: 'positive' as const,
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
    jobs: 34,
    revenue: '$16,420',
    rating: 4.9,
    status: 'On Job',
    efficiency: 95,
  },
  {
    name: 'Lisa Martinez',
    jobs: 28,
    revenue: '$13,840',
    rating: 4.8,
    status: 'Available',
    efficiency: 92,
  },
  {
    name: 'Alex Kim',
    jobs: 25,
    revenue: '$12,250',
    rating: 4.7,
    status: 'On Job',
    efficiency: 89,
  },
  {
    name: 'Sarah Johnson',
    jobs: 22,
    revenue: '$10,890',
    rating: 4.8,
    status: 'Off Duty',
    efficiency: 91,
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
