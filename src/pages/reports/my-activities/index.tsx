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
  FileBarChart,
  Users,
  User,
  BarChart3,
  Search,
  Filter,
  Calendar,
  Eye,
  Check,
  X,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePermissions } from '@/src/hooks/usePermissions'
import { useAppSelector } from '@/src/store/hooks'
import { apiService } from '@/src/services/api'

interface ActivityLog {
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
  requestQuery: any
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
  referrer: string | null
  origin: string | null
  sessionId: string | null
  authToken: boolean
  tokenValid: boolean
  createdAt: string
  __v: number
}

interface ActivityLogsResponse {
  success: boolean
  message: string
  count: number
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  data: ActivityLog[]
}

export default function MyActivitiesPage() {
  const router = useRouter()
  const { checkPermission, getUserType } = usePermissions()
  const { data: userData } = useAppSelector(state => state.user)

  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
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
  const [filterModule, setFilterModule] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [debouncedActionFilter, setDebouncedActionFilter] = useState('')
  const [debouncedEndpointFilter, setDebouncedEndpointFilter] = useState('')
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(
    null
  )
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  // Filter states
  const [filterAction, setFilterAction] = useState<string>('')
  const [filterMethod, setFilterMethod] = useState<string>('all')
  const [filterEndpoint, setFilterEndpoint] = useState<string>('')
  const [filterStatusCode, setFilterStatusCode] = useState<string>('all')
  const [filterSuccess, setFilterSuccess] = useState<string>('all')
  const [filterStartDate, setFilterStartDate] = useState<string>('')
  const [filterEndDate, setFilterEndDate] = useState<string>('')

  // API service function
  const fetchActivityLogs = async (
    page: number = 1,
    limit: number = 20,
    search?: string,
    action?: string,
    method?: string,
    endpoint?: string,
    statusCode?: string,
    success?: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page,
        limit,
        sort: '-createdAt',
      }

      // Add search parameter if provided
      if (search && search.trim()) {
        params.search = search.trim()
      }

      // Add action filter if provided
      if (action && action.trim()) {
        params.action = action.trim()
      }

      // Add method filter if provided and not 'all'
      if (method && method.trim() && method !== 'all') {
        params.method = method.trim()
      }

      // Add endpoint filter if provided
      if (endpoint && endpoint.trim()) {
        params.endpoint = endpoint.trim()
      }

      // Add status code filter if provided and not 'all'
      if (statusCode && statusCode.trim() && statusCode !== 'all') {
        params.statusCode = statusCode.trim()
      }

      // Add success filter if provided and not 'all'
      if (success && success.trim() && success !== 'all') {
        params.success = success === 'true'
      }

      // Add date range filters if provided
      if (startDate && startDate.trim()) {
        params.startDate = startDate.trim()
      }

      if (endDate && endDate.trim()) {
        params.endDate = endDate.trim()
      }

      const response = await apiService.get<ActivityLogsResponse>(
        '/v1/activity-logs/my',
        {
          params,
        }
      )

      if (response.data.success) {
        setActivities(response.data.data)
        setTotalCount(response.data.pagination.total)
        setTotalPages(response.data.pagination.pages)

        // Update pagination state
        if (response.data.pagination) {
          setPagination({
            current: {
              page: response.data.pagination.page,
              limit: response.data.pagination.limit,
            },
            total: response.data.pagination.total,
            pages: response.data.pagination.pages,
            next: {
              page: response.data.pagination.page + 1,
              limit: response.data.pagination.limit,
            },
          })
        }
      } else {
        setError('Failed to fetch activity logs')
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err)
      setError('Failed to fetch activity logs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Debounce action filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedActionFilter(filterAction)
    }, 500)

    return () => clearTimeout(timer)
  }, [filterAction])

  // Debounce endpoint filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEndpointFilter(filterEndpoint)
    }, 500)

    return () => clearTimeout(timer)
  }, [filterEndpoint])

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [
    debouncedSearchTerm,
    debouncedActionFilter,
    debouncedEndpointFilter,
    filterMethod,
    filterStatusCode,
    filterSuccess,
    filterStartDate,
    filterEndDate,
  ])

  useEffect(() => {
    fetchActivityLogs(
      currentPage,
      entriesPerPage,
      debouncedSearchTerm,
      debouncedActionFilter,
      filterMethod,
      debouncedEndpointFilter,
      filterStatusCode,
      filterSuccess,
      filterStartDate,
      filterEndDate
    )
  }, [
    currentPage,
    entriesPerPage,
    debouncedSearchTerm,
    debouncedActionFilter,
    filterMethod,
    debouncedEndpointFilter,
    filterStatusCode,
    filterSuccess,
    filterStartDate,
    filterEndDate,
  ])

  const handleTabClick = (path: string) => {
    router.push(path)
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Update pagination state
    setPagination(prev => ({
      ...prev,
      current: { ...prev.current, page },
      next: { page: page + 1, limit: prev.current.limit },
    }))
  }

  const handleRowClick = (activity: ActivityLog) => {
    setSelectedActivity(activity)
    setIsSidePanelOpen(true)
  }

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false)
    setSelectedActivity(null)
  }

  const clearAllFilters = () => {
    setFilterAction('')
    setFilterMethod('all')
    setFilterEndpoint('')
    setFilterStatusCode('all')
    setFilterSuccess('all')
    setFilterStartDate('')
    setFilterEndDate('')
    setSearchTerm('')
    setDateRange('all')
  }

  // Apply date range filtering (client-side since API might not support it)
  const filteredActivities = activities.filter(activity => {
    if (dateRange === 'all') return true

    const activityDate = new Date(activity.createdAt)
    const now = new Date()

    switch (dateRange) {
      case 'today':
        return activityDate.toDateString() === now.toDateString()
      case 'week':
        return now.getTime() - activityDate.getTime() <= 7 * 24 * 60 * 60 * 1000
      case 'month':
        return (
          now.getTime() - activityDate.getTime() <= 30 * 24 * 60 * 60 * 1000
        )
      default:
        return true
    }
  })

  const currentActivities = filteredActivities

  // Get unique values for filters
  const actions = [
    ...Array.from(new Set(activities.map(activity => activity.action))),
  ]
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  const statusCodes = [
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
  const successOptions = ['true', 'false']
  const dateRanges = ['all', 'today', 'week', 'month']

  const getStatusColor = (success: boolean, statusCode: number) => {
    if (success && statusCode < 400) {
      return 'bg-green-100 text-green-800'
    } else if (statusCode >= 400 && statusCode < 500) {
      return 'bg-yellow-100 text-yellow-800'
    } else if (statusCode >= 500) {
      return 'bg-red-100 text-red-800'
    } else {
      return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusText = (success: boolean, statusCode: number) => {
    if (success && statusCode < 400) {
      return 'Success'
    } else if (statusCode >= 400 && statusCode < 500) {
      return 'Warning'
    } else if (statusCode >= 500) {
      return 'Error'
    } else {
      return 'Unknown'
    }
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button
            onClick={() =>
              fetchActivityLogs(
                currentPage,
                entriesPerPage,
                debouncedSearchTerm,
                debouncedActionFilter,
                filterMethod,
                debouncedEndpointFilter
              )
            }
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>My Activities - Reports - WePro</title>
        <meta
          name="description"
          content="View your personal activity history"
        />
      </Head>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/reports/user-activities')}
            className="flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <Users className="w-4 h-4 mr-2" />
            User Activities
          </Button>
          <Button
            variant="default"
            onClick={() => handleTabClick('/reports/my-activities')}
            className="flex-1 flex items-center justify-center text-white"
          >
            <User className="w-4 h-4 mr-2" />
            My Activities
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/reports/reports')}
            className="flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              My Activities
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

              {/* Filter Controls */}
              <div className="space-y-4">
                {/* Search Field */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search activities..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* Action Filter */}
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">Action</Label>
                    <Input
                      placeholder="Enter action..."
                      value={filterAction}
                      onChange={e => setFilterAction(e.target.value)}
                    />
                  </div>

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
                        <SelectItem value="all">All Methods</SelectItem>
                        {methods.map(method => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Endpoint Filter */}
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">Endpoint</Label>
                    <Input
                      placeholder="Enter endpoint..."
                      value={filterEndpoint}
                      onChange={e => setFilterEndpoint(e.target.value)}
                    />
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
                        <SelectItem value="all">All Status Codes</SelectItem>
                        {statusCodes.map(code => (
                          <SelectItem key={code} value={code}>
                            {code}
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
                        <SelectItem value="all">All</SelectItem>
                        {successOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option === 'true' ? 'Success' : 'Failed'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date Filter */}
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">Start Date</Label>
                    <Input
                      type="date"
                      value={filterStartDate}
                      onChange={e => setFilterStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* End Date Filter */}
                  <div className={`space-y-2 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                    <Label className="text-sm font-medium">End Date</Label>
                    <Input
                      type="date"
                      value={filterEndDate}
                      onChange={e => setFilterEndDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
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

        {/* My Activities List */}
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
                  value={entriesPerPage.toString()}
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
            </div>

            <div className="overflow-hidden">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Action</TableHead>
                    <TableHead className="w-20">Method</TableHead>
                    <TableHead className="w-48">Endpoint</TableHead>
                    <TableHead className="w-24">Status Code</TableHead>
                    <TableHead className="w-20">Success</TableHead>
                    <TableHead className="w-28">Response Time</TableHead>
                    <TableHead className="w-40">Created At</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
                          Loading activities...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-red-500"
                      >
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : currentActivities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No activities found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentActivities.map(activity => (
                      <TableRow
                        key={activity._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell
                          className="font-medium truncate"
                          title={activity.action}
                        >
                          {activity.action}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              activity.method === 'GET'
                                ? 'bg-blue-100 text-blue-800'
                                : activity.method === 'POST'
                                  ? 'bg-green-100 text-green-800'
                                  : activity.method === 'PUT'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : activity.method === 'DELETE'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {activity.method}
                          </span>
                        </TableCell>
                        <TableCell
                          className="truncate"
                          title={activity.endpoint}
                        >
                          {activity.endpoint}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              activity.statusCode >= 200 &&
                              activity.statusCode < 300
                                ? 'bg-green-100 text-green-800'
                                : activity.statusCode >= 300 &&
                                    activity.statusCode < 400
                                  ? 'bg-blue-100 text-blue-800'
                                  : activity.statusCode >= 400 &&
                                      activity.statusCode < 500
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : activity.statusCode >= 500
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {activity.statusCode}
                          </span>
                        </TableCell>
                        <TableCell>
                          {activity.success ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell
                          className="truncate"
                          title={`${activity.responseTime}ms`}
                        >
                          {activity.responseTime}ms
                        </TableCell>
                        <TableCell
                          className="truncate"
                          title={formatTimestamp(activity.createdAt)}
                        >
                          {formatTimestamp(activity.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRowClick(activity)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </div>
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
          {/* Show Entries Dropdown */}
          <div className="flex items-center gap-2 justify-end">
            <Label
              htmlFor="entries"
              className="text-sm text-neutral-600 dark:text-neutral-400"
            >
              Show
            </Label>
            <Select
              value={entriesPerPage.toString()}
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
            ) : currentActivities.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-neutral-500">No activities found</span>
              </div>
            ) : (
              currentActivities.map(activity => (
                <Card key={activity._id} className="border border-neutral-200 dark:border-neutral-700">
                  <CardContent className="pt-4 pb-4">
                    <div className="space-y-3">
                      {/* Action */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Action
                        </div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {activity.action}
                        </div>
                      </div>

                      {/* Method */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Method
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            activity.method === 'GET'
                              ? 'bg-blue-100 text-blue-800'
                              : activity.method === 'POST'
                                ? 'bg-green-100 text-green-800'
                                : activity.method === 'PUT'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : activity.method === 'DELETE'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                          }`}
                        >
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

                      {/* Status Code */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Status Code
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
                        <div className="flex items-center gap-2">
                          {activity.success ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-red-600" />
                          )}
                          <span className="text-sm text-neutral-900 dark:text-neutral-100">
                            {activity.success ? 'Yes' : 'No'}
                          </span>
                        </div>
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

                      {/* Created At */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Created At
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {formatTimestamp(activity.createdAt)}
                        </div>
                      </div>

                      {/* Additional Details - Hidden by default */}
                      {expandedCards.has(activity._id) && (
                        <>
                          {/* Module */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Module
                            </div>
                            <div className="text-sm text-neutral-900 dark:text-neutral-100">
                              {activity.module}
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
                        </>
                      )}

                      {/* Show Details Button - Always at bottom */}
                      <div className="pt-2 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCardDetails(activity._id)}
                          className="flex-1 flex items-center justify-center gap-2"
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRowClick(activity)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
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
      {/* Side Panel for Activity Details */}
      {isSidePanelOpen && selectedActivity && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 animate-in fade-in duration-300"
            onClick={handleCloseSidePanel}
          />

          {/* Side Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-900 shadow-xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Activity Details
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseSidePanel}
                  className="h-8 w-8 p-0"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div>
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Activity ID:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                          {selectedActivity._id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Action:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedActivity.action}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Method:
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            selectedActivity.method === 'GET'
                              ? 'bg-blue-100 text-blue-800'
                              : selectedActivity.method === 'POST'
                                ? 'bg-green-100 text-green-800'
                                : selectedActivity.method === 'PUT'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : selectedActivity.method === 'DELETE'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {selectedActivity.method}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Endpoint:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                          {selectedActivity.endpoint}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Status Code:
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            selectedActivity.statusCode >= 200 &&
                            selectedActivity.statusCode < 300
                              ? 'bg-green-100 text-green-800'
                              : selectedActivity.statusCode >= 300 &&
                                  selectedActivity.statusCode < 400
                                ? 'bg-blue-100 text-blue-800'
                                : selectedActivity.statusCode >= 400 &&
                                    selectedActivity.statusCode < 500
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : selectedActivity.statusCode >= 500
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {selectedActivity.statusCode}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Success:
                        </span>
                        <div className="flex items-center">
                          {selectedActivity.success ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-red-600" />
                          )}
                          <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                            {selectedActivity.success ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Response Time:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedActivity.responseTime}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Created At:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {formatTimestamp(selectedActivity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* User Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                      User Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          User Name:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedActivity.userName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          User Email:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedActivity.userEmail || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          User Type:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedActivity.userType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          User ID:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                          {selectedActivity.userId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Module:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedActivity.module}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Tenant ID:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                          {selectedActivity.tenantId}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Technical Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Request ID:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                          {selectedActivity.requestId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          IP Address:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedActivity.ipAddress}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          User Agent:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-mono text-right max-w-xs truncate">
                          {selectedActivity.userAgent}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Browser:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedActivity.browser}{' '}
                          {selectedActivity.browserVersion}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          OS:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedActivity.os} {selectedActivity.osVersion}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Device:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedActivity.device}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Response Size:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedActivity.responseSize} bytes
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Forwarded For:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                          {selectedActivity.forwardedFor}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Referrer:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-mono max-w-xs truncate">
                          {selectedActivity.referrer || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Origin:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-mono max-w-xs truncate">
                          {selectedActivity.origin || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Session ID:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                          {selectedActivity.sessionId || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Auth Token:
                        </span>
                        <div className="flex items-center">
                          {selectedActivity.authToken ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                          <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                            {selectedActivity.authToken ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Token Valid:
                        </span>
                        <div className="flex items-center">
                          {selectedActivity.tokenValid ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                          <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                            {selectedActivity.tokenValid ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error Information */}
                  {selectedActivity.errorMessage && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Error Information
                      </h3>
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-sm text-red-800 dark:text-red-200 font-mono">
                          {selectedActivity.errorMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Request Query */}
                  {selectedActivity.requestQuery &&
                    Object.keys(selectedActivity.requestQuery).length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                          Request Query
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <pre className="text-sm text-gray-900 dark:text-gray-100 font-mono overflow-x-auto">
                            {JSON.stringify(
                              selectedActivity.requestQuery,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={handleCloseSidePanel}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
