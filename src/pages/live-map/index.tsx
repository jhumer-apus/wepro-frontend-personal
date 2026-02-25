import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { DateValueType } from 'react-tailwindcss-datepicker'
import { GoogleMap, Marker, OverlayView } from '@react-google-maps/api'
import { useTheme } from 'next-themes'
import {
  AlertTriangle,
  Car,
  Clock3,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  MapPin,
  MousePointer2,
  Plus,
  Route,
  Settings,
  Search,
  Sparkles,
  Star,
} from 'lucide-react'
import { Input } from '@/src/components/ui/input'
import { Button } from '@/src/components/ui/button'
import InputDatepicker from '@/src/components/input/datepicker'
import SelectInput from '@/src/components/input/select'
import SidePanel from '@/src/components/sidePanel'

type StatusItem = {
  id: string
  name: string
  color: string
}

const STATUS_FILTERS: StatusItem[] = [
  { id: 'rejected', name: 'Rejected', color: '#2563EB' },
  { id: 'canceled', name: 'Canceled', color: '#EF4444' },
  { id: 'pending', name: 'Pending', color: '#8B5CF6' },
  { id: 'done', name: 'Done', color: '#22C55E' },
  { id: 'in-progress', name: 'In Progress', color: '#3B82F6' },
  { id: 'no-answer', name: 'No Answer', color: '#F59E42' },
  { id: 'appointments', name: 'Appointments', color: '#22C55E' },
  { id: 'not-confirmed', name: 'Not Confirmed', color: '#EF4444' },
  { id: 'submitted', name: 'Submitted', color: '#FBBF24' },
  { id: 'follow-up', name: 'Follow Up', color: '#FBBF24' },
  { id: 'confirmed', name: 'Confirmed', color: '#22C55E' },
]

type JobTagItem = {
  id: string
  name: string
  color: string
}

const JOB_TAGS: JobTagItem[] = [
  { id: 'urgent', name: 'Urgent', color: '#EF4444' },
  { id: 'warranty', name: 'Warranty', color: '#2563EB' },
  { id: 'contract', name: 'Contract', color: '#8B5CF6' },
  { id: 'commercial', name: 'Commercial', color: '#22C55E' },
  { id: 'new-system', name: 'New-system', color: '#F59E42' },
]

const TECHNICIAN_FILTER_OPTIONS = [
  'Mike Johnson',
  'Sarah Davis',
  'David Wilson',
  'Lisa Martinez',
  'Chris Brown',
]

const DISPATCH_TYPE_FILTER_OPTIONS = [
  'Manual Dispatch',
  'Auto Dispatch',
  'Emergency Dispatch',
  'Reassigned',
]

const FILTER_BY_OPTIONS = [
  'Updated At',
  'Created At',
  'Upcoming Appointment',
  'Past Appointment',
  'Schedule Date',
]

const liveMapContainerStyle = {
  width: '100%',
  height: '100%',
}

const liveMapCenter = {
  lat: 29.7604,
  lng: -95.3698,
}

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
]

const JOB_QUEUE_ITEMS = [
  {
    jobId: 'JOB-1001',
    title: 'AC Repair - No Cooling',
    customer: 'Johnson Residence',
    company: 'Johnson Properties',
    address: '2123 Elm St, Houston, TX',
    time: '09:00 - 12:00',
    value: '$450',
    type: 'HVAC',
    statusBadge: { label: 'Need to Collect Payment', tone: 'red' as const },
    lat: 29.7478,
    lng: -95.3562,
  },
  {
    jobId: 'JOB-1002',
    title: 'Electrical Panel Upgrade',
    customer: 'Smith Commercial',
    company: 'Smith Commercial Group',
    address: '3456 Business Blvd, Houston, TX',
    time: '10:00 - 15:00',
    value: '$850',
    type: 'Electrical',
    statusBadge: { label: 'Opportunity', tone: 'green' as const },
    assignedTo: 'David Chen',
    lat: 29.7726,
    lng: -95.3885,
  },
  {
    jobId: 'JOB-1003',
    title: 'Water Heater Installation',
    customer: 'Davis Family',
    company: 'Davis Holdings',
    address: '4789 Residential Dr, Houston, TX',
    time: '11:30 - 14:30',
    value: '$620',
    type: 'Plumbing',
    assignedTo: 'Mike Johnson',
    lat: 29.7814,
    lng: -95.3653,
  },
  {
    jobId: 'JOB-1004',
    title: 'Emergency Furnace Check',
    customer: 'River Oaks Condo',
    company: 'River Oaks Management',
    address: '900 Park Ln, Houston, TX',
    time: '12:00 - 13:30',
    value: '$390',
    type: 'HVAC',
    statusBadge: { label: 'Need to Collect Payment', tone: 'red' as const },
    lat: 29.7521,
    lng: -95.3842,
  },
  {
    jobId: 'JOB-1005',
    title: 'Generator Diagnostics',
    customer: 'Bayou Office Center',
    company: 'Bayou Office Center LLC',
    address: '1250 Commerce St, Houston, TX',
    time: '13:15 - 16:00',
    value: '$710',
    type: 'Electrical',
    statusBadge: { label: 'Opportunity', tone: 'green' as const },
    lat: 29.7698,
    lng: -95.3504,
  },
  {
    jobId: 'JOB-1006',
    title: 'Drain Line Cleaning',
    customer: 'Westfield Apartments',
    company: 'Westfield Communities',
    address: '3321 Sunset Ave, Houston, TX',
    time: '14:00 - 17:00',
    value: '$540',
    type: 'Plumbing',
    assignedTo: 'Sarah Wilson',
    lat: 29.7396,
    lng: -95.3711,
  },
]

const TECHNICIAN_ITEMS = [
  {
    initials: 'MJ',
    name: 'Mike Johnson',
    rating: '4.9',
    load: '95% load',
    skills: ['HVAC', 'Electrical', 'Plumbing', 'Smart Home'],
    jobs: [
      { title: 'Water Heater Installation', value: '$1200' },
      { title: 'Smart Thermostat Setup', value: '$280' },
    ],
    jobId: '3139368',
    status: 'Appointments',
    client: 'Chuck',
    company: 'N/A',
    address: '209 Northwest 8th Street, Chiefland, FL, 32626',
    lat: 29.7842,
    lng: -95.3796,
  },
  {
    initials: 'SW',
    name: 'Sarah Wilson',
    rating: '4.8',
    load: '45% load',
    skills: ['HVAC', 'Refrigeration', 'Commercial'],
    jobs: [
      { title: 'Commercial AC Tune-Up', value: '$640' },
      { title: 'Unit Diagnostics', value: '$220' },
    ],
    jobId: '3139369',
    status: 'Appointments',
    client: 'Maria',
    company: 'N/A',
    address: '412 Pine Ridge Dr, Houston, TX, 77002',
    lat: 29.7449,
    lng: -95.3818,
  },
  {
    initials: 'DC',
    name: 'David Chen',
    rating: '4.7',
    load: '62% load',
    skills: ['Electrical', 'Panel Upgrade', 'Safety'],
    jobs: [
      { title: 'Panel Upgrade - Suite B', value: '$910' },
      { title: 'Breaker Replacement', value: '$340' },
    ],
    jobId: '3139370',
    status: 'Appointments',
    client: 'Ethan',
    company: 'N/A',
    address: '885 Commerce Ave, Houston, TX, 77003',
    lat: 29.7749,
    lng: -95.3488,
  },
  {
    initials: 'AL',
    name: 'Amanda Lee',
    rating: '4.9',
    load: '70% load',
    skills: ['Plumbing', 'Leak Repair', 'Drainage'],
    jobs: [
      { title: 'Main Line Inspection', value: '$510' },
      { title: 'Kitchen Leak Repair', value: '$390' },
    ],
    jobId: '3139371',
    status: 'Appointments',
    client: 'Olivia',
    company: 'N/A',
    address: '72 Harbor Point Rd, Houston, TX, 77007',
    lat: 29.7464,
    lng: -95.3517,
  },
  {
    initials: 'RT',
    name: 'Robert Taylor',
    rating: '4.6',
    load: '54% load',
    skills: ['HVAC', 'Maintenance', 'Residential'],
    jobs: [
      { title: 'HVAC Seasonal Maintenance', value: '$430' },
      { title: 'Blower Motor Check', value: '$260' },
    ],
    jobId: '3139372',
    status: 'Appointments',
    client: 'Noah',
    company: 'N/A',
    address: '1402 Brookside Ln, Houston, TX, 77011',
    lat: 29.7348,
    lng: -95.3689,
  },
  {
    initials: 'KP',
    name: 'Kevin Patel',
    rating: '4.8',
    load: '88% load',
    skills: ['Electrical', 'Generators', 'Commercial'],
    jobs: [
      { title: 'Generator Diagnostics', value: '$780' },
      { title: 'Power Audit', value: '$350' },
    ],
    jobId: '3139373',
    status: 'Appointments',
    client: 'Ava',
    company: 'N/A',
    address: '55 Midtown Plaza, Houston, TX, 77010',
    lat: 29.7827,
    lng: -95.3608,
  },
  {
    initials: 'EM',
    name: 'Emily Martinez',
    rating: '4.7',
    load: '39% load',
    skills: ['Plumbing', 'Water Heaters', 'Residential'],
    jobs: [
      { title: 'Water Heater Flush', value: '$310' },
      { title: 'Valve Replacement', value: '$180' },
    ],
    jobId: '3139374',
    status: 'Appointments',
    client: 'Liam',
    company: 'N/A',
    address: '980 South Main St, Houston, TX, 77012',
    lat: 29.7575,
    lng: -95.3921,
  },
]

const mapMarkers = [
  ...JOB_QUEUE_ITEMS.map(job => ({
    id: job.jobId,
    lat: job.lat,
    lng: job.lng,
    kind: 'job' as const,
  })),
  ...TECHNICIAN_ITEMS.map(tech => ({
    id: `tech-${tech.initials}`,
    lat: tech.lat,
    lng: tech.lng,
    kind: 'technician' as const,
  })),
]

export default function LiveMapIndex(): React.JSX.Element {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isJobsQueueCollapsed, setIsJobsQueueCollapsed] = useState(false)
  const [isTechniciansCollapsed, setIsTechniciansCollapsed] = useState(false)
  const [selectedQueueJob, setSelectedQueueJob] = useState<string | null>(null)
  const [hoveredQueueJob, setHoveredQueueJob] = useState<string | null>(null)
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null)
  const [hoveredTechnician, setHoveredTechnician] = useState<string | null>(null)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [liveMapEntityFilter, setLiveMapEntityFilter] = useState<
    'all' | 'job' | 'technician'
  >('all')
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([])
  const [selectedDispatchTypes, setSelectedDispatchTypes] = useState<string[]>([])
  const [filterBy, setFilterBy] = useState('')
  const [technicianSearchTerm, setTechnicianSearchTerm] = useState('')
  const [dispatchTypeSearchTerm, setDispatchTypeSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [routeParameter, setRouteParameter] = useState('Distance')
  const [maxJobs, setMaxJobs] = useState('4')
  const [dateRangeValue, setDateRangeValue] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  })
  const statusCount = useMemo(() => STATUS_FILTERS.length, [])
  const jobTypeCount = useMemo(() => JOB_TAGS.length, [])
  const technicianOptions = useMemo(
    () =>
      TECHNICIAN_FILTER_OPTIONS.filter(option =>
        option.toLowerCase().includes(technicianSearchTerm.toLowerCase().trim())
      ).map(option => ({ label: option, value: option })),
    [technicianSearchTerm]
  )
  const dispatchTypeOptions = useMemo(
    () =>
      DISPATCH_TYPE_FILTER_OPTIONS.filter(option =>
        option.toLowerCase().includes(dispatchTypeSearchTerm.toLowerCase().trim())
      ).map(option => ({ label: option, value: option })),
    [dispatchTypeSearchTerm]
  )
  const filterByOptions = useMemo(
    () => FILTER_BY_OPTIONS.map(option => ({ label: option, value: option })),
    []
  )
  const statusPillsRef = useRef<HTMLDivElement | null>(null)
  const jobTypePillsRef = useRef<HTMLDivElement | null>(null)
  const hoveredJobHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoveredTechHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mapRef = useRef<{
    getCenter: () => { lat: () => number; lng: () => number } | null | undefined
    setCenter: (position: { lat: number; lng: number }) => void
  } | null>(null)
  const [isDraggingStatusPills, setIsDraggingStatusPills] = useState(false)
  const [isDraggingJobTypePills, setIsDraggingJobTypePills] = useState(false)
  const statusDragStartX = useRef(0)
  const statusDragStartScroll = useRef(0)
  const statusDragMoved = useRef(false)
  const jobTypeDragStartX = useRef(0)
  const jobTypeDragStartScroll = useRef(0)
  const jobTypeDragMoved = useRef(false)
  const [statusScrollState, setStatusScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  })
  const [jobTypeScrollState, setJobTypeScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  })
  const selectedQueueJobData = useMemo(
    () => JOB_QUEUE_ITEMS.find(job => job.title === selectedQueueJob) ?? null,
    [selectedQueueJob]
  )
  const hoveredQueueJobData = useMemo(
    () => JOB_QUEUE_ITEMS.find(job => job.title === hoveredQueueJob) ?? null,
    [hoveredQueueJob]
  )
  const hoveredTechnicianData = useMemo(
    () => TECHNICIAN_ITEMS.find(tech => tech.name === hoveredTechnician) ?? null,
    [hoveredTechnician]
  )
  const selectedTechnicianData = useMemo(
    () => TECHNICIAN_ITEMS.find(tech => tech.name === selectedTechnician) ?? null,
    [selectedTechnician]
  )

  const animateMapPan = (target: { lat: number; lng: number }) => {
    if (!mapRef.current) return
    const currentCenter = mapRef.current.getCenter()
    if (!currentCenter) {
      mapRef.current.setCenter(target)
      return
    }

    const startLat = currentCenter.lat()
    const startLng = currentCenter.lng()
    const durationMs = 420
    const startTime = performance.now()

    const step = (now: number) => {
      if (!mapRef.current) return
      const progress = Math.min((now - startTime) / durationMs, 1)
      const eased = 1 - (1 - progress) ** 3
      mapRef.current.setCenter({
        lat: startLat + (target.lat - startLat) * eased,
        lng: startLng + (target.lng - startLng) * eased,
      })
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }

  const openGoogleMapsLocation = (lat: number, lng: number) => {
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
    window.open(mapsUrl, '_blank', 'noopener,noreferrer')
  }

  const openJobQuickView = (job: {
    jobId?: string
    title?: string
    customer?: string
    company?: string
    address?: string
    time?: string
    value?: string
    type?: string
    status?: string
    assignedTo?: string
    lat?: number
    lng?: number
    notes?: string
  }) => {
    SidePanel.open({
      title: job.title || `Job #${job.jobId || 'N/A'}`,
      content: () => (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase text-slate-500">Job ID</p>
              <p className="text-xl font-semibold text-slate-900">#{job.jobId || 'N/A'}</p>
              <p className="text-sm text-slate-600">{job.title || 'Service Job'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-slate-500">Status</p>
              <p className="text-sm font-medium text-slate-900">{job.status || 'Appointments'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-xs uppercase text-slate-500 mb-1">Client</p>
              <div className="space-y-1 text-sm text-slate-900">
                <p className="font-medium">{job.customer || 'N/A'}</p>
                <p className="text-slate-600">{job.company || 'N/A'}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-xs uppercase text-slate-500 mb-1">Schedule</p>
              <div className="space-y-1 text-sm text-slate-900">
                <p className="font-medium">{job.time || '09:00 - 12:00'}</p>
                <p className="text-slate-600">{job.type || 'General Service'}</p>
                <p className="text-slate-600">{job.value || '$0'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs uppercase text-slate-500 mb-1">Address</p>
            <p className="text-sm text-slate-700">{job.address || 'N/A'}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs uppercase text-slate-500 mb-1">Assignment</p>
            <p className="text-sm text-slate-700">{job.assignedTo || 'Unassigned'}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                if (job.lat != null && job.lng != null) openGoogleMapsLocation(job.lat, job.lng)
              }}
            >
              View Location
            </Button>
            <Button size="sm" variant="secondary" onClick={() => SidePanel.close()}>
              Close
            </Button>
          </div>
        </div>
      ),
    })
  }

  const openTechnicianQuickView = (tech: (typeof TECHNICIAN_ITEMS)[number]) => {
    openJobQuickView({
      jobId: tech.jobId || '0000000',
      title: `${tech.jobs.length} Jobs`,
      customer: tech.client || 'N/A',
      company: tech.company || 'N/A',
      address: tech.address || 'N/A',
      time: 'Today',
      value: tech.jobs[0]?.value || '$0',
      type: tech.skills[0] || 'General Service',
      status: tech.status || 'Appointments',
      assignedTo: tech.name,
      lat: tech.lat,
      lng: tech.lng,
      notes: 'Technician quick view (dummy details where unavailable).',
    })
  }

  const cancelHoveredJobHide = () => {
    if (!hoveredJobHideTimeoutRef.current) return
    clearTimeout(hoveredJobHideTimeoutRef.current)
    hoveredJobHideTimeoutRef.current = null
  }

  const scheduleHoveredJobHide = () => {
    cancelHoveredJobHide()
    hoveredJobHideTimeoutRef.current = setTimeout(() => {
      setHoveredQueueJob(null)
      hoveredJobHideTimeoutRef.current = null
    }, 180)
  }

  const cancelHoveredTechHide = () => {
    if (!hoveredTechHideTimeoutRef.current) return
    clearTimeout(hoveredTechHideTimeoutRef.current)
    hoveredTechHideTimeoutRef.current = null
  }

  const scheduleHoveredTechHide = () => {
    cancelHoveredTechHide()
    hoveredTechHideTimeoutRef.current = setTimeout(() => {
      setHoveredTechnician(null)
      hoveredTechHideTimeoutRef.current = null
    }, 180)
  }

  const updateStatusPillScrollState = () => {
    const el = statusPillsRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setStatusScrollState({
      canScrollLeft: scrollLeft > 2,
      canScrollRight: scrollLeft + clientWidth < scrollWidth - 2,
    })
  }

  const scrollStatusPills = (direction: 'left' | 'right') => {
    const el = statusPillsRef.current
    if (!el) return
    const delta = direction === 'left' ? -220 : 220
    el.scrollBy({ left: delta, behavior: 'smooth' })
    setTimeout(updateStatusPillScrollState, 180)
  }

  const updateJobTypePillScrollState = () => {
    const el = jobTypePillsRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setJobTypeScrollState({
      canScrollLeft: scrollLeft > 2,
      canScrollRight: scrollLeft + clientWidth < scrollWidth - 2,
    })
  }

  const scrollJobTypePills = (direction: 'left' | 'right') => {
    const el = jobTypePillsRef.current
    if (!el) return
    const delta = direction === 'left' ? -220 : 220
    el.scrollBy({ left: delta, behavior: 'smooth' })
    setTimeout(updateJobTypePillScrollState, 180)
  }

  const startStatusPillDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = statusPillsRef.current
    if (!container) return
    setIsDraggingStatusPills(true)
    statusDragStartX.current = event.clientX
    statusDragStartScroll.current = container.scrollLeft
    statusDragMoved.current = false
    container.classList.add('cursor-grabbing', 'select-none')
  }

  const handleStatusPillDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingStatusPills) return
    const container = statusPillsRef.current
    if (!container) return
    const deltaX = event.clientX - statusDragStartX.current
    if (Math.abs(deltaX) > 3) statusDragMoved.current = true
    container.scrollLeft = statusDragStartScroll.current - deltaX
    updateStatusPillScrollState()
  }

  const endStatusPillDrag = () => {
    if (!isDraggingStatusPills) return
    setIsDraggingStatusPills(false)
    const container = statusPillsRef.current
    container?.classList.remove('cursor-grabbing', 'select-none')
    updateStatusPillScrollState()
  }

  const startJobTypePillDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = jobTypePillsRef.current
    if (!container) return
    setIsDraggingJobTypePills(true)
    jobTypeDragStartX.current = event.clientX
    jobTypeDragStartScroll.current = container.scrollLeft
    jobTypeDragMoved.current = false
    container.classList.add('cursor-grabbing', 'select-none')
  }

  const handleJobTypePillDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingJobTypePills) return
    const container = jobTypePillsRef.current
    if (!container) return
    const deltaX = event.clientX - jobTypeDragStartX.current
    if (Math.abs(deltaX) > 3) jobTypeDragMoved.current = true
    container.scrollLeft = jobTypeDragStartScroll.current - deltaX
    updateJobTypePillScrollState()
  }

  const endJobTypePillDrag = () => {
    if (!isDraggingJobTypePills) return
    setIsDraggingJobTypePills(false)
    const container = jobTypePillsRef.current
    container?.classList.remove('cursor-grabbing', 'select-none')
    updateJobTypePillScrollState()
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!showFilters) return
    updateStatusPillScrollState()
    updateJobTypePillScrollState()
    const onResize = () => {
      updateStatusPillScrollState()
      updateJobTypePillScrollState()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [showFilters])

  useEffect(() => {
    if (!selectedQueueJobData || !mapRef.current) return
    animateMapPan({
      lat: selectedQueueJobData.lat,
      lng: selectedQueueJobData.lng,
    })
  }, [selectedQueueJobData])

  useEffect(() => {
    if (!selectedTechnicianData || !mapRef.current) return
    animateMapPan({
      lat: selectedTechnicianData.lat,
      lng: selectedTechnicianData.lng,
    })
  }, [selectedTechnicianData])

  useEffect(() => {
    return () => {
      cancelHoveredJobHide()
      cancelHoveredTechHide()
    }
  }, [])

  const handleDateRangeChange = (value: DateValueType) => {
    setDateRangeValue(value)
  }

  return (
    <div className="md:h-[calc(100vh-110px)] flex flex-col">
      <section className="mb-6 relative rounded-lg p-4 md:p-5 pb-5 md:pb-6 border border-slate-200/60 dark:border-slate-700/60 shadow-none md:shadow-xl bg-white dark:bg-slate-900 md:bg-gradient-to-br md:from-slate-50 md:via-blue-50 md:to-indigo-50 md:dark:from-slate-900 md:dark:via-blue-950/20 md:dark:to-indigo-950/20">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
              Live Map
              </h2>
            </div>
            <div className="md:flex items-start gap-2 hidden">
              <div className="flex items-center gap-1 rounded-full bg-slate-50 border border-slate-100 dark:bg-slate-800 px-1 py-1 h-10">
                {([
                  { key: 'all', label: 'All' },
                  { key: 'job', label: 'Jobs' },
                  { key: 'technician', label: 'Technicians' },
                ] as const).map(item => (
                  <Button
                    key={item.key}
                    variant="ghost"
                    className={`h-8 rounded-full px-4 text-xs ${
                      liveMapEntityFilter === item.key
                        ? 'bg-brandGreen-900 text-white hover:bg-brandGreen-600'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setLiveMapEntityFilter(item.key)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search jobs, clients, phone, address"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(prev => !prev)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
                <SelectInput
                  label="Technician"
                  options={technicianOptions}
                  placeholder="All technicians"
                  value={selectedTechnicians}
                  multiselect
                  onSearch={setTechnicianSearchTerm}
                  onSelect={val => setSelectedTechnicians(Array.isArray(val) ? val : [])}
                />
                <SelectInput
                  label="Dispatch Type"
                  options={dispatchTypeOptions}
                  placeholder="All dispatch types"
                  value={selectedDispatchTypes}
                  multiselect
                  onSearch={setDispatchTypeSearchTerm}
                  onSelect={val => setSelectedDispatchTypes(Array.isArray(val) ? val : [])}
                />
                <InputDatepicker
                  value={dateRangeValue}
                  onChange={handleDateRangeChange}
                  label="Date Range"
                />
                <SelectInput
                  label="Filter By"
                  options={filterByOptions}
                  placeholder="Select filter type"
                  value={filterBy}
                  onSearch={() => {}}
                  onSelect={val => setFilterBy(Array.isArray(val) ? '' : val)}
                />
              </div>
              <div className="flex flex-row items-center pt-2">
                <p className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium mr-1 w-[70px]">Status:</p>
                <div className="overflow-hidden flex-1">
                  <div className="sticky top-0 px-1 pb-0 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
                    <div className="relative">
                      {statusScrollState.canScrollLeft && (
                        <button
                          type="button"
                          className="absolute left-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          onClick={() => scrollStatusPills('left')}
                          disabled={!statusScrollState.canScrollLeft}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                      )}
                      <div
                        ref={statusPillsRef}
                        className={`flex items-center gap-1.5 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab select-none ${statusScrollState.canScrollLeft ? 'pl-8' : 'pl-0'} ${statusScrollState.canScrollRight ? 'pr-8' : 'pr-0'}`}
                        onMouseDown={startStatusPillDrag}
                        onMouseMove={handleStatusPillDrag}
                        onMouseUp={endStatusPillDrag}
                        onMouseLeave={endStatusPillDrag}
                        onScroll={updateStatusPillScrollState}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (statusDragMoved.current) {
                              statusDragMoved.current = false
                              return
                            }
                            setSelectedStatuses([])
                          }}
                          className={`flex items-center gap-1.5 rounded-full h-7 px-2 text-xs whitespace-nowrap ${
                            selectedStatuses.length === 0
                              ? 'bg-slate-900 text-white'
                              : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full bg-slate-500" />
                          All
                          <span className="hidden opacity-70 sm:inline">{statusCount}</span>
                        </button>

                        {STATUS_FILTERS.map(status => {
                          const isActive = selectedStatuses.includes(status.name)
                          return (
                            <button
                              key={status.id}
                              type="button"
                              onClick={() => {
                                if (statusDragMoved.current) {
                                  statusDragMoved.current = false
                                  return
                                }
                                setSelectedStatuses(prev =>
                                  prev.includes(status.name)
                                    ? prev.filter(item => item !== status.name)
                                    : [...prev, status.name]
                                )
                              }}
                              style={{
                                color: isActive ? 'white' : undefined,
                                backgroundColor: isActive ? status.color : undefined,
                              }}
                              className={`flex items-center gap-1.5 rounded-full h-7 px-2 text-xs whitespace-nowrap ${
                                isActive
                                  ? 'bg-slate-900'
                                  : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: isActive ? 'white' : status.color }}
                              />
                              {status.name}
                            </button>
                          )
                        })}
                      </div>
                      {statusScrollState.canScrollRight && (
                        <button
                          type="button"
                          className="absolute right-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          onClick={() => scrollStatusPills('right')}
                          disabled={!statusScrollState.canScrollRight}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center">
                <p className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium mr-1 w-[70px]">Job Tags:</p>
                <div className="overflow-hidden flex-1">
                  <div className="sticky top-0 mt-2 px-1 pb-0 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
                    <div className="relative">
                      {jobTypeScrollState.canScrollLeft && (
                        <button
                          type="button"
                          className="absolute left-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          onClick={() => scrollJobTypePills('left')}
                          disabled={!jobTypeScrollState.canScrollLeft}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                      )}
                      <div
                        ref={jobTypePillsRef}
                        className={`flex items-center gap-1.5 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab select-none ${jobTypeScrollState.canScrollLeft ? 'pl-8' : 'pl-0'} ${jobTypeScrollState.canScrollRight ? 'pr-8' : 'pr-0'}`}
                        onMouseDown={startJobTypePillDrag}
                        onMouseMove={handleJobTypePillDrag}
                        onMouseUp={endJobTypePillDrag}
                        onMouseLeave={endJobTypePillDrag}
                        onScroll={updateJobTypePillScrollState}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (jobTypeDragMoved.current) {
                              jobTypeDragMoved.current = false
                              return
                            }
                            setSelectedJobTypes([])
                          }}
                          className={`flex items-center gap-1.5 rounded-full h-7 px-2 text-xs whitespace-nowrap ${
                            selectedJobTypes.length === 0
                              ? 'bg-slate-900 text-white'
                              : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full bg-slate-500" />
                          All
                          <span className="hidden opacity-70 sm:inline">{jobTypeCount}</span>
                        </button>

                        {JOB_TAGS.map(jobTag => {
                          const isActive = selectedJobTypes.includes(jobTag.id)
                          return (
                            <button
                              key={jobTag.id}
                              type="button"
                              onClick={() => {
                                if (jobTypeDragMoved.current) {
                                  jobTypeDragMoved.current = false
                                  return
                                }
                                setSelectedJobTypes(prev =>
                                  prev.includes(jobTag.id)
                                    ? prev.filter(item => item !== jobTag.id)
                                    : [...prev, jobTag.id]
                                )
                              }}
                              style={{
                                color: isActive ? 'white' : undefined,
                                backgroundColor: isActive ? jobTag.color : undefined,
                              }}
                              className={`flex items-center gap-1.5 rounded-full h-7 px-2 text-xs whitespace-nowrap ${
                                isActive
                                  ? 'bg-slate-900'
                                  : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: isActive ? 'white' : jobTag.color }}
                              />
                              <span>{jobTag.name}</span>
                            </button>
                          )
                        })}
                      </div>
                      {jobTypeScrollState.canScrollRight && (
                        <button
                          type="button"
                          className="absolute right-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          onClick={() => scrollJobTypePills('right')}
                          disabled={!jobTypeScrollState.canScrollRight}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <div className="inline-flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="font-medium">4 Active Techs</span>
            </div>
            <div className="inline-flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="font-medium">2 Jobs</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-3">
            <div className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <Settings className="h-4 w-4 text-slate-500" />
              <span className="font-medium">Route Parameters:</span>
            </div>
            <div className="min-w-[130px]">
              <SelectInput
                label={undefined}
                options={['Revenue', 'Distance', 'Time', 'Balanced'].map(option => ({
                  label: option,
                  value: option,
                }))}
                placeholder="Route Parameter"
                value={routeParameter}
                onSelect={val =>
                  setRouteParameter(Array.isArray(val) ? (val[0] ?? 'Distance') : val)
                }
                className="mt-0"
              />
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <span className="font-medium">Max Jobs:</span>
              <input
                type="number"
                min={1}
                max={99}
                value={maxJobs}
                onChange={e => setMaxJobs(e.target.value)}
                className="h-10 w-16 rounded-xl border border-slate-200 bg-white px-2 text-center text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brandGreen-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex-row flex">
        <div
          className={`shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
            isJobsQueueCollapsed
              ? 'w-0 opacity-0 -translate-x-3 pointer-events-none'
              : 'w-[320px] opacity-100 translate-x-0 mr-4'
          }`}
        >
          <div className="flex h-full overflow-hidden flex-col rounded-2xl border border-slate-200 bg-white p-4 pr-2 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex-row justify-between flex pr-2">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Jobs Queue
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">6 jobs</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-slate-300 dark:border-slate-600"
              aria-label="Collapse jobs queue"
              onClick={() => setIsJobsQueueCollapsed(true)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {JOB_QUEUE_ITEMS.map(job => {
              const isSelected = selectedQueueJob === job.title
              return (
                <div
                  key={job.title}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    isSelected
                      ? 'border-brandGreen-400 bg-brandGreen-50/60 dark:border-brandGreen-600 dark:bg-brandGreen-900/20'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-slate-600'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedQueueJob === job.title) {
                        setSelectedQueueJob(null)
                        return
                      }
                      setSelectedTechnician(null)
                      setSelectedQueueJob(job.title)
                    }}
                    className="w-full text-left cursor-pointer"
                    aria-label={`Open ${job.title}`}
                  >
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{job.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Job ID: {job.jobId}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Company: {job.company}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{job.customer}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{job.address}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                        <Clock3 className="h-3.5 w-3.5" />
                        {job.time}
                      </div>
                      <span className="text-base font-semibold text-green-600">{job.value}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="inline-flex font-xs rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-700 dark:border-slate-600 dark:text-slate-200">
                        {job.type}
                      </div>
                      {job.statusBadge && (
                        <div
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            job.statusBadge.tone === 'red'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}
                        >
                          {job.statusBadge.label}
                        </div>
                      )}
                    </div>
                    {job.assignedTo && (
                      <div className="mt-2 rounded-md border border-emerald-200/70 bg-emerald-50/55 px-2.5 py-1 text-[11px] text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-300">
                        Assigned to: <span className="font-medium">{job.assignedTo}</span>
                      </div>
                    )}
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isSelected
                        ? 'mt-3 max-h-[520px] border-t border-slate-200 pt-3 opacity-100 dark:border-slate-700'
                        : 'max-h-0 border-t-0 pt-0 opacity-0'
                    }`}
                  >
                    <div className="transform transition-all duration-300 ease-in-out">
                      <div className="flex w-full items-center gap-2">
                        <Button
                          variant="outline"
                          className="h-8 flex-1 rounded-sm border-brandGreen-500 text-xs text-brandGreen-900 hover:bg-brandGreen-50 dark:border-brandGreen-700 dark:text-brandGreen-300"
                          onClick={e => {
                            e.stopPropagation()
                            openJobQuickView({
                              jobId: job.jobId,
                              title: job.title,
                              customer: job.customer,
                              company: job.company,
                              address: job.address,
                              time: job.time,
                              value: job.value,
                              type: job.type,
                              status: job.statusBadge?.label,
                              assignedTo: job.assignedTo,
                              lat: job.lat,
                              lng: job.lng,
                            })
                          }}
                        >
                          Quick View
                        </Button>
                        <Button
                          className="h-8 flex-1 rounded-sm bg-brandGreen-900 text-xs text-white hover:bg-brandGreen-800"
                          onClick={() => openGoogleMapsLocation(job.lat, job.lng)}
                        >
                          View Location
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        </div>

        <div className="rounded-2xl flex-1 flex border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:col-span-6">
          <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <GoogleMap
              mapContainerStyle={liveMapContainerStyle}
              center={liveMapCenter}
              zoom={12}
              onLoad={map => {
                mapRef.current = map
              }}
              onUnmount={() => {
                mapRef.current = null
              }}
              options={{
                mapTypeId: 'roadmap',
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                fullscreenControl: false,
                mapTypeControl: false,
                styles: mounted && resolvedTheme === 'dark' ? darkMapStyles : [],
              }}
            >
              {mapMarkers.map(marker => (
                marker.kind === 'job' ? (
                  <Marker
                    key={marker.id}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    onMouseOver={() => {
                      cancelHoveredJobHide()
                      const hoveredJob = JOB_QUEUE_ITEMS.find(job => job.jobId === marker.id)
                      if (hoveredJob) setHoveredQueueJob(hoveredJob.title)
                    }}
                    onMouseOut={scheduleHoveredJobHide}
                  />
                ) : (
                  <OverlayView
                    key={marker.id}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div
                      className="-translate-x-1/2 -translate-y-1/2"
                      onMouseEnter={() => {
                        cancelHoveredTechHide()
                        const hoveredTech = TECHNICIAN_ITEMS.find(
                          tech => `tech-${tech.initials}` === marker.id
                        )
                        if (hoveredTech) {
                          setHoveredQueueJob(null)
                          setHoveredTechnician(hoveredTech.name)
                        }
                      }}
                      onMouseLeave={scheduleHoveredTechHide}
                    >
                      <div className="flex h-8 w-12 items-center justify-center rounded-full bg-white  shadow-md ring-2 ring-brandGreen-900 dark:ring-slate-900/90">
                        <Car className="h-8 w-8 text-brandGreen-900" />
                      </div>
                    </div>
                  </OverlayView>
                )
              ))}
              {hoveredQueueJobData && (
                <OverlayView
                  position={{ lat: hoveredQueueJobData.lat, lng: hoveredQueueJobData.lng }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div
                    className="-translate-x-1/2 -translate-y-[calc(100%+20px)]"
                    onMouseEnter={cancelHoveredJobHide}
                    onMouseLeave={scheduleHoveredJobHide}
                  >
                    <div className="w-[330px] rounded-xl border border-slate-200 bg-white p-4 text-slate-700 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">
                          {hoveredQueueJobData.title}
                        </p>
                        <button
                          type="button"
                          onClick={() => setHoveredQueueJob(null)}
                          className="text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                          aria-label="Close tooltip"
                        >
                          ×
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <p><span className="font-semibold">Job ID:</span> {hoveredQueueJobData.jobId}</p>
                        <p><span className="font-semibold">Status:</span> {hoveredQueueJobData.statusBadge?.label ?? 'Scheduled'}</p>
                        <p><span className="font-semibold">Client:</span> {hoveredQueueJobData.customer}</p>
                        <p><span className="font-semibold">Company:</span> {hoveredQueueJobData.company}</p>
                        <p><span className="font-semibold">Address:</span> {hoveredQueueJobData.address}</p>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 flex-1 rounded-sm border-brandGreen-500 text-xs text-brandGreen-900 hover:bg-brandGreen-50 dark:border-brandGreen-700 dark:text-brandGreen-300"
                          onClick={() =>
                            openJobQuickView({
                              jobId: hoveredQueueJobData.jobId,
                              title: hoveredQueueJobData.title,
                              customer: hoveredQueueJobData.customer,
                              company: hoveredQueueJobData.company,
                              address: hoveredQueueJobData.address,
                              time: hoveredQueueJobData.time,
                              value: hoveredQueueJobData.value,
                              type: hoveredQueueJobData.type,
                              status: hoveredQueueJobData.statusBadge?.label,
                              assignedTo: hoveredQueueJobData.assignedTo,
                              lat: hoveredQueueJobData.lat,
                              lng: hoveredQueueJobData.lng,
                            })
                          }
                        >
                          Quick View
                        </Button>
                        <Button
                          type="button"
                          className="h-8 flex-1 rounded-sm bg-brandGreen-900 text-xs text-white hover:bg-brandGreen-800"
                          onClick={() => openGoogleMapsLocation(hoveredQueueJobData.lat, hoveredQueueJobData.lng)}
                        >
                          View Location
                        </Button>
                      </div>
                    </div>
                  </div>
                </OverlayView>
              )}
              {hoveredTechnicianData && (
                <OverlayView
                  position={{ lat: hoveredTechnicianData.lat, lng: hoveredTechnicianData.lng }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div
                    className="-translate-x-1/2 -translate-y-[calc(100%+20px)]"
                    onMouseEnter={cancelHoveredTechHide}
                    onMouseLeave={scheduleHoveredTechHide}
                  >
                    <div className="w-[330px] rounded-xl border border-slate-200 bg-white p-4 text-slate-700 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">
                          {hoveredTechnicianData.jobs.length} Jobs
                        </p>
                        <button
                          type="button"
                          onClick={() => setHoveredTechnician(null)}
                          className="text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                          aria-label="Close tooltip"
                        >
                          ×
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <p><span className="font-semibold">Job ID:</span> {hoveredTechnicianData.jobId}</p>
                        <p><span className="font-semibold">Technician:</span> {hoveredTechnicianData.name} jobs</p>
                        <p><span className="font-semibold">Status:</span> {hoveredTechnicianData.status}</p>
                        <p><span className="font-semibold">Client:</span> {hoveredTechnicianData.client}</p>
                        <p><span className="font-semibold">Company:</span> {hoveredTechnicianData.company}</p>
                        <p><span className="font-semibold">Address:</span> {hoveredTechnicianData.address}</p>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 flex-1 rounded-sm border-brandGreen-500 text-xs text-brandGreen-900 hover:bg-brandGreen-50 dark:border-brandGreen-700 dark:text-brandGreen-300"
                          onClick={() => openTechnicianQuickView(hoveredTechnicianData)}
                        >
                          Quick View
                        </Button>
                        <Button
                          type="button"
                          className="h-8 flex-1 rounded-sm bg-brandGreen-900 text-xs text-white hover:bg-brandGreen-800"
                          onClick={() => openGoogleMapsLocation(hoveredTechnicianData.lat, hoveredTechnicianData.lng)}
                        >
                          View Location
                        </Button>
                      </div>
                    </div>
                  </div>
                </OverlayView>
              )}
            </GoogleMap>
            {isJobsQueueCollapsed && (
              <div className="absolute top-4 left-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 rounded-full border-slate-300 dark:border-slate-600 w-[140px]"
                  aria-label="Expand jobs queue"
                  onClick={() => setIsJobsQueueCollapsed(false)}
                >
                  <p className="font-semibold">Jobs Queue</p>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            {isTechniciansCollapsed && (
              <div className="absolute top-4 right-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 rounded-full border-slate-300 dark:border-slate-600 w-[140px]"
                  aria-label="Expand technicians panel"
                  onClick={() => setIsTechniciansCollapsed(false)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <p className="font-semibold">Technicians</p>
                </Button>
              </div>
            )}
            <div className="absolute bottom-4 left-4">
              <div className="max-w-xs rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <MousePointer2 className="h-4 w-4" />
                  Interactive Route Map
                </div>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <li>- Click technicians to view/hide routes</li>
                  <li>- Hover jobs for quick assign/reassign</li>
                  <li>- Colored lines show route connections</li>
                  <li>- Numbers show route sequence</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
            isTechniciansCollapsed
              ? 'w-0 opacity-0 translate-x-3 pointer-events-none'
              : 'w-[360px] opacity-100 translate-x-0 ml-4'
          }`}
        >
          <div className="flex h-full overflow-hidden flex-col rounded-2xl border border-slate-200 bg-white p-4 pr-2 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-start justify-between gap-2 pr-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-slate-300 dark:border-slate-600"
              aria-label="Collapse technicians panel"
              onClick={() => setIsTechniciansCollapsed(true)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Technicians
            </h3>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {TECHNICIAN_ITEMS.map(tech => {
              const isTechSelected = selectedTechnician === tech.name
              return (
                <div
                  key={tech.name}
                  className={`rounded-xl border p-3 transition cursor-pointer ${
                    isTechSelected
                      ? 'border-brandGreen-400 bg-brandGreen-50/60 dark:border-brandGreen-600 dark:bg-brandGreen-900/20'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-slate-600'
                  }`}
                  onClick={() => {
                    setSelectedQueueJob(null)
                    setSelectedTechnician(prev => (prev === tech.name ? null : tech.name))
                  }}
                >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
                      {tech.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{tech.name}</p>
                      <p className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        Active
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 text-sm text-slate-700 dark:text-slate-200">
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      {tech.rating}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{tech.load}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {tech.skills.map(skill => (
                      <span
                        key={skill}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                    Today's Jobs ({tech.jobs.length})
                  </p>
                  <div className="space-y-1.5">
                    {tech.jobs.map((job, idx) => (
                      <div
                        key={`${tech.name}-${job.title}`}
                        className="flex items-center justify-between rounded-md bg-slate-100 px-2.5 py-1.5 dark:bg-slate-800/80"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                            {idx + 1}
                          </span>
                          <span className="truncate text-xs text-slate-700 dark:text-slate-200">
                            {job.title}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-green-600">{job.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isTechSelected
                      ? 'mt-3 max-h-[120px] border-t border-slate-200 pt-3 opacity-100 dark:border-slate-700'
                      : 'max-h-0 border-t-0 pt-0 opacity-0'
                  }`}
                >
                  <div className="transform transition-all duration-300 ease-in-out">
                    <div className="flex w-full items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 flex-1 rounded-sm border-brandGreen-500 text-xs text-brandGreen-900 hover:bg-brandGreen-50 dark:border-brandGreen-700 dark:text-brandGreen-300"
                        onClick={e => {
                          e.stopPropagation()
                          openTechnicianQuickView(tech)
                        }}
                      >
                        Quick View
                      </Button>
                      <Button
                        type="button"
                        className="h-8 flex-1 rounded-sm bg-brandGreen-900 text-xs text-white hover:bg-brandGreen-800"
                        onClick={() => openGoogleMapsLocation(tech.lat, tech.lng)}
                      >
                        View Location
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
