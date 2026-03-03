import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
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
  FileBarChart,
  Users,
  User,
  BarChart3,
  Search,
  Filter,
  Check,
  ChevronsUpDown,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePermissions } from '@/src/hooks/usePermissions'
import api from '@/src/services/api'

interface UserActivity {
  _id: string
  userId: string
  userName: string
  userEmail: string | null
  userType: string
  tenantId: string
  action: string
  method: string
  endpoint: string
  module: string
  requestId: string
  statusCode: number
  success: boolean
  errorMessage: string | null
  responseTime: number
  responseSize: number
  ipAddress: string
  forwardedFor: string
  userAgent: string
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  device: string
  referrer: string
  origin: string
  sessionId: string | null
  authToken: boolean
  tokenValid: boolean
  createdAt: string
  requestBody: any
  requestQuery?: any
  __v: number
}

interface Module {
  _id: string
  code: string
  name: string
  isP1Module: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

interface ModulesResponse {
  success: boolean
  message: string
  count: number
  pagination: {
    current: {
      page: number
      limit: number
    }
    total: number
    pages: number
    next?: {
      page: number
      limit: number
    }
  }
  data: Module[]
}

interface ActivityLogsResponse {
  success: boolean
  message: string
  count: number
  pagination: {
    current: {
      page: number
      limit: number
    }
    total: number
    pages: number
  }
  data: UserActivity[]
}

export default function UserActivitiesPage() {
  const router = useRouter()
  const { checkPermission, getUserType } = usePermissions()

  const [error, setError] = useState<string | null>(null)
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchUserEmail, setSearchUserEmail] = useState('')
  const [searchUserName, setSearchUserName] = useState('')
  const [searchAction, setSearchAction] = useState('')
  const [searchEndpoint, setSearchEndpoint] = useState('')
  const [searchIpAddress, setSearchIpAddress] = useState('')
  const [searchBrowser, setSearchBrowser] = useState('')
  const [searchOs, setSearchOs] = useState('')
  const [searchDevice, setSearchDevice] = useState('')

  // Debounced search states
  const [debouncedSearchUserName, setDebouncedSearchUserName] = useState('')
  const [debouncedSearchAction, setDebouncedSearchAction] = useState('')
  const [debouncedSearchEndpoint, setDebouncedSearchEndpoint] = useState('')
  const [debouncedSearchIpAddress, setDebouncedSearchIpAddress] = useState('')
  const [debouncedSearchBrowser, setDebouncedSearchBrowser] = useState('')
  const [debouncedSearchOs, setDebouncedSearchOs] = useState('')
  const [debouncedSearchDevice, setDebouncedSearchDevice] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pagination, setPagination] = useState({
    current: { page: 1, limit: 10 },
    total: 0,
    pages: 0,
    next: { page: 2, limit: 10 },
  })
  const [filterUserId, setFilterUserId] = useState<string>('all')
  const [filterUserType, setFilterUserType] = useState<string>('all')
  const [filterTenantId, setFilterTenantId] = useState<string>('all')
  const [filterMethod, setFilterMethod] = useState<string>('all')
  const [filterModule, setFilterModule] = useState<string>('all')
  const [filterStatusCode, setFilterStatusCode] = useState<string>('all')
  const [filterSuccess, setFilterSuccess] = useState<string>('all')
  const [filterPopulate, setFilterPopulate] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('-createdAt')
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [modules, setModules] = useState<Module[]>([])
  const [loadingModules, setLoadingModules] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [tenants, setTenants] = useState<any[]>([])
  const [loadingTenants, setLoadingTenants] = useState(false)
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false)
  const [tenantSearchTerm, setTenantSearchTerm] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  // Fetch users for userId filter
  const fetchUsers = async (searchTerm: string = '') => {
    try {
      setLoadingUsers(true)
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
        status: 'Active',
        type: 'P5',
      })

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      const response = await api.get(`/v3/users?${params}`)
      if (response.data.success) {
        setUsers(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Fetch modules for module filter
  const fetchModules = async () => {
    try {
      setLoadingModules(true)
      const response = await api.get(
        '/v3/package-modules/tenant-modules?page=1&limit=50'
      )
      if (response.data.success) {
        setModules(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching modules:', error)
    } finally {
      setLoadingModules(false)
    }
  }

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

      // Fetch from all three package types
      const response = await api.get(`/v3/users/tenants/all?${params}`)

      // Combine results from all three APIs
      const allTenants = []

      if (response.data.success && response.data.data) {
        allTenants.push(...response.data.data)
      }

      setTenants(allTenants)
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setLoadingTenants(false)
    }
  }

  // Get selected tenant name for display
  const getSelectedTenantName = () => {
    if (filterTenantId === 'all') return 'All Tenants'
    const tenant = tenants.find(t => t._id === filterTenantId)
    return tenant ? `${tenant.name} (${tenant.username})` : 'Select tenant...'
  }

  // Handle tenant dropdown close
  const handleTenantDropdownClose = (open: boolean) => {
    setTenantDropdownOpen(open)
    if (!open) {
      setTenantSearchTerm('')
      // Fetch all tenants when closing
      fetchTenants('')
    }
  }

  // API service function
  const fetchActivityLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: entriesPerPage.toString(),
        sort: sortBy,
      })

      // Only add parameters that have actual values
      if (searchUserEmail) {
        params.append('userEmail', searchUserEmail)
      }
      if (debouncedSearchUserName) {
        params.append('userName', debouncedSearchUserName)
      }
      if (debouncedSearchAction) {
        params.append('action', debouncedSearchAction)
      }
      if (debouncedSearchEndpoint) {
        params.append('endpoint', debouncedSearchEndpoint)
      }
      if (debouncedSearchIpAddress) {
        params.append('ipAddress', debouncedSearchIpAddress)
      }
      if (debouncedSearchBrowser) {
        params.append('browser', debouncedSearchBrowser)
      }
      if (debouncedSearchOs) {
        params.append('os', debouncedSearchOs)
      }
      if (debouncedSearchDevice) {
        params.append('device', debouncedSearchDevice)
      }
      if (filterUserId && filterUserId !== 'all') {
        params.append('userId', filterUserId)
      }
      if (filterUserType && filterUserType !== 'all') {
        params.append('userType', filterUserType)
      }
      if (filterTenantId && filterTenantId !== 'all') {
        params.append('tenantId', filterTenantId)
      }
      if (filterMethod && filterMethod !== 'all') {
        params.append('method', filterMethod)
      }
      if (filterModule && filterModule !== 'all') {
        params.append('module', filterModule)
      }
      if (filterStatusCode && filterStatusCode !== 'all') {
        params.append('statusCode', filterStatusCode)
      }
      if (filterSuccess && filterSuccess !== 'all') {
        params.append('success', filterSuccess)
      }
      if (filterPopulate && filterPopulate !== 'all') {
        params.append('populate', filterPopulate)
      }
      if (startDate) {
        params.append('startDate', startDate)
      }
      if (endDate) {
        params.append('endDate', endDate)
      }

      const apiEndpoint = checkPermission('MOD017', 'view_all_logs')
        ? `/v3/admin/activity-logs?${params}`
        : `/v3/activity-logs?${params}`

      const response = await api.get<ActivityLogsResponse>(apiEndpoint)

      if (response.data.success) {
        setActivities(response.data.data)
        setTotalCount(response.data.pagination.total)
        setTotalPages(response.data.pagination.pages)

        // Update pagination state
        if (response.data.pagination) {
          setPagination({
            current: {
              page: response.data.pagination.current.page,
              limit: response.data.pagination.current.limit,
            },
            total: response.data.pagination.total,
            pages: response.data.pagination.pages,
            next: {
              page: response.data.pagination.current.page + 1,
              limit: response.data.pagination.current.limit,
            },
          })
        }
      } else {
        setError(response.data.message || 'Failed to fetch activity logs')
        setActivities([])
        setTotalCount(0)
        setTotalPages(0)
        setPagination({
          current: { page: 1, limit: 10 },
          total: 0,
          pages: 0,
          next: { page: 2, limit: 10 },
        })
      }
    } catch (error: any) {
      console.error('Error fetching activity logs:', error)
      setError(error.response?.data?.message || 'Failed to fetch activity logs')
      setActivities([])
      setTotalCount(0)
      setTotalPages(0)
      setPagination({
        current: { page: 1, limit: 10 },
        total: 0,
        pages: 0,
        next: { page: 2, limit: 10 },
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivityLogs()
  }, [
    currentPage,
    entriesPerPage,
    searchUserEmail,
    debouncedSearchUserName,
    debouncedSearchAction,
    debouncedSearchEndpoint,
    debouncedSearchIpAddress,
    debouncedSearchBrowser,
    debouncedSearchOs,
    debouncedSearchDevice,
    filterUserId,
    filterUserType,
    filterTenantId,
    filterMethod,
    filterModule,
    filterStatusCode,
    filterSuccess,
    filterPopulate,
    startDate,
    endDate,
    sortBy,
  ])

  useEffect(() => {
    fetchUsers('') // Load all users initially
    fetchModules()
    // Only fetch tenants for P1 users
    if (getUserType() === 'P1') {
      fetchTenants('')
    }
  }, [getUserType])

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Update pagination state
    setPagination(prev => ({
      ...prev,
      current: { ...prev.current, page },
      next: { page: page + 1, limit: prev.current.limit },
    }))
  }

  const handleEntriesChange = (value: string) => {
    const newLimit = parseInt(value)
    setEntriesPerPage(newLimit)
    setCurrentPage(1) // Reset to first page when changing entries per page
    // Update pagination state
    setPagination(prev => ({
      ...prev,
      current: { page: 1, limit: newLimit },
      next: { page: 2, limit: newLimit },
    }))
  }

  const handleSortToggle = () => {
    setSortBy(prevSort => (prevSort === '-createdAt' ? 'createdAt' : '-createdAt'))
    setCurrentPage(1) // Reset to first page when changing sort
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Get selected user name for display
  const getSelectedUserName = () => {
    if (filterUserId === 'all') return 'All Users'
    const user = users.find(u => u._id === filterUserId)
    return user ? `${user.name} (${user.username})` : 'Select user...'
  }

  // Debounced search effect for users
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        if (userDropdownOpen) {
          fetchUsers(userSearchTerm)
        }
      },
      userSearchTerm ? 300 : 0
    ) // No delay for empty search, 300ms debounce for search

    return () => clearTimeout(timeoutId)
  }, [userSearchTerm, userDropdownOpen])

  // Debounced search effect for tenants
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        if (tenantDropdownOpen) {
          fetchTenants(tenantSearchTerm)
        }
      },
      tenantSearchTerm ? 300 : 0
    ) // No delay for empty search, 300ms debounce for search

    return () => clearTimeout(timeoutId)
  }, [tenantSearchTerm, tenantDropdownOpen])

  // Debounced search effects for main search fields
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchUserName(searchUserName)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchUserName])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchAction(searchAction)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchAction])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchEndpoint(searchEndpoint)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchEndpoint])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchIpAddress(searchIpAddress)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchIpAddress])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchBrowser(searchBrowser)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchBrowser])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchOs(searchOs)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchOs])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchDevice(searchDevice)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchDevice])

  // Handle dropdown close
  const handleUserDropdownClose = (open: boolean) => {
    setUserDropdownOpen(open)
    if (!open) {
      setUserSearchTerm('')
      // Fetch all users when closing
      fetchUsers('')
    }
  }

  const getStatusBadgeColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300)
      return 'bg-green-100 text-green-800'
    if (statusCode >= 300 && statusCode < 400)
      return 'bg-blue-100 text-blue-800'
    if (statusCode >= 400 && statusCode < 500)
      return 'bg-yellow-100 text-yellow-800'
    if (statusCode >= 500) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getSuccessBadgeColor = (success: boolean) => {
    return success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const toggleCardDetails = (activityId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(activityId)) {
        newSet.delete(activityId)
      } else {
        newSet.add(activityId)
      }
      return newSet
    })
  }

  const userTypes = ['all', 'p1', 'p5', 'tenant']
  const methods = ['all', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  const statusCodes = [
    'all',
    '200',
    '201',
    '202',
    '204',
    '301',
    '302',
    '304',
    '400',
    '401',
    '403',
    '404',
    '422',
    '500',
    '502',
    '503',
  ]
  const successOptions = ['all', 'true', 'false']
  const populateOptions = ['all', 'true', 'false']

  return (
    <>
      <Head>
        <title>User Activities - Reports - WePro</title>
        <meta
          name="description"
          content="View user activities and system logs"
        />
      </Head>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex sm:flex gap-1 sm:space-x-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1 overflow-x-auto sm:overflow-x-visible scrollbar-hide">
          <Button
            variant="default"
            onClick={() => handleTabClick('/reports/user-activities')}
            className="flex-shrink-0 sm:flex-1 flex items-center justify-center text-white text-xs sm:text-sm px-4 sm:px-4"
          >
            <Users className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">User Activities</span>
            <span className="sm:hidden">User Activities</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/reports/my-activities')}
            className="flex-shrink-0 sm:flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs sm:text-sm px-4 sm:px-4"
          >
            <User className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">My Activities</span>
            <span className="sm:hidden">My Activities</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/reports/reports')}
            className="flex-shrink-0 sm:flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs sm:text-sm px-4 sm:px-4"
          >
            <BarChart3 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Reports</span>
            <span className="sm:hidden">Reports</span>
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              User Activities
            </h1>
          </div>
        </div>

        {/* Filters Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Filters
                </h3>
              </div>

              {/* Search Bars */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hidden md:block">
                  Search Fields
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/*<div className="space-y-2">
                    <Label className="text-sm font-medium">User Email</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        placeholder="Search by email..."
                        className="pl-10"
                        value={searchUserEmail}
                        onChange={e => setSearchUserEmail(e.target.value)}
                      />
                    </div>
                  </div>*/}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">User Name</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        placeholder="Search by name..."
                        className="pl-10"
                        value={searchUserName}
                        onChange={e => setSearchUserName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">Action</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        placeholder="Search by action..."
                        className="pl-10"
                        value={searchAction}
                        onChange={e => setSearchAction(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">Endpoint</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        placeholder="Search by endpoint..."
                        className="pl-10"
                        value={searchEndpoint}
                        onChange={e => setSearchEndpoint(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">IP Address</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        placeholder="Search by IP..."
                        className="pl-10"
                        value={searchIpAddress}
                        onChange={e => setSearchIpAddress(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">Browser</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        placeholder="Search by browser..."
                        className="pl-10"
                        value={searchBrowser}
                        onChange={e => setSearchBrowser(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">
                      Operating System
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        placeholder="Search by OS..."
                        className="pl-10"
                        value={searchOs}
                        onChange={e => setSearchOs(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">Device</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        placeholder="Search by device..."
                        className="pl-10"
                        value={searchDevice}
                        onChange={e => setSearchDevice(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Date Range Filters */}
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* User Type Filter */}
                  {checkPermission('MOD017', 'view_all_logs') && (
                    <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                      <Label className="text-sm font-medium">User Type</Label>
                      <Select
                        value={filterUserType}
                        onValueChange={setFilterUserType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select user type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {userTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type === 'all'
                                ? 'All Types'
                                : type.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Method Filter */}
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">Method</Label>
                    <Select
                      value={filterMethod}
                      onValueChange={setFilterMethod}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method..." />
                      </SelectTrigger>
                      <SelectContent>
                        {methods.map(method => (
                          <SelectItem key={method} value={method}>
                            {method === 'all' ? 'All Methods' : method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Code Filter */}
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">Status Code</Label>
                    <Select
                      value={filterStatusCode}
                      onValueChange={setFilterStatusCode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status code..." />
                      </SelectTrigger>
                      <SelectContent>
                        {statusCodes.map(code => (
                          <SelectItem key={code} value={code}>
                            {code === 'all' ? 'All Status Codes' : code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Success Filter */}
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">Success</Label>
                    <Select
                      value={filterSuccess}
                      onValueChange={setFilterSuccess}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select success..." />
                      </SelectTrigger>
                      <SelectContent>
                        {successOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option === 'all'
                              ? 'All'
                              : option === 'true'
                                ? 'Success'
                                : 'Failed'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Populate Filter */}
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">Populate</Label>
                    <Select
                      value={filterPopulate}
                      onValueChange={setFilterPopulate}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select populate..." />
                      </SelectTrigger>
                      <SelectContent>
                        {populateOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option === 'all'
                              ? 'All'
                              : option === 'true'
                                ? 'Yes'
                                : 'No'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Module Filter */}
                  {checkPermission('MOD017', 'view_all_logs') && (
                    <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                      <Label className="text-sm font-medium">Module</Label>
                      <Select
                        value={filterModule}
                        onValueChange={setFilterModule}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select module..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Modules</SelectItem>
                          {loadingModules ? (
                            <SelectItem value="loading" disabled>
                              Loading modules...
                            </SelectItem>
                          ) : (
                            modules.map(module => (
                              <SelectItem key={module._id} value={module.code}>
                                {module.name} ({module.code})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* User ID Filter - Searchable Dropdown */}
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">User</Label>
                    <Popover
                      open={userDropdownOpen}
                      onOpenChange={handleUserDropdownClose}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={userDropdownOpen}
                          className="w-full justify-between"
                        >
                          {getSelectedUserName()}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search users..."
                            value={userSearchTerm}
                            onValueChange={setUserSearchTerm}
                          />
                          <CommandList>
                            {loadingUsers ? (
                              <CommandEmpty>Loading users...</CommandEmpty>
                            ) : users.length === 0 ? (
                              <CommandEmpty>No users found.</CommandEmpty>
                            ) : (
                              <CommandGroup>
                                <CommandItem
                                  value="all"
                                  onSelect={() => {
                                    setFilterUserId('all')
                                    setUserDropdownOpen(false)
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      filterUserId === 'all'
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    }`}
                                  />
                                  All Users
                                </CommandItem>
                                {users.map(user => (
                                  <CommandItem
                                    key={user._id}
                                    value={user._id}
                                    onSelect={() => {
                                      setFilterUserId(user._id)
                                      setUserDropdownOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        filterUserId === user._id
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      }`}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {user.name}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {user.username}{' '}
                                        {user.email && `• ${user.email}`}
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

                  {/* Tenant ID Filter - Searchable Dropdown - Only show for P1 users */}
                  {getUserType() === 'P1' && (
                    <div className={`space-y-2 min-w-0 flex-1 sm:max-w-xs ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                      <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Tenant
                      </Label>
                      <Popover
                        open={tenantDropdownOpen}
                        onOpenChange={handleTenantDropdownClose}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={tenantDropdownOpen}
                            className="w-full justify-between"
                          >
                            {getSelectedTenantName()}
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
                              onValueChange={setTenantSearchTerm}
                            />
                            <CommandList>
                              {loadingTenants ? (
                                <CommandEmpty>Loading tenants...</CommandEmpty>
                              ) : tenants.length === 0 ? (
                                <CommandEmpty>No tenants found.</CommandEmpty>
                              ) : (
                                <CommandGroup>
                                  <CommandItem
                                    value="all"
                                    onSelect={() => {
                                      setFilterTenantId('all')
                                      setTenantDropdownOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        filterTenantId === 'all'
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      }`}
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
                                          .includes(searchLower) ||
                                        tenant.email
                                          ?.toLowerCase()
                                          .includes(searchLower)
                                      )
                                    })
                                    .map(tenant => (
                                      <CommandItem
                                        key={tenant._id}
                                        value={tenant._id}
                                        onSelect={() => {
                                          setFilterTenantId(tenant._id)
                                          setTenantDropdownOpen(false)
                                        }}
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            filterTenantId === tenant._id
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          }`}
                                        />
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            {tenant.name}
                                          </span>
                                          <span className="text-sm text-muted-foreground">
                                            {tenant.username}{' '}
                                            {tenant.email &&
                                              `• ${tenant.email}`}
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
                  )}
                </div>
              </div>
              {/* Mobile Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden flex items-center gap-2 w-full justify-center mt-4"
              >
                {showMobileFilters ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Filters
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show More Filters
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Activities List */}
        {/* Desktop View */}
        <Card className="hidden md:block">
          <CardContent className="pt-6">
            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              {/* Show Entries Dropdown */}
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="entries"
                  className="text-sm text-neutral-600 dark:text-neutral-400"
                >
                  Show
                </Label>
                <Select
                  value={pagination.current.limit.toString()}
                  onValueChange={handleEntriesChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="40">40</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <Label className="text-sm text-neutral-600 dark:text-neutral-400">
                  entries
                </Label>
              </div>

              {/* Sort Button */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSortToggle}
                  className="flex items-center gap-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span>
                    Sort: {sortBy === '-createdAt' ? 'Newest First' : 'Oldest First'}
                  </span>
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Success</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
                          Loading activities...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={13}
                        className="text-center py-8 text-red-500"
                      >
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-8">
                        No activities found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activities.map(activity => (
                      <TableRow key={activity._id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">
                              {activity.userName}
                            </div>
                            <div className="text-xs text-gray-400">
                              {activity.userType}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {activity.action}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {activity.method}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm max-w-xs truncate">
                          {activity.endpoint}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            {activity.module}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(activity.statusCode)}`}
                          >
                            {activity.statusCode}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getSuccessBadgeColor(activity.success)}`}
                          >
                            {activity.success ? 'Yes' : 'No'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {activity.responseTime}ms
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{activity.browser}</div>
                            <div className="text-xs text-gray-500">
                              {activity.browserVersion}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{activity.os}</div>
                            <div className="text-xs text-gray-500">
                              {activity.osVersion}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{activity.device}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {activity.ipAddress}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(activity.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              {/* Showing entries info */}
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Showing{' '}
                {(pagination.current.page - 1) * pagination.current.limit + 1}{' '}
                to{' '}
                {Math.min(
                  pagination.current.page * pagination.current.limit,
                  pagination.total
                )}{' '}
                of {pagination.total} entries
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current.page - 1)}
                  disabled={pagination.current.page === 1}
                >
                  Previous
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.pages) },
                    (_, i) => {
                      let pageNum
                      if (pagination.pages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.current.page <= 3) {
                        pageNum = i + 1
                      } else if (
                        pagination.current.page >=
                        pagination.pages - 2
                      ) {
                        pageNum = pagination.pages - 4 + i
                      } else {
                        pageNum = pagination.current.page - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pagination.current.page === pageNum
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current.page + 1)}
                  disabled={pagination.current.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile View */}
        <div className="block md:hidden space-y-4">
          {/* Show Entries and Sort in one row */}
          <div className="flex items-center justify-between gap-4">
            {/* Sort Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSortToggle}
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span>
                Sort: {sortBy === '-createdAt' ? 'Newest First' : 'Oldest First'}
              </span>
            </Button>

            {/* Show Entries Dropdown */}
            <div className="flex items-center gap-2">
              <Label
                htmlFor="entries"
                className="text-sm text-neutral-600 dark:text-neutral-400"
              >
                Show
              </Label>
              <Select
                value={pagination.current.limit.toString()}
                onValueChange={handleEntriesChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="40">40</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Mobile Card View */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
                  <span className="text-neutral-500">Loading activities...</span>
                </div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-neutral-500">No activities found</span>
              </div>
            ) : (
              activities.map(activity => (
                <Card key={activity._id} className="border border-neutral-200 dark:border-neutral-700">
                  <CardContent className="pt-4 pb-4">
                    <div className="space-y-3">
                      {/* User */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          User
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {activity.userName}
                          </div>
                          <div className="text-xs text-gray-400">
                            {activity.userType}
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Action
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {activity.action}
                        </span>
                      </div>

                      {/* Method */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Method
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {activity.method}
                        </span>
                      </div>

                      {/* Endpoint */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Endpoint
                        </div>
                        <div className="font-mono text-sm break-all">
                          {activity.endpoint}
                        </div>
                      </div>

                      {/* Module */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Module
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          {activity.module}
                        </span>
                      </div>

                      {/* Additional Details - Hidden by default */}
                      {expandedCards.has(activity._id) && (
                        <>
                          {/* Status */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Status
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(activity.statusCode)}`}
                            >
                              {activity.statusCode}
                            </span>
                          </div>

                          {/* Success */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Success
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getSuccessBadgeColor(activity.success)}`}
                            >
                              {activity.success ? 'Yes' : 'No'}
                            </span>
                          </div>

                          {/* Response Time */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Response Time
                            </div>
                            <div className="text-sm text-neutral-900 dark:text-neutral-100">
                              {activity.responseTime}ms
                            </div>
                          </div>

                          {/* Browser */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Browser
                            </div>
                            <div>
                              <div className="text-sm text-neutral-900 dark:text-neutral-100">
                                {activity.browser}
                              </div>
                              <div className="text-xs text-gray-500">
                                {activity.browserVersion}
                              </div>
                            </div>
                          </div>

                          {/* OS */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Operating System
                            </div>
                            <div>
                              <div className="text-sm text-neutral-900 dark:text-neutral-100">
                                {activity.os}
                              </div>
                              <div className="text-xs text-gray-500">
                                {activity.osVersion}
                              </div>
                            </div>
                          </div>

                          {/* Device */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Device
                            </div>
                            <div className="text-sm text-neutral-900 dark:text-neutral-100">
                              {activity.device}
                            </div>
                          </div>

                          {/* IP Address */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              IP Address
                            </div>
                            <div className="font-mono text-sm text-neutral-900 dark:text-neutral-100">
                              {activity.ipAddress}
                            </div>
                          </div>

                          {/* Timestamp */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Timestamp
                            </div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                              {formatDate(activity.createdAt)}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Show Details Button - Always at bottom */}
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCardDetails(activity._id)}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          {expandedCards.has(activity._id) ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Show Details
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Showing entries info */}
          <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
            Showing{' '}
            {(pagination.current.page - 1) * pagination.current.limit + 1}{' '}
            to{' '}
            {Math.min(
              pagination.current.page * pagination.current.limit,
              pagination.total
            )}{' '}
            of {pagination.total} entries
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current.page - 1)}
              disabled={pagination.current.page === 1 || loading}
            >
              Previous
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, pagination.pages) },
                (_, i) => {
                  let pageNum
                  if (pagination.pages <= 5) {
                    pageNum = i + 1
                  } else if (pagination.current.page <= 3) {
                    pageNum = i + 1
                  } else if (
                    pagination.current.page >=
                    pagination.pages - 2
                  ) {
                    pageNum = pagination.pages - 4 + i
                  } else {
                    pageNum = pagination.current.page - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={
                        pagination.current.page === pageNum
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                      disabled={loading}
                    >
                      {pageNum}
                    </Button>
                  )
                }
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current.page + 1)}
              disabled={pagination.current.page === pagination.pages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
