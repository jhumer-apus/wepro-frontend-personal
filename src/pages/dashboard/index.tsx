import React, { useState, useEffect } from 'react'
import { JobStat } from '@/src/constants/interface/dashboard'
import {
  jobsStats,
  topSources,
  revenueData,
  salesMetrics,
  upcomingAppointments,
  topTechnicians,
  aiInsights,
} from '@/src/constants/dummyData/dashboard'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/src/components/ui/dialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Progress } from '@/src/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  Phone,
  Plus,
  Zap,
  AlertCircle,
  Timer,
  FileText,
  CreditCard,
  Target,
  Filter,
  CheckCircle,
  PieChart,
  Star,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Wrench,
  Map,
  Navigation,
  Receipt,
  Maximize2,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Settings as SettingsIcon,
  Briefcase,
  MessageSquare,
  Eye,
  MapPin,
  User,
  Info,
} from 'lucide-react'

type FranchiseKey = 'all' | 'franchise1' | 'franchise2'
type TimeRangeKey = 'today' | 'week' | 'lastweek'

type FranchiseDataset = {
  jobsStats: JobStat[]
  revenueData: Array<Record<string, string | number>>
  topSources: Array<Record<string, string | number>>
  salesMetrics: Array<Record<string, string | number>>
  upcomingAppointments: Array<Record<string, string>>
  topTechnicians: Array<Record<string, string | number>>
}

const dateRangeOptions = [
  { label: 'Today', value: 'today' },
  { label: 'This Week (Sun - Today)', value: 'week-sun-today' },
  { label: 'This Week (Mon - Today)', value: 'week-mon-today' },
  { label: 'Last 7 Days', value: 'last-7-days' },
  { label: 'Last Week (Sun - Sat)', value: 'last-week-sun-sat' },
  { label: 'Last Week (Mon - Sun)', value: 'last-week-mon-sun' },
  { label: 'Last Business Week (Mon - Fri)', value: 'last-business-week' },
  { label: 'Last 14 Days', value: 'last-14-days' },
  { label: 'This Month', value: 'this-month' },
  { label: 'Last 30 Days', value: 'last-30-days' },
  { label: 'Last Month', value: 'last-month' },
]

// Dummy franchise slices to drive the Franchise tabs
const franchiseData: Record<FranchiseKey, FranchiseDataset> = {
  all: {
    jobsStats,
    revenueData,
    topSources,
    salesMetrics,
    upcomingAppointments,
    topTechnicians,
  },
  franchise1: {
    jobsStats: [
      {
        name: 'Total Jobs',
        value: '132',
        change: '+6.4%',
        changeType: 'positive' as const,
        icon: DollarSign,
        subtitle: 'Houston Metro',
      },
      {
        name: 'First Time Callers',
        value: '21',
        change: '+4.2%',
        changeType: 'positive' as const,
        icon: PhoneIncoming,
        subtitle: 'Houston Metro',
      },
      {
        name: 'Completed Jobs',
        value: '7',
        change: '+2',
        changeType: 'positive' as const,
        icon: CheckCircle,
        subtitle: 'vs yesterday',
      },
    ],
    revenueData: [
      {
        name: 'Total Revenue',
        value: '$82,430',
        change: '+11.5%',
        changeType: 'positive' as const,
      },
      {
        name: 'Total Profit',
        value: '$24,910',
        change: '+8.2%',
        changeType: 'positive' as const,
      },
    ],
    topSources: [
      { name: 'Same Day Garage', value: 49.5, count: 52, revenue: '$22,410' },
      { name: 'Garage Door Repair', value: 26.1, count: 28, revenue: '$12,540' },
      { name: 'Same Day Air Duct', value: 13.2, count: 14, revenue: '$6,830' },
      { name: 'Appliance Service', value: 11.2, count: 12, revenue: '$5,540' },
    ],
    salesMetrics: [
      { name: 'Average Ticket', value: '$465', change: '+5.5%', changeType: 'positive' as const },
      { name: 'Jobs Completed', value: '14', change: '+1', changeType: 'positive' as const },
      { name: 'Conversion Rate', value: '66.2%', change: '+2.3%', changeType: 'positive' as const },
    ],
    upcomingAppointments: [
      {
        customer: 'Maria Gomez',
        service: 'Garage Door Tune-Up',
        time: '1:30 PM',
        address: '211 Kirby Dr, Houston',
        status: 'confirmed',
        technician: 'Mike R.',
        priority: 'high',
        duration: '2h',
        value: '$420',
      },
      {
        customer: 'Kevin Tran',
        service: 'Panel Replacement',
        time: '3:45 PM',
        address: '610 Westheimer Rd, Houston',
        status: 'pending',
        technician: 'Lisa M.',
        priority: 'medium',
        duration: '1.5h',
        value: '$360',
      },
    ],
    topTechnicians: [
      { name: 'Mike Rodriguez', jobs: 18, revenue: '$9,820', rating: 4.9, status: 'On Job', efficiency: 96 },
      { name: 'Lisa Martinez', jobs: 15, revenue: '$7,340', rating: 4.8, status: 'Available', efficiency: 92 },
      { name: 'Alex Kim', jobs: 12, revenue: '$6,120', rating: 4.7, status: 'On Job', efficiency: 88 },
      { name: 'Sarah Johnson', jobs: 9, revenue: '$4,980', rating: 4.8, status: 'Off Duty', efficiency: 90 },
    ],
  },
  franchise2: {
    jobsStats: [
      {
        name: 'Total Jobs',
        value: '98',
        change: '+3.1%',
        changeType: 'positive' as const,
        icon: DollarSign,
        subtitle: 'Dallas',
      },
      {
        name: 'First Time Callers',
        value: '14',
        change: '+1.8%',
        changeType: 'positive' as const,
        icon: PhoneIncoming,
        subtitle: 'Dallas',
      },
      {
        name: 'Completed Jobs',
        value: '5',
        change: '+1',
        changeType: 'positive' as const,
        icon: CheckCircle,
        subtitle: 'vs yesterday',
      },
    ],
    revenueData: [
      {
        name: 'Total Revenue',
        value: '$61,980',
        change: '+6.8%',
        changeType: 'positive' as const,
      },
      {
        name: 'Total Profit',
        value: '$18,120',
        change: '+5.4%',
        changeType: 'positive' as const,
      },
    ],
    topSources: [
      { name: 'Same Day Garage', value: 38.1, count: 37, revenue: '$15,980' },
      { name: 'Garage Door Repair', value: 31.4, count: 30, revenue: '$12,420' },
      { name: 'Same Day Air Duct', value: 18.3, count: 17, revenue: '$7,110' },
      { name: 'Appliance Service', value: 12.2, count: 12, revenue: '$5,470' },
    ],
    salesMetrics: [
      { name: 'Average Ticket', value: '$440', change: '+3.1%', changeType: 'positive' as const },
      { name: 'Jobs Completed', value: '11', change: '+1', changeType: 'positive' as const },
      { name: 'Conversion Rate', value: '64.0%', change: '+1.2%', changeType: 'positive' as const },
    ],
    upcomingAppointments: [
      {
        customer: 'Ava Mitchell',
        service: 'Gate Repair',
        time: '12:15 PM',
        address: '1220 Elm St, Dallas',
        status: 'confirmed',
        technician: 'Alex K.',
        priority: 'medium',
        duration: '2h',
        value: '$390',
      },
      {
        customer: 'Jordan Lee',
        service: 'Smart Opener Install',
        time: '5:20 PM',
        address: '3325 McKinney Ave, Dallas',
        status: 'pending',
        technician: 'Sarah J.',
        priority: 'low',
        duration: '1.5h',
        value: '$310',
      },
    ],
    topTechnicians: [
      { name: 'Alex Kim', jobs: 16, revenue: '$7,940', rating: 4.7, status: 'On Job', efficiency: 89 },
      { name: 'Sarah Johnson', jobs: 14, revenue: '$6,820', rating: 4.8, status: 'Available', efficiency: 91 },
      { name: 'Mike Rodriguez', jobs: 12, revenue: '$5,980', rating: 4.9, status: 'On Job', efficiency: 94 },
      { name: 'Lisa Martinez', jobs: 10, revenue: '$4,780', rating: 4.8, status: 'Off Duty', efficiency: 90 },
    ],
  },
}

// Time range overrides to simulate different periods (generic across franchises)
const timeRangeData: Record<TimeRangeKey, Partial<FranchiseDataset>> = {
  today: {
    upcomingAppointments: [
      {
        jobId: 'job-2993741',
        clientName: 'No Client Name',
        service: 'Motorcycle Key',
        source: 'Wepro Dev',
        agent: '',
        address: 'No Address',
        timeWindow: 'Sun Jan 25, 2026 2:00 AM – 2026-01-25 04:00:00',
        relativeTime: 'In 2 Days 23 Hours 48 Minutes',
        tag: 'Motorcycle Key',
        tagTone: 'bg-blue-500',
        statusTag: 'Not Confirmed',
        statusTone: 'bg-orange-500',
      },
      {
        jobId: 'job-3005274',
        clientName: 'Sam',
        service: 'Service',
        source: 'Wepro Dev',
        agent: 'AI Agent job Testing',
        address: '123456 Main Street',
        timeWindow: 'Wed Jan 21, 2026 8:24 PM – No Limit',
        relativeTime: '5 Hours 47 Minutes Ago',
        tag: 'Service',
        tagTone: 'bg-blue-500',
        statusTag: 'Not Confirmed',
        statusTone: 'bg-orange-500',
      },
      {
        jobId: 'job-3005277',
        clientName: 'No Client Name',
        service: 'Service',
        source: 'Wepro Dev',
        agent: 'AI Agent job Testing',
        address: 'No Address',
        timeWindow: 'Wed Jan 21, 2026 8:25 PM – No Limit',
        relativeTime: '5 Hours 46 Minutes Ago',
        tag: 'Service',
        tagTone: 'bg-blue-500',
        statusTag: 'Not Confirmed',
        statusTone: 'bg-orange-500',
      },
      {
        jobId: 'job-3005278',
        clientName: 'Sam',
        service: 'Service',
        source: 'Wepro Dev',
        agent: 'AI Agent job Testing',
        address: 'No Address',
        timeWindow: 'Wed Jan 21, 2026 8:25 PM – No Limit',
        relativeTime: '5 Hours 46 Minutes Ago',
        tag: 'Service',
        tagTone: 'bg-blue-500',
        statusTag: 'Not Confirmed',
        statusTone: 'bg-orange-500',
      },
    ],
  },
  week: {
    jobsStats: [
      { name: 'Total Jobs', value: '412', change: '+9.8%', changeType: 'positive' as const, icon: Briefcase, subtitle: 'This week' },
      { name: 'First Time Callers', value: '68', change: '+6.2%', changeType: 'positive' as const, icon: PhoneIncoming, subtitle: 'This week' },
      { name: 'Completed Jobs', value: '21', change: '+5', changeType: 'positive' as const, icon: CheckCircle, subtitle: 'vs yesterday' },
    ],
    revenueData: [
      { name: 'Total Revenue', value: '$284,610', change: '+14.2%', changeType: 'positive' as const },
      { name: 'Total Profit', value: '$81,430', change: '+11.9%', changeType: 'positive' as const },
    ],
    topSources: [
      { name: 'Same Day Garage', value: 42.1, count: 166, revenue: '$78,210' },
      { name: 'Garage Door Repair', value: 30.4, count: 120, revenue: '$56,320' },
      { name: 'Same Day Air Duct', value: 16.3, count: 65, revenue: '$28,440' },
      { name: 'Appliance Service', value: 11.2, count: 44, revenue: '$19,180' },
    ],
    salesMetrics: [
      { name: 'Average Ticket', value: '$505', change: '+9.1%', changeType: 'positive' as const },
      { name: 'Jobs Completed', value: '78', change: '+12', changeType: 'positive' as const },
      { name: 'Conversion Rate', value: '69.8%', change: '+3.4%', changeType: 'positive' as const },
    ],
    upcomingAppointments: [
      {
        customer: 'Weekly Sync Client',
        service: 'Garage Door Service',
        time: 'Tomorrow 10:00 AM',
        address: 'Various',
        status: 'confirmed',
        technician: 'Rotation',
        priority: 'medium',
        duration: '—',
        value: '$2,450',
      },
    ],
    topTechnicians: [
      { name: 'Weekly Leader - Mike Rodriguez', jobs: 52, revenue: '$24,980', rating: 4.9, status: 'On Job', efficiency: 95 },
      { name: 'Lisa Martinez', jobs: 47, revenue: '$22,110', rating: 4.8, status: 'Available', efficiency: 93 },
      { name: 'Alex Kim', jobs: 41, revenue: '$19,780', rating: 4.7, status: 'On Job', efficiency: 90 },
      { name: 'Sarah Johnson', jobs: 36, revenue: '$17,120', rating: 4.8, status: 'Off Duty', efficiency: 91 },
    ],
  },
  lastweek: {
    jobsStats: [
      { name: 'Total Jobs', value: '365', change: '+3.4%', changeType: 'positive' as const, icon: Briefcase, subtitle: 'Last week' },
      { name: 'First Time Callers', value: '54', change: '+2.1%', changeType: 'positive' as const, icon: PhoneIncoming, subtitle: 'Last week' },
      { name: 'Completed Jobs', value: '18', change: '+3', changeType: 'positive' as const, icon: CheckCircle, subtitle: 'vs prior day' },
    ],
    revenueData: [
      { name: 'Total Revenue', value: '$241,320', change: '+9.3%', changeType: 'positive' as const },
      { name: 'Total Profit', value: '$69,870', change: '+7.8%', changeType: 'positive' as const },
    ],
    topSources: [
      { name: 'Same Day Garage', value: 40.2, count: 150, revenue: '$68,940' },
      { name: 'Garage Door Repair', value: 29.8, count: 111, revenue: '$51,240' },
      { name: 'Same Day Air Duct', value: 17.6, count: 65, revenue: '$26,430' },
      { name: 'Appliance Service', value: 12.4, count: 47, revenue: '$21,110' },
    ],
    salesMetrics: [
      { name: 'Average Ticket', value: '$498', change: '+6.4%', changeType: 'positive' as const },
      { name: 'Jobs Completed', value: '71', change: '+7', changeType: 'positive' as const },
      { name: 'Conversion Rate', value: '68.1%', change: '+2.1%', changeType: 'positive' as const },
    ],
    upcomingAppointments: [
      {
        customer: 'Follow-up Weeklies',
        service: 'Maintenance Blocks',
        time: 'Rolling',
        address: 'Service Area',
        status: 'confirmed',
        technician: 'Team',
        priority: 'low',
        duration: '—',
        value: '$1,980',
      },
    ],
    topTechnicians: [
      { name: 'Alex Kim', jobs: 45, revenue: '$21,440', rating: 4.7, status: 'On Job', efficiency: 90 },
      { name: 'Mike Rodriguez', jobs: 43, revenue: '$20,980', rating: 4.9, status: 'Available', efficiency: 94 },
      { name: 'Lisa Martinez', jobs: 38, revenue: '$18,420', rating: 4.8, status: 'On Job', efficiency: 92 },
      { name: 'Sarah Johnson', jobs: 33, revenue: '$15,760', rating: 4.8, status: 'Off Duty', efficiency: 90 },
    ],
  },
}

const franchiseCenters: Record<FranchiseKey, { lat: number; lng: number }> = {
  all: { lat: 29.7604, lng: -95.3698 }, // Houston
  franchise1: { lat: 29.7604, lng: -95.3698 }, // Houston Metro
  franchise2: { lat: 32.7767, lng: -96.797 }, // Dallas
}

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const addDays = (date: Date, days: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const startOfWeekSun = (date: Date) => addDays(date, -date.getDay())
const startOfWeekMon = (date: Date) => addDays(date, -((date.getDay() + 6) % 7))

const dateRangeToDisplay = (value: string) => {
  const today = new Date()
  let start = today
  let end = today

  switch (value) {
    case 'today':
      start = today
      end = today
      break
    case 'week-sun-today':
      start = startOfWeekSun(today)
      end = today
      break
    case 'week-mon-today':
      start = startOfWeekMon(today)
      end = today
      break
    case 'last-7-days':
      start = addDays(today, -6)
      end = today
      break
    case 'last-14-days':
      start = addDays(today, -13)
      end = today
      break
    case 'last-week-sun-sat': {
      const thisWeekStart = startOfWeekSun(today)
      start = addDays(thisWeekStart, -7)
      end = addDays(start, 6)
      break
    }
    case 'last-week-mon-sun': {
      const thisWeekStart = startOfWeekMon(today)
      start = addDays(thisWeekStart, -7)
      end = addDays(start, 6)
      break
    }
    case 'last-business-week': {
      const thisWeekStart = startOfWeekMon(today)
      start = addDays(thisWeekStart, -7)
      end = addDays(start, 4)
      break
    }
    case 'this-month':
      start = new Date(today.getFullYear(), today.getMonth(), 1)
      end = today
      break
    case 'last-30-days':
      start = addDays(today, -29)
      end = today
      break
    case 'last-month': {
      const year = today.getFullYear()
      const month = today.getMonth()
      start = new Date(year, month - 1, 1)
      end = new Date(year, month, 0)
      break
    }
    default:
      start = today
      end = today
      break
  }

  const startStr = formatDate(start)
  const endStr = formatDate(end)
  return startStr === endStr ? startStr : `${startStr} – ${endStr}`
}

const mapDateRangeToTimeKey = (value: string): TimeRangeKey => {
  if (value.includes('last')) return 'lastweek'
  if (value.includes('week')) return 'week'
  return 'today'
}

const prng = (key: string, salt: string) => {
  const str = `${key}-${salt}`
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) % 1000000007
  }
  return (hash % 1000) / 1000
}

const adjustValueString = (value: string, delta: number) => {
  const isCurrency = value.trim().startsWith('$')
  const isPercent = value.includes('%')
  const numeric = parseInt(value.replace(/[^0-9]/g, ''), 10)
  if (Number.isNaN(numeric)) return value
  const adjusted = Math.max(0, numeric + delta)
  if (isPercent) return `${adjusted}%`
  if (isCurrency) return `$${adjusted.toLocaleString()}`
  return adjusted.toLocaleString()
}

const teamPhotos = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=128&h=128&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face',
]

const teamMembersBase = [
  {
    name: 'Mike Rodriguez',
    status: 'On Job',
    offset: { lat: 0.01, lng: -0.015 },
    job: '#4521',
    customer: 'Sarah Johnson',
    eta: '15 min',
    efficiency: 95,
  },
  {
    name: 'Lisa Martinez',
    status: 'Available',
    offset: { lat: -0.008, lng: 0.012 },
    job: null,
    customer: null,
    eta: 'Available',
    efficiency: 92,
  },
  {
    name: 'Alex Kim',
    status: 'On Job',
    offset: { lat: -0.015, lng: -0.008 },
    job: '#4522',
    customer: 'David Chen',
    eta: '30 min',
    efficiency: 89,
  },
  {
    name: 'Sarah Johnson',
    status: 'Off Duty',
    offset: { lat: 0.012, lng: 0.014 },
    job: null,
    customer: null,
    eta: 'N/A',
    efficiency: 91,
  },
]

const mapContainerStyle = { width: '100%', height: '100%' }

const DashboardIndex: React.FC = (): React.JSX.Element => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })
  // Filter state for shared filtering across sections
  const selectedFranchise: FranchiseKey = 'all'
  const selectedTimeRange: TimeRangeKey = 'today'
  const [dispatcherType, setDispatcherType] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState('today')
  const currentDateRangeLabel = dateRangeToDisplay(selectedDateRange)
  const [markerBuffer, setMarkerBuffer] = useState(false)
  const [photoIcons, setPhotoIcons] = useState<(google.maps.Icon | null)[]>([])
  const [mapFilter, setMapFilter] = useState<'all' | 'job' | 'technician'>('all')
  const [showInvoicesModal, setShowInvoicesModal] = useState(false)
  const [invoicePage, setInvoicePage] = useState(1)

  const allInvoices = [
    { id: '#INV-2301', customer: 'Johnson Electronics', amount: '$1,245', status: 'Overdue', due: 'Mar 12' },
    { id: '#INV-2302', customer: 'Metro Apartments', amount: '$890', status: 'Pending', due: 'Mar 18' },
    { id: '#INV-2303', customer: 'Smith Residence', amount: '$425', status: 'Overdue', due: 'Mar 14' },
    { id: '#INV-2304', customer: 'Brighton Homes', amount: '$1,980', status: 'Open', due: 'Mar 20' },
    { id: '#INV-2305', customer: 'Houston Med Center', amount: '$2,410', status: 'Paid', due: 'Paid' },
    { id: '#INV-2306', customer: 'Downtown Lofts', amount: '$760', status: 'Open', due: 'Mar 22' },
    { id: '#INV-2307', customer: 'Uptown Offices', amount: '$1,120', status: 'Pending', due: 'Mar 19' },
    { id: '#INV-2308', customer: 'Clearwater Pools', amount: '$890', status: 'Open', due: 'Mar 25' },
    { id: '#INV-2309', customer: 'Northside Retail', amount: '$1,540', status: 'Overdue', due: 'Mar 10' },
  ]
  const serviceAreas = [
    { name: 'Houston Metro', jobs: 126, revenue: '$58,200', sla: '92% on-time', trend: '+4.3%' },
    { name: 'Dallas Urban', jobs: 98, revenue: '$43,110', sla: '89% on-time', trend: '+3.1%' },
    { name: 'Suburban Ring', jobs: 74, revenue: '$31,480', sla: '94% on-time', trend: '+2.4%' },
    { name: 'Emergency Zone', jobs: 28, revenue: '$14,920', sla: '88% on-time', trend: '+6.8%' },
  ]
  const estimateInvoiceStats = [
    {
      title: 'Pending Invoices Count',
      value: '0',
      color: 'text-amber-600',
      badgeColor: 'bg-amber-400',
    },
    {
      title: 'Pending Invoices Amount',
      value: '$0',
      color: 'text-amber-600',
      badgeColor: 'bg-amber-400',
    },
    {
      title: 'Pending Estimates',
      value: '$0',
      subtitle: '0 pending (0 total)',
      color: 'text-indigo-600',
      badgeColor: 'bg-indigo-500',
    },
    {
      title: 'Accepted Estimates',
      value: '$0',
      subtitle: '0 accepted',
      color: 'text-emerald-600',
      badgeColor: 'bg-emerald-500',
    },
  ]
  const agentStats = [
    {
      name: 'Msg Sent',
      value: '1,240',
      change: '+4.3%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      color: 'bg-blue-500',
    },
    {
      name: 'Msg Received',
      value: '1,180',
      change: '+3.8%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      color: 'bg-cyan-500',
    },
    {
      name: 'Total Msg',
      value: '2,420',
      change: '+4.1%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      color: 'bg-sky-500',
    },
    {
      name: 'Incoming Calls',
      value: '320',
      change: '+2.0%',
      changeType: 'positive' as const,
      icon: PhoneIncoming,
      color: 'bg-emerald-500',
    },
    {
      name: 'Outgoing Calls',
      value: '285',
      change: '+1.4%',
      changeType: 'positive' as const,
      icon: PhoneOutgoing,
      color: 'bg-amber-500',
    },
    {
      name: 'Total Calls',
      value: '605',
      change: '+1.8%',
      changeType: 'positive' as const,
      icon: PhoneCall,
      color: 'bg-indigo-500',
    },
    {
      name: 'Online Agents',
      value: '18',
      change: '+2',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'bg-emerald-600',
    },
    {
      name: 'Busy Agents',
      value: '7',
      change: '+0.5',
      changeType: 'positive' as const,
      icon: AlertCircle,
      color: 'bg-yellow-500',
    },
    {
      name: 'Offline Agents',
      value: '5',
      change: '-1',
      changeType: 'negative' as const,
      icon: Timer,
      color: 'bg-slate-500',
    },
  ]
  const payoutDispatchers = [
    {
      name: 'VS DISPATCH',
      note: 'No Stripe record setup for this dispatcher.',
    },
    {
      name: 'LockSmith 24/7',
      note: 'No Stripe record setup for this dispatcher.',
    },
    {
      name: 'Locksmith GDS',
      note: 'No Stripe record setup for this dispatcher.',
    },
  ]
  const invoicePageSize = 5
  const invoicePageCount = Math.ceil(allInvoices.length / invoicePageSize)
  const paginatedInvoices = allInvoices.slice(
    (invoicePage - 1) * invoicePageSize,
    invoicePage * invoicePageSize
  )

  // Handle filter changes
  useEffect(() => {
    // allow Google markers to animate after map loads
    const timer = setTimeout(() => setMarkerBuffer(true), 500)
    return () => clearTimeout(timer)
  }, [])

  // Preload round photo icons as canvas-based data URLs to avoid CORS/layout issues
  useEffect(() => {
    let cancelled = false
    const loadIcons = async () => {
      if (!isLoaded || typeof window === 'undefined') return
      const g = (window as typeof window & { google?: typeof google }).google
      if (!g) return
      const promises = teamPhotos.map(
        url =>
          new Promise<google.maps.Icon | null>(resolve => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              const size = 56
              const canvas = document.createElement('canvas')
              canvas.width = size
              canvas.height = size
              const ctx = canvas.getContext('2d')
              if (!ctx) return resolve(null)
              const r = size / 2
              ctx.fillStyle = 'white'
              ctx.beginPath()
              ctx.arc(r, r, r, 0, Math.PI * 2)
              ctx.fill()
              ctx.save()
              ctx.beginPath()
              ctx.arc(r, r, r - 3, 0, Math.PI * 2)
              ctx.clip()
              ctx.drawImage(img, 0, 0, size, size)
              ctx.restore()
              ctx.strokeStyle = '#ffffff'
              ctx.lineWidth = 3
              ctx.beginPath()
              ctx.arc(r, r, r - 1.5, 0, Math.PI * 2)
              ctx.stroke()
              const dataUrl = canvas.toDataURL()
              resolve({
                url: dataUrl,
                scaledSize: new g.maps.Size(size, size),
                anchor: new g.maps.Point(r, r),
              })
            }
            img.onerror = () => resolve(null)
            img.src = url
          })
      )
      const results = await Promise.all(promises)
      if (!cancelled) setPhotoIcons(results)
    }
    loadIcons()
    return () => {
      cancelled = true
    }
  }, [isLoaded])

  const effectiveTimeRange: TimeRangeKey =
    mapDateRangeToTimeKey(selectedDateRange) || selectedTimeRange
  const baseFranchiseData =
    franchiseData[selectedFranchise] || franchiseData.all
  const baseSelected = {
    jobsStats:
      timeRangeData[effectiveTimeRange].jobsStats || baseFranchiseData.jobsStats,
    revenueData:
      timeRangeData[effectiveTimeRange].revenueData ||
      baseFranchiseData.revenueData,
    topSources:
      timeRangeData[effectiveTimeRange].topSources || baseFranchiseData.topSources,
    salesMetrics:
      timeRangeData[effectiveTimeRange].salesMetrics ||
      baseFranchiseData.salesMetrics,
    upcomingAppointments:
      timeRangeData[effectiveTimeRange].upcomingAppointments ||
      baseFranchiseData.upcomingAppointments,
    topTechnicians:
      timeRangeData[effectiveTimeRange].topTechnicians ||
      baseFranchiseData.topTechnicians,
  }

  const filterKey = `${dispatcherType}-${selectedDateRange}`
  const noise = (salt: string, scale = 25) =>
    Math.floor(prng(filterKey, salt) * scale) - Math.floor(scale / 2)

  const jobsStatsBase = (baseSelected.jobsStats ??
    baseFranchiseData.jobsStats ??
    []) as JobStat[]
  const revenueDataBase = (baseSelected.revenueData ??
    baseFranchiseData.revenueData ??
    []) as typeof baseFranchiseData.revenueData
  const topSourcesBase = (baseSelected.topSources ??
    baseFranchiseData.topSources ??
    []) as typeof baseFranchiseData.topSources
  const salesMetricsBase = (baseSelected.salesMetrics ??
    baseFranchiseData.salesMetrics ??
    []) as typeof baseFranchiseData.salesMetrics
  const upcomingAppointmentsBase = (baseSelected.upcomingAppointments ??
    baseFranchiseData.upcomingAppointments ??
    []) as typeof baseFranchiseData.upcomingAppointments
  const topTechniciansBase = (baseSelected.topTechnicians ??
    baseFranchiseData.topTechnicians ??
    []) as typeof baseFranchiseData.topTechnicians

  const selectedData: FranchiseDataset = {
    jobsStats: jobsStatsBase.map((stat, idx) => ({
      ...stat,
      value: adjustValueString(stat.value, noise(`job-${idx}`, 40)),
      change: `${stat.change}`,
    })) as JobStat[],
    revenueData: revenueDataBase.map((item, idx) => ({
      ...item,
      value: adjustValueString(String(item.value), noise(`rev-${idx}`, 5000)),
      change: `${item.change}`,
    })) as FranchiseDataset['revenueData'],
    topSources: topSourcesBase.map((item, idx) => ({
      ...item,
      value: Math.max(
        1,
        Number(item.value) + Math.round(prng(filterKey, `src-${idx}`) * 8 - 4)
      ),
    })) as FranchiseDataset['topSources'],
    salesMetrics: salesMetricsBase.map((item, idx) => ({
      ...item,
      value: adjustValueString(String(item.value), noise(`sales-${idx}`, 300)),
      change: `${item.change}`,
    })) as FranchiseDataset['salesMetrics'],
    upcomingAppointments: upcomingAppointmentsBase.map((item, idx) => ({
      ...item,
      value: adjustValueString(String((item as any).value ?? '0'), noise(`appt-${idx}`, 120)),
    })) as FranchiseDataset['upcomingAppointments'],
    topTechnicians: topTechniciansBase.map((tech, idx) => ({
      ...tech,
      jobs: Math.max(1, Number(tech.jobs) + noise(`tech-j-${idx}`, 6)),
      revenue: adjustValueString(String(tech.revenue), noise(`tech-r-${idx}`, 800)),
    })) as FranchiseDataset['topTechnicians'],
  }

  const mapCenter =
    franchiseCenters[selectedFranchise] || franchiseCenters.all
  const teamMembers = teamMembersBase.map(member => ({
    ...member,
    lat: mapCenter.lat + member.offset.lat,
    lng: mapCenter.lng + member.offset.lng,
  }))
  const filteredTeamMembers = teamMembers.filter(member => {
    if (mapFilter === 'all') return true
    if (mapFilter === 'job') return Boolean(member.job)
    return !member.job
  })
  const dropAnimation =
    isLoaded &&
    markerBuffer &&
    typeof window !== 'undefined' &&
    (window as typeof window & { google?: typeof google }).google
      ? (window as typeof window & { google: typeof google }).google.maps.Animation.DROP
      : undefined

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Welcome back, John! 🚀 Here&apos;s your business performance today
          </p>
          <div className="flex items-center mt-2 text-sm text-neutral-500">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Last updated: 2 minutes ago
            <Button variant="ghost" size="sm" className="ml-2 h-6 px-2">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsContent value="overview" className="space-y-6">
          {/* Global Controls */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Dispatcher Type */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Dispatcher Type:
                    </span>
                    <Select
                      value={dispatcherType}
                    onValueChange={value => {
                      setDispatcherType(value)
                    }}
                    >
                      <SelectTrigger className="w-40 h-9">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="vs-dispatch">VS Dispatch</SelectItem>
                        <SelectItem value="locksmith-24-7">LockSmith 24/7</SelectItem>
                        <SelectItem value="locksmith-gds">Locksmith GDS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Date Range:
                    </span>
                    <Select
                      value={selectedDateRange}
                    onValueChange={value => {
                      setSelectedDateRange(value)
                    }}
                    >
                      <SelectTrigger className="w-56 h-9">
                        <SelectValue placeholder="Today" />
                      </SelectTrigger>
                      <SelectContent>
                        {dateRangeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center text-sm font-semibold text-neutral-700 dark:text-neutral-200 mt-2">
                  <Calendar className="w-4 h-4 mr-2 text-neutral-600 dark:text-neutral-300" />
                  <span className="mr-1">Coverage:</span>
                  <span className="text-neutral-900 dark:text-neutral-100">
                    {currentDateRangeLabel}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jobs Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 lg:gap-6">
            {selectedData.jobsStats.map((stat, index) => {
              const Icon = stat.icon as React.ComponentType<{ className?: string }>
              return (
                <Card
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-brandGreen-50 to-brandGreen-100 dark:from-brandGreen-950 dark:to-brandGreen-900 rounded-xl shadow-sm">
                        <Icon className="w-6 h-6 text-brandGreen-600 dark:text-brandGreen-400" />
                      </div>
                      <div className="flex items-center space-x-1">
                        {stat.changeType === 'positive' ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={`text-sm font-semibold ${
                            stat.changeType === 'positive'
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                      {stat.value}
                    </h3>
                    <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                      {stat.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {stat.subtitle}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Revenue & Profit */}
            <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg mr-3">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  Revenue & Profit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedData.revenueData.map(item => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        {item.name}
                      </p>
                      <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                        {item.value}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-600">
                        {item.change}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Lead Sources */}
            <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mr-3">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  Top Lead Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
            {selectedData.topSources.map(source => (
                  <div key={source.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        {source.name}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                          {source.value}%
                        </span>
                        <p className="text-xs text-neutral-500">
                          {source.count} leads • {source.revenue}
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={parseFloat(source.value.toString())}
                      className="h-3"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Sales Overview */}
            <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg mr-3">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  Sales Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
            {selectedData.salesMetrics.map(metric => (
                  <div
                    key={metric.name}
                    className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        {metric.name}
                      </p>
                      <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        {metric.value}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-600">
                        {metric.change}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* REALISTIC TEAM MAP - GPS TRACKING */}
            <Card className="lg:col-span-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center text-lg">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg mr-3">
                      <Map className="w-5 h-5 text-white" />
                    </div>
                    Team Map - Live GPS Tracking
                    <div className="ml-3 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-neutral-500">Live GPS</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full p-1 flex items-center">
                      {[
                        { key: 'all', label: 'All' },
                        { key: 'job', label: 'Job' },
                        { key: 'technician', label: 'Technician' },
                      ].map(option => (
                        <Button
                          key={option.key}
                          size="sm"
                          variant={mapFilter === option.key ? 'default' : 'ghost'}
                          className={`h-8 px-3 text-xs rounded-full ${
                            mapFilter === option.key
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : 'text-neutral-600 dark:text-neutral-300'
                          }`}
                          onClick={() =>
                            setMapFilter(option.key as 'all' | 'job' | 'technician')
                          }
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Maximize2 className="w-4 h-4 mr-2" />
                      Full Screen
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
            {/* Live Map */}
            <div className="h-[460px] md:h-[560px] rounded-xl relative overflow-hidden shadow-inner">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={12}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    styles: [
                      {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }],
                      },
                    ],
                  }}
                >
                  {filteredTeamMembers.map((member, index) => (
                    <Marker
                      key={member.name}
                      position={{ lat: member.lat, lng: member.lng }}
                      title={`${member.name}${member.job ? ` - Job ${member.job}` : ''}`}
                      animation={dropAnimation}
                      icon={photoIcons[index % photoIcons.length] || undefined}
                      label={
                        !photoIcons[index % photoIcons.length]
                          ? {
                              text: member.name
                                .split(' ')
                                .map(n => n[0])
                                .join(''),
                              className:
                                'bg-white text-neutral-800 px-2 py-1 rounded-full text-[10px] font-semibold shadow-md',
                            }
                          : undefined
                      }
                    />
                  ))}
                </GoogleMap>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 text-neutral-500 text-sm">
                  Loading map...
                </div>
              )}

              {/* Map overlay controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
                >
                  <Target className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>

              {/* Map legend */}
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/20">
                <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                  Live Team Status
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Available
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-neutral-600 dark:text-neutral-400">
                      On Job
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Off Duty
                    </span>
                  </div>
                </div>
              </div>

              {/* Live activity indicator */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                🔴 LIVE GPS TRACKING
              </div>
            </div>

              </CardContent>
            </Card>

            {/* Coming Up Appointments */}
            <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mr-3">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    Upcoming Jobs
                    <Badge variant="secondary" className="ml-3">
                      {selectedData.upcomingAppointments.length}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-8 px-3">
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[460px] md:h-[560px] space-y-4 overflow-y-scroll">
                  {selectedData.upcomingAppointments.map((appointment, index) => (
                    <div
                      key={index}
                      className="p-5 md:p-6 rounded-xl bg-gradient-to-r from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 shadow-sm hover:shadow-md transition-all duration-200 border border-neutral-200 dark:border-neutral-700 space-y-3"
                    >
                      {(() => {
                        const jobId = (appointment as any).jobId || appointment.customer
                        const clientName =
                          (appointment as any).clientName ||
                          appointment.service ||
                          appointment.customer
                        const tag = (appointment as any).tag
                        const tagTone = (appointment as any).tagTone || 'bg-blue-500'
                        const statusTag =
                          (appointment as any).statusTag || appointment.status
                        const statusTone =
                          (appointment as any).statusTone || 'bg-orange-500'
                        const source =
                          (appointment as any).source ||
                          (appointment as any).technician ||
                          ''
                        const agent = (appointment as any).agent || ''
                        const address = (appointment as any).address || 'No Address'
                        const timeWindow =
                          (appointment as any).timeWindow || appointment.time
                        const relativeTime =
                          (appointment as any).relativeTime ||
                          (appointment as any).duration ||
                          ''

                        return (
                          <div className="space-y-3">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm md:text-base font-bold text-emerald-600">
                                      {jobId}
                                    </span>
                                    <Eye className="w-3.5 h-3.5 text-neutral-400" />
                                    <span className="text-sm md:text-base font-semibold text-neutral-800 dark:text-neutral-100">
                                      {clientName}
                                    </span>
                                  </div>
                                  <div className="flex items-center flex-wrap gap-2 text-xs text-neutral-500">
                                    <span className="font-semibold text-neutral-600 dark:text-neutral-300">
                                      Source:
                                    </span>
                                    <span className="text-neutral-700 dark:text-neutral-300">
                                      {source || '—'}
                                    </span>
                                    {agent ? (
                                      <>
                                        <User className="w-3 h-3 text-neutral-400" />
                                        <span className="text-neutral-700 dark:text-neutral-300">
                                          {agent}
                                        </span>
                                      </>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
                                {tag ? (
                                  <Badge
                                    className={`text-[11px] font-semibold text-white px-3 py-1 rounded-full ${tagTone}`}
                                  >
                                    {tag}
                                  </Badge>
                                ) : null}
                                {statusTag ? (
                                  <Badge
                                    className={`text-[11px] font-semibold text-white px-3 py-1 rounded-full ${statusTone}`}
                                  >
                                    {statusTag}
                                  </Badge>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200">
                                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                <span className="font-semibold leading-snug">{address}</span>
                              </span>
                              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200">
                                <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                                <span className="font-semibold leading-snug">{timeWindow}</span>
                              </span>
                              {relativeTime ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200">
                                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span className="font-semibold leading-snug">
                                    {relativeTime}
                                  </span>
                                </span>
                              ) : null}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Technicians */}
            <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg mr-3">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  Top Technicians
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedData.topTechnicians.map((tech, index) => (
                    <div
                      key={tech.name}
                      className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                            {tech.name}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-neutral-500">
                            <Badge
                              variant={
                                tech.status === 'Available'
                                  ? 'default'
                                  : tech.status === 'On Job'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className="text-xs"
                            >
                              {tech.status}
                            </Badge>
                            <span className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 mr-1" />
                              {tech.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                          {tech.revenue}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {tech.jobs} jobs
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Job Types */}
            <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg mr-3">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  Top Job Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    name: 'Garage Door Repair',
                    percentage: 76.45,
                    count: 189,
                    revenue: '$92,450',
                  },
                  {
                    name: 'Appliances',
                    percentage: 12.3,
                    count: 30,
                    revenue: '$18,940',
                  },
                  {
                    name: 'Air Duct Cleaning',
                    percentage: 7.8,
                    count: 19,
                    revenue: '$12,180',
                  },
                  {
                    name: 'Gate Repair',
                    percentage: 3.45,
                    count: 9,
                    revenue: '$5,420',
                  },
                ].map(type => (
                  <div key={type.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {type.name}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                          {type.percentage}%
                        </span>
                        <div className="text-xs text-neutral-500">
                          {type.count} jobs • {type.revenue}
                        </div>
                      </div>
                    </div>
                    <Progress value={type.percentage} className="h-3" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Jobs by Status Chart */}
            <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg mr-3">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  Jobs by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Done Jobs',
                      value: 189,
                      percentage: 76.5,
                      color: 'bg-green-500',
                    },
                    {
                      name: 'Open Jobs',
                      value: 47,
                      percentage: 19,
                      color: 'bg-blue-500',
                    },
                    {
                      name: 'Canceled Jobs',
                      value: 11,
                      percentage: 4.5,
                      color: 'bg-red-500',
                    },
                    {
                      name: 'Custom A',
                      value: 14,
                      percentage: 5.6,
                      color: 'bg-amber-500',
                    },
                    {
                      name: 'Custom B',
                      value: 9,
                      percentage: 3.4,
                      color: 'bg-purple-500',
                    },
                  ].map(status => (
                    <div
                      key={status.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full ${status.color}`}
                        ></div>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {status.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                          {status.value}
                        </span>
                        <div className="text-xs text-neutral-500">
                          {status.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Agents */}
            <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg mr-3">
                    <PhoneCall className="w-5 h-5 text-white" />
                  </div>
                  Agents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {agentStats.map(stat => {
                  const Icon = stat.icon
                  const changeColor =
                    stat.changeType === 'positive'
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  return (
                    <div
                      key={stat.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${stat.color}`}></div>
                        <div className="flex items-center space-x-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          <span>{stat.name}</span>
                          <Icon className="w-4 h-4 text-neutral-400" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                          {stat.value}
                        </p>
                        <p className={`text-xs font-semibold ${changeColor}`}>
                          {stat.change}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Estimates & Invoices Panel */}
            <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <span>Estimates & Invoices</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {estimateInvoiceStats.map(item => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 border border-neutral-200/70 dark:border-neutral-800 shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${item.badgeColor} shadow-sm shadow-black/10`}
                      ></div>
                      <div>
                        <p className={`text-sm font-semibold ${item.color}`}>
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${item.color}`}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="px-6 pb-4 pt-1">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowInvoicesModal(true)}
                >
                  View All
                </Button>
              </div>
            </Card>

            {/* Service Areas */}
            <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mr-3">
                    <Map className="w-5 h-5 text-white" />
                  </div>
                  Service Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceAreas.map(area => (
                  <div
                    key={area.name}
                    className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {area.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {area.jobs} jobs • {area.revenue}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-neutral-500 mt-1">
                        <Badge variant="outline">{area.sla}</Badge>
                        <span className="flex items-center text-emerald-600 font-medium">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {area.trend}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        Coverage
                      </p>
                      <p className="text-xs text-neutral-500">Route ready</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payouts Panel */}
            <Card className="lg:col-span-12 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg mr-3 shadow-sm">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        Credit Card Payouts
                        <Info className="w-4 h-4 text-neutral-400" />
                      </p>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {payoutDispatchers.map(dispatcher => (
                  <div
                    key={dispatcher.name}
                    className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden"
                  >
                    <div className="px-4 py-3 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/80">
                      <div className="text-sky-700 dark:text-sky-200 font-semibold text-sm uppercase tracking-wide">
                        {dispatcher.name}
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs border-sky-300 text-sky-700 dark:text-sky-200 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/20"
                      >
                        Action Required
                      </Badge>
                    </div>
                    <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 flex items-start gap-2 text-sm leading-relaxed border-t border-amber-100 dark:border-amber-800/60">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500 dark:text-amber-300" />
                      <span>{dispatcher.note}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="assistant" className="space-y-6">
          {/* WePro AI Assistant */}
          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden border-l-8 border-l-purple-500 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 opacity-95"></div>

            <CardHeader className="relative z-10 pb-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center text-2xl">
                  <div className="p-3 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl mr-4 shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <span className="text-white font-bold">WePro AI Assistant</span>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                      <span className="text-purple-200 text-sm">
                        Actively monitoring your business
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full text-xs font-semibold text-white shadow-lg">
                    🚀 AI POWERED
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Configure AI
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    View All Insights
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Insights */}
                <div className="lg:col-span-2 space-y-4">
                  {aiInsights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-500/30 rounded-lg">
                          {insight.type === 'optimization' && (
                            <TrendingUp className="w-5 h-5 text-blue-200" />
                          )}
                          {insight.type === 'attention' && (
                            <AlertCircle className="w-5 h-5 text-yellow-200" />
                          )}
                          {insight.type === 'opportunity' && (
                            <DollarSign className="w-5 h-5 text-green-200" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-lg mb-2">
                            {insight.title}
                          </h4>
                          <p className="text-purple-200 mb-3">
                            {insight.description}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2 text-sm">
                            <span className="text-green-300 font-semibold">
                              {insight.impact}
                            </span>
                            <span className="text-blue-300">
                              Confidence: {insight.confidence}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Performance Stats */}
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <h4 className="font-semibold text-white mb-4 flex items-center">
                      <PieChart className="w-5 h-5 mr-2" />
                      AI Performance Today
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-purple-200 mb-2">
                          <span>Schedule Optimization</span>
                          <span>94%</span>
                        </div>
                        <div className="w-full bg-purple-900/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-400 to-blue-500 h-2 rounded-full"
                            style={{ width: '94%' }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm text-purple-200 mb-2">
                          <span>Customer Predictions</span>
                          <span>87%</span>
                        </div>
                        <div className="w-full bg-purple-900/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                            style={{ width: '87%' }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm text-purple-200 mb-2">
                          <span>Revenue Forecasting</span>
                          <span>91%</span>
                        </div>
                        <div className="w-full bg-purple-900/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                            style={{ width: '91%' }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-xl border border-white/10">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          $18,750
                        </div>
                        <div className="text-purple-200 text-sm">
                          Revenue saved by AI this month
                        </div>
                        <div className="flex items-center justify-center mt-2 text-green-300 text-sm">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          +$2,340 vs last month
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Estimates & Invoices Modal */}
      <Dialog
        open={showInvoicesModal}
        onOpenChange={open => {
          setShowInvoicesModal(open)
          if (!open) setInvoicePage(1)
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>All Estimates & Invoices</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {paginatedInvoices.map(invoice => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                <div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {invoice.id} • {invoice.customer}
                  </div>
                  <div className="text-xs text-neutral-500">Due: {invoice.due}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      invoice.status.toLowerCase() === 'paid'
                        ? 'default'
                        : invoice.status.toLowerCase() === 'overdue'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="text-xs capitalize"
                  >
                    {invoice.status}
                  </Badge>
                  <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {invoice.amount}
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-neutral-500">
              Page {invoicePage} of {invoicePageCount}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={invoicePage <= 1}
                onClick={() => setInvoicePage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={invoicePage >= invoicePageCount}
                onClick={() =>
                  setInvoicePage(p => Math.min(invoicePageCount, p + 1))
                }
              >
                Next
              </Button>
              <Button variant="outline" onClick={() => setShowInvoicesModal(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default DashboardIndex
