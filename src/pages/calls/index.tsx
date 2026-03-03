import React from 'react'
import Papa from 'papaparse'
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  CallBlockingRule,
  CallBlockingResponse,
  CallBlockingStatistics,
  SpamProtectionRule,
  SpamProtectionResponse,
  SpamProtectionStatistics,
  PhoneNumber,
  PhoneNumberResponse,
  PhoneNumberStatistics,
  AvailablePhoneNumber,
  AvailablePhoneNumbersResponse,
} from '@/src/constants/interface/callBlocking'
import { Source } from '@/src/constants/interface/source'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { Loading } from '@/src/components/ui/loading'
import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Input } from '@/src/components/ui/input'
import { Textarea } from '@/src/components/ui/textarea'
import { Label } from '@/src/components/ui/label'
import { Slider } from '@/src/components/ui/slider'
import { Switch } from '@/src/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/src/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/src/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import {
  PhoneCall,
  Phone,
  PhoneOutgoing,
  PhoneMissed,
  Search,
  Play,
  Plus,
  TrendingUp,
  MapPin,
  Settings,
  CheckCircle2,
  Shield,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  SlidersHorizontal,
  ChevronDown,
  XCircle,
  Smile,
  Frown,
  Meh,
  Download,
  CalendarDays,
  Brain,
  BarChart3,
  DollarSign,
  Target,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Check,
  Edit,
  Upload,
  Pencil,
  PhoneIncoming,
  Trash2,
  Loader2,
  CheckCircle,
  Link,
  Unlink,
  MessageSquare,
} from 'lucide-react'
import { usePermissions } from '@/src/hooks/usePermissions'
import { useDebounce } from '@/src/hooks/useDebounce'

// Enhanced call data
const callData = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    phoneNumber: '(555) 123-4567',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face',
    source: 'Google Ads',
    location: 'Downtown LA',
    jobType: 'Plumbing Emergency',
    status: 'completed',
    callOutcome: 'connected',
    customerSatisfaction: 'happy',
    duration: '4:32',
    timestamp: '10:15 AM',
    date: '2024-01-24',
    hasRecording: true,
    notes: 'Customer needs urgent pipe repair, scheduled for tomorrow 2 PM',
    rating: 5,
    type: 'incoming',
    followUpRequired: false,
    tags: ['emergency', 'plumbing', 'high-value'],
    answeredBy: {
      name: 'Mike Rodriguez',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  },
  {
    id: '2',
    customerName: 'David Chen',
    phoneNumber: '(555) 987-6543',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    source: 'Facebook',
    location: 'West Hollywood',
    jobType: 'HVAC Maintenance',
    status: 'completed',
    callOutcome: 'connected',
    customerSatisfaction: 'neutral',
    duration: '2:18',
    timestamp: '9:45 AM',
    date: '2024-01-24',
    hasRecording: false,
    notes: 'Annual maintenance check, customer interested in upgrade',
    rating: 4,
    type: 'outgoing',
    followUpRequired: true,
    tags: ['hvac', 'maintenance', 'recurring'],
    answeredBy: {
      name: 'Sam Delgado',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    },
  },
  {
    id: '3',
    customerName: 'Emma Williams',
    phoneNumber: '(555) 456-7890',
    avatar:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
    source: 'Yelp',
    location: 'Beverly Hills',
    jobType: 'Electrical Repair',
    status: 'missed',
    callOutcome: 'no-answer',
    customerSatisfaction: 'unhappy',
    duration: '0:00',
    timestamp: '8:30 AM',
    date: '2024-01-24',
    hasRecording: false,
    notes: 'Multiple attempts, needs follow-up',
    rating: 2,
    type: 'incoming',
    followUpRequired: true,
    tags: ['electrical', 'urgent'],
    answeredBy: null,
  },
]

// Live metrics
const liveMetrics = {
  todayCalls: 45,
  todayChange: '+12%',
}

// AI insights
const aiInsights = [
  {
    icon: Brain,
    title: 'Peak Call Time Detected',
    description: '9-11 AM showing highest conversion rates (78%)',
    confidence: 94,
    action: 'Schedule more agents during peak hours',
  },
  {
    icon: TrendingUp,
    title: 'Revenue Opportunity',
    description: '7 missed calls worth estimated $2,065 in potential revenue',
    confidence: 87,
    action: 'Implement callback automation',
  },
]

// Available agents
const agents = [
  'Alex Johnson',
  'Sam Delgado',
  'Taylor Wilson',
  'Maria Garcia',
  'Mike Rodriguez',
]

// Source numbers with names
const sourceNumbers = {
  google: [
    { number: '(999) 999-9999', name: 'Google Main Line' },
    { number: '(312) 626-8242', name: 'Google Emergency' },
  ],
  facebook: [{ number: '(305) 930-8362', name: 'Facebook Campaigns' }],
  organic: [{ number: '(346) 570-1075', name: 'Organic Search' }],
  yelp: [{ number: '(832) 390-7155', name: 'Yelp Reviews' }],
  referral: [{ number: '(713) 492-0872', name: 'Referral Program' }],
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />
    case 'missed':
      return <PhoneMissed className="w-4 h-4 text-red-500" />
    case 'blocked':
      return <Shield className="w-4 h-4 text-red-500" />
    default:
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />
  }
}

const getOutcomeIcon = (outcome: string) => {
  switch (outcome) {
    case 'connected':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />
    case 'busy':
      return <Phone className="w-4 h-4 text-yellow-500" />
    case 'no-answer':
      return <PhoneMissed className="w-4 h-4 text-red-500" />
    case 'voicemail':
      return <PhoneCall className="w-4 h-4 text-[#53a533]/50" />
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" />
    case 'blocked':
      return <Shield className="w-4 h-4 text-red-500" />
    default:
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />
  }
}

const getSatisfactionIcon = (satisfaction: string) => {
  switch (satisfaction) {
    case 'happy':
      return <Smile className="w-4 h-4 text-green-500" />
    case 'neutral':
      return <Meh className="w-4 h-4 text-yellow-500" />
    case 'unhappy':
      return <Frown className="w-4 h-4 text-red-500" />
    default:
      return null
  }
}

const getSourceColor = (source: string) => {
  const colors = {
    'Google Ads': 'bg-[#53a533]/50',
    Facebook: 'bg-purple-500',
    Organic: 'bg-green-500',
    Yelp: 'bg-yellow-500',
    Referral: 'bg-indigo-500',
  }
  return colors[source as keyof typeof colors] || 'bg-gray-500'
}

// Custom Select Component
function CustomSelect({
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
  className,
}: {
  value: string
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder: string
  disabled?: boolean
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleOptionSelect = (optionValue: string) => {
    onValueChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full px-4 py-3 text-left bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-[#53a533]/50/20 focus:border-[#53a533]/30 transition-all duration-200 ${
          disabled
            ? 'opacity-40 cursor-not-allowed bg-slate-50'
            : 'cursor-pointer hover:border-slate-300'
        } ${isOpen ? 'ring-2 ring-[#53a533]/50/20 border-[#53a533]/30' : ''}`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-medium truncate ${selectedOption ? 'text-slate-900 dark:text-gray-100' : 'text-slate-500 dark:text-gray-400'}`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 dark:text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-slate-200 dark:border-neutral-700 overflow-hidden z-[9999] min-w-[250px]"
          onClick={e => e.stopPropagation()}
        >
          <div className="max-h-64 overflow-y-auto">
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors duration-150 ${
                  value === option.value
                    ? 'bg-[#53a533]/5 text-[#3d7a28] font-medium'
                    : 'text-slate-700 dark:text-gray-300'
                }`}
              >
                <span className="block truncate">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Searchable Select Component
function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
  className,
}: {
  value: string
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder: string
  disabled?: boolean
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  )
  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearch('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleOptionSelect = (optionValue: string) => {
    onValueChange(optionValue)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full px-4 py-3 text-left bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-[#53a533]/50/20 focus:border-[#53a533]/30 transition-all duration-200 ${
          disabled
            ? 'opacity-40 cursor-not-allowed bg-slate-50'
            : 'cursor-pointer hover:border-slate-300'
        } ${isOpen ? 'ring-2 ring-[#53a533]/50/20 border-[#53a533]/30' : ''}`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-medium truncate ${selectedOption ? 'text-slate-900 dark:text-gray-100' : 'text-slate-500 dark:text-gray-400'}`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 dark:text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-slate-200 dark:border-neutral-700 overflow-hidden z-[9999] min-w-[250px]"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:ring-2 focus:ring-[#53a533]/50/20 focus:border-[#53a533]/30 transition-all duration-200"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors duration-150 ${
                  value === option.value
                    ? 'bg-[#53a533]/5 text-[#3d7a28] font-medium'
                    : 'text-slate-700 dark:text-gray-300'
                }`}
              >
                <span className="block truncate">{option.label}</span>
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-4 py-6 text-sm text-slate-500 dark:text-gray-400 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const CallsIndex: React.FC = (): React.JSX.Element => {
  const { checkPermission } = usePermissions()
  const [selectedTab, setSelectedTab] = useState('call-log')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(
    null
  )
  const [isDialerOpen, setIsDialerOpen] = useState(false)

  // Advanced Filters State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [callFlowFilter, setCallFlowFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [sourceNumberFilter, setSourceNumberFilter] = useState('')
  const [minDuration, setMinDuration] = useState('')
  const [maxDuration, setMaxDuration] = useState('')
  const [agentFilter, setAgentFilter] = useState('all')
  const [recordingFilter, setRecordingFilter] = useState('any')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [outcomeFilter, setOutcomeFilter] = useState('all')

  // Call Blocking State
  const [callBlockingData, setCallBlockingData] = useState<CallBlockingRule[]>(
    []
  )
  const [callBlockingLoading, setCallBlockingLoading] = useState(false)
  const [callBlockingError, setCallBlockingError] = useState<string | null>(
    null
  )
  const [callBlockingPagination, setCallBlockingPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  })
  const [loadingMore, setLoadingMore] = useState(false)
  const [callBlockingStats, setCallBlockingStats] = useState({
    totalBlocked: 0,
    blockedToday: 0,
    timeSaved: 0,
  })
  const [exportFormatDialogOpen, setExportFormatDialogOpen] = useState(false)
  const [selectedExportFormat, setSelectedExportFormat] = useState<
    'csv' | 'json'
  >('csv')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false)
  const [ruleToDelete, setRuleToDelete] = useState<CallBlockingRule | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)
  const [editingRule, setEditingRule] = useState<CallBlockingRule | null>(null)
  const [editFormData, setEditFormData] = useState({
    phoneNumber: '',
    pattern: '',
    blockingType: 'number' as 'number' | 'pattern',
    blockType: 'permanent' as 'permanent' | 'temporary',
    reason: 'spam',
    sourceSelectionType: 'all' as 'all' | 'specific',
    sourceCodes: [] as string[],
    notes: '',
    expiresAt: '',
  })
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({})
  const [updating, setUpdating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [statistics, setStatistics] = useState<CallBlockingStatistics | null>(
    null
  )
  const [statisticsLoading, setStatisticsLoading] = useState(false)
  const [blockingStartDate, setBlockingStartDate] = useState('')
  const [blockingEndDate, setBlockingEndDate] = useState('')
  const [blockingGroupBy, setBlockingGroupBy] = useState<
    'day' | 'week' | 'month' | 'none'
  >('none')
  const [importing, setImporting] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importFormData, setImportFormData] = useState({
    format: 'csv' as 'json' | 'csv',
    sourceSelectionType: 'all' as 'all' | 'specific',
    sourceCodes: [] as string[],
    rules: null as File | null,
    csvContent: '' as string,
  })
  const [importErrors, setImportErrors] = useState<{ [key: string]: string }>(
    {}
  )
  const [selectedCsvFileName, setSelectedCsvFileName] = useState<string>('')
  const [importResults, setImportResults] = useState<any>(null)
  const [resultsModalOpen, setResultsModalOpen] = useState(false)
  const [manualInputMode, setManualInputMode] = useState(false)
  const [manualRulesContent, setManualRulesContent] = useState('')

  // Call Blocking Creation Form State
  const [createFormData, setCreateFormData] = useState({
    phoneNumber: '',
    pattern: '',
    blockingType: 'number' as 'number' | 'pattern',
    blockType: 'permanent' as 'permanent' | 'temporary',
    reason: 'spam',
    sourceSelectionType: 'all' as 'all' | 'specific',
    sourceCodes: [] as string[],
    notes: '',
    expiresAt: '',
  })
  const [sources, setSources] = useState<
    Array<{ id: string; code: string; name: string }>
  >([])
  const [sourcesLoading, setSourcesLoading] = useState(false)
  const [sourceCodesOpen, setSourceCodesOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [sourceSearchQuery, setSourceSearchQuery] = useState('')

  // Spam Protection state
  const [spamProtectionData, setSpamProtectionData] = useState<
    SpamProtectionRule[]
  >([])
  const [spamProtectionLoading, setSpamProtectionLoading] = useState(false)
  const [spamProtectionError, setSpamProtectionError] = useState<string | null>(
    null
  )
  const [spamProtectionPagination, setSpamProtectionPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  })
  const [spamProtectionLoadingMore, setSpamProtectionLoadingMore] =
    useState(false)
  const [spamProtectionViewModalOpen, setSpamProtectionViewModalOpen] =
    useState(false)
  const [selectedSpamProtectionRule, setSelectedSpamProtectionRule] =
    useState<SpamProtectionRule | null>(null)
  const [detailedSpamProtectionRule, setDetailedSpamProtectionRule] =
    useState<SpamProtectionRule | null>(null)
  const [spamProtectionDetailLoading, setSpamProtectionDetailLoading] =
    useState(false)
  const [spamProtectionDeleteModalOpen, setSpamProtectionDeleteModalOpen] =
    useState(false)
  const [spamProtectionToDelete, setSpamProtectionToDelete] =
    useState<SpamProtectionRule | null>(null)
  const [spamProtectionDeleting, setSpamProtectionDeleting] = useState(false)
  const [spamProtectionCreateModalOpen, setSpamProtectionCreateModalOpen] =
    useState(false)
  const [spamProtectionCreating, setSpamProtectionCreating] = useState(false)
  const [spamProtectionCreateForm, setSpamProtectionCreateForm] = useState({
    title: '',
    protection: '{{dynamic}}',
    greeting: '',
    sourceSelectionType: 'all' as 'all' | 'specific',
    sourceCodes: [] as string[],
    voiceId: 'TX3LPaxmHKxFdv7VOQHJ',
    voiceSettings: {
      stability: 0.5,
      similarity_boost: 0.7,
      style: 0,
      use_speaker_boost: true,
    },
  })
  const [spamProtectionCreateErrors, setSpamProtectionCreateErrors] = useState<{
    [key: string]: string
  }>({})
  const [spamProtectionSourceCodesOpen, setSpamProtectionSourceCodesOpen] =
    useState(false)
  const [spamProtectionSourceSearchQuery, setSpamProtectionSourceSearchQuery] =
    useState('')
  const [spamProtectionRegenerating, setSpamProtectionRegenerating] =
    useState(false)
  const [spamProtectionToEdit, setSpamProtectionToEdit] =
    useState<SpamProtectionRule | null>(null)

  // Spam Protection Statistics state
  const [spamProtectionStatistics, setSpamProtectionStatistics] =
    useState<SpamProtectionStatistics | null>(null)
  const [spamProtectionStatisticsLoading, setSpamProtectionStatisticsLoading] =
    useState(false)
  const [spamProtectionStatisticsError, setSpamProtectionStatisticsError] =
    useState<string | null>(null)
  const [spamProtectionStartDate, setSpamProtectionStartDate] = useState('')
  const [spamProtectionEndDate, setSpamProtectionEndDate] = useState('')

  // Phone Number Management state
  const [phoneNumberData, setPhoneNumberData] = useState<PhoneNumber[]>([])
  const [phoneNumberLoading, setPhoneNumberLoading] = useState(false)
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null)
  const [phoneNumberPagination, setPhoneNumberPagination] = useState({
    current: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [phoneNumberViewModalOpen, setPhoneNumberViewModalOpen] =
    useState(false)
  const [selectedPhoneNumber, setSelectedPhoneNumber] =
    useState<PhoneNumber | null>(null)
  const [phoneNumberDetailLoading, setPhoneNumberDetailLoading] =
    useState(false)
  const [phoneNumberStartDate, setPhoneNumberStartDate] = useState('')
  const [phoneNumberEndDate, setPhoneNumberEndDate] = useState('')
  const [phoneNumberSearchTerm, setPhoneNumberSearchTerm] = useState('')
  const debouncedPhoneNumberSearchTerm = useDebounce(phoneNumberSearchTerm, 500)

  // Additional filters for MOD042 users
  const [phoneNumberTenantId, setPhoneNumberTenantId] = useState('all')
  const [phoneNumberByTenantId, setPhoneNumberByTenantId] = useState('all')
  const [phoneNumberCountry, setPhoneNumberCountry] = useState('all')
  const [phoneNumberStatus, setPhoneNumberStatus] = useState('all')

  // Tenant filter states
  const [tenants, setTenants] = useState<any[]>([])
  const [loadingTenants, setLoadingTenants] = useState(false)
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false)
  const [tenantSearchTerm, setTenantSearchTerm] = useState('')

  const [byTenants, setByTenants] = useState<any[]>([])
  const [loadingByTenants, setLoadingByTenants] = useState(false)
  const [byTenantDropdownOpen, setByTenantDropdownOpen] = useState(false)
  const [byTenantSearchTerm, setByTenantSearchTerm] = useState('')

  // Phone Number Statistics state
  const [phoneNumberStatistics, setPhoneNumberStatistics] =
    useState<PhoneNumberStatistics | null>(null)
  const [phoneNumberStatisticsLoading, setPhoneNumberStatisticsLoading] =
    useState(false)
  const [phoneNumberStatisticsError, setPhoneNumberStatisticsError] = useState<
    string | null
  >(null)
  const [phoneStatisticsAccordionOpen, setPhoneStatisticsAccordionOpen] =
    useState(false)

  // Intersection Observer refs and state for section-based loading
  const callBlockingRef = useRef<HTMLDivElement>(null)
  const spamProtectionRef = useRef<HTMLDivElement>(null)
  const phoneNumberRef = useRef<HTMLDivElement>(null)
  const [sectionsLoaded, setSectionsLoaded] = useState<Set<string>>(new Set())

  // Purchase phone number modal states
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [selectedNumberForPurchase, setSelectedNumberForPurchase] =
    useState<AvailablePhoneNumber | null>(null)
  const [purchaseFormData, setPurchaseFormData] = useState({
    friendlyName: '',
  })
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)

  // Purchase New Phone Numbers section states
  const [purchaseSectionFilters, setPurchaseSectionFilters] = useState({
    country: 'US',
    locality: '',
    areaCode: '',
    numberType: 'all',
    contains: '',
    smsEnabled: false,
    mmsEnabled: false,
    voiceEnabled: false,
    limit: 20,
  })
  const [purchaseSectionNumbers, setPurchaseSectionNumbers] = useState<
    AvailablePhoneNumber[]
  >([])
  const [purchaseSectionLoading, setPurchaseSectionLoading] = useState(false)
  const [purchaseSectionError, setPurchaseSectionError] = useState<
    string | null
  >(null)
  const [
    selectedNumberForPurchaseSection,
    setSelectedNumberForPurchaseSection,
  ] = useState<AvailablePhoneNumber | null>(null)
  const [purchaseSectionFriendlyName, setPurchaseSectionFriendlyName] =
    useState('')
  const [purchaseSectionPurchasing, setPurchaseSectionPurchasing] =
    useState(false)
  const [purchaseSectionPurchaseError, setPurchaseSectionPurchaseError] =
    useState<string | null>(null)

  // Assign to source modal states
  const [assignToSourceModalOpen, setAssignToSourceModalOpen] = useState(false)
  const [
    selectedPhoneNumberForAssignment,
    setSelectedPhoneNumberForAssignment,
  ] = useState<PhoneNumber | null>(null)
  const [assignmentSources, setAssignmentSources] = useState<Source[]>([])
  const [assignmentSourcesLoading, setAssignmentSourcesLoading] =
    useState(false)
  const [assignmentSourcesOpen, setAssignmentSourcesOpen] = useState(false)
  const [selectedAssignmentSource, setSelectedAssignmentSource] =
    useState<Source | null>(null)
  const [assignmentSourceSearchQuery, setAssignmentSourceSearchQuery] =
    useState('')
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)

  // Release source confirmation modal states
  const [releaseConfirmationModalOpen, setReleaseConfirmationModalOpen] =
    useState(false)
  const [selectedPhoneNumberForRelease, setSelectedPhoneNumberForRelease] =
    useState<PhoneNumber | null>(null)
  const [releasing, setReleasing] = useState(false)
  const [releaseError, setReleaseError] = useState<string | null>(null)

  // Delete phone number modal states
  const [phoneNumberToDelete, setPhoneNumberToDelete] =
    useState<PhoneNumber | null>(null)

  // Edit phone number modal states
  const [editPhoneNumberModalOpen, setEditPhoneNumberModalOpen] =
    useState(false)
  const [selectedPhoneNumberForEdit, setSelectedPhoneNumberForEdit] =
    useState<PhoneNumber | null>(null)
  const [phoneNumberEditFormData, setPhoneNumberEditFormData] = useState({
    friendlyName: '',
  })
  const [editing, setEditing] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Date range helper function
  const getDateRangeDisplay = () => {
    if (dateRangeFilter === 'custom' && customStartDate && customEndDate) {
      return {
        start: customStartDate,
        end: customEndDate,
        label: `${new Date(customStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(customEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      }
    }

    const today = new Date()
    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    switch (dateRangeFilter) {
      case 'today':
        return {
          start: formatDate(today),
          end: formatDate(today),
          label: 'Today',
        }
      case 'yesterday':
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        return {
          start: formatDate(yesterday),
          end: formatDate(yesterday),
          label: 'Yesterday',
        }
      case 'last7days':
        const last7 = new Date(today)
        last7.setDate(today.getDate() - 7)
        return {
          start: formatDate(last7),
          end: formatDate(today),
          label: 'Last 7 Days',
        }
      case 'last30days':
        const last30 = new Date(today)
        last30.setDate(today.getDate() - 30)
        return {
          start: formatDate(last30),
          end: formatDate(today),
          label: 'Last 30 Days',
        }
      case 'thismonth':
        const thisMonthStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        )
        return {
          start: formatDate(thisMonthStart),
          end: formatDate(today),
          label: 'This Month',
        }
      case 'lastmonth':
        const lastMonthStart = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        )
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
        return {
          start: formatDate(lastMonthStart),
          end: formatDate(lastMonthEnd),
          label: 'Last Month',
        }
      default:
        return null
    }
  }

  // Filter handlers
  const handleQuickFilter = (filterType: string) => {
    if (activeQuickFilter === filterType) {
      setActiveQuickFilter(null)
    } else {
      setActiveQuickFilter(filterType)
    }
  }

  const handleSourceFilterChange = (value: string) => {
    setSourceFilter(value)
    setSourceNumberFilter('')
  }

  const getAvailableSourceNumbers = () => {
    if (sourceFilter === 'all') return []
    return sourceNumbers[sourceFilter as keyof typeof sourceNumbers] || []
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setActiveQuickFilter(null)
    setCallFlowFilter('all')
    setSourceFilter('all')
    setSourceNumberFilter('')
    setMinDuration('')
    setMaxDuration('')
    setAgentFilter('all')
    setRecordingFilter('any')
    setDateRangeFilter('all')
    setCustomStartDate('')
    setCustomEndDate('')
    setOutcomeFilter('all')
  }

  // Comprehensive filtering logic
  const filteredCalls = callData.filter(call => {
    const matchesSearch =
      searchTerm === '' ||
      call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.phoneNumber.includes(searchTerm) ||
      call.jobType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesQuickFilter =
      !activeQuickFilter ||
      (() => {
        switch (activeQuickFilter) {
          case 'total':
            return true
          case 'incoming':
            return call.type === 'incoming'
          case 'outgoing':
            return call.type === 'outgoing'
          case 'missed':
            return call.status === 'missed'
          default:
            return true
        }
      })()

    const matchesCallFlow =
      callFlowFilter === 'all' ||
      (() => {
        switch (callFlowFilter) {
          case 'masking':
            return call.type === 'incoming'
          case 'inhouse':
            return call.type === 'outgoing'
          default:
            return true
        }
      })()

    const matchesSource =
      sourceFilter === 'all' ||
      (() => {
        switch (sourceFilter) {
          case 'google':
            return call.source === 'Google Ads'
          case 'facebook':
            return call.source === 'Facebook'
          case 'organic':
            return call.source === 'Organic'
          case 'yelp':
            return call.source === 'Yelp'
          case 'referral':
            return call.source === 'Referral'
          default:
            return true
        }
      })()

    const matchesSourceNumber =
      !sourceNumberFilter || call.phoneNumber === sourceNumberFilter
    const matchesAgent =
      agentFilter === 'all' ||
      (call.answeredBy
        ? call.answeredBy.name === agentFilter
        : agentFilter === 'Unassigned')
    const matchesRecording =
      recordingFilter === 'any' ||
      (() => {
        switch (recordingFilter) {
          case 'with':
            return call.hasRecording
          case 'without':
            return !call.hasRecording
          default:
            return true
        }
      })()
    const matchesOutcome =
      outcomeFilter === 'all' || call.callOutcome === outcomeFilter

    const matchesDuration = (() => {
      if (!minDuration && !maxDuration) return true
      const [minutes, seconds] = call.duration.split(':').map(Number)
      const totalSeconds = minutes * 60 + seconds
      if (minDuration && totalSeconds < parseInt(minDuration) * 60) return false
      if (maxDuration && totalSeconds > parseInt(maxDuration) * 60) return false
      return true
    })()

    return (
      matchesSearch &&
      matchesQuickFilter &&
      matchesCallFlow &&
      matchesSource &&
      matchesSourceNumber &&
      matchesAgent &&
      matchesRecording &&
      matchesOutcome &&
      matchesDuration
    )
  })

  // Fetch call blocking data function (now called by intersection observer)
  const fetchCallBlockingData = async () => {
    if (!checkPermission('MOD039', 'view')) {
      return
    }
    setCallBlockingLoading(true)
    setCallBlockingError(null)

    try {
      const params = new URLSearchParams()
      params.append('page', '1')
      params.append('limit', '10')
      params.append('sort', '-createdAt')

      const response = await apiService.get(
        `/v1/wepro-phone/call-blocking?${params.toString()}`
      )

      setCallBlockingData(response.data.data)

      // Update pagination state
      setCallBlockingPagination({
        currentPage: response.data.pagination.current.page,
        totalPages: response.data.pagination.pages,
        hasMore:
          response.data.pagination.current.page <
          response.data.pagination.pages,
      })

      // Calculate statistics
      const totalBlocked = response.data.data.reduce(
        (sum: number, rule: any) => sum + rule.blockedCount,
        0
      )
      const today = new Date().toISOString().split('T')[0]
      const blockedToday = response.data.data.filter((rule: any) =>
        rule.createdAt.startsWith(today)
      ).length

      setCallBlockingStats({
        totalBlocked,
        blockedToday,
        timeSaved: Math.round(totalBlocked * 2.5), // Estimate 2.5 minutes saved per blocked call
      })
    } catch (error) {
      console.error('Error fetching call blocking data:', error)
      setCallBlockingError('Failed to load call blocking data')
    } finally {
      setCallBlockingLoading(false)
    }
  }

  // Fetch call blocking statistics
  const fetchCallBlockingStatistics = useCallback(async () => {
    if (!checkPermission('MOD039', 'view_statistics')) {
      return
    }
    try {
      setStatisticsLoading(true)
      const params = new URLSearchParams()
      if (blockingStartDate) params.append('startDate', blockingStartDate)
      if (blockingEndDate) params.append('endDate', blockingEndDate)
      if (blockingGroupBy && blockingGroupBy !== 'none')
        params.append('groupBy', blockingGroupBy)

      const queryString = params.toString()
      const url = `/v1/wepro-phone/call-blocking/statistics${queryString ? `?${queryString}` : ''}`

      const response = await apiService.get(url)
      setStatistics(response.data)
    } catch (error) {
      console.error('Error fetching call blocking statistics:', error)
    } finally {
      setStatisticsLoading(false)
    }
  }, [blockingStartDate, blockingEndDate, blockingGroupBy])

  // Set default date range to empty
  useEffect(() => {
    setBlockingStartDate('')
    setBlockingEndDate('')
  }, [])

  // Call blocking statistics loading is now handled by intersection observer

  // Fetch statistics when date range or groupBy changes
  useEffect(() => {
    if (selectedTab !== 'phone-settings') {
      return
    }
    fetchCallBlockingStatistics()
  }, [
    blockingStartDate,
    blockingEndDate,
    blockingGroupBy,
    fetchCallBlockingStatistics,
  ])

  // Fetch sources for call blocking creation
  const fetchSources = async (searchQuery: string = '') => {
    if (!checkPermission('MOD008', 'view')) {
      return
    }
    setSourcesLoading(true)
    try {
      const searchParam = searchQuery
        ? `&search=${encodeURIComponent(searchQuery)}`
        : ''
      const response = await apiService.get(
        `/v1/sources?page=1&limit=50&sort=-createdAt${searchParam}`
      )
      const sourcesData =
        response.data.success !== undefined ? response.data.data : response.data
      setSources(sourcesData || [])
    } catch (error) {
      console.error('Error fetching sources:', error)
    } finally {
      setSourcesLoading(false)
    }
  }

  // Fetch spam protection data
  const fetchSpamProtectionData = async () => {
    if (!checkPermission('MOD040', 'view')) {
      return
    }
    setSpamProtectionLoading(true)
    setSpamProtectionError(null)

    try {
      const params = new URLSearchParams()
      params.append('page', '1')
      params.append('limit', '10')
      params.append('sortBy', '-createdAt')

      const response = await apiService.get(
        `/v1/wepro-phone/spam-protection?${params.toString()}`
      )

      if (response.data.success) {
        setSpamProtectionData(response.data.data.data)
        setSpamProtectionPagination({
          currentPage: response.data.data.pagination.current,
          totalPages: response.data.data.pagination.pages,
          hasMore:
            response.data.data.pagination.current <
            response.data.data.pagination.pages,
        })
      }
    } catch (error) {
      console.error('Error fetching spam protection data:', error)
      setSpamProtectionError('Failed to load spam protection data')
    } finally {
      setSpamProtectionLoading(false)
    }
  }

  // Fetch spam protection statistics
  const fetchSpamProtectionStatistics = async () => {
    if (!checkPermission('MOD040', 'view_statistics')) {
      return
    }
    setSpamProtectionStatisticsLoading(true)
    setSpamProtectionStatisticsError(null)

    try {
      const params = new URLSearchParams()
      if (spamProtectionStartDate)
        params.append('startDate', spamProtectionStartDate)
      if (spamProtectionEndDate) params.append('endDate', spamProtectionEndDate)

      const response = await apiService.get(
        `/v1/wepro-phone/spam-protection/statistics?${params.toString()}`
      )

      if (response.data.success) {
        setSpamProtectionStatistics(response.data.data)
      } else {
        setSpamProtectionStatisticsError(
          response.data.message || 'Failed to fetch statistics'
        )
      }
    } catch (error: any) {
      console.error('Error fetching spam protection statistics:', error)
      setSpamProtectionStatisticsError(
        error.response?.data?.message || 'Failed to fetch statistics'
      )
    } finally {
      setSpamProtectionStatisticsLoading(false)
    }
  }

  // Intersection Observer for section-based loading in Phone Settings tab
  useEffect(() => {
    if (selectedTab !== 'phone-settings') return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section')

            // Prevent duplicate loading
            if (!sectionId || sectionsLoaded.has(sectionId)) return

            switch (sectionId) {
              case 'call-blocking':
                if (checkPermission('MOD039', 'view')) {
                  fetchCallBlockingData()
                  fetchCallBlockingStatistics()
                  setSectionsLoaded(
                    prev => new Set(Array.from(prev).concat('call-blocking'))
                  )
                }
                break
              case 'spam-protection':
                if (checkPermission('MOD040', 'view')) {
                  fetchSpamProtectionData()
                  fetchSpamProtectionStatistics()
                  setSectionsLoaded(
                    prev => new Set(Array.from(prev).concat('spam-protection'))
                  )
                }
                break
              case 'phone-numbers':
                if (
                  checkPermission('MOD041', 'view') ||
                  checkPermission('MOD042', 'view')
                ) {
                  fetchPhoneNumberData()
                  fetchPhoneNumberStatistics()
                  setSectionsLoaded(
                    prev => new Set(Array.from(prev).concat('phone-numbers'))
                  )
                }
                break
            }
          }
        })
      },
      {
        threshold: 0.1, // Trigger when 10% of section is visible
        rootMargin: '50px', // Start loading 50px before section comes into view
      }
    )

    // Observe sections that user has permission to see
    if (checkPermission('MOD039', 'view') && callBlockingRef.current) {
      observer.observe(callBlockingRef.current)
    }
    if (checkPermission('MOD040', 'view') && spamProtectionRef.current) {
      observer.observe(spamProtectionRef.current)
    }
    if (
      (checkPermission('MOD041', 'view') ||
        checkPermission('MOD042', 'view')) &&
      phoneNumberRef.current
    ) {
      observer.observe(phoneNumberRef.current)
    }

    return () => observer.disconnect()
  }, [selectedTab, sectionsLoaded])

  // Reset loaded sections when tab changes
  useEffect(() => {
    setSectionsLoaded(new Set())
  }, [selectedTab])

  // Set default date range to empty
  useEffect(() => {
    setSpamProtectionStartDate('')
    setSpamProtectionEndDate('')
  }, [])

  // Spam protection statistics loading is now handled by intersection observer

  // Fetch statistics when date range changes
  useEffect(() => {
    if (spamProtectionStartDate || spamProtectionEndDate) {
      fetchSpamProtectionStatistics()
    }
  }, [spamProtectionStartDate, spamProtectionEndDate])

  // Handle spam protection view
  const handleSpamProtectionView = async (rule: SpamProtectionRule) => {
    setSelectedSpamProtectionRule(rule)
    setSpamProtectionViewModalOpen(true)
    setSpamProtectionDetailLoading(true)

    try {
      const response = await apiService.get(
        `/v1/wepro-phone/spam-protection/${rule._id}`
      )
      if (response.data.success) {
        setDetailedSpamProtectionRule(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching detailed spam protection data:', error)
      // Fallback to basic rule data if detailed fetch fails
      setDetailedSpamProtectionRule(rule)
    } finally {
      setSpamProtectionDetailLoading(false)
    }
  }

  // Handle spam protection delete
  const handleSpamProtectionDelete = (rule: SpamProtectionRule) => {
    setSpamProtectionToDelete(rule)
    setSpamProtectionDeleteModalOpen(true)
  }

  // Confirm spam protection delete
  const confirmSpamProtectionDelete = async () => {
    if (!spamProtectionToDelete) return

    setSpamProtectionDeleting(true)
    try {
      await apiService.delete(
        `/v1/wepro-phone/spam-protection/${spamProtectionToDelete._id}`
      )
      toast.success('Spam protection rule deleted successfully')

      // Refresh the spam protection data
      await fetchSpamProtectionData()

      // Close modals
      setSpamProtectionDeleteModalOpen(false)
      setSpamProtectionViewModalOpen(false)
      setSpamProtectionToDelete(null)
    } catch (error) {
      console.error('Error deleting spam protection rule:', error)
      toast.error('Failed to delete spam protection rule')
    } finally {
      setSpamProtectionDeleting(false)
    }
  }

  // Handle load more spam protection rules
  const handleLoadMoreSpamProtection = async () => {
    if (spamProtectionLoadingMore || !spamProtectionPagination.hasMore) return

    setSpamProtectionLoadingMore(true)
    try {
      const nextPage = spamProtectionPagination.currentPage + 1
      const params = new URLSearchParams()
      params.append('page', nextPage.toString())
      params.append('limit', '10')
      params.append('sortBy', '-createdAt')

      const response = await apiService.get(
        `/v1/wepro-phone/spam-protection?${params.toString()}`
      )

      if (response.data.success) {
        // Append new data to existing data
        setSpamProtectionData(prev => [...prev, ...response.data.data.data])

        // Update pagination state
        setSpamProtectionPagination(prev => ({
          currentPage: response.data.data.pagination.current,
          totalPages: response.data.data.pagination.pages,
          hasMore:
            response.data.data.pagination.current <
            response.data.data.pagination.pages,
        }))
      }
    } catch (error) {
      console.error('Error loading more spam protection rules:', error)
      toast.error('Failed to load more spam protection rules')
    } finally {
      setSpamProtectionLoadingMore(false)
    }
  }

  // Handle spam protection create form input changes
  const handleSpamProtectionCreateFormChange = (field: string, value: any) => {
    setSpamProtectionCreateForm(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (spamProtectionCreateErrors[field]) {
      setSpamProtectionCreateErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  // Handle voice settings changes
  const handleVoiceSettingsChange = (field: string, value: any) => {
    setSpamProtectionCreateForm(prev => ({
      ...prev,
      voiceSettings: {
        ...prev.voiceSettings,
        [field]: value,
      },
    }))
  }

  // Handle spam protection source code toggle
  const handleSpamProtectionSourceCodeToggle = (sourceCode: string) => {
    setSpamProtectionCreateForm(prev => ({
      ...prev,
      sourceCodes: prev.sourceCodes.includes(sourceCode)
        ? prev.sourceCodes.filter(code => code !== sourceCode)
        : [...prev.sourceCodes, sourceCode],
    }))
  }

  // Handle spam protection source codes popover open/close
  const handleSpamProtectionSourceCodesOpenChange = (open: boolean) => {
    setSpamProtectionSourceCodesOpen(open)
    if (!open) {
      // Reset search when popover closes
      setSpamProtectionSourceSearchQuery('')
      // Fetch all sources again
      fetchSources()
    }
  }

  // Handle spam protection audio regeneration
  const handleSpamProtectionRegenerateAudio = async () => {
    if (!detailedSpamProtectionRule && !selectedSpamProtectionRule) return

    const ruleId =
      detailedSpamProtectionRule?._id || selectedSpamProtectionRule?._id
    if (!ruleId) return

    setSpamProtectionRegenerating(true)
    try {
      await apiService.post(
        `/v1/wepro-phone/spam-protection/${ruleId}/regenerate-audio`
      )
      toast.success('Audio regeneration started successfully')

      // Refresh the detailed data to get updated status
      if (detailedSpamProtectionRule) {
        const response = await apiService.get(
          `/v1/wepro-phone/spam-protection/${ruleId}`
        )
        if (response.data.success) {
          setDetailedSpamProtectionRule(response.data.data)
        }
      }
    } catch (error: any) {
      console.error('Error regenerating spam protection audio:', error)
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to regenerate audio'
      toast.error(errorMessage)
    } finally {
      setSpamProtectionRegenerating(false)
    }
  }

  // Handle spam protection edit
  const handleSpamProtectionEdit = (rule: SpamProtectionRule) => {
    setSpamProtectionToEdit(rule)
    setSpamProtectionCreateForm({
      title: rule.title,
      protection: rule.protection,
      greeting: rule.greeting,
      sourceSelectionType: rule.sourceSelectionType,
      sourceCodes: rule.sourceCodes,
      voiceId: rule.voiceId,
      voiceSettings: rule.voiceSettings || {
        stability: 0.5,
        similarity_boost: 0.7,
        style: 0,
        use_speaker_boost: true,
      },
    })
    setSpamProtectionCreateErrors({})
    setSpamProtectionCreateModalOpen(true)
  }

  // Validate spam protection create form
  const validateSpamProtectionCreateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!spamProtectionCreateForm.title.trim()) {
      errors.title = 'Title is required'
    } else if (spamProtectionCreateForm.title.length > 200) {
      errors.title = 'Title must be 200 characters or less'
    }

    if (!spamProtectionCreateForm.greeting.trim()) {
      errors.greeting = 'Greeting message is required'
    } else if (!spamProtectionCreateForm.greeting.includes('{{dynamic}}')) {
      errors.greeting = 'Greeting must contain {{dynamic}} placeholder'
    } else if (spamProtectionCreateForm.greeting.length > 1000) {
      errors.greeting = 'Greeting must be 1000 characters or less'
    }

    if (
      spamProtectionCreateForm.sourceSelectionType === 'specific' &&
      spamProtectionCreateForm.sourceCodes.length === 0
    ) {
      errors.sourceCodes =
        'At least one source code is required when using specific selection'
    }

    setSpamProtectionCreateErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle spam protection create form submission
  const handleSpamProtectionCreateSubmit = async () => {
    if (!validateSpamProtectionCreateForm()) {
      return
    }

    setSpamProtectionCreating(true)
    try {
      if (spamProtectionToEdit) {
        // Update existing rule
        await apiService.put(
          `/v1/wepro-phone/spam-protection/${spamProtectionToEdit._id}`,
          spamProtectionCreateForm
        )
        toast.success('Spam protection rule updated successfully')
      } else {
        // Create new rule
        await apiService.post(
          '/v1/wepro-phone/spam-protection',
          spamProtectionCreateForm
        )
        toast.success('Spam protection rule created successfully')
      }

      // Reset form
      setSpamProtectionCreateForm({
        title: '',
        protection: '{{dynamic}}',
        greeting: '',
        sourceSelectionType: 'all',
        sourceCodes: [],
        voiceId: 'TX3LPaxmHKxFdv7VOQHJ',
        voiceSettings: {
          stability: 0.5,
          similarity_boost: 0.7,
          style: 0,
          use_speaker_boost: true,
        },
      })
      setSpamProtectionCreateErrors({})
      setSpamProtectionToEdit(null)

      // Close modal
      setSpamProtectionCreateModalOpen(false)

      // Refresh the spam protection data
      await fetchSpamProtectionData()
    } catch (error: any) {
      console.error('Error saving spam protection rule:', error)

      // Handle validation errors from API
      if (
        error.response?.data?.details &&
        Array.isArray(error.response.data.details)
      ) {
        const fieldErrors: { [key: string]: string } = {}

        error.response.data.details.forEach((detail: any) => {
          if (detail.field && detail.message) {
            fieldErrors[detail.field] = detail.message
          }
        })

        setSpamProtectionCreateErrors(fieldErrors)
        toast.error('Please fix the validation errors below')
      } else {
        // Generic error message
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          `Failed to ${spamProtectionToEdit ? 'update' : 'create'} spam protection rule`
        toast.error(errorMessage)
      }
    } finally {
      setSpamProtectionCreating(false)
    }
  }

  // Debounced search for sources
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (sourceCodesOpen) {
        fetchSources(sourceSearchQuery)
      }
    }, 300) // 300ms delay

    return () => clearTimeout(timeoutId)
  }, [sourceSearchQuery, sourceCodesOpen])

  // Debounced search for spam protection source codes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (spamProtectionSourceCodesOpen) {
        fetchSources(spamProtectionSourceSearchQuery)
      }
    }, 300) // 300ms delay

    return () => clearTimeout(timeoutId)
  }, [spamProtectionSourceSearchQuery, spamProtectionSourceCodesOpen])

  // Fetch tenants for tenantId filter
  const fetchTenants = async (searchTerm: string = '') => {
    try {
      setLoadingTenants(true)
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
      })

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      const response = await apiService.get(`/v1/users/tenants/all?${params}`)
      if (response.data.success && response.data.data) {
        setTenants(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setLoadingTenants(false)
    }
  }

  // Fetch byTenants for byTenantId filter
  const fetchByTenants = async (searchTerm: string = '') => {
    try {
      setLoadingByTenants(true)
      const params = new URLSearchParams({
        page: '1',
        limit: '5',
        packageType: 'P4',
      })

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      const response = await apiService.get(`/v1/users/tenant?${params}`)
      if (response.data.success && response.data.data) {
        setByTenants(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching byTenants:', error)
    } finally {
      setLoadingByTenants(false)
    }
  }

  // Phone Number Management API functions
  const fetchPhoneNumberData = async (
    page: number = phoneNumberPagination.current
  ) => {
    // Check permissions first
    if (
      !checkPermission('MOD042', 'view') &&
      !checkPermission('MOD041', 'view')
    ) {
      setPhoneNumberData([])
      setPhoneNumberPagination({
        current: 1,
        limit: phoneNumberPagination.limit,
        total: 0,
        pages: 0,
      })
      return
    }

    setPhoneNumberLoading(true)
    setPhoneNumberError(null)

    try {
      let response

      // Build query parameters
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', phoneNumberPagination.limit.toString())
      params.append('sortBy', '-createdAt')
      if (phoneNumberStartDate) params.append('startDate', phoneNumberStartDate)
      if (phoneNumberEndDate) params.append('endDate', phoneNumberEndDate)
      if (debouncedPhoneNumberSearchTerm.trim())
        params.append('search', debouncedPhoneNumberSearchTerm.trim())

      // Additional filters for MOD042 users
      if (checkPermission('MOD042', 'view')) {
        if (phoneNumberTenantId.trim() && phoneNumberTenantId !== 'all')
          params.append('tenantId', phoneNumberTenantId.trim())
        if (phoneNumberByTenantId.trim() && phoneNumberByTenantId !== 'all')
          params.append('byTenantId', phoneNumberByTenantId.trim())
        if (phoneNumberCountry.trim() && phoneNumberCountry !== 'all')
          params.append('country', phoneNumberCountry.trim())
        if (phoneNumberStatus.trim() && phoneNumberStatus !== 'all')
          params.append('status', phoneNumberStatus.trim())
      }

      const queryString = params.toString()

      if (checkPermission('MOD042', 'view')) {
        // Use admin API for MOD042 permission
        const url = `/v1/admin/phone-numbers${queryString ? `?${queryString}` : ''}`
        response = await apiService.get(url)
      } else {
        // Use regular API for MOD041 permission
        const url = `/v1/wepro-phone/phone-numbers${queryString ? `?${queryString}` : ''}`
        response = await apiService.get(url)
      }

      if (response.data.success) {
        setPhoneNumberData(response.data.data.data)
        setPhoneNumberPagination({
          current: response.data.data.pagination.current,
          limit: response.data.data.pagination.limit,
          total: response.data.data.pagination.total,
          pages: response.data.data.pagination.pages,
        })
      }
    } catch (error) {
      console.error('Error fetching phone number data:', error)
      setPhoneNumberError('Failed to load phone number data')
    } finally {
      setPhoneNumberLoading(false)
    }
  }

  // Handle pagination
  const handlePhoneNumberPageChange = (page: number) => {
    fetchPhoneNumberData(page)
  }

  const handlePhoneNumberPreviousPage = () => {
    if (phoneNumberPagination.current > 1) {
      fetchPhoneNumberData(phoneNumberPagination.current - 1)
    }
  }

  const handlePhoneNumberNextPage = () => {
    if (phoneNumberPagination.current < phoneNumberPagination.pages) {
      fetchPhoneNumberData(phoneNumberPagination.current + 1)
    }
  }

  // Handle phone number view
  const handlePhoneNumberView = async (phoneNumber: PhoneNumber) => {
    setSelectedPhoneNumber(phoneNumber)
    setPhoneNumberViewModalOpen(true)
    setPhoneNumberDetailLoading(true)

    try {
      const response = await apiService.getPhoneNumberById(phoneNumber._id)
      if (response.data.success) {
        setSelectedPhoneNumber(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching detailed phone number data:', error)
      // Keep the original phone number data if detailed fetch fails
    } finally {
      setPhoneNumberDetailLoading(false)
    }
  }

  // Fetch phone number statistics
  const fetchPhoneNumberStatistics = async () => {
    // Check permissions first
    if (
      !checkPermission('MOD042', 'view') &&
      !checkPermission('MOD041', 'view_statistics')
    ) {
      setPhoneNumberStatistics({
        summary: {
          totalNumbers: 0,
          assignedNumbers: 0,
          unassignedNumbers: 0,
          activeNumbers: 0,
          totalCalls: 0,
          totalSms: 0,
          totalMonthlyCharges: 0,
        },
        byCountry: {},
        byNumberType: {},
        mostUsedNumbers: [],
      })
      return
    }

    setPhoneNumberStatisticsLoading(true)
    setPhoneNumberStatisticsError(null)

    try {
      let response

      if (checkPermission('MOD042', 'view')) {
        // Use admin statistics API for MOD042 permission
        const params = new URLSearchParams()
        if (phoneNumberStartDate)
          params.append('startDate', phoneNumberStartDate)
        if (phoneNumberEndDate) params.append('endDate', phoneNumberEndDate)
        if (phoneNumberTenantId.trim() && phoneNumberTenantId !== 'all')
          params.append('tenantId', phoneNumberTenantId.trim())
        if (phoneNumberByTenantId.trim() && phoneNumberByTenantId !== 'all')
          params.append('byTenantId', phoneNumberByTenantId.trim())

        const queryString = params.toString()
        const url = `/v1/admin/phone-numbers/statistics${queryString ? `?${queryString}` : ''}`
        response = await apiService.get(url)
      } else {
        // Use regular statistics API for MOD041 permission
        response = await apiService.getPhoneNumberStatistics({
          startDate: phoneNumberStartDate,
          endDate: phoneNumberEndDate,
        })
      }

      if (response.data.success) {
        setPhoneNumberStatistics(response.data.data)
      } else {
        setPhoneNumberStatisticsError(
          response.data.message || 'Failed to fetch statistics'
        )
      }
    } catch (error: any) {
      console.error('Error fetching phone number statistics:', error)
      setPhoneNumberStatisticsError(
        error.response?.data?.message || 'Failed to fetch statistics'
      )
    } finally {
      setPhoneNumberStatisticsLoading(false)
    }
  }

  // Fetch available phone numbers for Purchase New Phone Numbers section
  const fetchPurchaseSectionNumbers = async () => {
    if (!checkPermission('MOD041', 'purchase')) {
      return
    }
    setPurchaseSectionLoading(true)
    setPurchaseSectionError(null)

    try {
      const response = await apiService.getAvailablePhoneNumbers(
        purchaseSectionFilters
      )

      if (response.data.success) {
        const availableNumbers = response.data.data?.availableNumbers || []
        setPurchaseSectionNumbers(
          Array.isArray(availableNumbers) ? availableNumbers : []
        )
      } else {
        setPurchaseSectionError(
          response.data.message || 'Failed to fetch available phone numbers'
        )
        setPurchaseSectionNumbers([])
      }
    } catch (error: any) {
      console.error('Error fetching purchase section phone numbers:', error)
      setPurchaseSectionError(
        error.response?.data?.message ||
          'Failed to fetch available phone numbers'
      )
      setPurchaseSectionNumbers([])
    } finally {
      setPurchaseSectionLoading(false)
    }
  }

  // Purchase phone number
  const purchasePhoneNumber = async () => {
    if (!selectedNumberForPurchase) return

    setPurchasing(true)
    setPurchaseError(null)

    try {
      const response = await apiService.purchasePhoneNumber({
        phoneNumber: selectedNumberForPurchase.phoneNumber,
        numberType: selectedNumberForPurchase.numberType,
        friendlyName: purchaseFormData.friendlyName,
      })

      if (response.data.success) {
        toast.success(
          `Phone number ${selectedNumberForPurchase.phoneNumber} purchased successfully!`
        )
        setPurchaseModalOpen(false)
        setPurchaseFormData({ friendlyName: '' })
        setSelectedNumberForPurchase(null)
        // Refresh the purchased numbers list
        fetchPhoneNumberData()
      } else {
        setPurchaseError(
          response.data.message || 'Failed to purchase phone number'
        )
      }
    } catch (error: any) {
      console.error('Error purchasing phone number:', error)
      setPurchaseError(
        error.response?.data?.message || 'Failed to purchase phone number'
      )
    } finally {
      setPurchasing(false)
    }
  }

  // Purchase phone number from Purchase New Phone Numbers section
  const purchasePhoneNumberFromSection = async () => {
    if (!selectedNumberForPurchaseSection) return

    setPurchaseSectionPurchasing(true)
    setPurchaseSectionPurchaseError(null)

    try {
      const response = await apiService.purchasePhoneNumber({
        phoneNumber: selectedNumberForPurchaseSection.phoneNumber,
        numberType: selectedNumberForPurchaseSection.numberType,
        friendlyName: purchaseSectionFriendlyName || '',
      })

      if (response.data.success) {
        toast.success(
          `Phone number ${selectedNumberForPurchaseSection.phoneNumber} purchased successfully!`
        )
        setSelectedNumberForPurchaseSection(null)
        setPurchaseSectionFriendlyName('')
        // Refresh both the available numbers list and the purchased numbers list
        fetchPurchaseSectionNumbers()
        fetchPhoneNumberData()
      } else {
        setPurchaseSectionPurchaseError(
          response.data.message || 'Failed to purchase phone number'
        )
      }
    } catch (error: any) {
      console.error('Error purchasing phone number:', error)
      setPurchaseSectionPurchaseError(
        error.response?.data?.message || 'Failed to purchase phone number'
      )
    } finally {
      setPurchaseSectionPurchasing(false)
    }
  }

  // Handle phone number edit
  const handlePhoneNumberEdit = (phoneNumber: PhoneNumber) => {
    setSelectedPhoneNumberForEdit(phoneNumber)
    setPhoneNumberEditFormData({
      friendlyName: phoneNumber.friendlyName || '',
    })
    setEditPhoneNumberModalOpen(true)
  }

  // Update phone number
  const updatePhoneNumber = async () => {
    if (!selectedPhoneNumberForEdit) return

    setEditing(true)
    setEditError(null)

    try {
      const response = await apiService.put(
        `/v1/wepro-phone/phone-numbers/${selectedPhoneNumberForEdit._id}`,
        {
          friendlyName: phoneNumberEditFormData.friendlyName,
        }
      )

      if (response.data.success) {
        toast.success(
          `Phone number ${selectedPhoneNumberForEdit.formattedPhoneNumber} updated successfully!`
        )
        setEditPhoneNumberModalOpen(false)
        setPhoneNumberEditFormData({ friendlyName: '' })
        setSelectedPhoneNumberForEdit(null)
        // Refresh the phone number data
        fetchPhoneNumberData()
      } else {
        setEditError(response.data.message || 'Failed to update phone number')
      }
    } catch (error: any) {
      console.error('Error updating phone number:', error)
      setEditError(
        error.response?.data?.message || 'Failed to update phone number'
      )
    } finally {
      setEditing(false)
    }
  }

  // Fetch sources for assignment
  const fetchAssignmentSources = async (searchQuery: string = '') => {
    setAssignmentSourcesLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', '1')
      params.append('limit', '50')
      params.append('sort', '-createdAt')
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }

      const response = await apiService.get(`/v1/sources?${params.toString()}`)
      const sourcesData =
        response.data.success !== undefined ? response.data.data : response.data
      setAssignmentSources(sourcesData || [])
    } catch (error: any) {
      console.error('Error fetching sources:', error)
      toast.error('Failed to load sources')
    } finally {
      setAssignmentSourcesLoading(false)
    }
  }

  // Handle source selection
  const handleAssignmentSourceSelect = (source: Source) => {
    setSelectedAssignmentSource(source)
    setAssignmentSourcesOpen(false)
  }

  // Handle source search query changes
  const handleAssignmentSourceSearchChange = (value: string) => {
    setAssignmentSourceSearchQuery(value)
  }

  // Fetch sources when search query changes
  useEffect(() => {
    if (assignToSourceModalOpen) {
      const timeoutId = setTimeout(() => {
        fetchAssignmentSources(assignmentSourceSearchQuery)
      }, 300) // Debounce search by 300ms

      return () => clearTimeout(timeoutId)
    }
  }, [assignmentSourceSearchQuery, assignToSourceModalOpen])

  // Assign phone number to source
  const assignPhoneNumberToSource = async () => {
    if (!selectedPhoneNumberForAssignment || !selectedAssignmentSource) return

    setAssigning(true)
    setAssignError(null)

    try {
      const response = await apiService.put(
        `/v1/wepro-phone/phone-numbers/${selectedPhoneNumberForAssignment._id}/assign`,
        {
          sourceCode: selectedAssignmentSource.code,
        }
      )

      if (response.data.success) {
        const action = selectedPhoneNumberForAssignment.assignedSource
          ? 'updated'
          : 'assigned'
        toast.success(
          `Phone number ${selectedPhoneNumberForAssignment.phoneNumber} ${action} to ${selectedAssignmentSource.name} successfully!`
        )
        setAssignToSourceModalOpen(false)
        setSelectedPhoneNumberForAssignment(null)
        setSelectedAssignmentSource(null)
        setAssignmentSourceSearchQuery('')
        // Refresh the phone number data
        fetchPhoneNumberData()
      } else {
        const action = selectedPhoneNumberForAssignment.assignedSource
          ? 'update'
          : 'assign'
        setAssignError(
          response.data.message || `Failed to ${action} phone number to source`
        )
      }
    } catch (error: any) {
      console.error('Error assigning phone number to source:', error)
      setAssignError(
        error.response?.data?.message ||
          'Failed to assign phone number to source'
      )
    } finally {
      setAssigning(false)
    }
  }

  // Handle release source button click - show confirmation modal
  const handleReleaseSourceClick = (phoneNumber: PhoneNumber) => {
    setSelectedPhoneNumberForRelease(phoneNumber)
    setReleaseError(null)
    setReleaseConfirmationModalOpen(true)
  }

  // Release source from phone number - actual API call
  const releaseSourceFromPhoneNumber = async () => {
    if (!selectedPhoneNumberForRelease) return

    setReleasing(true)
    setReleaseError(null)

    try {
      const response = await apiService.put(
        `/v1/wepro-phone/phone-numbers/${selectedPhoneNumberForRelease._id}/release`,
        {}
      )

      if (response.data.success) {
        toast.success(
          `Source released from phone number ${selectedPhoneNumberForRelease.phoneNumber} successfully!`
        )
        setReleaseConfirmationModalOpen(false)
        setSelectedPhoneNumberForRelease(null)
        // Refresh the phone number data
        fetchPhoneNumberData()
      } else {
        setReleaseError(
          response.data.message || 'Failed to release source from phone number'
        )
      }
    } catch (error: any) {
      console.error('Error releasing source from phone number:', error)
      setReleaseError(
        error.response?.data?.message ||
          'Failed to release source from phone number'
      )
    } finally {
      setReleasing(false)
    }
  }

  // Handle delete phone number button click - show confirmation modal
  const handleDeletePhoneNumber = (phoneNumber: PhoneNumber) => {
    setPhoneNumberToDelete(phoneNumber)
    setDeleteDialogOpen(true)
  }

  // Delete phone number - actual API call
  const handleDeletePhoneNumberConfirm = async () => {
    if (!phoneNumberToDelete) return

    setDeleting(true)

    try {
      let response

      if (checkPermission('MOD042', 'delete')) {
        // Use admin API for MOD042 permission
        response = await apiService.delete(
          `/v1/admin/phone-numbers/${phoneNumberToDelete._id}`
        )
      } else {
        // Use regular API for other permissions
        response = await apiService.delete(
          `/v1/wepro-phone/phone-numbers/${phoneNumberToDelete._id}`
        )
      }

      if (response.data.success) {
        fetchPhoneNumberData()
        toast.success(
          `Phone number ${phoneNumberToDelete.phoneNumber} deleted successfully!`
        )
        setDeleteDialogOpen(false)
        setPhoneNumberToDelete(null)
        // Refresh the phone number data
      } else {
        toast.error(response.data.message || 'Failed to delete phone number')
      }
    } catch (error: any) {
      console.error('Error deleting phone number:', error)
      toast.error(
        error.response?.data?.message || 'Failed to delete phone number'
      )
    } finally {
      setDeleting(false)
    }
  }

  // Handle delete phone number cancel
  const handleDeletePhoneNumberCancel = () => {
    setDeleteDialogOpen(false)
    setPhoneNumberToDelete(null)
  }

  // Phone number data loading is now handled by intersection observer

  // Set default date range to empty
  useEffect(() => {
    setPhoneNumberStartDate('')
    setPhoneNumberEndDate('')
  }, [])

  // Phone number data and statistics loading is now handled by intersection observer

  // Fetch phone number data when search term changes
  useEffect(() => {
    if (selectedTab === 'phone-settings') {
      // Reset to page 1 when search term changes
      setPhoneNumberPagination(prev => ({ ...prev, current: 1 }))
      fetchPhoneNumberData(1)
    }
  }, [debouncedPhoneNumberSearchTerm, phoneNumberStartDate, phoneNumberEndDate])

  // Fetch purchase section numbers when filters change
  useEffect(() => {
    if (selectedTab === 'phone-settings') {
      fetchPurchaseSectionNumbers()
    }
  }, [purchaseSectionFilters, selectedTab])

  // Fetch tenants for MOD042 users
  useEffect(() => {
    if (selectedTab === 'phone-settings' && checkPermission('MOD042', 'view')) {
      fetchTenants()
      fetchByTenants()
    }
  }, [selectedTab])

  // Refetch phone numbers when additional filters change
  useEffect(() => {
    if (selectedTab === 'phone-settings' && checkPermission('MOD042', 'view')) {
      setPhoneNumberPagination(prev => ({ ...prev, current: 1 }))
      fetchPhoneNumberData(1)
    }
  }, [
    phoneNumberTenantId,
    phoneNumberByTenantId,
    phoneNumberCountry,
    phoneNumberStatus,
  ])

  // Refetch statistics when tenant filters change for MOD042 users
  useEffect(() => {
    if (selectedTab === 'phone-settings' && checkPermission('MOD042', 'view')) {
      fetchPhoneNumberStatistics()
    }
  }, [phoneNumberTenantId, phoneNumberByTenantId])

  // Phone number validation function
  const validatePhoneNumber = (phoneNumber: string) => {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '')

    // Check if it's exactly 10 digits
    if (cleaned.length !== 10) {
      return false
    }

    // Check if it matches the format (XXX) XXX-XXXX
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/
    return phoneRegex.test(phoneNumber)
  }

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '')

    // Limit to 10 digits
    const limited = cleaned.slice(0, 10)

    // Format as (XXX) XXX-XXXX
    if (limited.length >= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
    } else if (limited.length >= 3) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`
    } else if (limited.length > 0) {
      return `(${limited}`
    }

    return limited
  }

  // Handle form input changes
  const handleFormInputChange = (field: string, value: any) => {
    // Special handling for phone number formatting
    if (field === 'phoneNumber') {
      const formatted = formatPhoneNumber(value)
      setCreateFormData(prev => ({
        ...prev,
        [field]: formatted,
      }))
    } else {
      setCreateFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  // Handle source code toggle
  const handleSourceCodeToggle = (sourceCode: string) => {
    setCreateFormData(prev => ({
      ...prev,
      sourceCodes: prev.sourceCodes.includes(sourceCode)
        ? prev.sourceCodes.filter(code => code !== sourceCode)
        : [...prev.sourceCodes, sourceCode],
    }))
  }

  // Handle source codes popover open/close
  const handleSourceCodesOpenChange = (open: boolean) => {
    setSourceCodesOpen(open)
    if (!open) {
      // Reset search when popover closes
      setSourceSearchQuery('')
      // Fetch all sources again
      fetchSources()
    }
  }

  // Handle form submission
  const handleCreateBlockingRule = async () => {
    // Validate form
    const errors: { [key: string]: string } = {}

    if (createFormData.blockingType === 'number') {
      if (!createFormData.phoneNumber.trim()) {
        errors.phoneNumber = 'Phone number is required'
      } else if (!validatePhoneNumber(createFormData.phoneNumber)) {
        errors.phoneNumber = 'Phone number must be in format (777) 888-9999'
      }
    }

    if (
      createFormData.blockingType === 'pattern' &&
      !createFormData.pattern.trim()
    ) {
      errors.pattern = 'Pattern is required'
    }

    if (
      createFormData.sourceSelectionType === 'specific' &&
      createFormData.sourceCodes.length === 0
    ) {
      errors.sourceCodes = 'At least one source code is required'
    }

    if (
      createFormData.blockType === 'temporary' &&
      !createFormData.expiresAt.trim()
    ) {
      errors.expiresAt = 'Expiration date is required for temporary blocks'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setCreating(true)
    try {
      // Convert datetime-local to ISO format for expiresAt
      const formatExpiresAt = (dateTimeLocal: string) => {
        if (!dateTimeLocal) return undefined
        // Convert datetime-local format (YYYY-MM-DDTHH:MM) to ISO format (YYYY-MM-DDTHH:MM:SS.sssZ)
        const date = new Date(dateTimeLocal)
        return date.toISOString()
      }

      const payload = {
        phoneNumber:
          createFormData.blockingType === 'number'
            ? createFormData.phoneNumber
            : undefined,
        pattern:
          createFormData.blockingType === 'pattern'
            ? createFormData.pattern
            : undefined,
        blockingType: createFormData.blockingType,
        blockType: createFormData.blockType,
        reason: createFormData.reason,
        sourceSelectionType: createFormData.sourceSelectionType,
        sourceCodes:
          createFormData.sourceSelectionType === 'specific'
            ? createFormData.sourceCodes
            : [],
        notes: createFormData.notes,
        expiresAt:
          createFormData.blockType === 'temporary'
            ? formatExpiresAt(createFormData.expiresAt)
            : undefined,
      }

      await apiService.post('/v1/wepro-phone/call-blocking', payload)

      // Show success toast
      const displayName =
        createFormData.blockingType === 'number'
          ? createFormData.phoneNumber
          : createFormData.pattern

      toast.success('Call blocking rule created successfully!', {
        description: `The blocking rule for "${displayName}" has been created in the system.`,
      })

      // Reset form
      setCreateFormData({
        phoneNumber: '',
        pattern: '',
        blockingType: 'number',
        blockType: 'permanent',
        reason: 'spam',
        sourceSelectionType: 'all',
        sourceCodes: [],
        notes: '',
        expiresAt: '',
      })

      // Refresh call blocking data
      const response = await apiService.get(
        `/v1/wepro-phone/call-blocking?page=1&limit=10&sort=-createdAt`
      )

      setCallBlockingData(response.data.data)

      // Update statistics
      const totalBlocked = response.data.data.reduce(
        (sum: number, rule: any) => sum + rule.blockedCount,
        0
      )
      const today = new Date().toISOString().split('T')[0]
      const blockedToday = response.data.data.filter((rule: any) =>
        rule.createdAt.startsWith(today)
      ).length

      setCallBlockingStats({
        totalBlocked,
        blockedToday,
        timeSaved: Math.round(totalBlocked * 2.5),
      })
    } catch (error: any) {
      console.error('Error creating call blocking rule:', error)

      // Show error toast
      let errorMessage = 'An error occurred while creating the blocking rule.'
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error('Failed to create blocking rule', {
        description: errorMessage,
        style: {
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: '1px solid #f87171',
        },
        className: 'text-white',
        descriptionClassName: 'text-white',
      })
    } finally {
      setCreating(false)
    }
  }

  // Handle delete blocking rule
  const handleDeleteRule = (rule: CallBlockingRule) => {
    setRuleToDelete(rule)
    setUnblockDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {console.log(ruleToDelete, 'ruleToDelete')
    if (!ruleToDelete) return

    setDeleting(true)
    try {
      await apiService.delete(
        `/v1/wepro-phone/call-blocking/${ruleToDelete._id}`
      )

      // Remove the deleted rule from the local state
      setCallBlockingData(prev =>
        prev.filter(rule => rule._id !== ruleToDelete._id)
      )

      // Update statistics
      const updatedData = callBlockingData.filter(
        rule => rule._id !== ruleToDelete._id
      )
      const totalBlocked = updatedData.reduce(
        (sum, rule) => sum + rule.blockedCount,
        0
      )
      const today = new Date().toISOString().split('T')[0]
      const blockedToday = updatedData.filter(rule =>
        rule.createdAt.startsWith(today)
      ).length

      setCallBlockingStats({
        totalBlocked,
        blockedToday,
        timeSaved: Math.round(totalBlocked * 2.5),
      })

      // Show success toast
      const displayName =
        ruleToDelete.phoneNumber || ruleToDelete.pattern || 'this rule'
      toast.success('Call blocking rule deleted successfully!', {
        description: `The blocking rule for "${displayName}" has been removed from the system.`,
      })
    } catch (error: any) {
      console.error('Error deleting blocking rule:', error)

      // Show error toast
      let errorMessage = 'An error occurred while deleting the blocking rule.'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error('Failed to delete blocking rule', {
        description: errorMessage,
        style: {
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: '1px solid #f87171',
        },
        className: 'text-white',
        descriptionClassName: 'text-white',
      })
    } finally {
      setDeleting(false)
      setUnblockDialogOpen(false)
      setRuleToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setUnblockDialogOpen(false)
    setRuleToDelete(null)
  }

  // Handle edit blocking rule
  const handleEditRule = (rule: CallBlockingRule) => {
    setEditingRule(rule)
    setEditFormData({
      phoneNumber: rule.phoneNumber || '',
      pattern: rule.pattern || '',
      blockingType: rule.blockingType,
      blockType: rule.blockType,
      reason: rule.reason,
      sourceSelectionType:
        rule.sourceCodes && rule.sourceCodes.length > 0 ? 'specific' : 'all',
      sourceCodes: rule.sourceCodes || [],
      notes: rule.notes || '',
      expiresAt: rule.expiresAt
        ? new Date(rule.expiresAt).toISOString().slice(0, 16)
        : '',
    })
    setEditErrors({})
  }

  const handleEditFormInputChange = (field: string, value: any) => {
    // Special handling for phone number formatting
    if (field === 'phoneNumber') {
      const formatted = formatPhoneNumber(value)
      setEditFormData(prev => ({
        ...prev,
        [field]: formatted,
      }))
    } else {
      setEditFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }

    // Clear error when user starts typing
    if (editErrors[field]) {
      setEditErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const handleEditSourceCodeToggle = (sourceCode: string) => {
    setEditFormData(prev => ({
      ...prev,
      sourceCodes: prev.sourceCodes.includes(sourceCode)
        ? prev.sourceCodes.filter(code => code !== sourceCode)
        : [...prev.sourceCodes, sourceCode],
    }))
  }

  const handleUpdateBlockingRule = async () => {
    if (!editingRule) return

    // Validate form
    const errors: { [key: string]: string } = {}

    if (
      editFormData.blockingType === 'number' &&
      !editFormData.phoneNumber.trim()
    ) {
      errors.phoneNumber = 'Phone number is required'
    } else if (
      editFormData.blockingType === 'number' &&
      !validatePhoneNumber(editFormData.phoneNumber)
    ) {
      errors.phoneNumber = 'Phone number must be in format (777) 888-9999'
    }

    if (
      editFormData.blockingType === 'pattern' &&
      !editFormData.pattern.trim()
    ) {
      errors.pattern = 'Pattern is required'
    }

    if (
      editFormData.sourceSelectionType === 'specific' &&
      editFormData.sourceCodes.length === 0
    ) {
      errors.sourceCodes = 'At least one source code is required'
    }

    if (
      editFormData.blockType === 'temporary' &&
      !editFormData.expiresAt.trim()
    ) {
      errors.expiresAt = 'Expiration date is required for temporary blocks'
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    setUpdating(true)
    try {
      // Convert datetime-local to ISO format for expiresAt
      const formatExpiresAt = (dateTimeLocal: string) => {
        if (!dateTimeLocal) return undefined
        const date = new Date(dateTimeLocal)
        return date.toISOString()
      }

      const payload = {
        phoneNumber:
          editFormData.blockingType === 'number'
            ? editFormData.phoneNumber
            : undefined,
        pattern:
          editFormData.blockingType === 'pattern'
            ? editFormData.pattern
            : undefined,
        blockingType: editFormData.blockingType,
        blockType: editFormData.blockType,
        reason: editFormData.reason,
        sourceSelectionType: editFormData.sourceSelectionType,
        sourceCodes:
          editFormData.sourceSelectionType === 'specific'
            ? editFormData.sourceCodes
            : [],
        notes: editFormData.notes,
        expiresAt:
          editFormData.blockType === 'temporary'
            ? formatExpiresAt(editFormData.expiresAt)
            : undefined,
      }

      await apiService.put(
        `/v1/wepro-phone/call-blocking/${editingRule._id}`,
        payload
      )

      // Show success toast
      const displayName =
        editFormData.blockingType === 'number'
          ? editFormData.phoneNumber
          : editFormData.pattern

      toast.success('Call blocking rule updated successfully!', {
        description: `The blocking rule for "${displayName}" has been updated.`,
      })

      // Close edit mode
      setEditingRule(null)

      // Refresh call blocking data
      const response = await apiService.get(
        `/v1/wepro-phone/call-blocking?page=1&limit=10&sort=-createdAt`
      )

      setCallBlockingData(response.data.data)

      // Update statistics
      const totalBlocked = response.data.data.reduce(
        (sum: number, rule: any) => sum + rule.blockedCount,
        0
      )
      const today = new Date().toISOString().split('T')[0]
      const blockedToday = response.data.data.filter((rule: any) =>
        rule.createdAt.startsWith(today)
      ).length

      setCallBlockingStats({
        totalBlocked,
        blockedToday,
        timeSaved: Math.round(totalBlocked * 2.5),
      })
    } catch (error: any) {
      console.error('Error updating call blocking rule:', error)

      // Show error toast
      let errorMessage = 'An error occurred while updating the blocking rule.'
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error('Failed to update blocking rule', {
        description: errorMessage,
        style: {
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: '1px solid #f87171',
        },
        className: 'text-white',
        descriptionClassName: 'text-white',
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleEditCancel = () => {
    setEditingRule(null)
    setEditFormData({
      phoneNumber: '',
      pattern: '',
      blockingType: 'number',
      blockType: 'permanent',
      reason: 'spam',
      sourceSelectionType: 'all',
      sourceCodes: [],
      notes: '',
      expiresAt: '',
    })
    setEditErrors({})
  }

  // Handle load more blocked numbers
  const handleLoadMore = async () => {
    if (loadingMore || !callBlockingPagination.hasMore) return

    setLoadingMore(true)
    try {
      const nextPage = callBlockingPagination.currentPage + 1
      const params = new URLSearchParams()
      params.append('page', nextPage.toString())
      params.append('limit', '10')
      params.append('sort', '-createdAt')

      const response = await apiService.get(
        `/v1/wepro-phone/call-blocking?${params.toString()}`
      )

      // Append new data to existing data
      setCallBlockingData(prev => [...prev, ...response.data.data])

      // Update pagination state
      setCallBlockingPagination(prev => ({
        currentPage: response.data.pagination.current.page,
        totalPages: response.data.pagination.pages,
        hasMore:
          response.data.pagination.current.page <
          response.data.pagination.pages,
      }))
    } catch (error) {
      console.error('Error loading more blocked numbers:', error)
      toast.error('Failed to load more blocked numbers')
    } finally {
      setLoadingMore(false)
    }
  }

  // Handle export blocked list
  const handleExportBlockedList = () => {
    setExportFormatDialogOpen(true)
  }

  const handleExportConfirm = async () => {
    setExporting(true)
    setExportFormatDialogOpen(false)
    try {
      const response = await apiService.get(
        `/v1/wepro-phone/call-blocking/export?format=${selectedExportFormat}`,
        {
          responseType: selectedExportFormat === 'csv' ? 'blob' : 'json',
        }
      )

      let blob: Blob
      let filename: string

      if (selectedExportFormat === 'json') {
        // For JSON, extract only the rules array from the response
        const rulesArray = response.data.data.rules
        const jsonString = JSON.stringify(rulesArray, null, 2)
        blob = new Blob([jsonString], { type: 'application/json' })
        filename = `blocked-numbers-${new Date().toISOString().split('T')[0]}.json`
      } else {
        // For CSV, use the blob response directly
        blob = new Blob([response.data], { type: 'text/csv' })
        filename = `blocked-numbers-${new Date().toISOString().split('T')[0]}.csv`
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Show success toast
      toast.success('Export successful!', {
        description: `Blocked numbers list has been downloaded as ${selectedExportFormat.toUpperCase()}.`,
      })
    } catch (error: any) {
      console.error('Error exporting blocked list:', error)

      // Show error toast
      let errorMessage = 'An error occurred while exporting the blocked list.'
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error('Export failed', {
        description: errorMessage,
        style: {
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: '1px solid #f87171',
        },
        className: 'text-white',
        descriptionClassName: 'text-white',
      })
    } finally {
      setExporting(false)
    }
  }

  // Handle import blocked list - open modal
  const handleImportBlockedList = () => {
    setImportModalOpen(true)
    setImportFormData({
      format: 'csv',
      sourceSelectionType: 'all',
      sourceCodes: [],
      rules: null,
      csvContent: '',
    })
    setImportErrors({})
  }

  // Handle import form input changes
  const handleImportFormInputChange = (field: string, value: any) => {
    setImportFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (importErrors[field]) {
      setImportErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  // Handle file upload for import
  const handleImportFileUpload = async (
    field: 'rules' | 'csvContent',
    file: File | null
  ) => {
    if (field === 'csvContent' && file) {
      // Convert CSV file to string
      try {
        const text = await file.text()
        setImportFormData(prev => ({
          ...prev,
          [field]: text,
        }))
        setSelectedCsvFileName(file.name)
      } catch (error) {
        console.error('Error reading CSV file:', error)
        toast.error('Error reading CSV file', {
          description:
            'Could not read the selected CSV file. Please try again.',
        })
        return
      }
    } else {
      // For rules file, store as File object
      setImportFormData(prev => ({
        ...prev,
        [field]: file,
      }))
    }

    // Clear error when file is selected
    if (importErrors[field]) {
      setImportErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  // Handle import source code toggle
  const handleImportSourceCodeToggle = (sourceCode: string) => {
    setImportFormData(prev => ({
      ...prev,
      sourceCodes: prev.sourceCodes.includes(sourceCode)
        ? prev.sourceCodes.filter(code => code !== sourceCode)
        : [...prev.sourceCodes, sourceCode],
    }))
  }

  // Handle import submission
  const handleImportSubmit = async () => {
    // Validate form
    const errors: { [key: string]: string } = {}

    if (
      importFormData.sourceSelectionType === 'specific' &&
      importFormData.sourceCodes.length === 0
    ) {
      errors.sourceCodes = 'At least one source code is required'
    }

    if (
      importFormData.format === 'json' &&
      !importFormData.rules &&
      !manualRulesContent.trim()
    ) {
      errors.rules = 'Rules file or manual input is required for JSON format'
    }

    if (importFormData.format === 'csv' && !importFormData.csvContent.trim()) {
      errors.csvContent = 'CSV file is required for CSV format'
    }

    if (Object.keys(errors).length > 0) {
      setImportErrors(errors)
      return
    }

    // setImporting(true)
    try {
      const payload: any = {
        format: importFormData.format,
        sourceSelectionType: importFormData.sourceSelectionType,
      }

      if (importFormData.sourceSelectionType === 'specific') {
        payload.sourceCodes = importFormData.sourceCodes
      }

      if (importFormData.format === 'json') {
        if (manualInputMode && manualRulesContent.trim()) {
          // Use manual input content - validate JSON first
          try {
            payload.rules = JSON.parse(manualRulesContent).map((val: Record<string, unknown>) => {
              return {
                ...val,
                sourceSelectionType: payload.sourceSelectionType,
                sourceCodes: payload.sourceCodes || [],
              }
            })
          } catch (error) {
            setImportErrors({
              rules:
                'Invalid JSON format. Please check your input and try again.',
            })
            return
          }
        } else if (importFormData.rules) {
          // Use uploaded file content
          try {
            const rulesContent = await importFormData.rules.text()
            payload.rules = JSON.parse(rulesContent).map((val: any) => {
              return {
                ...val,
                sourceSelectionType: payload.sourceSelectionType,
                sourceCodes: payload.sourceCodes || [],
              }
            })
          } catch (error) {
            setImportErrors({
              rules:
                'Invalid JSON file. Please check the file format and try again.',
            })
            return
          }
        }
      }

      if (importFormData.format === 'csv' && importFormData.csvContent) {
        const parsed = Papa.parse(importFormData.csvContent, { header: true })
        payload.csvContent = Papa.unparse(
          parsed.data.map(val => {
            return {
              ...(val && typeof val === 'object' ? val : {}),
              sourceSelectionType: payload.sourceSelectionType,
              sourceCodes: payload.sourceCodes
                ? payload.sourceCodes.join(';')
                : '',
            }
          })
        )
      }

      const response = await apiService.post(
        '/v1/wepro-phone/call-blocking/import',
        payload
      )

      // Store results and show results modal
      setImportResults(response.data)
      setImportModalOpen(false)
      setResultsModalOpen(true)

      // Reset import form data
      setImportFormData({
        format: 'csv',
        sourceSelectionType: 'all',
        sourceCodes: [],
        rules: null,
        csvContent: '',
      })
      setSelectedCsvFileName('')
      setImportErrors({})
      setManualInputMode(false)
      setManualRulesContent('')

      // Refresh call blocking data
      const callBlockingResponse = await apiService.get(
        `/v1/wepro-phone/call-blocking?page=1&limit=10&sort=-createdAt`
      )

      setCallBlockingData(callBlockingResponse.data.data)

      // Update statistics
      const statsResponse = await apiService.get(
        '/v1/wepro-phone/call-blocking/statistics'
      )
      setStatistics(statsResponse.data)

      // Update call blocking stats
      const totalBlocked = callBlockingResponse.data.data.reduce(
        (sum: number, rule: { blockedCount: number }) => sum + rule.blockedCount,
        0
      )
      const today = new Date().toISOString().split('T')[0]
      const blockedToday = callBlockingResponse.data.data.filter(
        (rule: { createdAt: string }) => rule.createdAt.startsWith(today)
      ).length

      setCallBlockingStats({
        totalBlocked,
        blockedToday,
        timeSaved: Math.round(totalBlocked * 2.5),
      })
    } catch (error: any) {
      console.error('Error importing blocked list:', error)

      // Show error toast
      let errorMessage = 'An error occurred while importing the blocked list.'
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error('Import failed', {
        description: errorMessage,
        style: {
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: '1px solid #f87171',
        },
        className: 'text-white',
        descriptionClassName: 'text-white',
      })
    } finally {
      setImporting(false)
    }
  }

  // Handle import modal cancel
  const handleImportCancel = () => {
    setImportModalOpen(false)
    setImportFormData({
      format: 'csv',
      sourceSelectionType: 'all',
      sourceCodes: [],
      rules: null,
      csvContent: '',
    })
    setImportErrors({})
    setSelectedCsvFileName('')
    setManualInputMode(false)
    setManualRulesContent('')
  }

  // Handle manual input toggle
  const handleManualInputToggle = () => {
    setManualInputMode(!manualInputMode)
    if (!manualInputMode) {
      // Switching to manual input mode - clear file selection
      setImportFormData(prev => ({
        ...prev,
        rules: null,
      }))
      setImportErrors(prev => ({
        ...prev,
        rules: '',
      }))
    } else {
      // Switching to file upload mode - clear manual content
      setManualRulesContent('')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="backdrop-blur-xl border-b border-slate-200/50 dark:border-neutral-700/50">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                WePro Phone
              </h1>
            </div>
            <Button className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Phone className="w-4 h-4 mr-2" />
              Make Call
            </Button>
          </div>

          {/* Call Filter Widgets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pt-6">
            <Card
              className={`border-0 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                activeQuickFilter === 'total'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white ring-2 ring-white/30'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
              }`}
              onClick={() => handleQuickFilter('total')}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold mb-1">
                    {liveMetrics.todayCalls}
                  </p>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Calls
                  </p>
                  <div className="flex items-center justify-center text-blue-200 text-xs mt-2">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {liveMetrics.todayChange} today
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`border-0 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                activeQuickFilter === 'incoming'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white ring-2 ring-white/30'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
              }`}
              onClick={() => handleQuickFilter('incoming')}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold mb-1">
                    {callData.filter(call => call.type === 'incoming').length}
                  </p>
                  <p className="text-green-100 text-sm font-medium">Incoming</p>
                  <div className="flex items-center justify-center text-green-200 text-xs mt-2">
                    <PhoneIncoming className="w-3 h-3 mr-1" />
                    Click to filter
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`border-0 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                activeQuickFilter === 'outgoing'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white ring-2 ring-white/30'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
              }`}
              onClick={() => handleQuickFilter('outgoing')}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold mb-1">
                    {callData.filter(call => call.type === 'outgoing').length}
                  </p>
                  <p className="text-purple-100 text-sm font-medium">
                    Outgoing
                  </p>
                  <div className="flex items-center justify-center text-purple-200 text-xs mt-2">
                    <PhoneOutgoing className="w-3 h-3 mr-1" />
                    Click to filter
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`border-0 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                activeQuickFilter === 'missed'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white ring-2 ring-white/30'
                  : 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600'
              }`}
              onClick={() => handleQuickFilter('missed')}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold mb-1">
                    {callData.filter(call => call.status === 'missed').length}
                  </p>
                  <p className="text-red-100 text-sm font-medium">Missed</p>
                  <div className="flex items-center justify-center text-red-200 text-xs mt-2">
                    <PhoneMissed className="w-3 h-3 mr-1" />
                    Need follow-up
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex gap-1 sm:space-x-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1 overflow-x-auto sm:overflow-x-visible scrollbar-hide">
          <Button
            variant={selectedTab === 'call-log' ? 'default' : 'ghost'}
            onClick={() => setSelectedTab('call-log')}
            className={`flex-shrink-0 sm:flex-1 flex items-center justify-center text-xs sm:text-sm px-4 ${
              selectedTab === 'call-log' ? 'text-white' : ''
            } hover:bg-neutral-200 dark:hover:bg-neutral-700`}
          >
            Call Log
          </Button>
          <Button
            variant={selectedTab === 'analytics' ? 'default' : 'ghost'}
            onClick={() => setSelectedTab('analytics')}
            className={`flex-shrink-0 sm:flex-1 flex items-center justify-center text-xs sm:text-sm px-4 ${
              selectedTab === 'analytics' ? 'text-white' : ''
            } hover:bg-neutral-200 dark:hover:bg-neutral-700`}
          >
            Analytics
          </Button>
          <Button
            variant={selectedTab === 'ai-insights' ? 'default' : 'ghost'}
            onClick={() => setSelectedTab('ai-insights')}
            className={`flex-shrink-0 sm:flex-1 flex items-center justify-center text-xs sm:text-sm px-4 ${
              selectedTab === 'ai-insights' ? 'text-white' : ''
            } hover:bg-neutral-200 dark:hover:bg-neutral-700`}
          >
            AI Insights
          </Button>
          <Button
            variant={selectedTab === 'phone-settings' ? 'default' : 'ghost'}
            onClick={() => setSelectedTab('phone-settings')}
            className={`flex-shrink-0 sm:flex-1 flex items-center justify-center text-xs sm:text-sm px-4 ${
              selectedTab === 'phone-settings' ? 'text-white' : ''
            } hover:bg-neutral-200 dark:hover:bg-neutral-700`}
          >
            Phone Settings
          </Button>
        </div>
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsContent value="call-log" className="mt-6">
            {/* Search and Advanced Filters - Only for Call Log */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search calls by name, number, or job type..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-[#53a533]/50/20 focus:border-[#53a533]/30 transition-all duration-200"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`rounded-xl border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600 transition-all duration-200 ${
                      showAdvancedFilters
                        ? 'bg-[#53a533]/5 dark:bg-[#53a533]/10 border-[#53a533]/20 dark:border-[#53a533]/30 text-[#3d7a28] dark:text-[#53a533]'
                        : ''
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Advanced Filters</span>
                    <span className="sm:hidden">Filters</span>
                    <ChevronDown
                      className={`w-4 h-4 ml-2 transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`}
                    />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const csvContent = filteredCalls
                        .map(
                          call =>
                            `${call.customerName},${call.phoneNumber},${call.source},${call.jobType},${call.status},${call.callOutcome},${call.customerSatisfaction},${call.duration},${call.timestamp},${call.date}`
                        )
                        .join('\n')
                      const blob = new Blob([csvContent], { type: 'text/csv' })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'calls-export.csv'
                      a.click()
                    }}
                    className="rounded-xl border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600"
                  >
                    <Download className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>

                  {(searchTerm || activeQuickFilter || showAdvancedFilters) && (
                    <Button
                      variant="ghost"
                      onClick={clearAllFilters}
                      className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>

              {/* Date Range Indicator */}
              {dateRangeFilter !== 'all' && (
                <div className="mb-6">
                  {(() => {
                    const range = getDateRangeDisplay()
                    if (range) {
                      return (
                        <div className="inline-flex flex-wrap items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 sm:px-4 py-2 rounded-xl border border-[#53a533]/20/60">
                          <CalendarDays className="w-4 h-4 text-[#53a533]/50 shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-[#3d7a28]">
                            {range.label}
                          </span>
                          <span className="text-xs text-[#53a533]/50">
                            {new Date(range.start).toLocaleDateString()} -{' '}
                            {new Date(range.end).toLocaleDateString()}
                          </span>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              )}

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="mb-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50/80 to-blue-50/40 dark:from-neutral-800 dark:to-neutral-900 rounded-3xl border border-slate-200/60 dark:border-neutral-700 backdrop-blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Call Flow Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-[#53a533]/50 rounded-full"></div>
                        <span>Call Flow</span>
                      </label>
                      <CustomSelect
                        value={callFlowFilter}
                        onValueChange={setCallFlowFilter}
                        options={[
                          { value: 'all', label: 'All Flows' },
                          { value: 'masking', label: 'Call Masking' },
                          { value: 'inhouse', label: 'In-house' },
                        ]}
                        placeholder="Select flow type"
                      />
                    </div>

                    {/* Source Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Source</span>
                      </label>
                      <SearchableSelect
                        value={sourceFilter}
                        onValueChange={handleSourceFilterChange}
                        options={[
                          { value: 'all', label: 'All Sources' },
                          { value: 'google', label: 'Google' },
                          { value: 'facebook', label: 'Facebook' },
                          { value: 'organic', label: 'Organic' },
                          { value: 'yelp', label: 'Yelp' },
                          { value: 'referral', label: 'Referral' },
                        ]}
                        placeholder="Select source"
                      />
                    </div>

                    {/* Phone Number Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Phone Number</span>
                      </label>
                      <SearchableSelect
                        value={sourceNumberFilter}
                        onValueChange={setSourceNumberFilter}
                        disabled={sourceFilter === 'all'}
                        options={[
                          {
                            value: '',
                            label:
                              sourceFilter === 'all'
                                ? 'Select source first'
                                : 'All numbers',
                          },
                          ...getAvailableSourceNumbers().map(item => ({
                            value: item.number,
                            label: `${item.number} - ${item.name}`,
                          })),
                        ]}
                        placeholder="Select number"
                      />
                    </div>

                    {/* Agent Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                        <span>Agent</span>
                      </label>
                      <SearchableSelect
                        value={agentFilter}
                        onValueChange={setAgentFilter}
                        options={[
                          { value: 'all', label: 'All Agents' },
                          { value: 'Unassigned', label: 'Unassigned' },
                          ...agents.map(agent => ({
                            value: agent,
                            label: agent,
                          })),
                        ]}
                        placeholder="Select agent"
                      />
                    </div>

                    {/* Duration Filters */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>Min Duration (min)</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={minDuration}
                        onChange={e => setMinDuration(e.target.value)}
                        className="px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-[#53a533]/50/20 focus:border-[#53a533]/30 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                        <span>Max Duration (min)</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="∞"
                        value={maxDuration}
                        onChange={e => setMaxDuration(e.target.value)}
                        className="px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-[#53a533]/50/20 focus:border-[#53a533]/30 transition-all duration-200"
                      />
                    </div>

                    {/* Recording Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        <span>Recording</span>
                      </label>
                      <CustomSelect
                        value={recordingFilter}
                        onValueChange={setRecordingFilter}
                        options={[
                          { value: 'any', label: 'Any' },
                          { value: 'with', label: 'With Recording' },
                          { value: 'without', label: 'Without Recording' },
                        ]}
                        placeholder="Recording status"
                      />
                    </div>

                    {/* Call Outcome Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>Call Outcome</span>
                      </label>
                      <CustomSelect
                        value={outcomeFilter}
                        onValueChange={setOutcomeFilter}
                        options={[
                          { value: 'all', label: 'All Outcomes' },
                          { value: 'connected', label: 'Connected' },
                          { value: 'busy', label: 'Busy' },
                          { value: 'no-answer', label: 'No Answer' },
                          { value: 'voicemail', label: 'Voicemail' },
                          { value: 'failed', label: 'Failed' },
                          { value: 'blocked', label: 'Blocked' },
                        ]}
                        placeholder="Select outcome"
                      />
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span>Date Range</span>
                      </label>
                      <CustomSelect
                        value={dateRangeFilter}
                        onValueChange={setDateRangeFilter}
                        options={[
                          { value: 'all', label: 'All Dates' },
                          { value: 'today', label: 'Today' },
                          { value: 'yesterday', label: 'Yesterday' },
                          { value: 'last7days', label: 'Last 7 Days' },
                          { value: 'last30days', label: 'Last 30 Days' },
                          { value: 'thismonth', label: 'This Month' },
                          { value: 'lastmonth', label: 'Last Month' },
                          { value: 'custom', label: 'Custom Range' },
                        ]}
                        placeholder="Select date range"
                      />
                    </div>

                    {/* Custom Date Range Inputs */}
                    {dateRangeFilter === 'custom' && (
                      <>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            <span>Start Date</span>
                          </label>
                          <Input
                            type="date"
                            value={customStartDate}
                            onChange={e => setCustomStartDate(e.target.value)}
                            className="px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-[#53a533]/50/20 focus:border-[#53a533]/30 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span>End Date</span>
                          </label>
                          <Input
                            type="date"
                            value={customEndDate}
                            onChange={e => setCustomEndDate(e.target.value)}
                            className="px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-[#53a533]/50/20 focus:border-[#53a533]/30 transition-all duration-200"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Results Summary */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
                Showing{' '}
                <span className="font-semibold text-slate-900 dark:text-gray-100">
                  {activeQuickFilter ? activeQuickFilter : 'all'} calls (
                  {filteredCalls.length} results)
                </span>
              </span>
            </div>

            {/* Call List */}
            <div className="space-y-3">
              {filteredCalls.map(call => (
                  <Card
                    key={call.id}
                    className="border-0 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm hover:bg-white dark:hover:bg-neutral-800 hover:shadow-lg transition-all duration-200 rounded-2xl overflow-hidden"
                  >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Left Section: Avatar & Main Details */}
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        {/* Avatar & Direction */}
                        <div className="relative shrink-0">
                          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-white dark:border-neutral-800 shadow-md">
                            <AvatarImage src={call.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 dark:from-blue-600 dark:to-cyan-600 text-white font-semibold text-xs sm:text-sm">
                              {call.customerName
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-white dark:bg-neutral-800 rounded-full shadow-md flex items-center justify-center">
                            {call.type === 'incoming' ? (
                              <ArrowDownLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500" />
                            ) : (
                              <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#53a533]/50" />
                            )}
                          </div>
                        </div>

                        {/* Call Details */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Name and Status Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-gray-100 truncate">
                              {call.customerName}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Call Outcome Indicator */}
                              <div className="flex items-center gap-1">
                                {getOutcomeIcon(call.callOutcome)}
                                <span className="text-xs text-slate-500 dark:text-gray-400 capitalize">
                                  {call.callOutcome.replace('-', ' ')}
                                </span>
                              </div>

                              {/* Customer Satisfaction Indicator */}
                              {call.customerSatisfaction && (
                                <div className="flex items-center gap-1">
                                  {getSatisfactionIcon(call.customerSatisfaction)}
                                  <span className="text-xs text-slate-500 dark:text-gray-400 capitalize">
                                    {call.customerSatisfaction}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Phone, Source, Location Row */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 font-mono">
                              {call.phoneNumber}
                            </span>
                            <Badge
                              className={`${getSourceColor(call.source)} text-white text-xs px-2 py-0.5`}
                            >
                              {call.source}
                            </Badge>
                            <span className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[150px] sm:max-w-none">{call.location}</span>
                            </span>
                          </div>

                          {/* Job Type and Follow-up Row */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-300">
                              {call.jobType}
                            </span>
                            {call.followUpRequired && (
                              <Badge
                                variant="outline"
                                className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 text-xs"
                              >
                                Follow-up Required
                              </Badge>
                            )}
                          </div>

                          {/* Tags */}
                          {call.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              {call.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Notes */}
                          {call.notes && (
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 line-clamp-2">
                              {call.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Section: Time & Status */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2 sm:ml-4 shrink-0">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(call.status)}
                          <span className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 whitespace-nowrap">
                            {call.timestamp}
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 sm:gap-2">
                          {call.hasRecording && (
                            <div className="flex items-center gap-1 text-[#4a9430] text-xs sm:text-sm">
                              <Play className="w-3 h-3 shrink-0" />
                              <span>{call.duration}</span>
                            </div>
                          )}

                          {call.answeredBy && (
                            <div className="flex items-center gap-1.5">
                              <Avatar className="w-5 h-5 shrink-0">
                                <AvatarImage src={call.answeredBy.avatar} />
                                <AvatarFallback className="text-xs bg-slate-200 dark:bg-neutral-700 dark:text-gray-300">
                                  {call.answeredBy.name
                                    .split(' ')
                                    .map(n => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-slate-500 dark:text-gray-400 truncate max-w-[80px] sm:max-w-none">
                                {call.answeredBy.name.split(' ')[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

              {/* No Results */}
              {filteredCalls.length === 0 && (
                <Card className="border-0 bg-white/50 dark:bg-neutral-800/50">
                <CardContent className="p-6 sm:p-12 text-center">
                  <PhoneCall className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4 sm:mb-6" />
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-gray-100 mb-2">
                    No calls found
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 mb-4 sm:mb-6">
                    Try adjusting your search criteria or filters to find what
                    you&apos;re looking for.
                  </p>
                  <Button
                    onClick={clearAllFilters}
                    className="bg-gradient-to-r from-[#53a533] to-[#53a533] hover:from-[#4a9430] hover:to-[#4a9430] text-white rounded-xl text-sm sm:text-base"
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl">
                <CardContent className="p-4 sm:p-6 text-center">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-[#53a533]/50 dark:text-[#53a533]/70 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-gray-100 mb-2">
                    Call Volume
                  </h3>
                  <p className="text-xl sm:text-2xl font-bold text-[#4a9430] dark:text-[#53a533]">89</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">Today</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {aiInsights.map((insight, index) => (
                  <Card
                    key={index}
                    className="border-0 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm rounded-2xl"
                  >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center shrink-0">
                        <insight.icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-gray-100 mb-2">
                          {insight.title}
                        </h3>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 mb-3">
                          {insight.description}
                        </p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                          <span className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                            {insight.confidence}% confidence
                          </span>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 text-white rounded-lg w-full sm:w-auto text-xs sm:text-sm"
                          >
                            {insight.action}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="phone-settings" className="mt-6">
            <div className="space-y-8">
              {/* Call Blocking Management */}
              {checkPermission('MOD039', 'view') && (
                <Card
                    ref={callBlockingRef}
                    data-section="call-blocking"
                    className="border-0 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm rounded-2xl"
                  >
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-start sm:items-center gap-3 sm:space-x-3 mb-6 sm:mb-8">
                      <div className="hidden sm:flex w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-xl sm:rounded-2xl items-center justify-center shrink-0">
                        <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-gray-100 break-words">
                          Call Blocking Management
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 mt-1">
                          Block unwanted calls and manage your blocked numbers
                          list
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Add Number to Block */}
                      {checkPermission('MOD039', 'create') && (
                        <div className="flex flex-col space-y-6 h-[calc(100vh-80px)]">
                          <div className="p-4 sm:p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border border-red-200 dark:border-red-800 flex-grow flex flex-col">
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-gray-100 mb-4">
                              Block New Number
                            </h3>

                            <div className="space-y-4">
                              {/* Blocking Type */}
                              <div>
                                <Label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                                  Blocking Type
                                </Label>
                                <Select
                                  value={createFormData.blockingType}
                                  onValueChange={(
                                    value: 'number' | 'pattern'
                                  ) =>
                                    handleFormInputChange('blockingType', value)
                                  }
                                >
                                  <SelectTrigger className="px-4 py-3 border-slate-200 dark:border-neutral-700 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all duration-200">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="number">
                                      Number
                                    </SelectItem>
                                    <SelectItem value="pattern">
                                      Pattern
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Phone Number (conditional) */}
                              {createFormData.blockingType === 'number' && (
                                <div>
                                  <Label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                                    Phone Number
                                  </Label>
                                  <Input
                                    value={createFormData.phoneNumber}
                                    onChange={e =>
                                      handleFormInputChange(
                                        'phoneNumber',
                                        e.target.value
                                      )
                                    }
                                    placeholder="(777) 888-9999"
                                    maxLength={14} // (777) 888-9999 = 14 characters
                                    className={`px-4 py-3 border-slate-200 dark:border-neutral-700 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all duration-200 ${formErrors.phoneNumber ? 'border-red-500' : ''}`}
                                  />
                                  <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">
                                    Enter 10-digit phone number in format (777)
                                    888-9999
                                  </p>
                                  {formErrors.phoneNumber && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {formErrors.phoneNumber}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Pattern (conditional) */}
                              {createFormData.blockingType === 'pattern' && (
                                <div>
                                  <Label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                                    Pattern (Regex)
                                  </Label>
                                  <Input
                                    value={createFormData.pattern}
                                    onChange={e =>
                                      handleFormInputChange(
                                        'pattern',
                                        e.target.value
                                      )
                                    }
                                    placeholder="^\\+1800.*"
                                    className={`px-4 py-3 border-slate-200 dark:border-neutral-700 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all duration-200 ${formErrors.pattern ? 'border-red-500' : ''}`}
                                  />
                                  {formErrors.pattern && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {formErrors.pattern}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Block Type */}
                              <div>
                                <Label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                                  Block Type
                                </Label>
                                <Select
                                  value={createFormData.blockType}
                                  onValueChange={(
                                    value: 'permanent' | 'temporary'
                                  ) =>
                                    handleFormInputChange('blockType', value)
                                  }
                                >
                                  <SelectTrigger className="px-4 py-3 border-slate-200 dark:border-neutral-700 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all duration-200">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="permanent">
                                      Permanent
                                    </SelectItem>
                                    <SelectItem value="temporary">
                                      Temporary
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Expiration Date (conditional) */}
                              {createFormData.blockType === 'temporary' && (
                                <div>
                                  <Label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                                    Expiration Date
                                  </Label>
                                  <Input
                                    type="datetime-local"
                                    value={createFormData.expiresAt}
                                    onChange={e =>
                                      handleFormInputChange(
                                        'expiresAt',
                                        e.target.value
                                      )
                                    }
                                    className={`px-4 py-3 border-slate-200 dark:border-neutral-700 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all duration-200 ${formErrors.expiresAt ? 'border-red-500' : ''}`}
                                  />
                                  {formErrors.expiresAt && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {formErrors.expiresAt}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Block Reason */}
                              <div>
                                <Label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                                  Block Reason
                                </Label>
                                <Select
                                  value={createFormData.reason}
                                  onValueChange={value =>
                                    handleFormInputChange('reason', value)
                                  }
                                >
                                  <SelectTrigger className="px-4 py-3 border-slate-200 dark:border-neutral-700 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all duration-200">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="spam">Spam</SelectItem>
                                    <SelectItem value="harassment">
                                      Harassment
                                    </SelectItem>
                                    <SelectItem value="fraud">Fraud</SelectItem>
                                    <SelectItem value="telemarketing">
                                      Telemarketing
                                    </SelectItem>
                                    <SelectItem value="wrong_number">
                                      Wrong Number
                                    </SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Source Selection Type */}
                              <div>
                                <Label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                                  Source Selection
                                </Label>
                                <Select
                                  value={createFormData.sourceSelectionType}
                                  onValueChange={(value: 'all' | 'specific') =>
                                    handleFormInputChange(
                                      'sourceSelectionType',
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger className="px-4 py-3 border-slate-200 dark:border-neutral-700 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all duration-200">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">
                                      All Sources
                                    </SelectItem>
                                    <SelectItem value="specific">
                                      Specific Sources
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Source Codes (conditional) */}
                              {createFormData.sourceSelectionType ===
                                'specific' && (
                                <div>
                                  <Label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                                    Source Codes
                                  </Label>
                                  <Popover
                                    open={sourceCodesOpen}
                                    onOpenChange={handleSourceCodesOpenChange}
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={sourceCodesOpen}
                                        className={`w-full justify-between ${formErrors.sourceCodes ? 'border-red-500' : ''}`}
                                      >
                                        {createFormData.sourceCodes.length > 0
                                          ? `${createFormData.sourceCodes.length} source(s) selected`
                                          : 'Select source codes...'}
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-full p-0"
                                      align="start"
                                    >
                                      <Command>
                                        <CommandInput
                                          placeholder="Search source codes..."
                                          value={sourceSearchQuery}
                                          onValueChange={setSourceSearchQuery}
                                        />
                                        <CommandList>
                                          <CommandEmpty>
                                            {sourcesLoading
                                              ? 'Loading...'
                                              : 'No source codes found.'}
                                          </CommandEmpty>
                                          <CommandGroup>
                                            {sources.map(source => (
                                              <CommandItem
                                                key={source.id}
                                                value={source.code}
                                                onSelect={() =>
                                                  handleSourceCodeToggle(
                                                    source.code
                                                  )
                                                }
                                              >
                                                <CheckCircle2
                                                  className={`mr-2 h-4 w-4 ${
                                                    createFormData.sourceCodes.includes(
                                                      source.code
                                                    )
                                                      ? 'opacity-100'
                                                      : 'opacity-0'
                                                  }`}
                                                />
                                                {source.code} - {source.name}
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  {createFormData.sourceCodes.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {createFormData.sourceCodes.map(code => (
                                        <Badge
                                          key={code}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {code}
                                          <XCircle
                                            className="ml-1 h-3 w-3 cursor-pointer"
                                            onClick={() =>
                                              handleSourceCodeToggle(code)
                                            }
                                          />
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  {formErrors.sourceCodes && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {formErrors.sourceCodes}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Notes */}
                              <div>
                                <Label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                                  Notes (Optional)
                                </Label>
                                <Textarea
                                  value={createFormData.notes}
                                  onChange={e =>
                                    handleFormInputChange(
                                      'notes',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Additional notes about this blocking rule..."
                                  className="px-4 py-3 border-slate-200 dark:border-neutral-700 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition-all duration-200"
                                  rows={3}
                                />
                              </div>
                            </div>
                            <div className="flex-grow flex justify-end flex-col">
                              <Button
                                onClick={handleCreateBlockingRule}
                                disabled={creating}
                                className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 dark:from-red-600 dark:to-rose-600 dark:hover:from-red-700 dark:hover:to-rose-700 text-white shadow-lg rounded-xl"
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                {creating ? 'Creating...' : 'Block Number'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Blocked Numbers List */}
                      <div
                        className={
                          'flex flex-col space-y-6 h-[calc(100vh-80px)] ' +
                          (!checkPermission('MOD039', 'create')
                            ? 'col-span-2'
                            : '')
                        }
                      >
                        <div className="flex-1 flex flex-col min-h-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-gray-100">
                              Currently Blocked Numbers
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-xs sm:text-sm text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 whitespace-nowrap"
                              >
                                {callBlockingLoading
                                  ? '...'
                                  : `${callBlockingData.length} Blocked`}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex-grow overflow-y-scroll flex">
                            <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
                              {callBlockingLoading ? (
                                <Loading
                                  message="Loading blocked numbers..."
                                  size="sm"
                                  className="py-8"
                                />
                              ) : callBlockingError ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="text-red-500">
                                    {callBlockingError}
                                  </div>
                                </div>
                              ) : callBlockingData.length === 0 ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="text-slate-500 dark:text-gray-400">
                                    No blocked numbers found
                                  </div>
                                </div>
                              ) : (
                                callBlockingData.map((blocked, index) => {
                                  const formatPhoneNumber = (
                                    phoneNumber?: string
                                  ) => {
                                    if (!phoneNumber) return 'Pattern Block'
                                    // Format phone number to (XXX) XXX-XXXX
                                    const cleaned = phoneNumber.replace(
                                      /\D/g,
                                      ''
                                    )
                                    if (
                                      cleaned.length === 11 &&
                                      cleaned.startsWith('1')
                                    ) {
                                      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
                                    } else if (cleaned.length === 10) {
                                      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
                                    }
                                    return phoneNumber
                                  }

                                  const formatReason = (reason: string) => {
                                    return reason
                                      .split('_')
                                      .map(
                                        word =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1)
                                      )
                                      .join(' ')
                                  }

                                  const formatDate = (dateString: string) => {
                                    return new Date(
                                      dateString
                                    ).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                    })
                                  }

                                  return (
                                    <div
                                      key={blocked._id}
                                      className="p-3 sm:p-4 bg-white dark:bg-neutral-800 rounded-xl border border-slate-100 dark:border-neutral-700 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50/30 dark:hover:bg-red-900/20 transition-all duration-200"
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                        <div className="flex-1 min-w-0 space-y-2">
                                          {/* Phone Number and Badges */}
                                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                            <span className="font-mono text-base sm:text-lg font-semibold text-slate-900 dark:text-gray-100 whitespace-nowrap">
                                              {formatPhoneNumber(
                                                blocked.phoneNumber
                                              )}
                                            </span>
                                            <Badge
                                              variant="outline"
                                              className={`text-xs shrink-0 ${
                                                blocked.reason === 'spam' ||
                                                blocked.reason ===
                                                  'telemarketing'
                                                  ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                                  : blocked.reason ===
                                                      'harassment'
                                                    ? 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                                                    : blocked.reason === 'fraud'
                                                      ? 'text-red-700 dark:text-red-400 border-red-300 dark:border-red-800'
                                                      : blocked.reason ===
                                                          'wrong_number'
                                                        ? 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                                        : 'text-slate-600 dark:text-gray-400 border-slate-200 dark:border-neutral-700'
                                              }`}
                                            >
                                              {formatReason(blocked.reason)}
                                            </Badge>
                                            <Badge
                                              variant="outline"
                                              className={`capitalize text-xs shrink-0 ${
                                                blocked.blockingType ===
                                                'pattern'
                                                  ? 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                                  : 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                                              }`}
                                            >
                                              {blocked.blockingType}
                                            </Badge>
                                            <Badge
                                              variant="outline"
                                              className={`capitalize text-xs shrink-0 ${
                                                blocked.blockType ===
                                                'permanent'
                                                  ? 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                                                  : 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                                              }`}
                                            >
                                              {blocked.blockType}
                                            </Badge>
                                          </div>
                                          
                                          {/* Info Row */}
                                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-gray-400">
                                            <span className="whitespace-nowrap">
                                              Blocked:{' '}
                                              {formatDate(blocked.createdAt)}
                                            </span>
                                            <span className="whitespace-nowrap">
                                              Calls prevented:{' '}
                                              {blocked.blockedCount}
                                            </span>
                                            {blocked.notes && (
                                              <span className="text-slate-500 dark:text-gray-500 italic truncate max-w-full sm:max-w-md">
                                                {blocked.notes.length > 50
                                                  ? `${blocked.notes.substring(0, 50)}...`
                                                  : blocked.notes}
                                              </span>
                                            )}
                                          </div>
                                          
                                          {/* Tags */}
                                          {blocked.tags &&
                                            blocked.tags.length > 0 && (
                                              <div className="flex flex-wrap gap-1.5">
                                                {blocked.tags.map(
                                                  (tag, tagIndex) => (
                                                    <Badge
                                                      key={tagIndex}
                                                      variant="outline"
                                                      className="text-xs text-slate-500 dark:text-gray-400 border-slate-200 dark:border-neutral-700"
                                                    >
                                                      {tag}
                                                    </Badge>
                                                  )
                                                )}
                                              </div>
                                            )}
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 shrink-0">
                                          {checkPermission(
                                            'MOD039',
                                            'edit'
                                          ) && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                              onClick={() =>
                                                handleEditRule(blocked)
                                              }
                                            >
                                              <Edit className="w-4 h-4 sm:mr-1" />
                                              <span className="hidden sm:inline">Edit</span>
                                            </Button>
                                          )}

                                          {checkPermission(
                                            'MOD039',
                                            'delete'
                                          ) && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                              onClick={() =>
                                                handleDeleteRule(blocked)
                                              }
                                            >
                                              <XCircle className="w-4 h-4 sm:mr-1" />
                                              <span className="hidden sm:inline">Unblock</span>
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })
                              )}

                              {/* View More Button */}
                              {callBlockingPagination.hasMore && (
                                <div className="flex justify-center pt-4">
                                  <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="text-slate-600 dark:text-gray-400 border-slate-300 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800"
                                  >
                                    {loadingMore ? (
                                      <>
                                        <Loading size="sm" className="mr-2" />
                                        Loading...
                                      </>
                                    ) : (
                                      <>
                                        <ArrowDownLeft className="w-4 h-4 mr-2" />
                                        View More
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Statistics Card */}
                    {statistics && (
                      <div className="mt-8">
                        <Card className="border-0 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl border dark:border-neutral-700">
                          <CardContent className="p-4 sm:p-6">
                            {checkPermission('MOD039', 'view_statistics') && (
                              <>
                                <div className="mb-6">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-gray-100">
                                      Blocking Statistics
                                    </h3>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2 w-full sm:w-auto">
                                      {/* Date Range - Stack vertically on mobile, horizontal on desktop */}
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                                        <Input
                                          type="date"
                                          value={blockingStartDate}
                                          onChange={e =>
                                            setBlockingStartDate(e.target.value)
                                          }
                                          className="text-xs sm:text-sm dark:bg-neutral-800 dark:border-neutral-700 w-full sm:w-auto"
                                        />
                                        <span className="hidden sm:inline text-xs sm:text-sm text-slate-500 dark:text-gray-400 whitespace-nowrap shrink-0">to</span>
                                        <Input
                                          type="date"
                                          value={blockingEndDate}
                                          onChange={e =>
                                            setBlockingEndDate(e.target.value)
                                          }
                                          className="text-xs sm:text-sm dark:bg-neutral-800 dark:border-neutral-700 w-full sm:w-auto"
                                        />
                                      </div>
                                      
                                      {/* Select and Button - Side by side on mobile, inline on desktop */}
                                      <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Select
                                          value={blockingGroupBy}
                                          onValueChange={(
                                            value:
                                              | 'day'
                                              | 'week'
                                              | 'month'
                                              | 'none'
                                          ) => setBlockingGroupBy(value)}
                                        >
                                          <SelectTrigger className="flex-1 sm:flex-none sm:w-24 text-xs sm:text-sm dark:bg-neutral-800 dark:border-neutral-700">
                                            <SelectValue placeholder="Group" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="none">
                                              No Group
                                            </SelectItem>
                                            <SelectItem value="day">
                                              Day
                                            </SelectItem>
                                            <SelectItem value="week">
                                              Week
                                            </SelectItem>
                                            <SelectItem value="month">
                                              Month
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                        
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-slate-600 dark:text-gray-400 border-slate-300 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 flex-1 sm:flex-none sm:w-auto whitespace-nowrap"
                                          onClick={fetchCallBlockingStatistics}
                                          disabled={statisticsLoading}
                                        >
                                          <BarChart3 className="w-4 h-4 sm:mr-2" />
                                          {statisticsLoading
                                            ? 'Refreshing...'
                                            : 'Refresh'}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
                                  {/* Summary Stats */}
                                  <div className="text-center p-3 sm:p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl">
                                    <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-gray-100">
                                      {statistics?.summary?.totalRules || 0}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-gray-400">
                                      Total Rules
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl">
                                    <div className="text-2xl font-bold text-green-600">
                                      {statistics?.summary?.activeRules || 0}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-gray-400">
                                      Active
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl">
                                    <div className="text-2xl font-bold text-red-600">
                                      {statistics?.summary?.inactiveRules || 0}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-gray-400">
                                      Inactive
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl">
                                    <div className="text-2xl font-bold text-orange-600">
                                      {statistics?.summary?.expiredRules || 0}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-gray-400">
                                      Expired
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl">
                                    <div className="text-2xl font-bold text-blue-600">
                                      {statistics?.summary?.totalBlockedCalls ||
                                        0}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-gray-400">
                                      Blocked Calls
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl">
                                    <div className="text-2xl font-bold text-purple-600">
                                      {(statistics?.byType?.number || 0) +
                                        (statistics?.byType?.pattern || 0)}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-gray-400">
                                      Total Rules
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {/* By Type */}
                                  <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-gray-100 mb-3">
                                      By Type
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-neutral-800/60 rounded-lg">
                                        <span className="text-sm text-slate-600 dark:text-gray-400">
                                          Number
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                        >
                                          {statistics?.byType?.number || 0}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-neutral-800/60 rounded-lg">
                                        <span className="text-sm text-slate-600 dark:text-gray-400">
                                          Pattern
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                                        >
                                          {statistics?.byType?.pattern || 0}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* By Reason */}
                                  <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-gray-100 mb-3">
                                      By Reason
                                    </h4>
                                    <div className="space-y-2">
                                      {Object.entries(
                                        statistics?.byReason || {}
                                      ).map(([reason, count]) => (
                                        <div
                                          key={reason}
                                          className="flex justify-between items-center p-2 bg-white/60 dark:bg-neutral-800/60 rounded-lg"
                                        >
                                          <span className="text-sm text-slate-600 dark:text-gray-400 capitalize">
                                            {reason.replace('_', ' ')}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className={`text-xs ${
                                              reason === 'spam' ||
                                              reason === 'telemarketing'
                                                ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                                : reason === 'harassment'
                                                  ? 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                                                  : reason === 'fraud'
                                                    ? 'text-red-700 dark:text-red-400 border-red-300 dark:border-red-800'
                                                    : reason === 'wrong_number'
                                                      ? 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                                      : 'text-slate-600 dark:text-gray-400 border-slate-200 dark:border-neutral-700'
                                            }`}
                                          >
                                            {count}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* By Block Type */}
                                  <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-gray-100 mb-3">
                                      By Block Type
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-neutral-800/60 rounded-lg">
                                        <span className="text-sm text-slate-600 dark:text-gray-400">
                                          Permanent
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                                        >
                                          {statistics?.byBlockType?.permanent ||
                                            0}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-neutral-800/60 rounded-lg">
                                        <span className="text-sm text-slate-600 dark:text-gray-400">
                                          Temporary
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                                        >
                                          {statistics?.byBlockType?.temporary ||
                                            0}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Top Blocked Numbers */}
                                {statistics?.topBlockedNumbers &&
                                  statistics.topBlockedNumbers.length > 0 && (
                                    <div className="mt-6">
                                      <h4 className="font-semibold text-slate-900 dark:text-gray-100 mb-3">
                                        Top Blocked Numbers
                                      </h4>
                                      <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {statistics?.topBlockedNumbers
                                          ?.slice(0, 5)
                                          .map((item, index) => (
                                            <div
                                              key={item._id}
                                              className="flex justify-between items-center p-3 bg-white/60 dark:bg-neutral-800/60 rounded-lg"
                                            >
                                              <div className="flex items-center space-x-3">
                                                <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                                                  #{index + 1}
                                                </span>
                                                <span className="font-mono text-sm text-slate-900 dark:text-gray-100">
                                                  {item.phoneNumber ||
                                                    item.pattern}
                                                </span>
                                                <Badge
                                                  variant="outline"
                                                  className={`text-xs ${
                                                    item.reason === 'spam' ||
                                                    item.reason ===
                                                      'telemarketing'
                                                      ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                                      : item.reason ===
                                                          'harassment'
                                                        ? 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                                                        : item.reason ===
                                                            'fraud'
                                                          ? 'text-red-700 dark:text-red-400 border-red-300 dark:border-red-800'
                                                          : item.reason ===
                                                              'wrong_number'
                                                            ? 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                                            : 'text-slate-600 dark:text-gray-400 border-slate-200 dark:border-neutral-700'
                                                  }`}
                                                >
                                                  {item.reason.replace(
                                                    '_',
                                                    ' '
                                                  )}
                                                </Badge>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <span className="text-sm text-slate-600 dark:text-gray-400">
                                                  {item.blockedCount} calls
                                                </span>
                                                <Badge
                                                  variant="outline"
                                                  className={`text-xs ${
                                                    item.isCurrentlyActive
                                                      ? 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                                                      : 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                                  }`}
                                                >
                                                  {item.isCurrentlyActive
                                                    ? 'Active'
                                                    : 'Inactive'}
                                                </Badge>
                                              </div>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                              </>
                            )}
                            <div
                              className={
                                'flex flex-wrap items-center gap-2 sm:gap-2 ' +
                                (checkPermission('MOD039', 'view_statistics')
                                  ? 'mt-6 pt-6 border-t border-slate-200 dark:border-neutral-700'
                                  : '')
                              }
                            >
                              {checkPermission('MOD039', 'import') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-slate-600 dark:text-gray-400 border-slate-300 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 flex-1 sm:flex-none min-w-0"
                                  onClick={handleImportBlockedList}
                                  disabled={importing}
                                >
                                  <Upload className="w-4 h-4 sm:mr-2 shrink-0" />
                                  <span className="hidden sm:inline">
                                    {importing
                                      ? 'Importing...'
                                      : 'Import Blocked List'}
                                  </span>
                                  <span className="sm:hidden">
                                    {importing
                                      ? 'Importing...'
                                      : 'Import'}
                                  </span>
                                </Button>
                              )}
                              {checkPermission('MOD039', 'export') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 dark:text-green-400 border-green-300 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 flex-1 sm:flex-none min-w-0"
                                  onClick={handleExportBlockedList}
                                  disabled={exporting}
                                >
                                  <Download className="w-4 h-4 sm:mr-2 shrink-0" />
                                  <span className="hidden sm:inline">
                                    {exporting
                                      ? 'Exporting...'
                                      : 'Export Blocked List'}
                                  </span>
                                  <span className="sm:hidden">
                                    {exporting
                                      ? 'Exporting...'
                                      : 'Export'}
                                  </span>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Spam Protection */}
              {checkPermission('MOD040', 'view') && (
                <Card
                    ref={spamProtectionRef}
                    data-section="spam-protection"
                    className="border-0 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm rounded-2xl"
                  >
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                      <div className="flex items-start sm:items-center gap-3 sm:space-x-3 flex-1 min-w-0">
                        <div className="hidden sm:flex w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl sm:rounded-2xl items-center justify-center shrink-0">
                          <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-gray-100 break-words">
                            Spam Protection
                          </h2>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 mt-1">
                            Manage spam protection rules and automated call
                            screening
                          </p>
                        </div>
                      </div>
                      {checkPermission('MOD040', 'create') && (
                        <Button
                          onClick={() => setSpamProtectionCreateModalOpen(true)}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg rounded-xl px-4 sm:px-6 w-full sm:w-auto shrink-0"
                        >
                          <Plus className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Add Rule</span>
                          <span className="sm:hidden">Add</span>
                        </Button>
                      )}
                    </div>

                    <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                      {spamProtectionLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loading size="lg" />
                        </div>
                      ) : spamProtectionError ? (
                        <div className="text-center py-12">
                          <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
                          <p className="text-red-600 dark:text-red-400 mb-4">
                            {spamProtectionError}
                          </p>
                          <Button
                            onClick={fetchSpamProtectionData}
                            variant="outline"
                            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Try Again
                          </Button>
                        </div>
                      ) : spamProtectionData.length === 0 ? (
                        <div className="text-center py-12">
                          <Shield className="w-12 h-12 text-slate-400 dark:text-neutral-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-2">
                            No Spam Protection Rules
                          </h3>
                          <p className="text-slate-600 dark:text-gray-400 mb-6">
                            Create your first spam protection rule to start
                            screening calls
                          </p>
                          <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Rule
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {spamProtectionData.map(rule => (
                            <div
                              key={rule._id}
                              className="p-3 sm:p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl border border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600 transition-all duration-200"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                <div className="flex-1 min-w-0 space-y-2">
                                  {/* Header with title and badges */}
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-gray-100 break-words">
                                      {rule.title}
                                    </h3>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs shrink-0 ${
                                        rule.status === 'active'
                                          ? 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                                          : rule.status === 'failed'
                                            ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                            : 'text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                                      }`}
                                    >
                                      {rule.status}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-slate-600 dark:text-gray-400 dark:border-neutral-700 shrink-0"
                                    >
                                      {rule.code}
                                    </Badge>
                                  </div>

                                  {/* Info section */}
                                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-600 dark:text-gray-400">
                                    <span className="whitespace-nowrap">
                                      <span className="font-medium">Type:</span>{' '}
                                      {rule.protection === '{{dynamic}}'
                                        ? 'Dynamic'
                                        : rule.protection}
                                    </span>
                                    <span className="whitespace-nowrap">
                                      <span className="font-medium">
                                        Sources:
                                      </span>{' '}
                                      {rule.sourceSelectionType === 'all'
                                        ? 'All'
                                        : `${rule.sourceCodes.length} specific`}
                                    </span>
                                    <span className="whitespace-nowrap">
                                      <span className="font-medium">
                                        Usage:
                                      </span>{' '}
                                      {rule.usageCount}
                                    </span>
                                    <span className="whitespace-nowrap">
                                      <span className="font-medium">
                                        Created:
                                      </span>{' '}
                                      {new Date(
                                        rule.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-wrap items-center gap-2 sm:gap-2 sm:ml-4 shrink-0">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                                    onClick={() =>
                                      handleSpamProtectionView(rule)
                                    }
                                  >
                                    <span className="hidden sm:inline">View</span>
                                    <span className="sm:hidden">View</span>
                                  </Button>
                                  {checkPermission(
                                    'MOD040',
                                    'regenerate_audio'
                                  ) && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 dark:border-neutral-700 items-center"
                                      onClick={() => {
                                        setSelectedSpamProtectionRule(rule)
                                        handleSpamProtectionRegenerateAudio()
                                      }}
                                      disabled={spamProtectionRegenerating}
                                      title="Generate Voice"
                                    >
                                      {spamProtectionRegenerating &&
                                      selectedSpamProtectionRule?._id ===
                                        rule._id ? (
                                        <Loading size="sm" message={''} />
                                      ) : (
                                        <Brain className="w-4 h-4" />
                                      )}
                                    </Button>
                                  )}
                                  {checkPermission('MOD040', 'edit') && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                                      onClick={() =>
                                        handleSpamProtectionEdit(rule)
                                      }
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {checkPermission('MOD040', 'delete') && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-neutral-700"
                                      onClick={() =>
                                        handleSpamProtectionDelete(rule)
                                      }
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Load More Button */}
                          {spamProtectionPagination.hasMore && (
                            <div className="flex justify-center pt-4">
                              <Button
                                variant="outline"
                                onClick={handleLoadMoreSpamProtection}
                                disabled={spamProtectionLoadingMore}
                                className="text-slate-600 dark:text-gray-400 border-slate-300 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800"
                              >
                                {spamProtectionLoadingMore ? (
                                  <>
                                    <Loading size="sm" className="mr-2" />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                                    Load More
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Spam Protection Statistics */}
                    {checkPermission('MOD040', 'view_statistics') && (
                      <>
                        {spamProtectionStatistics && (
                          <div className="mt-8">
                            <Card className="border-0 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl border dark:border-neutral-700">
                              <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6">
                                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-gray-100">
                                    Spam Protection Statistics
                                  </h3>
                                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 w-full sm:w-auto">
                                    {/* Date Range - Stack vertically on mobile, horizontal on desktop */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                                      <Input
                                        type="date"
                                        value={spamProtectionStartDate}
                                        onChange={e =>
                                          setSpamProtectionStartDate(
                                            e.target.value
                                          )
                                        }
                                        className="text-xs sm:text-sm dark:bg-neutral-800 dark:border-neutral-700 w-full sm:w-auto"
                                      />
                                      <span className="hidden sm:inline text-xs sm:text-sm text-slate-500 dark:text-gray-400 whitespace-nowrap shrink-0">to</span>
                                      <Input
                                        type="date"
                                        value={spamProtectionEndDate}
                                        onChange={e =>
                                          setSpamProtectionEndDate(
                                            e.target.value
                                          )
                                        }
                                        className="text-xs sm:text-sm dark:bg-neutral-800 dark:border-neutral-700 w-full sm:w-auto"
                                      />
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-slate-600 dark:text-gray-400 border-slate-300 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 w-full sm:w-auto whitespace-nowrap"
                                      onClick={fetchSpamProtectionStatistics}
                                      disabled={spamProtectionStatisticsLoading}
                                    >
                                      <BarChart3 className="w-4 h-4 sm:mr-2" />
                                      {spamProtectionStatisticsLoading
                                        ? 'Refreshing...'
                                        : 'Refresh'}
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
                                  {/* Summary Stats */}
                                  <div className="text-center p-3 sm:p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl">
                                    <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-gray-100">
                                      {spamProtectionStatistics?.summary
                                        ?.totalRules || 0}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-gray-400">
                                      Total Rules
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                      {spamProtectionStatistics?.summary
                                        ?.activeRules || 0}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-gray-400">
                                      Active
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl">
                                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                      {spamProtectionStatistics?.summary
                                        ?.processingRules || 0}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-gray-400">
                                      Processing
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl">
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                      {spamProtectionStatistics?.summary
                                        ?.failedRules || 0}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-gray-400">
                                      Failed
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl">
                                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                      {spamProtectionStatistics?.summary
                                        ?.inactiveRules || 0}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-gray-400">
                                      Inactive
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                      {spamProtectionStatistics?.summary
                                        ?.totalUsage || 0}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-gray-400">
                                      Total Usage
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {/* By Protection Type */}
                                  <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-gray-100 mb-3">
                                      By Protection Type
                                    </h4>
                                    <div className="space-y-2">
                                      {Object.entries(
                                        spamProtectionStatistics?.byProtection ||
                                          {}
                                      ).map(([type, count]) => (
                                        <div
                                          key={type}
                                          className="flex justify-between items-center p-2 bg-white/60 dark:bg-neutral-800/60 rounded-lg"
                                        >
                                          <span className="text-sm text-slate-600 dark:text-gray-400">
                                            {type === '{{dynamic}}'
                                              ? 'Dynamic'
                                              : type}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                          >
                                            {count}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* By Source Type */}
                                  <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-gray-100 mb-3">
                                      By Source Type
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-neutral-800/60 rounded-lg">
                                        <span className="text-sm text-slate-600 dark:text-gray-400">
                                          All Sources
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                                        >
                                          {spamProtectionStatistics
                                            ?.bySourceType?.all || 0}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-neutral-800/60 rounded-lg">
                                        <span className="text-sm text-slate-600 dark:text-gray-400">
                                          Specific Sources
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                        >
                                          {spamProtectionStatistics
                                            ?.bySourceType?.specific || 0}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Most Used Rules */}
                                  <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-gray-100 mb-3">
                                      Most Used Rules
                                    </h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                      {spamProtectionStatistics?.mostUsedRules
                                        ?.slice(0, 5)
                                        .map((rule, index) => (
                                          <div
                                            key={rule._id}
                                            className="flex justify-between items-center p-2 bg-white/60 dark:bg-neutral-800/60 rounded-lg"
                                          >
                                            <div className="flex items-center space-x-2">
                                              <span className="text-sm font-medium text-slate-500 dark:text-gray-500">
                                                #{index + 1}
                                              </span>
                                              <span className="text-sm text-slate-900 dark:text-gray-100 truncate">
                                                {rule.title}
                                              </span>
                                            </div>
                                            <Badge
                                              variant="outline"
                                              className="text-xs text-slate-600 dark:text-gray-400 dark:border-neutral-700"
                                            >
                                              {rule.usageCount}
                                            </Badge>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Phone Number Management */}
              {(checkPermission('MOD041', 'view') ||
                checkPermission('MOD042', 'view')) && (
                <Card
                    ref={phoneNumberRef}
                    data-section="phone-numbers"
                    className="border-0 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm rounded-2xl"
                  >
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                      <div className="flex items-start sm:items-center gap-3 sm:space-x-3">
                        <div className="hidden sm:flex w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl sm:rounded-2xl items-center justify-center shrink-0">
                          <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-gray-100 break-words">
                            Phone Number Management
                          </h2>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 mt-1">
                            Manage your phone numbers and their capabilities
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:space-x-3">
                        <div className="text-left sm:text-right">
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                            Total Numbers
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-[#4a9430] dark:text-[#53a533]">
                            {phoneNumberLoading
                              ? '...'
                              : phoneNumberData.length}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Search and Filter Row */}
                    {checkPermission('MOD041', 'view') && (
                      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="relative w-full sm:max-w-md">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-500 w-4 h-4" />
                          <Input
                            placeholder="Search phone numbers..."
                            value={phoneNumberSearchTerm}
                            onChange={e =>
                              setPhoneNumberSearchTerm(e.target.value)
                            }
                            className="pl-10 text-sm dark:bg-neutral-800 dark:border-neutral-700 w-full"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                          <Input
                            type="date"
                            value={phoneNumberStartDate}
                            onChange={e =>
                              setPhoneNumberStartDate(e.target.value)
                            }
                            className="text-sm dark:bg-neutral-800 dark:border-neutral-700 w-full sm:w-auto"
                          />
                          <span className="hidden sm:inline text-slate-500 dark:text-gray-400 whitespace-nowrap shrink-0">to</span>
                          <Input
                            type="date"
                            value={phoneNumberEndDate}
                            onChange={e =>
                              setPhoneNumberEndDate(e.target.value)
                            }
                            className="text-sm dark:bg-neutral-800 dark:border-neutral-700 w-full sm:w-auto"
                          />
                        </div>
                      </div>
                    )}
                    {/* Additional Filters for MOD042 Users */}
                    {checkPermission('MOD042', 'view') && (
                      <>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                              Search
                            </Label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-500 w-4 h-4" />
                              <Input
                                placeholder="Search phone numbers..."
                                value={phoneNumberSearchTerm}
                                onChange={e =>
                                  setPhoneNumberSearchTerm(e.target.value)
                                }
                                className="pl-10 text-sm dark:bg-neutral-800 dark:border-neutral-700"
                              />
                            </div>
                          </div>

                          {/* Status Filter */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                              Status
                            </Label>
                            <Select
                              value={phoneNumberStatus}
                              onValueChange={setPhoneNumberStatus}
                            >
                              <SelectTrigger className="text-sm dark:bg-neutral-800 dark:border-neutral-700">
                                <SelectValue placeholder="All Statuses" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All Statuses
                                </SelectItem>
                                <SelectItem value="assigned">
                                  Assigned
                                </SelectItem>
                                <SelectItem value="unassigned">
                                  Unassigned
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Tenant ID Filter */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                              Tenant
                            </Label>
                            <Popover
                              open={tenantDropdownOpen}
                              onOpenChange={open => {
                                setTenantDropdownOpen(open)
                                if (!open) {
                                  setTimeout(() => {
                                    setTenantSearchTerm('')
                                    fetchTenants('')
                                  }, 100)
                                }
                              }}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={tenantDropdownOpen}
                                  className="w-full justify-between text-sm dark:bg-neutral-800 dark:border-neutral-700"
                                >
                                  {phoneNumberTenantId &&
                                  phoneNumberTenantId !== 'all'
                                    ? tenants.find(
                                        t => t._id === phoneNumberTenantId
                                      )?.name || 'Select tenant...'
                                    : 'All Tenants'}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-[var(--radix-popover-trigger-width)] p-0"
                                align="start"
                              >
                                <Command shouldFilter={false}>
                                  <CommandInput
                                    placeholder="Search tenants..."
                                    value={tenantSearchTerm}
                                    onValueChange={value => {
                                      setTenantSearchTerm(value)
                                      fetchTenants(value)
                                    }}
                                  />
                                  <CommandList>
                                    {loadingTenants ? (
                                      <CommandEmpty>
                                        Loading tenants...
                                      </CommandEmpty>
                                    ) : tenants.length === 0 ? (
                                      <CommandEmpty>
                                        No tenants found.
                                      </CommandEmpty>
                                    ) : (
                                      <CommandGroup>
                                        <CommandItem
                                          value="all"
                                          onSelect={() => {
                                            setPhoneNumberTenantId('all')
                                            setTenantDropdownOpen(false)
                                          }}
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${phoneNumberTenantId === 'all' ? 'opacity-100' : 'opacity-0'}`}
                                          />
                                          All Tenants
                                        </CommandItem>
                                        {tenants
                                          .filter(tenant => {
                                            if (!tenantSearchTerm) return true
                                            const searchLower =
                                              tenantSearchTerm.toLowerCase()
                                            return (
                                              tenant.name
                                                ?.toLowerCase()
                                                .includes(searchLower) ||
                                              tenant.username
                                                ?.toLowerCase()
                                                .includes(searchLower)
                                            )
                                          })
                                          .map(tenant => (
                                            <CommandItem
                                              key={tenant._id}
                                              value={tenant._id}
                                              onSelect={() => {
                                                setPhoneNumberTenantId(
                                                  tenant._id
                                                )
                                                setTenantDropdownOpen(false)
                                              }}
                                            >
                                              <Check
                                                className={`mr-2 h-4 w-4 ${phoneNumberTenantId === tenant._id ? 'opacity-100' : 'opacity-0'}`}
                                              />
                                              <div className="flex flex-col">
                                                <span className="font-medium">
                                                  {tenant.name}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                  {tenant.username}
                                                </span>
                                              </div>
                                            </CommandItem>
                                          ))}
                                      </CommandGroup>
                                    )}
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* By Tenant ID Filter */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                              By Tenant
                            </Label>
                            <Popover
                              open={byTenantDropdownOpen}
                              onOpenChange={open => {
                                setByTenantDropdownOpen(open)
                                if (!open) {
                                  setTimeout(() => {
                                    setByTenantSearchTerm('')
                                    fetchByTenants('')
                                  }, 100)
                                }
                              }}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={byTenantDropdownOpen}
                                  className="w-full justify-between text-sm dark:bg-neutral-800 dark:border-neutral-700"
                                >
                                  {phoneNumberByTenantId &&
                                  phoneNumberByTenantId !== 'all'
                                    ? byTenants.find(
                                        t => t._id === phoneNumberByTenantId
                                      )?.name || 'Select tenant...'
                                    : 'All By Tenants'}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-[var(--radix-popover-trigger-width)] p-0"
                                align="start"
                              >
                                <Command shouldFilter={false}>
                                  <CommandInput
                                    placeholder="Search by tenants..."
                                    value={byTenantSearchTerm}
                                    onValueChange={value => {
                                      setByTenantSearchTerm(value)
                                      fetchByTenants(value)
                                    }}
                                  />
                                  <CommandList>
                                    {loadingByTenants ? (
                                      <CommandEmpty>
                                        Loading by tenants...
                                      </CommandEmpty>
                                    ) : byTenants.length === 0 ? (
                                      <CommandEmpty>
                                        No by tenants found.
                                      </CommandEmpty>
                                    ) : (
                                      <CommandGroup>
                                        <CommandItem
                                          value="all"
                                          onSelect={() => {
                                            setPhoneNumberByTenantId('all')
                                            setByTenantDropdownOpen(false)
                                          }}
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${phoneNumberByTenantId === 'all' ? 'opacity-100' : 'opacity-0'}`}
                                          />
                                          All By Tenants
                                        </CommandItem>
                                        {byTenants
                                          .filter(tenant => {
                                            if (!byTenantSearchTerm) return true
                                            const searchLower =
                                              byTenantSearchTerm.toLowerCase()
                                            return (
                                              tenant.name
                                                ?.toLowerCase()
                                                .includes(searchLower) ||
                                              tenant.username
                                                ?.toLowerCase()
                                                .includes(searchLower)
                                            )
                                          })
                                          .map(tenant => (
                                            <CommandItem
                                              key={tenant._id}
                                              value={tenant._id}
                                              onSelect={() => {
                                                setPhoneNumberByTenantId(
                                                  tenant._id
                                                )
                                                setByTenantDropdownOpen(false)
                                              }}
                                            >
                                              <Check
                                                className={`mr-2 h-4 w-4 ${phoneNumberByTenantId === tenant._id ? 'opacity-100' : 'opacity-0'}`}
                                              />
                                              <div className="flex flex-col">
                                                <span className="font-medium">
                                                  {tenant.name}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                  {tenant.username}
                                                </span>
                                              </div>
                                            </CommandItem>
                                          ))}
                                      </CommandGroup>
                                    )}
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Country Filter */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                              Country
                            </Label>
                            <Select
                              value={phoneNumberCountry}
                              onValueChange={setPhoneNumberCountry}
                            >
                              <SelectTrigger className="text-sm dark:bg-neutral-800 dark:border-neutral-700">
                                <SelectValue placeholder="All Countries" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All Countries
                                </SelectItem>
                                <SelectItem value="US">
                                  United States (US)
                                </SelectItem>
                                <SelectItem value="CA">Canada (CA)</SelectItem>
                                <SelectItem value="AU">
                                  Australia (AU)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                              Start Date
                            </Label>
                            <Input
                              type="date"
                              value={phoneNumberStartDate}
                              onChange={e =>
                                setPhoneNumberStartDate(e.target.value)
                              }
                              className="text-sm dark:bg-neutral-800 dark:border-neutral-700"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                              End Date
                            </Label>
                            <Input
                              type="date"
                              value={phoneNumberEndDate}
                              onChange={e =>
                                setPhoneNumberEndDate(e.target.value)
                              }
                              className="text-sm dark:bg-neutral-800 dark:border-neutral-700"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Summary Cards */}
                    {(checkPermission('MOD041', 'view_statistics') ||
                      checkPermission('MOD042', 'view')) && (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          {/* Total Numbers */}
                          <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-neutral-800 dark:to-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-700">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-slate-500 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                                <Phone className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm text-slate-600 dark:text-gray-400">
                                  Total Numbers
                                </p>
                                <p className="text-xl font-bold text-slate-900 dark:text-gray-100">
                                  {phoneNumberStatistics?.summary
                                    ?.totalNumbers || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                          {/* Active Numbers */}
                          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-green-500 dark:bg-green-600 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm text-slate-600 dark:text-gray-400">Active</p>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                  {phoneNumberStatistics?.summary
                                    ?.activeNumbers || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                          {/* Assigned Numbers */}
                          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                                <Link className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm text-slate-600 dark:text-gray-400">
                                  Assigned
                                </p>
                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                  {phoneNumberStatistics?.summary
                                    ?.assignedNumbers || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                          {/* Unassigned Numbers */}
                          <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-amber-500 dark:bg-amber-600 rounded-lg flex items-center justify-center">
                                <Unlink className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm text-slate-600 dark:text-gray-400">
                                  Unassigned
                                </p>
                                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                                  {phoneNumberStatistics?.summary
                                    ?.unassignedNumbers || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                          {/* Total Calls */}
                          <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-500 dark:bg-purple-600 rounded-lg flex items-center justify-center">
                                <PhoneCall className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm text-slate-600 dark:text-gray-400">
                                  Total Calls
                                </p>
                                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                  {phoneNumberStatistics?.summary?.totalCalls ||
                                    0}
                                </p>
                              </div>
                            </div>
                          </div>
                          {/* Total SMS */}
                          <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-indigo-500 dark:bg-indigo-600 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm text-slate-600 dark:text-gray-400">
                                  Total SMS
                                </p>
                                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                  {phoneNumberStatistics?.summary?.totalSms ||
                                    0}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                            value={
                              phoneStatisticsAccordionOpen
                                ? 'phone-statistics'
                                : ''
                            }
                            onValueChange={value =>
                              setPhoneStatisticsAccordionOpen(
                                value === 'phone-statistics'
                              )
                            }
                          >
                            <AccordionItem
                              value="phone-statistics"
                              className="border-0"
                            >
                              <AccordionTrigger className="rounded-2xl hover:no-underline [&>svg]:hidden">
                                <div className="flex justify-end w-full">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-slate-600 dark:text-gray-400 border-slate-300 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800"
                                  >
                                    {phoneStatisticsAccordionOpen
                                      ? 'Show less'
                                      : 'Show more statistics'}
                                  </Button>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-0 pt-4">
                                {phoneNumberStatistics ? (
                                  <Card className="border-0 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl border dark:border-neutral-700">
                                    <CardContent className="p-4 sm:p-6">
                                      <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-gray-100">
                                          Phone Number Statistics
                                        </h3>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                        {/* By Country */}
                                        <div>
                                          <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-gray-100 mb-2 sm:mb-3">
                                            By Country
                                          </h4>
                                          <div className="space-y-1.5 sm:space-y-2">
                                            {Object.entries(
                                              phoneNumberStatistics?.byCountry ||
                                                {}
                                            ).map(([country, count]) => (
                                              <div
                                                key={country}
                                                className="flex justify-between items-center p-2 sm:p-2 bg-white/60 dark:bg-neutral-800/60 rounded-lg"
                                              >
                                                <span className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 truncate flex-1 min-w-0 mr-2">
                                                  {country}
                                                </span>
                                                <Badge
                                                  variant="outline"
                                                  className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 shrink-0"
                                                >
                                                  {count}
                                                </Badge>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        {/* By Number Type */}
                                        <div>
                                          <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-gray-100 mb-2 sm:mb-3">
                                            By Number Type
                                          </h4>
                                          <div className="space-y-1.5 sm:space-y-2">
                                            <div className="flex justify-between items-center p-2 sm:p-2 bg-white/60 dark:bg-neutral-800/60 rounded-lg">
                                              <span className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
                                                Local
                                              </span>
                                              <Badge
                                                variant="outline"
                                                className="text-xs sm:text-sm text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 shrink-0"
                                              >
                                                {phoneNumberStatistics
                                                  ?.byNumberType?.local || 0}
                                              </Badge>
                                            </div>
                                            <div className="flex justify-between items-center p-2 sm:p-2 bg-white/60 dark:bg-neutral-800/60 rounded-lg">
                                              <span className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
                                                Toll-Free
                                              </span>
                                              <Badge
                                                variant="outline"
                                                className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 shrink-0"
                                              >
                                                {phoneNumberStatistics
                                                  ?.byNumberType?.[
                                                  'toll-free'
                                                ] || 0}
                                              </Badge>
                                            </div>
                                            <div className="flex justify-between items-center p-2 sm:p-2 bg-white/60 dark:bg-neutral-800/60 rounded-lg">
                                              <span className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
                                                Mobile
                                              </span>
                                              <Badge
                                                variant="outline"
                                                className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 shrink-0"
                                              >
                                                {phoneNumberStatistics
                                                  ?.byNumberType?.mobile || 0}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Most Used Numbers */}
                                        <div>
                                          <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-gray-100 mb-2 sm:mb-3">
                                            Most Used Numbers
                                          </h4>
                                          <div className="space-y-1.5 sm:space-y-2 max-h-40 sm:max-h-40 overflow-y-auto">
                                            {phoneNumberStatistics?.mostUsedNumbers
                                              ?.slice(0, 5)
                                              .map((number, index) => (
                                                <div
                                                  key={number.id}
                                                  className="flex justify-between items-start sm:items-center gap-2 p-2 sm:p-2 bg-white/60 dark:bg-neutral-800/60 rounded-lg"
                                                >
                                                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                                                    <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-gray-500 shrink-0">
                                                      #{index + 1}
                                                    </span>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                      <span className="text-xs sm:text-sm text-slate-900 dark:text-gray-100 truncate">
                                                        {number.friendlyName ||
                                                          number.phoneNumber}
                                                      </span>
                                                      <span className="text-xs text-slate-500 dark:text-gray-500 truncate">
                                                        {number.code}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <Badge
                                                      variant="outline"
                                                      className="text-xs text-slate-600 dark:text-gray-400 dark:border-neutral-700 whitespace-nowrap"
                                                    >
                                                      {
                                                        number.totalCallsReceived
                                                      }{' '}
                                                      calls
                                                    </Badge>
                                                    <Badge
                                                      variant="outline"
                                                      className="text-xs text-slate-600 dark:text-gray-400 dark:border-neutral-700 whitespace-nowrap"
                                                    >
                                                      {number.totalSmsReceived}{' '}
                                                      SMS
                                                    </Badge>
                                                  </div>
                                                </div>
                                              ))}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ) : (
                                  <div className="text-center py-6 sm:py-8">
                                    <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 dark:text-neutral-500 mx-auto mb-3 sm:mb-4" />
                                    <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400">
                                      No statistics available
                                    </p>
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </>
                    )}
                    {/* Table Header - Desktop Only */}
                    <div className="hidden md:block bg-slate-50 dark:bg-neutral-800 rounded-xl p-4 border border-slate-200 dark:border-neutral-700 mb-4">
                      <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-slate-700 dark:text-gray-300">
                        <div className="col-span-3">Phone Number</div>
                        <div className="col-span-2">Assigned Source</div>
                        <div className="col-span-2">Capabilities</div>
                        <div className="col-span-1">Calls</div>
                        <div className="col-span-1">SMS</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1">Actions</div>
                      </div>
                    </div>

                    {/* Phone Numbers List */}
                    <div className="space-y-2">
                      {phoneNumberLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loading size="lg" />
                        </div>
                      ) : phoneNumberError ? (
                        <div className="text-center py-12">
                          <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
                          <p className="text-red-600 dark:text-red-400 mb-4">
                            {phoneNumberError}
                          </p>
                          <Button
                            onClick={() => fetchPhoneNumberData()}
                            variant="outline"
                            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Try Again
                          </Button>
                        </div>
                      ) : phoneNumberData.length === 0 ? (
                        <div className="text-center py-12">
                          <Phone className="w-12 h-12 text-slate-400 dark:text-neutral-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-2">
                            No Phone Numbers
                          </h3>
                          <p className="text-slate-600 dark:text-gray-400 mb-6">
                            No phone numbers found for the selected date range
                          </p>
                        </div>
                      ) : (
                        phoneNumberData.map(phoneNumber => (
                          <div
                            key={phoneNumber._id}
                            className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-slate-100 dark:border-neutral-700 hover:border-[#53a533]/20 hover:shadow-md transition-all duration-200"
                          >
                            {/* Desktop Table View */}
                            <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                              {/* Phone Number */}
                              <div className="col-span-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-[#53a533]/10 dark:bg-[#53a533]/20 rounded-lg flex items-center justify-center">
                                    <Phone className="w-4 h-4 text-[#4a9430] dark:text-[#53a533]" />
                                  </div>
                                  <div>
                                    <p className="font-mono font-semibold text-slate-900 dark:text-gray-100">
                                      {phoneNumber.friendlyName ||
                                        phoneNumber.numberType}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-gray-400">
                                      {phoneNumber.formattedPhoneNumber}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Assigned Source */}
                              <div className="col-span-2">
                                {phoneNumber.assignedSource ? (
                                  <div>
                                    <p className="font-medium text-slate-900 dark:text-gray-100">
                                      {phoneNumber.assignedSource}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-gray-400">
                                      Assigned
                                    </p>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-slate-400 dark:text-gray-500 italic">
                                      Unassigned
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-gray-400">
                                      Available
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Capabilities */}
                              <div className="col-span-2">
                                <div className="flex flex-wrap gap-1">
                                  {phoneNumber.capabilities.voice && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                                    >
                                      Voice
                                    </Badge>
                                  )}
                                  {phoneNumber.capabilities.sms && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                    >
                                      SMS
                                    </Badge>
                                  )}
                                  {phoneNumber.capabilities.mms && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                                    >
                                      MMS
                                    </Badge>
                                  )}
                                  {phoneNumber.capabilities.fax && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                                    >
                                      Fax
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Calls */}
                              <div className="col-span-1">
                                <p className="font-semibold text-slate-900 dark:text-gray-100">
                                  {phoneNumber.totalCallsReceived || 0}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-gray-400">total</p>
                              </div>

                              {/* SMS */}
                              <div className="col-span-1">
                                <p className="font-semibold text-slate-900 dark:text-gray-100">
                                  {phoneNumber.totalSmsReceived || 0}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-gray-400">total</p>
                              </div>

                              {/* Status */}
                              <div className="col-span-2">
                                <Badge
                                  variant="outline"
                                  className={`${
                                    phoneNumber.status === 'active'
                                      ? 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                                      : phoneNumber.status === 'assigned'
                                        ? 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                                        : phoneNumber.status === 'inactive'
                                          ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                          : 'text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                                  }`}
                                >
                                  {phoneNumber.status === 'assigned' &&
                                  phoneNumber.assignedSource
                                    ? 'Assigned'
                                    : phoneNumber.status}
                                </Badge>
                              </div>

                              {/* Actions */}
                              <div className="col-span-1">
                                <div className="flex items-center justify-end">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-8 h-8 p-0 text-slate-500 dark:text-gray-400 hover:text-[#4a9430] dark:hover:text-[#53a533] hover:bg-[#53a533]/5 dark:hover:bg-[#53a533]/10"
                                        title="More Options"
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handlePhoneNumberView(phoneNumber)
                                        }
                                        className="cursor-pointer"
                                      >
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        View
                                      </DropdownMenuItem>
                                      {(checkPermission('MOD041', 'edit') ||
                                        checkPermission('MOD042', 'edit')) && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handlePhoneNumberEdit(phoneNumber)
                                          }
                                          className="cursor-pointer"
                                        >
                                          <Edit className="w-4 h-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                      )}
                                      {(((checkPermission('MOD041', 'assign') ||
                                        checkPermission('MOD042', 'assign')) &&
                                        !phoneNumber.assignedSource) ||
                                        ((checkPermission(
                                          'MOD041',
                                          'release'
                                        ) ||
                                          checkPermission(
                                            'MOD042',
                                            'release'
                                          )) &&
                                          phoneNumber.assignedSource)) && (
                                        <DropdownMenuItem
                                          onClick={() => {
                                            if (phoneNumber.assignedSource) {
                                              handleReleaseSourceClick(
                                                phoneNumber
                                              )
                                            } else {
                                              setSelectedPhoneNumberForAssignment(
                                                phoneNumber
                                              )
                                              setSelectedAssignmentSource(null)
                                              setAssignError(null)
                                              setAssignmentSourceSearchQuery('')
                                              setAssignToSourceModalOpen(true)
                                              fetchAssignmentSources()
                                            }
                                          }}
                                          className={`cursor-pointer ${
                                            phoneNumber.assignedSource
                                              ? 'text-orange-600 focus:text-orange-600'
                                              : 'text-blue-600 focus:text-blue-600'
                                          }`}
                                        >
                                          {phoneNumber.assignedSource ? (
                                            <>
                                              <Unlink className="w-4 h-4 mr-2" />
                                              Release
                                            </>
                                          ) : (
                                            <>
                                              <Link className="w-4 h-4 mr-2" />
                                              Assign
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                      )}
                                      {(checkPermission('MOD041', 'delete') ||
                                        checkPermission(
                                          'MOD042',
                                          'delete'
                                        )) && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleDeletePhoneNumber(phoneNumber)
                                          }
                                          className="cursor-pointer text-red-600 focus:text-red-600"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-3">
                              {/* Phone Number */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#53a533]/10 dark:bg-[#53a533]/20 rounded-lg flex items-center justify-center shrink-0">
                                  <Phone className="w-5 h-5 text-[#4a9430] dark:text-[#53a533]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-mono font-semibold text-base text-slate-900 dark:text-gray-100 truncate">
                                    {phoneNumber.friendlyName ||
                                      phoneNumber.numberType}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
                                    {phoneNumber.formattedPhoneNumber}
                                  </p>
                                </div>
                                <div className="shrink-0">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-8 h-8 p-0 text-slate-500 dark:text-gray-400 hover:text-[#4a9430] dark:hover:text-[#53a533] hover:bg-[#53a533]/5 dark:hover:bg-[#53a533]/10"
                                        title="More Options"
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handlePhoneNumberView(phoneNumber)
                                        }
                                        className="cursor-pointer"
                                      >
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        View
                                      </DropdownMenuItem>
                                      {(checkPermission('MOD041', 'edit') ||
                                        checkPermission('MOD042', 'edit')) && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handlePhoneNumberEdit(phoneNumber)
                                          }
                                          className="cursor-pointer"
                                        >
                                          <Edit className="w-4 h-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                      )}
                                      {((checkPermission('MOD041', 'assign') ||
                                        checkPermission(
                                          'MOD042',
                                          'assign'
                                        )) ||
                                        (phoneNumber.assignedSource &&
                                          (checkPermission('MOD041', 'release') ||
                                            checkPermission(
                                              'MOD042',
                                              'release'
                                            ))) &&
                                          phoneNumber.assignedSource) && (
                                        <DropdownMenuItem
                                          onClick={() => {
                                            if (phoneNumber.assignedSource) {
                                              handleReleaseSourceClick(
                                                phoneNumber
                                              )
                                            } else {
                                              setSelectedPhoneNumberForAssignment(
                                                phoneNumber
                                              )
                                              setSelectedAssignmentSource(null)
                                              setAssignError(null)
                                              setAssignmentSourceSearchQuery('')
                                              setAssignToSourceModalOpen(true)
                                              fetchAssignmentSources()
                                            }
                                          }}
                                          className={`cursor-pointer ${
                                            phoneNumber.assignedSource
                                              ? 'text-orange-600 focus:text-orange-600'
                                              : 'text-blue-600 focus:text-blue-600'
                                          }`}
                                        >
                                          {phoneNumber.assignedSource ? (
                                            <>
                                              <Unlink className="w-4 h-4 mr-2" />
                                              Release
                                            </>
                                          ) : (
                                            <>
                                              <Link className="w-4 h-4 mr-2" />
                                              Assign
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                      )}
                                      {(checkPermission('MOD041', 'delete') ||
                                        checkPermission(
                                          'MOD042',
                                          'delete'
                                        )) && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleDeletePhoneNumber(phoneNumber)
                                          }
                                          className="cursor-pointer text-red-600 focus:text-red-600"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>

                              {/* Details Grid */}
                              <div className="grid grid-cols-2 gap-3">
                                {/* Assigned Source */}
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-gray-400 mb-1">
                                    Assigned Source
                                  </p>
                                  {phoneNumber.assignedSource ? (
                                    <p className="text-sm font-medium text-slate-900 dark:text-gray-100">
                                      {phoneNumber.assignedSource}
                                    </p>
                                  ) : (
                                    <p className="text-sm text-slate-400 dark:text-gray-500 italic">
                                      Unassigned
                                    </p>
                                  )}
                                </div>

                                {/* Status */}
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-gray-400 mb-1">
                                    Status
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      phoneNumber.status === 'active'
                                        ? 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                                        : phoneNumber.status === 'assigned'
                                          ? 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                                          : phoneNumber.status === 'inactive'
                                            ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                            : 'text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                                    }`}
                                  >
                                    {phoneNumber.status === 'assigned' &&
                                    phoneNumber.assignedSource
                                      ? 'Assigned'
                                      : phoneNumber.status}
                                  </Badge>
                                </div>

                                {/* Calls */}
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-gray-400 mb-1">
                                    Calls
                                  </p>
                                  <p className="text-sm font-semibold text-slate-900 dark:text-gray-100">
                                    {phoneNumber.totalCallsReceived || 0}
                                  </p>
                                </div>

                                {/* SMS */}
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-gray-400 mb-1">
                                    SMS
                                  </p>
                                  <p className="text-sm font-semibold text-slate-900 dark:text-gray-100">
                                    {phoneNumber.totalSmsReceived || 0}
                                  </p>
                                </div>
                              </div>

                              {/* Capabilities */}
                              <div>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">
                                  Capabilities
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {phoneNumber.capabilities.voice && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                                    >
                                      Voice
                                    </Badge>
                                  )}
                                  {phoneNumber.capabilities.sms && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                    >
                                      SMS
                                    </Badge>
                                  )}
                                  {phoneNumber.capabilities.mms && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                                    >
                                      MMS
                                    </Badge>
                                  )}
                                  {phoneNumber.capabilities.fax && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                                    >
                                      Fax
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-6">
                      <p className="text-sm text-slate-600 dark:text-gray-400">
                        Showing {phoneNumberData.length} of{' '}
                        {phoneNumberPagination.total} numbers
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={phoneNumberPagination.current <= 1}
                          onClick={handlePhoneNumberPreviousPage}
                          className="dark:border-neutral-700 dark:hover:bg-neutral-800"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>

                        {/* Page Numbers */}
                        {Array.from(
                          { length: phoneNumberPagination.pages },
                          (_, i) => i + 1
                        ).map(page => (
                          <Button
                            key={page}
                            variant="outline"
                            size="sm"
                            onClick={() => handlePhoneNumberPageChange(page)}
                            className={
                              page === phoneNumberPagination.current
                                ? 'bg-[#53a533]/5 dark:bg-[#53a533]/20 text-[#4a9430] dark:text-[#53a533] border-[#53a533]/20 dark:border-[#53a533]/30'
                                : 'dark:border-neutral-700 dark:hover:bg-neutral-800'
                            }
                          >
                            {page}
                          </Button>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            phoneNumberPagination.current >=
                            phoneNumberPagination.pages
                          }
                          onClick={handlePhoneNumberNextPage}
                          className="dark:border-neutral-700 dark:hover:bg-neutral-800"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Buy New Numbers */}
              {checkPermission('MOD041', 'purchase') && (
                <Card className="border-0 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm rounded-2xl">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-start sm:items-center gap-3 sm:space-x-3 mb-6 sm:mb-8">
                      <div className="hidden sm:flex w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl sm:rounded-2xl items-center justify-center shrink-0">
                        <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-gray-100 break-words">
                          Purchase New Phone Numbers
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 mt-1">
                          Add dedicated tracking numbers for your marketing
                          campaigns
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Number Selection */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-4">
                            Search Filters
                          </h3>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Country */}
                              <div>
                                <Label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                                  Country
                                </Label>
                                <Select
                                  value={purchaseSectionFilters.country}
                                  onValueChange={value =>
                                    setPurchaseSectionFilters(prev => ({
                                      ...prev,
                                      country: value,
                                      // Reset number type to all if country is not AU and current type is mobile
                                      numberType:
                                        value !== 'AU' &&
                                        prev.numberType === 'mobile'
                                          ? 'all'
                                          : prev.numberType,
                                    }))
                                  }
                                >
                                  <SelectTrigger className="text-sm dark:bg-neutral-800 dark:border-neutral-700">
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="US">
                                      United States (US)
                                    </SelectItem>
                                    <SelectItem value="CA">
                                      Canada (CA)
                                    </SelectItem>
                                    <SelectItem value="AU">
                                      Australia (AU)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Locality */}
                              <div>
                                <Label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                                  Locality
                                </Label>
                                <Input
                                  value={purchaseSectionFilters.locality}
                                  onChange={e =>
                                    setPurchaseSectionFilters(prev => ({
                                      ...prev,
                                      locality: e.target.value,
                                    }))
                                  }
                                  placeholder="e.g., New York"
                                  className="text-sm dark:bg-neutral-800 dark:border-neutral-700"
                                />
                              </div>

                              {/* Area Code */}
                              <div>
                                <Label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                                  Area Code
                                </Label>
                                <Input
                                  value={purchaseSectionFilters.areaCode}
                                  onChange={e =>
                                    setPurchaseSectionFilters(prev => ({
                                      ...prev,
                                      areaCode: e.target.value,
                                    }))
                                  }
                                  placeholder="e.g., 212"
                                  className="text-sm dark:bg-neutral-800 dark:border-neutral-700"
                                />
                              </div>

                              {/* Number Type */}
                              <div>
                                <Label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                                  Number Type
                                </Label>
                                <Select
                                  value={purchaseSectionFilters.numberType}
                                  onValueChange={value =>
                                    setPurchaseSectionFilters(prev => ({
                                      ...prev,
                                      numberType: value,
                                    }))
                                  }
                                >
                                  <SelectTrigger className="text-sm dark:bg-neutral-800 dark:border-neutral-700">
                                    <SelectValue placeholder="All number types" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="local">Local</SelectItem>
                                    <SelectItem value="toll-free">
                                      Toll-free
                                    </SelectItem>
                                    <SelectItem
                                      value="mobile"
                                      disabled={
                                        purchaseSectionFilters.country !== 'AU'
                                      }
                                    >
                                      Mobile{' '}
                                      {purchaseSectionFilters.country !== 'AU'
                                        ? '(AU only)'
                                        : ''}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Contains */}
                              <div>
                                <Label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                                  Contains
                                </Label>
                                <Input
                                  value={purchaseSectionFilters.contains}
                                  onChange={e =>
                                    setPurchaseSectionFilters(prev => ({
                                      ...prev,
                                      contains: e.target.value,
                                    }))
                                  }
                                  placeholder="e.g., 555"
                                  className="text-sm dark:bg-neutral-800 dark:border-neutral-700"
                                />
                              </div>

                              {/* Limit */}
                              <div>
                                <Label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                                  Limit
                                </Label>
                                <Select
                                  value={purchaseSectionFilters.limit.toString()}
                                  onValueChange={value =>
                                    setPurchaseSectionFilters(prev => ({
                                      ...prev,
                                      limit: parseInt(value),
                                    }))
                                  }
                                >
                                  <SelectTrigger className="text-sm dark:bg-neutral-800 dark:border-neutral-700">
                                    <SelectValue placeholder="Select limit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="40">40</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Capabilities */}
                            <div className="p-4 bg-[#53a533]/5 dark:bg-[#53a533]/10 rounded-xl border border-[#53a533]/20 dark:border-[#53a533]/30">
                              <h4 className="font-semibold text-[#1f3f15] dark:text-[#53a533] mb-2">
                                Number Features
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="purchase-sms-enabled"
                                    checked={purchaseSectionFilters.smsEnabled}
                                    onChange={e =>
                                      setPurchaseSectionFilters(prev => ({
                                        ...prev,
                                        smsEnabled: e.target.checked,
                                      }))
                                    }
                                    className="w-4 h-4 text-[#4a9430] dark:text-[#53a533] rounded"
                                  />
                                  <Label
                                    htmlFor="purchase-sms-enabled"
                                    className="text-[#3d7a28] dark:text-[#53a533] cursor-pointer"
                                  >
                                    SMS
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="purchase-mms-enabled"
                                    checked={purchaseSectionFilters.mmsEnabled}
                                    onChange={e =>
                                      setPurchaseSectionFilters(prev => ({
                                        ...prev,
                                        mmsEnabled: e.target.checked,
                                      }))
                                    }
                                    className="w-4 h-4 text-[#4a9430] dark:text-[#53a533] rounded"
                                  />
                                  <Label
                                    htmlFor="purchase-mms-enabled"
                                    className="text-[#3d7a28] dark:text-[#53a533] cursor-pointer"
                                  >
                                    MMS
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="purchase-voice-enabled"
                                    checked={
                                      purchaseSectionFilters.voiceEnabled
                                    }
                                    onChange={e =>
                                      setPurchaseSectionFilters(prev => ({
                                        ...prev,
                                        voiceEnabled: e.target.checked,
                                      }))
                                    }
                                    className="w-4 h-4 text-[#4a9430] dark:text-[#53a533] rounded"
                                  />
                                  <Label
                                    htmlFor="purchase-voice-enabled"
                                    className="text-[#3d7a28] dark:text-[#53a533] cursor-pointer"
                                  >
                                    Voice
                                  </Label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Selected Number Display or Placeholder */}
                        {selectedNumberForPurchaseSection ? (
                          <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 shadow-sm">
                            <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-3">
                              Selected Number
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-gray-400">
                                  Phone Number:
                                </span>
                                <span className="font-medium text-slate-900 dark:text-gray-100">
                                  {selectedNumberForPurchaseSection.phoneNumber}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-gray-400">Type:</span>
                                <span className="font-medium text-slate-900 dark:text-gray-100 capitalize">
                                  {selectedNumberForPurchaseSection.numberType}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-gray-400">
                                  Location:
                                </span>
                                <span className="font-medium text-slate-900 dark:text-gray-100">
                                  {selectedNumberForPurchaseSection.locality
                                    ? `${selectedNumberForPurchaseSection.locality}, ${selectedNumberForPurchaseSection.region}`
                                    : selectedNumberForPurchaseSection.region}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-gray-400">Price:</span>
                                <span className="font-medium text-slate-900 dark:text-gray-100">
                                  $
                                  {
                                    selectedNumberForPurchaseSection.monthlyCharge
                                  }
                                  /month
                                </span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-3 block">
                                Number Purpose/Name
                              </label>
                              <Input
                                value={purchaseSectionFriendlyName}
                                onChange={e =>
                                  setPurchaseSectionFriendlyName(e.target.value)
                                }
                                placeholder="e.g., Google Emergency Line, Facebook Main"
                                className="px-4 py-3 border-slate-200 dark:border-neutral-700 dark:bg-neutral-900 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-[#53a533]/50/20 focus:border-[#53a533]/30 transition-all duration-200"
                              />
                            </div>
                            {/* Error Display */}
                            {purchaseSectionPurchaseError && (
                              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">
                                  {purchaseSectionPurchaseError}
                                </p>
                              </div>
                            )}

                            <div className="mt-4 flex justify-between space-x-2">
                              <div>
                                <h4 className="font-semibold text-slate-900 dark:text-gray-100">
                                  Ready to purchase?
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-gray-400">
                                  Your new number will be active within 5
                                  minutes
                                </p>
                              </div>
                              <Button
                                onClick={purchasePhoneNumberFromSection}
                                disabled={purchaseSectionPurchasing}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg rounded-xl px-8"
                              >
                                {purchaseSectionPurchasing
                                  ? 'Purchasing...'
                                  : 'Purchase Number'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 shadow-sm">
                            <div className="text-center py-6">
                              <Phone className="w-12 h-12 text-slate-400 dark:text-neutral-500 mx-auto mb-3" />
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-2">
                                Select a Number to Purchase
                              </h3>
                              <p className="text-slate-600 dark:text-gray-400 text-sm">
                                Choose a phone number from the available options
                                to see details and proceed with purchase.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Available Numbers */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-4">
                            Available Numbers in{' '}
                            {purchaseSectionFilters.areaCode}
                          </h3>
                          <div className="space-y-2 max-h-80 overflow-y-auto">
                            {purchaseSectionLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <Loading size="lg" />
                              </div>
                            ) : purchaseSectionError ? (
                              <div className="text-center py-8">
                                <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
                                <p className="text-red-600 dark:text-red-400 mb-4">
                                  {purchaseSectionError}
                                </p>
                                <Button
                                  onClick={fetchPurchaseSectionNumbers}
                                  variant="outline"
                                  className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  Try Again
                                </Button>
                              </div>
                            ) : purchaseSectionNumbers.length === 0 ? (
                              <div className="text-center py-8">
                                <Phone className="w-12 h-12 text-slate-400 dark:text-neutral-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-2">
                                  No Numbers Available
                                </h3>
                                <p className="text-slate-600 dark:text-gray-400 mb-6">
                                  No phone numbers found for area code{' '}
                                  {purchaseSectionFilters.areaCode}
                                </p>
                                <Button
                                  onClick={fetchPurchaseSectionNumbers}
                                  variant="outline"
                                  className="text-slate-600 dark:text-gray-400 border-slate-300 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800"
                                >
                                  Refresh
                                </Button>
                              </div>
                            ) : (
                              purchaseSectionNumbers.map((number, index) => (
                                <div
                                  key={number.phoneNumber}
                                  className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-lg border border-slate-100 dark:border-neutral-700 hover:border-[#53a533]/20 dark:hover:border-[#53a533]/30 hover:bg-[#53a533]/5/30 dark:hover:bg-[#53a533]/10 transition-all duration-200 cursor-pointer"
                                  onClick={() => {
                                    if (
                                      selectedNumberForPurchaseSection?.phoneNumber ===
                                      number.phoneNumber
                                    ) {
                                      setSelectedNumberForPurchaseSection(null)
                                    } else {
                                      setSelectedNumberForPurchaseSection(
                                        number
                                      )
                                    }
                                  }}
                                >
                                  <div>
                                    <span className="font-mono text-slate-900 dark:text-gray-100">
                                      {number.phoneNumber}
                                    </span>
                                    <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                                      {number.locality
                                        ? `${number.locality}, ${number.region}`
                                        : number.region}{' '}
                                      • {number.numberType}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                      ${number.monthlyCharge}/month
                                    </span>
                                    <Button
                                      size="sm"
                                      className={
                                        selectedNumberForPurchaseSection?.phoneNumber ===
                                        number.phoneNumber
                                          ? 'bg-red-500 hover:bg-red-600 text-white'
                                          : 'bg-[#53a533] hover:bg-[#4a9430] text-white'
                                      }
                                      onClick={e => {
                                        e.stopPropagation()
                                        if (
                                          selectedNumberForPurchaseSection?.phoneNumber ===
                                          number.phoneNumber
                                        ) {
                                          setSelectedNumberForPurchaseSection(
                                            null
                                          )
                                        } else {
                                          setSelectedNumberForPurchaseSection(
                                            number
                                          )
                                        }
                                      }}
                                    >
                                      {selectedNumberForPurchaseSection?.phoneNumber ===
                                      number.phoneNumber
                                        ? 'Unselect'
                                        : 'Select'}
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="mt-4 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-gray-400">
                              <strong>Note:</strong> Available numbers update
                              automatically when you change the search filters.
                            </p>
                          </div>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                          <h4 className="font-semibold text-green-900 dark:text-green-400 mb-2">
                            Pricing Information
                          </h4>
                          <div className="space-y-2 text-sm text-green-800 dark:text-green-300">
                            <div className="flex justify-between">
                              <span>Monthly Number Fee:</span>
                              <span className="font-semibold">
                                $
                                {selectedNumberForPurchaseSection?.monthlyCharge
                                  ? selectedNumberForPurchaseSection?.monthlyCharge?.toFixed(
                                      2
                                    )
                                  : '0.00'}
                              </span>
                            </div>
                            {/*<div className="flex justify-between">
                              <span>Per-minute Rate:</span>
                              <span className="font-semibold">$0.05</span>
                            </div>*/}
                            <div className="flex justify-between">
                              <span>Setup Fee:</span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                FREE
                              </span>
                            </div>
                            <hr className="border-green-300 dark:border-green-800 my-2" />
                            <div className="flex justify-between font-semibold">
                              <span>Total Monthly:</span>
                              {selectedNumberForPurchaseSection?.monthlyCharge ? (
                                <span>
                                  $
                                  {selectedNumberForPurchaseSection?.monthlyCharge?.toFixed(
                                    2
                                  )}{' '}
                                  + usage
                                </span>
                              ) : (
                                <span>$0</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsDialerOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#53a533] to-[#53a533] hover:from-[#4a9430] hover:to-[#4a9430] text-white shadow-2xl hover:shadow-3xl transition-all duration-300 z-50"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Unblock Confirmation Dialog */}
      <AlertDialog open={unblockDialogOpen} onOpenChange={setUnblockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock Number</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unblock{' '}
              <strong>
                {ruleToDelete?.phoneNumber
                  ? (() => {
                      const cleaned = ruleToDelete.phoneNumber.replace(
                        /\D/g,
                        ''
                      )
                      if (cleaned.length === 11 && cleaned.startsWith('1')) {
                        return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
                      } else if (cleaned.length === 10) {
                        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
                      }
                      return ruleToDelete.phoneNumber
                    })()
                  : 'this pattern block'}
              </strong>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Unblocking...' : 'Unblock'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Blocking Rule Dialog */}
      <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Edit className="w-6 h-6 mr-3 text-blue-600" />
              Edit Blocking Rule
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Blocking Type */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Blocking Type
              </Label>
              <Select
                value={editFormData.blockingType}
                onValueChange={(value: 'number' | 'pattern') =>
                  handleEditFormInputChange('blockingType', value)
                }
              >
                <SelectTrigger className="px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="pattern">Pattern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number (conditional) */}
            {editFormData.blockingType === 'number' && (
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Phone Number
                </Label>
                <Input
                  value={editFormData.phoneNumber}
                  onChange={e =>
                    handleEditFormInputChange('phoneNumber', e.target.value)
                  }
                  placeholder="(777) 888-9999"
                  maxLength={14}
                  className={`px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 ${editErrors.phoneNumber ? 'border-red-500' : ''}`}
                />
                <p className="text-slate-500 text-xs mt-1">
                  Enter 10-digit phone number in format (777) 888-9999
                </p>
                {editErrors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {editErrors.phoneNumber}
                  </p>
                )}
              </div>
            )}

            {/* Pattern (conditional) */}
            {editFormData.blockingType === 'pattern' && (
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Pattern (Regex)
                </Label>
                <Input
                  value={editFormData.pattern}
                  onChange={e =>
                    handleEditFormInputChange('pattern', e.target.value)
                  }
                  placeholder="^\\+1800.*"
                  className={`px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 ${editErrors.pattern ? 'border-red-500' : ''}`}
                />
                {editErrors.pattern && (
                  <p className="text-red-500 text-xs mt-1">
                    {editErrors.pattern}
                  </p>
                )}
              </div>
            )}

            {/* Block Type */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Block Type
              </Label>
              <Select
                value={editFormData.blockType}
                onValueChange={(value: 'permanent' | 'temporary') =>
                  handleEditFormInputChange('blockType', value)
                }
              >
                <SelectTrigger className="px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiration Date (conditional) */}
            {editFormData.blockType === 'temporary' && (
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Expiration Date
                </Label>
                <Input
                  type="datetime-local"
                  value={editFormData.expiresAt}
                  onChange={e =>
                    handleEditFormInputChange('expiresAt', e.target.value)
                  }
                  className={`px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 ${editErrors.expiresAt ? 'border-red-500' : ''}`}
                />
                {editErrors.expiresAt && (
                  <p className="text-red-500 text-xs mt-1">
                    {editErrors.expiresAt}
                  </p>
                )}
              </div>
            )}

            {/* Block Reason */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Block Reason
              </Label>
              <Select
                value={editFormData.reason}
                onValueChange={value =>
                  handleEditFormInputChange('reason', value)
                }
              >
                <SelectTrigger className="px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="telemarketing">Telemarketing</SelectItem>
                  <SelectItem value="wrong_number">Wrong Number</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source Selection Type */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Source Selection
              </Label>
              <Select
                value={editFormData.sourceSelectionType}
                onValueChange={(value: 'all' | 'specific') =>
                  handleEditFormInputChange('sourceSelectionType', value)
                }
              >
                <SelectTrigger className="px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="specific">Specific Sources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source Codes (conditional) */}
            {editFormData.sourceSelectionType === 'specific' && (
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Source Codes
                </Label>
                <Popover
                  open={sourceCodesOpen}
                  onOpenChange={handleSourceCodesOpenChange}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={sourceCodesOpen}
                      className={`w-full justify-between ${editErrors.sourceCodes ? 'border-red-500' : ''}`}
                    >
                      {editFormData.sourceCodes.length > 0
                        ? `${editFormData.sourceCodes.length} source(s) selected`
                        : 'Select source codes...'}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search source codes..."
                        value={sourceSearchQuery}
                        onValueChange={setSourceSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {sourcesLoading
                            ? 'Loading...'
                            : 'No source codes found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {sources.map(source => (
                            <CommandItem
                              key={source.id}
                              value={source.code}
                              onSelect={() =>
                                handleEditSourceCodeToggle(source.code)
                              }
                            >
                              <CheckCircle2
                                className={`mr-2 h-4 w-4 ${
                                  editFormData.sourceCodes.includes(source.code)
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                }`}
                              />
                              {source.code} - {source.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {editFormData.sourceCodes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {editFormData.sourceCodes.map(code => (
                      <Badge key={code} variant="outline" className="text-xs">
                        {code}
                        <XCircle
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => handleEditSourceCodeToggle(code)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
                {editErrors.sourceCodes && (
                  <p className="text-red-500 text-xs mt-1">
                    {editErrors.sourceCodes}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Notes (Optional)
              </Label>
              <Textarea
                value={editFormData.notes}
                onChange={e =>
                  handleEditFormInputChange('notes', e.target.value)
                }
                placeholder="Additional notes about this blocking rule..."
                className="px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={handleEditCancel}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateBlockingRule}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {updating ? 'Updating...' : 'Update Rule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Blocked List Dialog */}
      <Dialog
        open={importModalOpen}
        onOpenChange={() => setImportModalOpen(false)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Upload className="w-6 h-6 mr-3 text-blue-600" />
              Import Blocked List
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Format Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Format
              </Label>
              <Select
                value={importFormData.format}
                onValueChange={(value: 'json' | 'csv') =>
                  handleImportFormInputChange('format', value)
                }
              >
                <SelectTrigger className="px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source Selection Type */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Source Selection
              </Label>
              <Select
                value={importFormData.sourceSelectionType}
                onValueChange={(value: 'all' | 'specific') =>
                  handleImportFormInputChange('sourceSelectionType', value)
                }
              >
                <SelectTrigger className="px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="specific">Specific Sources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source Codes (conditional) */}
            {importFormData.sourceSelectionType === 'specific' && (
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Source Codes
                </Label>
                <Popover
                  open={sourceCodesOpen}
                  onOpenChange={handleSourceCodesOpenChange}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={sourceCodesOpen}
                      className={`w-full justify-between ${importErrors.sourceCodes ? 'border-red-500' : ''}`}
                    >
                      {importFormData.sourceCodes.length > 0
                        ? `${importFormData.sourceCodes.length} source(s) selected`
                        : 'Select source codes...'}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search source codes..."
                        value={sourceSearchQuery}
                        onValueChange={setSourceSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {sourcesLoading
                            ? 'Loading...'
                            : 'No source codes found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {sources.map(source => (
                            <CommandItem
                              key={source.id}
                              value={source.code}
                              onSelect={() =>
                                handleImportSourceCodeToggle(source.code)
                              }
                            >
                              <CheckCircle2
                                className={`mr-2 h-4 w-4 ${
                                  importFormData.sourceCodes.includes(
                                    source.code
                                  )
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                }`}
                              />
                              {source.code} - {source.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {importFormData.sourceCodes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {importFormData.sourceCodes.map(code => (
                      <Badge key={code} variant="outline" className="text-xs">
                        {code}
                        <XCircle
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => handleImportSourceCodeToggle(code)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
                {importErrors.sourceCodes && (
                  <p className="text-red-500 text-xs mt-1">
                    {importErrors.sourceCodes}
                  </p>
                )}
              </div>
            )}

            {/* Rules File Upload (conditional) */}
            {importFormData.format === 'json' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Rules File (JSON)
                  </Label>
                  <button
                    type="button"
                    onClick={handleManualInputToggle}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Pencil className="w-4 h-4" />
                    Manual Input
                  </button>
                </div>
                {manualInputMode ? (
                  <div className="space-y-2">
                    <Textarea
                      value={manualRulesContent}
                      onChange={e => setManualRulesContent(e.target.value)}
                      placeholder="Enter JSON rules manually..."
                      className="min-h-[200px] font-mono text-sm"
                    />
                    <p className="text-xs text-slate-500">
                      Enter JSON rules directly in the textarea above
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                    <input
                      type="file"
                      accept=".json"
                      onChange={e =>
                        handleImportFileUpload(
                          'rules',
                          e.target.files?.[0] || null
                        )
                      }
                      className="hidden"
                      id="rules-upload"
                    />
                    <label
                      htmlFor="rules-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="w-8 h-8 text-slate-400" />
                      <div className="text-sm text-slate-600">
                        {importFormData.rules ? (
                          <span className="text-blue-600 font-medium">
                            {importFormData.rules.name}
                          </span>
                        ) : (
                          'Click to upload JSON file'
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Select a JSON file containing blocking rules
                      </p>
                    </label>
                  </div>
                )}
                {importErrors.rules && (
                  <p className="text-red-500 text-xs mt-1">
                    {importErrors.rules}
                  </p>
                )}
              </div>
            )}

            {/* CSV File Upload (conditional) */}
            {importFormData.format === 'csv' && (
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  CSV File
                </Label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={e =>
                      handleImportFileUpload(
                        'csvContent',
                        e.target.files?.[0] || null
                      )
                    }
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="w-8 h-8 text-slate-400" />
                    <div className="text-sm text-slate-600">
                      {selectedCsvFileName ? (
                        <span className="text-blue-600 font-medium">
                          {selectedCsvFileName}
                        </span>
                      ) : (
                        'Click to upload CSV file'
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Select a CSV file containing blocked numbers
                    </p>
                  </label>
                </div>
                {importErrors.csvContent && (
                  <p className="text-red-500 text-xs mt-1">
                    {importErrors.csvContent}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={handleImportCancel}
                disabled={importing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImportSubmit}
                disabled={importing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {importing ? 'Importing...' : 'Import Rules'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Results Dialog */}
      <Dialog
        open={resultsModalOpen}
        onOpenChange={open => {
          setResultsModalOpen(open)
          if (!open) {
            // Reset form when results modal is closed
            setImportFormData({
              format: 'csv',
              sourceSelectionType: 'all',
              sourceCodes: [],
              rules: null,
              csvContent: '',
            })
            setSelectedCsvFileName('')
            setImportErrors({})
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <CheckCircle2 className="w-6 h-6 mr-3 text-green-600" />
              Import Results
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {importResults && (
              <>
                {/* Results List */}
                {importResults.data?.results &&
                  importResults.data.results.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-4">
                        Detailed Results
                      </h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {importResults.data.results.map(
                          (result: any, index: number) => (
                            <div
                              key={index}
                              className={`p-4 rounded-xl border ${
                                result.success
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-red-50 border-red-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {result.success ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                  )}
                                  <div>
                                    <span className="font-mono text-sm font-medium text-slate-900">
                                      {result.phoneNumber}
                                    </span>
                                    {result.code && (
                                      <span className="ml-2 text-xs text-slate-500">
                                        ({result.code})
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {result.success ? (
                                    <Badge
                                      variant="outline"
                                      className="text-green-600 border-green-200"
                                    >
                                      Success
                                    </Badge>
                                  ) : (
                                    <div className="text-right">
                                      <Badge
                                        variant="outline"
                                        className="text-red-600 border-red-200 mb-1"
                                      >
                                        Failed
                                      </Badge>
                                      {result.error && (
                                        <p className="text-xs text-red-600 mt-1">
                                          {result.error}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setResultsModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Call Dialer Dialog */}
      <Dialog open={isDialerOpen} onOpenChange={setIsDialerOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Phone className="w-6 h-6 mr-3 text-[#53a533]/50" />
              Smart Dialer
            </DialogTitle>
          </DialogHeader>
          <CallDialer onClose={() => setIsDialerOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Export Format Selection Dialog */}
      <Dialog
        open={exportFormatDialogOpen}
        onOpenChange={setExportFormatDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Download className="w-6 h-6 mr-3 text-green-600" />
              Export Format
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-3 block">
                Choose export format
              </Label>
              <div className="space-y-3">
                <div
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedExportFormat === 'csv'
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedExportFormat('csv')}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        selectedExportFormat === 'csv'
                          ? 'border-green-500 bg-green-500'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedExportFormat === 'csv' && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        CSV Format
                      </div>
                      <div className="text-sm text-slate-600">
                        Comma-separated values, compatible with Excel
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedExportFormat === 'json'
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedExportFormat('json')}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        selectedExportFormat === 'json'
                          ? 'border-green-500 bg-green-500'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedExportFormat === 'json' && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        JSON Format
                      </div>
                      <div className="text-sm text-slate-600">
                        JavaScript Object Notation, structured data
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setExportFormatDialogOpen(false)}
              disabled={exporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExportConfirm}
              disabled={exporting}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              {exporting ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export {selectedExportFormat.toUpperCase()}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spam Protection View Modal */}
      <Dialog
        open={spamProtectionViewModalOpen}
        onOpenChange={setSpamProtectionViewModalOpen}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Shield className="w-6 h-6 mr-3 text-orange-600" />
              Spam Protection Rule Details
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {spamProtectionDetailLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loading size="lg" />
              </div>
            ) : (
              (detailedSpamProtectionRule || selectedSpamProtectionRule) && (
                <div className="space-y-6 py-4">
                  {/* Header Info */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {
                          (
                            detailedSpamProtectionRule ||
                            selectedSpamProtectionRule
                          )?.title
                        }
                      </h3>
                      <Badge
                        variant="outline"
                        className={`${
                          (
                            detailedSpamProtectionRule ||
                            selectedSpamProtectionRule
                          )?.status === 'active'
                            ? 'text-green-600 border-green-200 bg-green-50'
                            : (
                                  detailedSpamProtectionRule ||
                                  selectedSpamProtectionRule
                                )?.status === 'failed'
                              ? 'text-red-600 border-red-200 bg-red-50'
                              : 'text-yellow-600 border-yellow-200 bg-yellow-50'
                        }`}
                      >
                        {
                          (
                            detailedSpamProtectionRule ||
                            selectedSpamProtectionRule
                          )?.status
                        }
                      </Badge>
                      <Badge variant="outline" className="text-slate-600">
                        {
                          (
                            detailedSpamProtectionRule ||
                            selectedSpamProtectionRule
                          )?.code
                        }
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <p>
                        Created:{' '}
                        {new Date(
                          (
                            detailedSpamProtectionRule ||
                            selectedSpamProtectionRule
                          )?.createdAt || ''
                        ).toLocaleDateString()}
                      </p>
                      <p>
                        Updated:{' '}
                        {new Date(
                          (
                            detailedSpamProtectionRule ||
                            selectedSpamProtectionRule
                          )?.updatedAt || ''
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Protection Type
                        </Label>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <span className="font-mono text-sm">
                            {(
                              detailedSpamProtectionRule ||
                              selectedSpamProtectionRule
                            )?.protection === '{{dynamic}}'
                              ? 'Dynamic'
                              : (
                                  detailedSpamProtectionRule ||
                                  selectedSpamProtectionRule
                                )?.protection}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Source Selection
                        </Label>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm">
                            {(
                              detailedSpamProtectionRule ||
                              selectedSpamProtectionRule
                            )?.sourceSelectionType === 'all'
                              ? 'All Sources'
                              : 'Specific Sources'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Usage Count
                        </Label>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <span className="text-2xl font-bold text-slate-900">
                            {
                              (
                                detailedSpamProtectionRule ||
                                selectedSpamProtectionRule
                              )?.usageCount
                            }
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Voice ID
                        </Label>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <span className="font-mono text-sm">
                            {
                              (
                                detailedSpamProtectionRule ||
                                selectedSpamProtectionRule
                              )?.voiceId
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Greeting Message
                        </Label>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="font-mono text-sm text-slate-900 whitespace-pre-wrap">
                            {
                              (
                                detailedSpamProtectionRule ||
                                selectedSpamProtectionRule
                              )?.greeting
                            }
                          </p>
                        </div>
                      </div>

                      {((detailedSpamProtectionRule || selectedSpamProtectionRule)?.sourceCodes?.length ?? 0) > 0 && (
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">
                              Source Codes (
                              {
                                (
                                  detailedSpamProtectionRule ||
                                  selectedSpamProtectionRule
                                )?.sourceCodes.length
                              }
                              )
                            </Label>
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <div className="flex flex-wrap gap-2">
                                {(
                                  detailedSpamProtectionRule ||
                                  selectedSpamProtectionRule
                                )?.sourceCodes.map(code => (
                                  <Badge
                                    key={code}
                                    variant="outline"
                                    className="text-slate-600 border-slate-200"
                                  >
                                    {code}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                      {(
                        detailedSpamProtectionRule || selectedSpamProtectionRule
                      )?.processedAt && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-2 block">
                            Processed At
                          </Label>
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm">
                              {new Date(
                                (
                                  detailedSpamProtectionRule ||
                                  selectedSpamProtectionRule
                                )?.processedAt || ''
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Voice Settings */}
                  {detailedSpamProtectionRule?.voiceSettings && (
                    <div className="border-t pt-4">
                      <h4 className="text-lg font-semibold text-slate-900 mb-3">
                        Voice Settings
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700">
                              Stability
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                              {
                                detailedSpamProtectionRule.voiceSettings
                                  .stability
                              }
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${detailedSpamProtectionRule.voiceSettings.stability * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700">
                              Similarity Boost
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                              {
                                detailedSpamProtectionRule.voiceSettings
                                  .similarity_boost
                              }
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${detailedSpamProtectionRule.voiceSettings.similarity_boost * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700">
                              Style
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                              {detailedSpamProtectionRule.voiceSettings.style}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{
                                width: `${detailedSpamProtectionRule.voiceSettings.style * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">
                              Speaker Boost
                            </span>
                            <Badge
                              variant="outline"
                              className={
                                detailedSpamProtectionRule.voiceSettings
                                  .use_speaker_boost
                                  ? 'text-green-600 border-green-200 bg-green-50'
                                  : 'text-red-600 border-red-200 bg-red-50'
                              }
                            >
                              {detailedSpamProtectionRule.voiceSettings
                                .use_speaker_boost
                                ? 'Enabled'
                                : 'Disabled'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Processing Error */}
                  {(detailedSpamProtectionRule || selectedSpamProtectionRule)
                    ?.processingError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <Label className="text-sm font-medium text-red-700 mb-2 block">
                        Processing Error
                      </Label>
                      <p className="text-sm text-red-600 font-mono">
                        {
                          (
                            detailedSpamProtectionRule ||
                            selectedSpamProtectionRule
                          )?.processingError
                        }
                      </p>
                    </div>
                  )}

                  {/* Technical Details */}
                  <div className="border-t pt-4">
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">
                      Technical Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-600">
                          Rule ID:
                        </span>
                        <span className="ml-2 font-mono text-slate-900">
                          {
                            (
                              detailedSpamProtectionRule ||
                              selectedSpamProtectionRule
                            )?._id
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">
                          Tenant:
                        </span>
                        <span className="ml-2 text-slate-900">
                          {(() => {
                            const t = (detailedSpamProtectionRule || selectedSpamProtectionRule)?.tenantId
                            return typeof t === 'object' && t !== null ? t.name : (t ?? 'N/A')
                          })()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">
                          Created By:
                        </span>
                        <span className="ml-2 text-slate-900">
                          {
                            (
                              detailedSpamProtectionRule ||
                              selectedSpamProtectionRule
                            )?.createdBy.type
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">
                          By Tenant:
                        </span>
                        <span className="ml-2 text-slate-900">
                          {(() => {
                            const t = (detailedSpamProtectionRule || selectedSpamProtectionRule)?.byTenantId
                            return typeof t === 'object' && t !== null ? t.name : (t ?? 'N/A')
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <DialogFooter className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setSpamProtectionViewModalOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="outline"
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              onClick={handleSpamProtectionRegenerateAudio}
              disabled={spamProtectionRegenerating}
            >
              {spamProtectionRegenerating ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Voice
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="text-slate-600 hover:text-slate-900"
              onClick={() => {
                if (detailedSpamProtectionRule || selectedSpamProtectionRule) {
                  handleSpamProtectionEdit(
                    detailedSpamProtectionRule || selectedSpamProtectionRule!
                  )
                }
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Rule
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                if (detailedSpamProtectionRule || selectedSpamProtectionRule) {
                  handleSpamProtectionDelete(
                    detailedSpamProtectionRule || selectedSpamProtectionRule!
                  )
                }
              }}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Delete Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spam Protection Delete Confirmation Modal */}
      <AlertDialog
        open={spamProtectionDeleteModalOpen}
        onOpenChange={setSpamProtectionDeleteModalOpen}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-lg">
              <XCircle className="w-5 h-5 mr-2 text-red-600" />
              Delete Spam Protection Rule
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Are you sure you want to delete the spam protection rule "
              {spamProtectionToDelete?.title}"? This action cannot be undone and
              will permanently remove the rule from your system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex space-x-3">
            <AlertDialogCancel
              disabled={spamProtectionDeleting}
              onClick={() => setSpamProtectionDeleteModalOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSpamProtectionDelete}
              disabled={spamProtectionDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {spamProtectionDeleting ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Delete Rule
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Spam Protection Create Modal */}
      <Dialog
        open={spamProtectionCreateModalOpen}
        onOpenChange={setSpamProtectionCreateModalOpen}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              {spamProtectionToEdit ? (
                <>
                  <Edit className="w-6 h-6 mr-3 text-orange-600" />
                  Edit Spam Protection Rule
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6 mr-3 text-orange-600" />
                  Create Spam Protection Rule
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      Rule Title *
                    </Label>
                    <Input
                      value={spamProtectionCreateForm.title}
                      onChange={e =>
                        handleSpamProtectionCreateFormChange(
                          'title',
                          e.target.value
                        )
                      }
                      placeholder="e.g., Main Line Protection"
                      maxLength={200}
                      className={`px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 transition-all duration-200 ${spamProtectionCreateErrors.title ? 'border-red-500' : ''}`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <div>
                        {spamProtectionCreateErrors.title && (
                          <p className="text-red-500 text-xs">
                            {spamProtectionCreateErrors.title}
                          </p>
                        )}
                      </div>
                      <p
                        className={`text-xs ${spamProtectionCreateForm.title.length > 180 ? 'text-red-500' : 'text-slate-500'}`}
                      >
                        {spamProtectionCreateForm.title.length}/200
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      Protection Type *
                    </Label>
                    <Select
                      value={spamProtectionCreateForm.protection}
                      onValueChange={value =>
                        handleSpamProtectionCreateFormChange(
                          'protection',
                          value
                        )
                      }
                    >
                      <SelectTrigger className="px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="{{dynamic}}">Dynamic</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="7">7</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="9">9</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Greeting Message *
                  </Label>
                  <Textarea
                    value={spamProtectionCreateForm.greeting}
                    onChange={e =>
                      handleSpamProtectionCreateFormChange(
                        'greeting',
                        e.target.value
                      )
                    }
                    placeholder="e.g., Thank you for calling. To speak with our team, please press {{dynamic}}"
                    rows={3}
                    maxLength={1000}
                    className={`px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 transition-all duration-200 ${spamProtectionCreateErrors.greeting ? 'border-red-500' : ''}`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      {spamProtectionCreateErrors.greeting && (
                        <p className="text-red-500 text-xs">
                          {spamProtectionCreateErrors.greeting}
                        </p>
                      )}
                    </div>
                    <p
                      className={`text-xs ${spamProtectionCreateForm.greeting.length > 900 ? 'text-red-500' : 'text-slate-500'}`}
                    >
                      {spamProtectionCreateForm.greeting.length}/1000
                    </p>
                  </div>
                </div>
              </div>

              {/* Source Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Source Selection
                </h3>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Source Selection
                  </Label>
                  <Select
                    value={spamProtectionCreateForm.sourceSelectionType}
                    onValueChange={(value: 'all' | 'specific') =>
                      handleSpamProtectionCreateFormChange(
                        'sourceSelectionType',
                        value
                      )
                    }
                  >
                    <SelectTrigger className="px-4 py-3 border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 transition-all duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="specific">Specific Sources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Source Codes (conditional) */}
                {spamProtectionCreateForm.sourceSelectionType ===
                  'specific' && (
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      Source Codes
                    </Label>
                    <Popover
                      open={spamProtectionSourceCodesOpen}
                      onOpenChange={handleSpamProtectionSourceCodesOpenChange}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={spamProtectionSourceCodesOpen}
                          className={`w-full justify-between ${spamProtectionCreateErrors.sourceCodes ? 'border-red-500' : ''}`}
                        >
                          {spamProtectionCreateForm.sourceCodes.length > 0
                            ? `${spamProtectionCreateForm.sourceCodes.length} source(s) selected`
                            : 'Select source codes...'}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search source codes..."
                            value={spamProtectionSourceSearchQuery}
                            onValueChange={setSpamProtectionSourceSearchQuery}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {sourcesLoading
                                ? 'Loading...'
                                : 'No source codes found.'}
                            </CommandEmpty>
                            <CommandGroup>
                              {sources.map(source => (
                                <CommandItem
                                  key={source.id}
                                  value={source.code}
                                  onSelect={() =>
                                    handleSpamProtectionSourceCodeToggle(
                                      source.code
                                    )
                                  }
                                >
                                  <CheckCircle2
                                    className={`mr-2 h-4 w-4 ${
                                      spamProtectionCreateForm.sourceCodes.includes(
                                        source.code
                                      )
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    }`}
                                  />
                                  {source.code} - {source.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {spamProtectionCreateForm.sourceCodes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {spamProtectionCreateForm.sourceCodes.map(code => (
                          <Badge
                            key={code}
                            variant="outline"
                            className="text-xs"
                          >
                            {code}
                            <XCircle
                              className="ml-1 h-3 w-3 cursor-pointer"
                              onClick={() =>
                                handleSpamProtectionSourceCodeToggle(code)
                              }
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                    {spamProtectionCreateErrors.sourceCodes && (
                      <p className="text-red-500 text-xs mt-1">
                        {spamProtectionCreateErrors.sourceCodes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Voice Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Voice Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      Stability (
                      {spamProtectionCreateForm.voiceSettings.stability})
                    </Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={spamProtectionCreateForm.voiceSettings.stability}
                      onChange={e =>
                        handleVoiceSettingsChange(
                          'stability',
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      Similarity Boost (
                      {spamProtectionCreateForm.voiceSettings.similarity_boost})
                    </Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={
                        spamProtectionCreateForm.voiceSettings.similarity_boost
                      }
                      onChange={e =>
                        handleVoiceSettingsChange(
                          'similarity_boost',
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      Style ({spamProtectionCreateForm.voiceSettings.style})
                    </Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={spamProtectionCreateForm.voiceSettings.style}
                      onChange={e =>
                        handleVoiceSettingsChange(
                          'style',
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      Speaker Boost
                    </Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={
                          spamProtectionCreateForm.voiceSettings
                            .use_speaker_boost
                        }
                        onChange={e =>
                          handleVoiceSettingsChange(
                            'use_speaker_boost',
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-orange-600 bg-slate-100 border-slate-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-slate-600">
                        {spamProtectionCreateForm.voiceSettings
                          .use_speaker_boost
                          ? 'Enabled'
                          : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setSpamProtectionCreateModalOpen(false)}
              disabled={spamProtectionCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSpamProtectionCreateSubmit}
              disabled={spamProtectionCreating}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              {spamProtectionCreating ? (
                <>
                  {spamProtectionToEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {spamProtectionToEdit ? (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Rule
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Rule
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phone Number View Modal */}
      <Dialog
        open={phoneNumberViewModalOpen}
        onOpenChange={setPhoneNumberViewModalOpen}
      >
        <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Phone className="w-6 h-6 mr-3 text-blue-600" />
              Phone Number Details
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {phoneNumberDetailLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loading size="lg" />
              </div>
            ) : (
              selectedPhoneNumber && (
                <div className="space-y-6 py-4">
                  {/* Header Info */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {selectedPhoneNumber.friendlyName ||
                          selectedPhoneNumber.formattedPhoneNumber}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`${
                          selectedPhoneNumber.status === 'active'
                            ? 'text-green-600 border-green-200 bg-green-50'
                            : selectedPhoneNumber.status === 'assigned'
                              ? 'text-blue-600 border-blue-200 bg-blue-50'
                              : selectedPhoneNumber.status === 'inactive'
                                ? 'text-red-600 border-red-200 bg-red-50'
                                : 'text-yellow-600 border-yellow-200 bg-yellow-50'
                        }`}
                      >
                        {selectedPhoneNumber.status}
                      </Badge>
                      <Badge variant="outline" className="text-slate-600">
                        {selectedPhoneNumber.code}
                      </Badge>
                      <Badge variant="outline" className="text-slate-600">
                        {selectedPhoneNumber.numberType}
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <p>
                        Created:{' '}
                        {new Date(
                          selectedPhoneNumber.createdAt
                        ).toLocaleDateString()}
                      </p>
                      <p>
                        Updated:{' '}
                        {new Date(
                          selectedPhoneNumber.updatedAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Phone Number
                        </Label>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <span className="font-mono text-sm">
                            {selectedPhoneNumber.formattedPhoneNumber}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Friendly Name
                        </Label>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm">
                            {selectedPhoneNumber.friendlyName ||
                              'Not specified'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Number Type
                        </Label>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm">
                            {selectedPhoneNumber.numberType}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Country
                        </Label>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm">
                            {selectedPhoneNumber.country}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Monthly Charge
                        </Label>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <span className="text-2xl font-bold text-slate-900">
                            ${selectedPhoneNumber.monthlyCharge}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Capabilities
                        </Label>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex flex-wrap gap-2">
                            {selectedPhoneNumber.capabilities.voice && (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-200"
                              >
                                Voice
                              </Badge>
                            )}
                            {selectedPhoneNumber.capabilities.sms && (
                              <Badge
                                variant="outline"
                                className="text-blue-600 border-blue-200"
                              >
                                SMS
                              </Badge>
                            )}
                            {selectedPhoneNumber.capabilities.mms && (
                              <Badge
                                variant="outline"
                                className="text-purple-600 border-purple-200"
                              >
                                MMS
                              </Badge>
                            )}
                            {selectedPhoneNumber.capabilities.fax && (
                              <Badge
                                variant="outline"
                                className="text-orange-600 border-orange-200"
                              >
                                Fax
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Total Calls Received
                        </Label>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <span className="text-2xl font-bold text-slate-900">
                            {selectedPhoneNumber.totalCallsReceived}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Total SMS Received
                        </Label>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <span className="text-2xl font-bold text-slate-900">
                            {selectedPhoneNumber.totalSmsReceived}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Currently Active
                        </Label>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <Badge
                            variant="outline"
                            className={
                              selectedPhoneNumber.isCurrentlyActive
                                ? 'text-green-600 border-green-200 bg-green-50'
                                : 'text-red-600 border-red-200 bg-red-50'
                            }
                          >
                            {selectedPhoneNumber.isCurrentlyActive
                              ? 'Active'
                              : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Details */}
                  {(selectedPhoneNumber.region ||
                    selectedPhoneNumber.locality ||
                    selectedPhoneNumber.postalCode) && (
                    <div className="border-t pt-4">
                      <h4 className="text-lg font-semibold text-slate-900 mb-3">
                        Location Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedPhoneNumber.region && (
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">
                              Region
                            </Label>
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <span className="text-sm">
                                {selectedPhoneNumber.region}
                              </span>
                            </div>
                          </div>
                        )}

                        {selectedPhoneNumber.locality && (
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">
                              Locality
                            </Label>
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <span className="text-sm">
                                {selectedPhoneNumber.locality}
                              </span>
                            </div>
                          </div>
                        )}

                        {selectedPhoneNumber.postalCode && (
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">
                              Postal Code
                            </Label>
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <span className="text-sm">
                                {selectedPhoneNumber.postalCode}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tenant Information */}
                  <div className="border-t pt-4">
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">
                      Tenant Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-600">
                          Tenant Name:
                        </span>
                        <span className="ml-2 text-slate-900">
                          {selectedPhoneNumber.tenantId.name}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">
                          Tenant Type:
                        </span>
                        <span className="ml-2 text-slate-900">
                          {selectedPhoneNumber.tenantId.type}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">
                          By Tenant Name:
                        </span>
                        <span className="ml-2 text-slate-900">
                          {selectedPhoneNumber.byTenantId.name}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">
                          By Tenant Type:
                        </span>
                        <span className="ml-2 text-slate-900">
                          {selectedPhoneNumber.byTenantId.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPhoneNumberViewModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Phone Number Modal */}
      <Dialog open={purchaseModalOpen} onOpenChange={setPurchaseModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Phone Number</DialogTitle>
            <DialogDescription>
              Complete your phone number purchase
            </DialogDescription>
          </DialogHeader>

          {selectedNumberForPurchase && (
            <div className="space-y-4">
              {/* Phone Number Details */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Selected Number
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Phone Number:</span>
                    <span className="font-medium">
                      {selectedNumberForPurchase.phoneNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Type:</span>
                    <span className="font-medium capitalize">
                      {selectedNumberForPurchase.numberType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Location:</span>
                    <span className="font-medium">
                      {selectedNumberForPurchase.locality
                        ? `${selectedNumberForPurchase.locality}, ${selectedNumberForPurchase.region}`
                        : selectedNumberForPurchase.region}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Price:</span>
                    <span className="font-medium">
                      ${selectedNumberForPurchase.monthlyCharge}/month
                    </span>
                  </div>
                </div>
              </div>

              {/* Friendly Name Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="friendlyName"
                  className="text-sm font-medium text-slate-700"
                >
                  Friendly Name
                </Label>
                <Input
                  id="friendlyName"
                  value={purchaseFormData.friendlyName}
                  onChange={e =>
                    setPurchaseFormData(prev => ({
                      ...prev,
                      friendlyName: e.target.value,
                    }))
                  }
                  placeholder="Enter a friendly name for this number"
                  className="text-sm"
                />
                <p className="text-xs text-slate-500">
                  This will be displayed as the name for this phone number
                </p>
              </div>

              {/* Error Display */}
              {purchaseError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{purchaseError}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPurchaseModalOpen(false)
                setPurchaseError(null)
                setPurchaseFormData({ friendlyName: '' })
                setSelectedNumberForPurchase(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={purchasePhoneNumber}
              disabled={purchasing || !purchaseFormData.friendlyName.trim()}
            >
              {purchasing ? <>Purchasing...</> : 'Purchase Number'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Phone Number Modal */}
      <Dialog
        open={editPhoneNumberModalOpen}
        onOpenChange={setEditPhoneNumberModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Phone Number</DialogTitle>
            <DialogDescription>
              Update the details for this phone number
            </DialogDescription>
          </DialogHeader>

          {selectedPhoneNumberForEdit ? (
            <div className="space-y-4">
              {/* Phone Number Details */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Phone Number Details
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Phone Number:</span>
                    <span className="font-medium">
                      {selectedPhoneNumberForEdit.formattedPhoneNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Type:</span>
                    <span className="font-medium capitalize">
                      {selectedPhoneNumberForEdit.numberType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span className="font-medium capitalize">
                      {selectedPhoneNumberForEdit.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monthly Charge:</span>
                    <span className="font-medium">
                      ${selectedPhoneNumberForEdit.monthlyCharge}/month
                    </span>
                  </div>
                </div>
              </div>

              {/* Friendly Name Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="editFriendlyName"
                  className="text-sm font-medium text-slate-700"
                >
                  Friendly Name
                </Label>
                <Input
                  id="editFriendlyName"
                  value={phoneNumberEditFormData.friendlyName}
                  onChange={e =>
                    setPhoneNumberEditFormData(prev => ({
                      ...prev,
                      friendlyName: e.target.value,
                    }))
                  }
                  placeholder="Enter a friendly name for this number"
                  className="text-sm"
                />
                <p className="text-xs text-slate-500">
                  This will be displayed as the name for this phone number
                </p>
              </div>

              {/* Error Display */}
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{editError}</p>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditPhoneNumberModalOpen(false)
                setEditError(null)
                setPhoneNumberEditFormData({ friendlyName: '' })
                setSelectedPhoneNumberForEdit(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={updatePhoneNumber}
              disabled={editing || !phoneNumberEditFormData.friendlyName.trim()}
            >
              {editing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Number'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign to Source Modal */}
      <Dialog
        open={assignToSourceModalOpen}
        onOpenChange={setAssignToSourceModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPhoneNumberForAssignment?.assignedSource
                ? 'Release Phone Number Source'
                : 'Assign Phone Number to Source'}
            </DialogTitle>
            <DialogDescription>
              {selectedPhoneNumberForAssignment?.assignedSource
                ? 'Are you sure you want to release the source assignment for this phone number?'
                : 'Select a source to assign this phone number to'}
            </DialogDescription>
          </DialogHeader>

          {selectedPhoneNumberForAssignment && (
            <div className="space-y-4">
              {/* Phone Number Details */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Phone Number
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Number:</span>
                    <span className="font-medium">
                      {selectedPhoneNumberForAssignment.phoneNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Friendly Name:</span>
                    <span className="font-medium">
                      {selectedPhoneNumberForAssignment.friendlyName || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Source Selection - only show when assigning new source */}
              {!selectedPhoneNumberForAssignment?.assignedSource && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Select Source *
                  </Label>
                  <Popover
                    open={assignmentSourcesOpen}
                    onOpenChange={setAssignmentSourcesOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={assignmentSourcesOpen}
                        className="w-full justify-between"
                      >
                        {selectedAssignmentSource
                          ? selectedAssignmentSource.name
                          : 'Select a source...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search sources..."
                          value={assignmentSourceSearchQuery}
                          onValueChange={handleAssignmentSourceSearchChange}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {assignmentSourcesLoading
                              ? 'Loading sources...'
                              : 'No sources found.'}
                          </CommandEmpty>
                          <CommandGroup>
                            {assignmentSources.map(source => (
                              <CommandItem
                                key={source._id}
                                value={source.name}
                                onSelect={() =>
                                  handleAssignmentSourceSelect(source)
                                }
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    selectedAssignmentSource?._id === source._id
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  }`}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {source.name}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {source.code}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Error Display */}
              {assignError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{assignError}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {!selectedPhoneNumberForAssignment?.assignedSource && (
              <Button
                variant="outline"
                onClick={() => {
                  setAssignToSourceModalOpen(false)
                  setSelectedPhoneNumberForAssignment(null)
                  setSelectedAssignmentSource(null)
                  setAssignError(null)
                  setAssignmentSourceSearchQuery('')
                }}
              >
                Cancel
              </Button>
            )}

            {/* Show different buttons based on state */}
            {!selectedPhoneNumberForAssignment?.assignedSource ? (
              // New assignment - show assign button
              <Button
                onClick={assignPhoneNumberToSource}
                disabled={assigning || !selectedAssignmentSource}
              >
                {assigning ? <>Assigning...</> : 'Assign to Source'}
              </Button>
            ) : // Has assigned source - no buttons needed (handled by confirmation modal)
            null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Source Confirmation Modal */}
      <Dialog
        open={releaseConfirmationModalOpen}
        onOpenChange={setReleaseConfirmationModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Release Source</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the source assignment for this
              phone number?
            </DialogDescription>
          </DialogHeader>

          {selectedPhoneNumberForRelease && (
            <div className="space-y-4">
              {/* Phone Number Details */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Phone Number
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Number:</span>
                    <span className="font-medium">
                      {selectedPhoneNumberForRelease.phoneNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Friendly Name:</span>
                    <span className="font-medium">
                      {selectedPhoneNumberForRelease.friendlyName || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Current Source:</span>
                    <span className="font-medium">
                      {selectedPhoneNumberForRelease.assignedSource}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {releaseError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{releaseError}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReleaseConfirmationModalOpen(false)
                setSelectedPhoneNumberForRelease(null)
                setReleaseError(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={releaseSourceFromPhoneNumber}
              disabled={releasing}
              className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
            >
              {releasing ? <>Releasing...</> : 'Release Source'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Phone Number Confirmation Modal */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Phone Number</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{phoneNumberToDelete?.phoneNumber}</strong>? This action
              cannot be undone and will permanently remove the phone number from
              the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDeletePhoneNumberCancel}
              disabled={deleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePhoneNumberConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Call Dialer Component
function CallDialer({ onClose }: { onClose: () => void }) {
  const [phoneNumber, setPhoneNumber] = useState('')

  const dialpadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ]

  const handleNumberClick = (number: string) => {
    setPhoneNumber(prev => prev + number)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Input
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          placeholder="Enter phone number"
          className="text-center text-xl font-mono border-0 bg-slate-50 rounded-xl h-14"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {dialpadNumbers.flat().map(number => (
          <Button
            key={number}
            variant="outline"
            className="h-14 w-14 text-xl font-semibold rounded-xl hover:bg-[#53a533]/5"
            onClick={() => handleNumberClick(number)}
          >
            {number}
          </Button>
        ))}
      </div>

      <Button
        disabled={!phoneNumber}
        className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl text-lg font-semibold"
      >
        <Phone className="w-5 h-5 mr-3" />
        Call {phoneNumber}
      </Button>
    </div>
  )
}

export default CallsIndex
