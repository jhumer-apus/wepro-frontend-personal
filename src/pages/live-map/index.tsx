import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { DateValueType } from 'react-tailwindcss-datepicker'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useTheme } from 'next-themes'
import {
  AlertTriangle,
  Clock3,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Droplets,
  Eye,
  Lightbulb,
  MapPin,
  Plus,
  Route,
  Settings,
  Search,
  Sparkles,
  Star,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react'
import { Input } from '@/src/components/ui/input'
import { Button } from '@/src/components/ui/button'
import InputDatepicker from '@/src/components/input/datepicker'
import SelectInput from '@/src/components/input/select'

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

type JobTypeItem = {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
}

const JOB_TYPES: JobTypeItem[] = [
  { id: 'hvac', name: 'HVAC', icon: Wind },
  { id: 'plumbing', name: 'Plumbing', icon: Droplets },
  { id: 'electrical', name: 'Electrical', icon: Lightbulb },
  { id: 'general', name: 'General', icon: Wrench },
  { id: 'emergency', name: 'Emergency', icon: AlertTriangle },
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

const mapMarkers = [
  { id: 'mk-1', lat: 29.7527, lng: -95.3602 },
  { id: 'mk-2', lat: 29.7704, lng: -95.3891 },
  { id: 'mk-3', lat: 29.7425, lng: -95.3735 },
  { id: 'mk-4', lat: 29.7834, lng: -95.3498 },
  { id: 'mk-5', lat: 29.7315, lng: -95.3572 },
]

export default function LiveMapIndex(): React.JSX.Element {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isJobsQueueCollapsed, setIsJobsQueueCollapsed] = useState(false)
  const [isTechniciansCollapsed, setIsTechniciansCollapsed] = useState(false)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [routeParameter, setRouteParameter] = useState('Distance')
  const [maxJobs, setMaxJobs] = useState('4')
  const [dateRangeValue, setDateRangeValue] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  })
  const statusCount = useMemo(() => STATUS_FILTERS.length, [])
  const jobTypeCount = useMemo(() => JOB_TYPES.length, [])
  const statusPillsRef = useRef<HTMLDivElement | null>(null)
  const jobTypePillsRef = useRef<HTMLDivElement | null>(null)
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
              AI Dispatch Master
              </h2>
            </div>
            <div className='md:flex items-start gap-2 hidden'>
              <Button className="h-10 rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-95 bg-gradient-to-r from-brandGreen-900 to-brandGreen-300">
                <Zap className="h-4 w-4 mr-2" />
                Auto-Assign All
              </Button>
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
            <div className="w-[260px] shrink-0">
              <InputDatepicker
                value={dateRangeValue}
                onChange={handleDateRangeChange}
                label={undefined}
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
            <div className="space-y-3 mt-2">
              <div className="flex flex-row items-center">
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
                <p className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium mr-1 w-[70px]">Job Type:</p>
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

                        {JOB_TYPES.map(jobType => {
                          const isActive = selectedJobTypes.includes(jobType.id)
                          const Icon = jobType.icon
                          return (
                            <button
                              key={jobType.id}
                              type="button"
                              onClick={() => {
                                if (jobTypeDragMoved.current) {
                                  jobTypeDragMoved.current = false
                                  return
                                }
                                setSelectedJobTypes(prev =>
                                  prev.includes(jobType.id)
                                    ? prev.filter(item => item !== jobType.id)
                                    : [...prev, jobType.id]
                                )
                              }}
                              className={`flex items-center gap-1.5 rounded-full h-7 px-2 text-xs whitespace-nowrap ${
                                isActive
                                  ? 'bg-slate-900 text-white'
                                  : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span>{jobType.name}</span>
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
              <span className="font-medium">2 Unassigned Jobs</span>
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium">$3,160 Total Value</span>
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
            {[
              {
                title: 'AC Repair - No Cooling',
                customer: 'Johnson Residence',
                address: '2123 Elm St, Houston, TX',
                time: '09:00 - 12:00',
                value: '$450',
                type: 'HVAC',
                statusBadge: { label: 'Need to Collect Payment', tone: 'red' },
              },
              {
                title: 'Electrical Panel Upgrade',
                customer: 'Smith Commercial',
                address: '3456 Business Blvd, Houston, TX',
                time: '10:00 - 15:00',
                value: '$850',
                type: 'Electrical',
                statusBadge: { label: 'Opportunity', tone: 'green' },
                assignedTo: 'David Chen',
              },
              {
                title: 'Water Heater Installation',
                customer: 'Davis Family',
                address: '4789 Residential Dr, Houston, TX',
                time: '11:30 - 14:30',
                value: '$620',
                type: 'Plumbing',
                assignedTo: 'Mike Johnson',
              },
              {
                title: 'Emergency Furnace Check',
                customer: 'River Oaks Condo',
                address: '900 Park Ln, Houston, TX',
                time: '12:00 - 13:30',
                value: '$390',
                type: 'HVAC',
                statusBadge: { label: 'Need to Collect Payment', tone: 'red' },
              },
              {
                title: 'Generator Diagnostics',
                customer: 'Bayou Office Center',
                address: '1250 Commerce St, Houston, TX',
                time: '13:15 - 16:00',
                value: '$710',
                type: 'Electrical',
                statusBadge: { label: 'Opportunity', tone: 'green' },
              },
              {
                title: 'Drain Line Cleaning',
                customer: 'Westfield Apartments',
                address: '3321 Sunset Ave, Houston, TX',
                time: '14:00 - 17:00',
                value: '$540',
                type: 'Plumbing',
                assignedTo: 'Sarah Wilson',
              },
            ].map(job => (
              <div
                key={job.title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/40"
              >
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{job.title}</p>
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
                  <div className="inline-flex rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-700 dark:border-slate-600 dark:text-slate-200">
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
              </div>
            ))}
          </div>
        </div>
        </div>

        <div className="rounded-2xl flex-1 flex border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:col-span-6">
          <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <GoogleMap
              mapContainerStyle={liveMapContainerStyle}
              center={liveMapCenter}
              zoom={12}
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
                <Marker
                  key={marker.id}
                  position={{ lat: marker.lat, lng: marker.lng }}
                />
              ))}
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
            {[
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
              },
            ].map(tech => (
              <div
                key={tech.name}
                className="rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-600"
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
                
                <Button variant="outline" className="mt-2 h-8 flex-1 rounded-sm text-xs border-slate-300 dark:border-slate-600 w-full">
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  View Route
                </Button>
                <div className="mt-2 flex items-center gap-2 w-full">
                  <Button variant="outline" className="h-8 flex-1 rounded-sm text-xs px-2.5 border-slate-300 dark:border-slate-600">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Manual
                  </Button>
                  <Button className="h-8 rounded-sm bg-violet-600 flex-1 px-2.5 text-xs text-white hover:bg-violet-700">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    AI Route
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
