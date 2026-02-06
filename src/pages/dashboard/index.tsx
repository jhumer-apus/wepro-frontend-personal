import React, { useState, useEffect, useRef } from 'react'
import type { DateValueType } from 'react-tailwindcss-datepicker'
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
import InputDatepicker from '@/src/components/input/datepicker'
import SelectInput from '@/src/components/input/select'
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
  Minimize2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Settings as SettingsIcon,
  Briefcase,
  MessageSquare,
  Eye,
  MapPin,
  User,
  Info,
  X,
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
    { name: 'Cancellation Rate', value: '66.2%', change: '+2.3%', changeType: 'positive' as const, subtitle: '5 out of total 52 jobs' },
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
      { name: 'Cancellation Rate', value: '64.0%', change: '+1.2%', changeType: 'positive' as const, subtitle: '5 out of total 52 jobs' },
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
      { name: 'Cancellation Rate', value: '69.8%', change: '+3.4%', changeType: 'positive' as const, subtitle: '5 out of total 52 jobs' },
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
      { name: 'Cancellation Rate', value: '68.1%', change: '+2.1%', changeType: 'positive' as const, subtitle: '5 out of total 52 jobs' },
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
  'https://t4.ftcdn.net/jpg/03/83/25/83/360_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg',
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
  const [dateRangeValue, setDateRangeValue] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  })
  const handleDateRangeChange = (value: DateValueType) => {
    setDateRangeValue(value || { startDate: null, endDate: null })
    setSelectedDateRange('custom-picker')
  }
  const formatCustomDateRangeLabel = () => {
    const start = dateRangeValue?.startDate
    const end = dateRangeValue?.endDate
    if (!start || !end) return 'Select range'
    return `${formatDate(new Date(start))} – ${formatDate(new Date(end))}`
  }
  const currentDateRangeLabel =
    selectedDateRange === 'custom-picker'
      ? formatCustomDateRangeLabel()
      : dateRangeToDisplay(selectedDateRange)
  const [markerBuffer, setMarkerBuffer] = useState(false)
  const [photoIcons, setPhotoIcons] = useState<(google.maps.Icon | null)[]>([])
  const [mapFilter, setMapFilter] = useState<'all' | 'job' | 'technician'>('all')
  const [showInvoicesModal, setShowInvoicesModal] = useState(false)
  const [showTopSourcesModal, setShowTopSourcesModal] = useState(false)
  const [topSourcesPage, setTopSourcesPage] = useState(1)
  const [showTopTechniciansModal, setShowTopTechniciansModal] = useState(false)
  const [topTechniciansPage, setTopTechniciansPage] = useState(1)
  const [showServiceAreasModal, setShowServiceAreasModal] = useState(false)
  const [serviceAreasPage, setServiceAreasPage] = useState(1)
  const [showTopJobTypesModal, setShowTopJobTypesModal] = useState(false)
  const [topJobTypesPage, setTopJobTypesPage] = useState(1)
  const [showMapModal, setShowMapModal] = useState(false)
  const [showUpcomingModal, setShowUpcomingModal] = useState(false)
  const [upcomingPage, setUpcomingPage] = useState(1)
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
    { name: 'Houston', totalJobs: 12, completedJobs: 3, cancellationRate: 8.33, revenue: '$850.00' },
    { name: 'San Francisco Bay Area', totalJobs: 1, completedJobs: 0, cancellationRate: 100, revenue: '$0.00' },
    { name: 'Dallas Urban', totalJobs: 4, completedJobs: 1, cancellationRate: 0, revenue: '$400.00' },
    { name: 'Austin Metro', totalJobs: 3, completedJobs: 1, cancellationRate: 15, revenue: '$265.00' },
    { name: 'Phoenix', totalJobs: 2, completedJobs: 0, cancellationRate: 50, revenue: '$180.00' },
  ]
  const topJobTypesData = [
    { name: 'Car Lockout', totalJobs: 15, completedJobs: 1, cancellationRate: 0, revenue: '$100.00' },
    { name: 'House Lockout', totalJobs: 10, completedJobs: 2, cancellationRate: 10, revenue: '$750.00' },
    { name: 'Car Key', totalJobs: 7, completedJobs: 0, cancellationRate: 0, revenue: '$0.00' },
    { name: 'Garage Door Repair', totalJobs: 3, completedJobs: 0, cancellationRate: 0, revenue: '$0.00' },
    { name: 'Service', totalJobs: 3, completedJobs: 0, cancellationRate: 0, revenue: '$0.00' },
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
    {
      name: 'Rapid Response',
      note: 'No Stripe record setup for this dispatcher.',
    },
    {
      name: 'Metro Field Ops',
      note: 'No Stripe record setup for this dispatcher.',
    },
    {
      name: 'Evergreen Services',
      note: 'No Stripe record setup for this dispatcher.',
    },
  ]
  const payoutsRef = useRef<HTMLDivElement | null>(null)
  const [isDraggingPayouts, setIsDraggingPayouts] = useState(false)
  const payoutDragStartX = useRef(0)
  const payoutDragStartScroll = useRef(0)
  const payoutDragMoved = useRef(false)
  const [payoutScrollState, setPayoutScrollState] = useState({ canScrollLeft: false, canScrollRight: false })
  const getPayoutStats = (name: string) => {
    // Simulate missing Stripe setup for specific dispatchers (e.g., VS DISPATCH)
    if (name.toLowerCase() === 'vs dispatch') return null
    let hash = 0
    for (let i = 0; i < name.length; i += 1) {
      hash = (hash * 31 + name.charCodeAt(i)) % 100000
    }
    const balance = 10000 + (hash % 8000) + (hash % 97)
    const feeRate = 0.015
    const fee = balance * feeRate
    const available = balance - fee
    const fmt = (n: number) => n.toFixed(2)
    return { balance: fmt(balance), available: fmt(available), fee: fmt(fee) }
  }

  const startPayoutDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = payoutsRef.current
    if (!container) return
    setIsDraggingPayouts(true)
    payoutDragStartX.current = event.clientX
    payoutDragStartScroll.current = container.scrollLeft
    payoutDragMoved.current = false
    container.classList.add('cursor-grabbing', 'select-none')
  }

  const handlePayoutDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingPayouts) return
    const container = payoutsRef.current
    if (!container) return
    const deltaX = event.clientX - payoutDragStartX.current
    if (Math.abs(deltaX) > 3) {
      payoutDragMoved.current = true
    }
    container.scrollLeft = payoutDragStartScroll.current - deltaX
  }

  const endPayoutDrag = () => {
    if (!isDraggingPayouts) return
    setIsDraggingPayouts(false)
    payoutsRef.current?.classList.remove('cursor-grabbing', 'select-none')
  }

  const updatePayoutScrollState = () => {
    const el = payoutsRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setPayoutScrollState({
      canScrollLeft: scrollLeft > 2,
      canScrollRight: scrollLeft + clientWidth < scrollWidth - 2,
    })
  }

  useEffect(() => {
    updatePayoutScrollState()
    const el = payoutsRef.current
    if (!el) return
    const onScroll = () => updatePayoutScrollState()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [payoutDispatchers.length])
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
                  <div className="w-40">
                    <SelectInput
                      value={dispatcherType}
                      options={[
                        { label: 'All', value: 'all' },
                        { label: 'VS Dispatch', value: 'vs-dispatch' },
                        { label: 'LockSmith 24/7', value: 'locksmith-24-7' },
                        { label: 'Locksmith GDS', value: 'locksmith-gds' },
                      ]}
                      placeholder="All"
                      onSelect={val => setDispatcherType(Array.isArray(val) ? (val[0] as string) : (val as string))}
                      onSearch={() => {}}
                    />
                  </div>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Date Range:
                    </span>
                  <div className="w-72">
                    <InputDatepicker
                      value={dateRangeValue}
                      onChange={handleDateRangeChange}
                      label={undefined}
                    />
                  </div>
                  </div>
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
                  <CardContent className="p-6 relative">
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
            <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mr-3">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    Top Lead Sources
                  </div>
                  {selectedData.topSources.length > 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 px-3"
                      onClick={() => setShowTopSourcesModal(true)}
                    >
                      View All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedData.topSources.slice(0, 4).map(source => (
                  <div key={source.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 block">
                          {source.name}
                        </span>
                        <p className="text-xs text-neutral-500">
                          {source.count} total jobs ({source.completed ?? 0} completed)
                        </p>
                        <p className="text-xs text-neutral-500">
                          Cancellation Rate
                        </p>
                        <p className="text-xs font-semibold text-emerald-600">
                          {source.cancellationRate ?? source.value}%
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-300">
                          {source.revenue}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={parseFloat((source.cancellationRate ?? source.value).toString())}
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
                      {metric.subtitle ? (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {metric.subtitle}
                        </p>
                      ) : null}
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
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full h-8 flex items-center">
                      {[
                        { key: 'all', label: 'All' },
                        { key: 'job', label: 'Job' },
                        { key: 'technician', label: 'Technician' },
                      ].map(option => (
                        <Button
                          key={option.key}
                          size="sm"
                          variant={mapFilter === option.key ? 'default' : 'ghost'}
                          className={`h-6 px-3 text-xs rounded-full ${
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
                      className="shadow-sm hover:shadow-md transition-all duration-200 text-xs h-8 px-3"
                      onClick={() => setShowMapModal(true)}
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
                      label={{
                        text: member.name,
                        className: 'text-xs font-semibold text-neutral-800 bg-white px-2 py-1 rounded-full shadow-sm mt-[80px]',
                        color: '#0f172a',
                      }}
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3"
                    onClick={() => setShowUpcomingModal(true)}
                  >
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
            <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg mr-3">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    Top Technicians
                  </div>
                  {selectedData.topTechnicians.length > 4 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 px-3"
                      onClick={() => setShowTopTechniciansModal(true)}
                    >
                      View All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedData.topTechnicians.slice(0, 3).map((tech, index) => {
                  const cancellation = Number(tech.cancellationRate ?? 0)
                  const totalJobs = Number(tech.totalJobs ?? tech.jobs ?? 0)
                  const completedJobs = Number(tech.completedJobs ?? 0)
                  const badgeTone =
                    tech.status === 'Available'
                      ? 'bg-green-100 text-green-800'
                      : tech.status === 'On Job'
                        ? 'bg-blue-100 text-blue-800'
                        : tech.status === 'WA Group'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-neutral-200 text-neutral-700'
                  return (
                    <div
                      key={tech.name}
                      className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/60"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                              {tech.name}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {totalJobs} total jobs ({completedJobs} completed)
                            </div>
                          </div>
                        </div>
                        <Badge className={`text-xs ${badgeTone}`}>{tech.status}</Badge>
                      </div>
                      <div className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                        {tech.revenue}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500">Cancellation Rate</div>
                      <Progress value={cancellation} className="h-2" />
                      <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 mt-1">
                        {cancellation.toFixed(2)}%
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Top Job Types */}
            <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg mr-3">
                      <Wrench className="w-5 h-5 text-white" />
                    </div>
                    Top Job Types
                  </div>
                  {topJobTypesData.length > 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 px-3"
                      onClick={() => setShowTopJobTypesModal(true)}
                    >
                      View All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topJobTypesData.slice(0, 3).map(type => {
                  const cancellation = Number(type.cancellationRate ?? 0)
                  return (
                    <div key={type.name} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/60">
                      <div className="flex items-start justify-between">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {type.name}
                        </span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-300">
                          {type.revenue}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {type.totalJobs ?? 0} total jobs ({type.completedJobs ?? 0} completed)
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">Cancellation Rate</p>
                      <Progress value={cancellation} className="h-2" />
                      <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mt-1">
                        {cancellation.toFixed(2)}%
                      </div>
                    </div>
                  )
                })}
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
                    name: 'Completed Jobs',
                    value: 142,
                    percentage: 57.8,
                    color: 'bg-emerald-500',
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
            <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                      <Receipt className="w-5 h-5 text-white" />
                    </div>
                    <span>Estimates & Invoices</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3"
                    onClick={() => setShowInvoicesModal(true)}
                  >
                    View All
                  </Button>
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
            </Card>

            {/* Service Areas */}
            <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mr-3">
                      <Map className="w-5 h-5 text-white" />
                    </div>
                    Service Areas
                  </div>
                  {serviceAreas.length > 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 px-3"
                      onClick={() => setShowServiceAreasModal(true)}
                    >
                      View All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceAreas.slice(0, 3).map(area => {
                  const cancellation = Number(area.cancellationRate ?? 0)
                  return (
                    <div
                      key={area.name}
                      className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/60"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {area.name}
                        </p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-300">
                          {area.revenue}
                        </p>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {area.totalJobs ?? 0} total jobs ({area.completedJobs ?? 0} completed)
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">Cancellation Rate</p>
                      <Progress value={cancellation} className="h-2" />
                      <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mt-1">
                        {cancellation.toFixed(2)}%
                      </div>
                    </div>
                  )
                })}
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
              <CardContent className="space-y-3">
                <div className="relative">
                  {payoutScrollState.canScrollLeft && (
                    <button
                      type="button"
                      className="absolute flex left-0 top-0 items-center bottom-0 z-10 w-16 bg-gradient-to-l from-transparent via-white/80 to-white dark:from-slate-900 dark:via-slate-900/80"
                      onMouseDown={e => e.stopPropagation()}
                      onClick={() => {
                        payoutsRef.current?.scrollBy({ left: -260, behavior: 'smooth' })
                        setTimeout(updatePayoutScrollState, 200)
                      }}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}
                  {payoutScrollState.canScrollRight && (
                    <button
                      type="button"
                      className="absolute flex right-0 top-0 justify-end items-center bottom-0 z-10 w-16 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80"
                      onMouseDown={e => e.stopPropagation()}
                      onClick={() => {
                        payoutsRef.current?.scrollBy({ left: 260, behavior: 'smooth' })
                        setTimeout(updatePayoutScrollState, 200)
                      }}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}
                  <div
                    className="overflow-x-auto pb-2 cursor-grab scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    ref={payoutsRef}
                    onMouseDown={startPayoutDrag}
                    onMouseMove={handlePayoutDrag}
                    onMouseUp={endPayoutDrag}
                    onMouseLeave={endPayoutDrag}
                  >
                    <div className="flex gap-4 min-w-full">
                      {payoutDispatchers.map(dispatcher => (
                        <div key={dispatcher.name}>
                          <div
                            className="min-w-[400px] flex flex-col rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden h-full"
                          >
                            <div className="px-4 py-3 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/80 border-b border-neutral-100 dark:border-neutral-800/60">
                              <div>
                                <div className="text-sky-700 dark:text-sky-200 font-semibold text-sm uppercase tracking-wide">
                                  {dispatcher.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  Payouts & Balances
                                </div>
                              </div>
                            </div>
                            {(() => {
                              const stats = getPayoutStats(dispatcher.name)
                              if (!stats) return null
                              return (
                                <div className="px-4 pt-4 pb-3 bg-sky-50 dark:bg-slate-900/40 border-b border-sky-100 dark:border-slate-800">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-xs font-semibold text-slate-500">Current Balance</p>
                                      <p className="text-2xl font-bold text-sky-800 dark:text-sky-200">${stats.balance} USD</p>
                                    </div>
                                    <div className="p-2 rounded-full bg-white shadow border border-sky-100 dark:bg-slate-800 dark:border-slate-700">
                                      <CreditCard className="w-4 h-4 text-sky-500" />
                                    </div>
                                  </div>
                                </div>
                              )
                            })()}
                            {(() => {
                              const stats = getPayoutStats(dispatcher.name)
                              if (!stats) {
                                return (
                                  <div className="items-center justify-center flex-1 px-4 py-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 flex items-start gap-2 text-sm leading-relaxed border-t border-amber-100 dark:border-amber-800/60">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500 dark:text-amber-300" />
                                    <span>{dispatcher.note}</span>
                                  </div>
                                )
                              }
                              return (
                                <div className="px-4 py-4 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-100 dark:border-emerald-800/60">
                                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-200 uppercase tracking-wide">
                                    Instant Payout Available Now
                                  </p>
                                  <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-100 mt-1">
                                    ${stats.available}
                                  </p>
                                  <p className="text-xs text-emerald-700 dark:text-emerald-200">
                                    After 1.5% fee (${stats.fee})
                                  </p>
                                  <Button className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                                    Payout Now
                                  </Button>
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* Top Sources modal */}
        <Dialog
          open={showTopSourcesModal}
          onOpenChange={open => {
            setShowTopSourcesModal(open)
            if (!open) setTopSourcesPage(1)
          }}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">All Top Sources</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {(() => {
                const pageSize = 5
                const sources = selectedData.topSources || []
                const pageCount = Math.max(1, Math.ceil(sources.length / pageSize))
                const page = Math.min(topSourcesPage, pageCount)
                const slice = sources.slice((page - 1) * pageSize, page * pageSize)
                return (
                  <>
                    {slice.map(source => (
                <div key={source.name} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{source.name}</p>
                      <p className="text-xs text-neutral-500">
                        {source.count} total jobs ({source.completed ?? 0} completed)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-300">{source.revenue}</p>
                      <p className="text-xs text-neutral-500">Cancellation Rate</p>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                        {source.cancellationRate ?? source.value}%
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={parseFloat((source.cancellationRate ?? source.value).toString())}
                    className="h-2"
                  />
                </div>
              ))}
                    <DialogFooter className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-xs text-neutral-500">
                        Page {page} of {pageCount}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page <= 1}
                          onClick={() => setTopSourcesPage(p => Math.max(1, p - 1))}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page >= pageCount}
                          onClick={() => setTopSourcesPage(p => Math.min(pageCount, p + 1))}
                        >
                          Next
                        </Button>
                        <Button variant="outline" onClick={() => setShowTopSourcesModal(false)}>
                          Close
                        </Button>
                      </div>
                    </DialogFooter>
                  </>
                )
              })()}
            </div>
          </DialogContent>
        </Dialog>

        {/* Top Technicians modal */}
        <Dialog
          open={showTopTechniciansModal}
          onOpenChange={open => {
            setShowTopTechniciansModal(open)
            if (!open) setTopTechniciansPage(1)
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">All Top Technicians</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {(() => {
                const pageSize = 3
                const techs = selectedData.topTechnicians || []
                const pageCount = Math.max(1, Math.ceil(techs.length / pageSize))
                const page = Math.min(topTechniciansPage, pageCount)
                const slice = techs.slice((page - 1) * pageSize, page * pageSize)
                return (
                  <>
                    {slice.map((tech, idx) => {
                      const cancellation = Number(tech.cancellationRate ?? 0)
                      const totalJobs = Number(tech.totalJobs ?? tech.jobs ?? 0)
                      const completedJobs = Number(tech.completedJobs ?? 0)
                      const badgeTone =
                        tech.status === 'Available'
                          ? 'bg-green-100 text-green-800'
                          : tech.status === 'On Job'
                            ? 'bg-blue-100 text-blue-800'
                            : tech.status === 'WA Group'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-neutral-200 text-neutral-700'
                      return (
                        <div
                          key={tech.name}
                          className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 space-y-1.5"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm">
                                #{(page - 1) * pageSize + idx + 1}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                                  {tech.name}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  {totalJobs} total jobs ({completedJobs} completed)
                                </p>
                              </div>
                            </div>
                            <Badge className={`text-xs ${badgeTone}`}>{tech.status}</Badge>
                          </div>
                          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-300">
                            {tech.revenue}
                          </div>
                          <div className="text-xs text-neutral-500">Cancellation Rate</div>
                          <Progress value={cancellation} className="h-2" />
                          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                            {cancellation.toFixed(2)}%
                          </div>
                        </div>
                      )
                    })}
                    <DialogFooter className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-xs text-neutral-500">
                        Page {page} of {pageCount}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page <= 1}
                          onClick={() => setTopTechniciansPage(p => Math.max(1, p - 1))}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page >= pageCount}
                          onClick={() => setTopTechniciansPage(p => Math.min(pageCount, p + 1))}
                        >
                          Next
                        </Button>
                        <Button variant="outline" onClick={() => setShowTopTechniciansModal(false)}>
                          Close
                        </Button>
                      </div>
                    </DialogFooter>
                  </>
                )
              })()}
            </div>
          </DialogContent>
        </Dialog>

        {/* Service Areas modal */}
        <Dialog
          open={showServiceAreasModal}
          onOpenChange={open => {
            setShowServiceAreasModal(open)
            if (!open) setServiceAreasPage(1)
          }}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">All Service Areas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {(() => {
                const pageSize = 4
                const areas = serviceAreas || []
                const pageCount = Math.max(1, Math.ceil(areas.length / pageSize))
                const page = Math.min(serviceAreasPage, pageCount)
                const slice = areas.slice((page - 1) * pageSize, page * pageSize)
                return (
                  <>
                    {slice.map(area => {
                      const cancellation = Number(area.cancellationRate ?? 0)
                      return (
                        <div
                          key={area.name}
                          className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 space-y-1.5"
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                              {area.name}
                            </p>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-300">
                              {area.revenue}
                            </p>
                          </div>
                          <p className="text-xs text-neutral-500">
                            {area.totalJobs ?? 0} total jobs ({area.completedJobs ?? 0} completed)
                          </p>
                          <p className="text-xs text-neutral-500">Cancellation Rate</p>
                          <Progress value={cancellation} className="h-2" />
                          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                            {cancellation.toFixed(2)}%
                          </div>
                        </div>
                      )
                    })}
                    <DialogFooter className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-xs text-neutral-500">
                        Page {page} of {pageCount}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page <= 1}
                          onClick={() => setServiceAreasPage(p => Math.max(1, p - 1))}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page >= pageCount}
                          onClick={() => setServiceAreasPage(p => Math.min(pageCount, p + 1))}
                        >
                          Next
                        </Button>
                        <Button variant="outline" onClick={() => setShowServiceAreasModal(false)}>
                          Close
                        </Button>
                      </div>
                    </DialogFooter>
                  </>
                )
              })()}
            </div>
          </DialogContent>
        </Dialog>

        {/* Top Job Types modal */}
        <Dialog
          open={showTopJobTypesModal}
          onOpenChange={open => {
            setShowTopJobTypesModal(open)
            if (!open) setTopJobTypesPage(1)
          }}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">All Top Job Types</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {(() => {
                const pageSize = 4
                const types = topJobTypesData || []
                const pageCount = Math.max(1, Math.ceil(types.length / pageSize))
                const page = Math.min(topJobTypesPage, pageCount)
                const slice = types.slice((page - 1) * pageSize, page * pageSize)
                return (
                  <>
                    {slice.map(type => {
                      const cancellation = Number(type.cancellationRate ?? 0)
                      return (
                        <div key={type.name} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 space-y-1.5">
                          <div className="flex items-start justify-between">
                            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                              {type.name}
                            </span>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-300">
                              {type.revenue}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500">
                            {type.totalJobs ?? 0} total jobs ({type.completedJobs ?? 0} completed)
                          </p>
                          <p className="text-xs text-neutral-500">Cancellation Rate</p>
                          <Progress value={cancellation} className="h-2" />
                          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                            {cancellation.toFixed(2)}%
                          </div>
                        </div>
                      )
                    })}
                    <DialogFooter className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-xs text-neutral-500">
                        Page {page} of {pageCount}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page <= 1}
                          onClick={() => setTopJobTypesPage(p => Math.max(1, p - 1))}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page >= pageCount}
                          onClick={() => setTopJobTypesPage(p => Math.min(pageCount, p + 1))}
                        >
                          Next
                        </Button>
                        <Button variant="outline" onClick={() => setShowTopJobTypesModal(false)}>
                          Close
                        </Button>
                      </div>
                    </DialogFooter>
                  </>
                )
              })()}
            </div>
          </DialogContent>
        </Dialog>

        {/* Upcoming Jobs modal */}
        <Dialog
          open={showUpcomingModal}
          onOpenChange={open => {
            setShowUpcomingModal(open)
            if (!open) setUpcomingPage(1)
          }}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">All Upcoming Jobs</DialogTitle>
            </DialogHeader>
            {(() => {
              const pageSize = 6
              const jobs = selectedData.upcomingAppointments || []
              const pageCount = Math.max(1, Math.ceil(jobs.length / pageSize))
              const page = Math.min(upcomingPage, pageCount)
              const slice = jobs.slice((page - 1) * pageSize, page * pageSize)
              return (
                <>
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    {slice.map((appointment, index) => {
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
                        (appointment as any).statusTime ||
                        ''
                      return (
                        <div
                          key={`${jobId}-${index}`}
                          className="p-4 rounded-xl bg-gradient-to-r from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-700 space-y-2"
                        >
                          <div className="flex flex-row justify-between">
                            <div className="flex flex-col space-y-0.5">
                              <p className="text-sm uppercase font-semibold text-emerald-600 dark:text-neutral-100 mb-1">
                                {jobId}
                              </p>
                              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {clientName}
                              </p>
                              
                              <div className='flex flex-row gap-1'>
                                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                                  Source:
                                </span>
                                <span className="text-xs text-neutral-700 dark:text-neutral-300">
                                  {source || '—'}
                                </span>
                              </div>
                              {agent ? (
                                <div className='flex flex-row gap-1 items-center'>
                                  <User className="w-3 h-3 text-neutral-700" />
                                  <span className="text-xs text-neutral-700 dark:text-neutral-300">
                                    {agent}
                                  </span>
                                </div>
                              ) : null}
                              <p className="text-xs text-neutral-500">{address}</p>
                            </div>
                            <div className="flex flex-row gap-2">
                              <div>
                                {tag ? (
                                  <Badge
                                    className={`text-xs ${tagTone} py-1`}
                                  >
                                    {tag}
                                  </Badge>
                                ) : null}
                              </div>
                              <div>
                                <Badge
                                  className={`text-xs ${statusTone} py-1`}
                                >
                                  {statusTag}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                            <span className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-full px-2 py-1">
                              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                              {timeWindow}
                            </span>
                            {relativeTime ? (
                              <span className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-full px-2 py-1">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                {relativeTime}
                              </span>
                            ) : null}
                            {source ? (
                              <span className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-full px-2 py-1">
                                <User className="w-3.5 h-3.5 text-neutral-500" />
                                {source}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <DialogFooter className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-xs text-neutral-500">
                      Page {Math.min(upcomingPage, Math.max(1, Math.ceil((selectedData.upcomingAppointments || []).length / 6)))} of {Math.max(1, Math.ceil((selectedData.upcomingAppointments || []).length / 6))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={upcomingPage <= 1}
                        onClick={() => setUpcomingPage(p => Math.max(1, p - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={upcomingPage >= Math.max(1, Math.ceil((selectedData.upcomingAppointments || []).length / 6))}
                        onClick={() => setUpcomingPage(p => Math.min(Math.max(1, Math.ceil((selectedData.upcomingAppointments || []).length / 6)), p + 1))}
                      >
                        Next
                      </Button>
                      <Button variant="outline" onClick={() => setShowUpcomingModal(false)}>
                        Close
                      </Button>
                    </div>
                  </DialogFooter>
                </>
              )
            })()}
          </DialogContent>
        </Dialog>

        {/* Map Fullscreen modal */}
        <Dialog open={showMapModal} onOpenChange={setShowMapModal} modal>
          <DialogContent className="max-w-[100vw] w-[100vw] h-[100vh] [&>button]:hidden flex flex-col rounded-none sm:rounded-none">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold flex flex-row items-center justify-between gap-2">
                <div className="flex flex-row items-center gap-2">
                  <Map className="w-4 h-4" />
                  Team Map - Full Screen
                </div>
                <div className="flex items-center justify-between px-1 gap-2">
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
                        onClick={() => setMapFilter(option.key as 'all' | 'job' | 'technician')}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shadow-sm hover:shadow-md rounded-full transition-all duration-200 text-xs h-10 w-10"
                      onClick={() => setShowMapModal(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapCenter}
                  zoom={12}
                  options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                  }}
                >
                  {teamMembers.map((member, idx) => {
                    const icon = photoIcons[idx]
                    return (
                      <Marker
                        key={member.name}
                        position={{
                          lat: mapCenter.lat + (member.offset?.lat ?? 0),
                          lng: mapCenter.lng + (member.offset?.lng ?? 0),
                        }}
                        icon={icon ?? undefined}
                        label={{
                          text: member.name,
                          className: 'text-xs font-semibold text-neutral-800 bg-white px-2 py-1 rounded-full shadow-sm mt-[80px]',
                          color: '#0f172a',
                        }}
                      />
                    )
                  })}
                </GoogleMap>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-neutral-500">Loading map...</div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <TabsContent value="assistant" className="space-y-6">
          {/* WePro AI Assistant */}
          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden border-l-8 border-l-purple-500 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 opacity-95"></div>

            <CardHeader className="relative pb-6">
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

            <CardContent className="relative">
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
