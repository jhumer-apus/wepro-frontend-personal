import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
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
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Building2,
  Eye,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/src/components/ui/dialog'
import {
  SettingsNavigation,
  KnowledgeHubSubNavigation,
} from '@/src/components/job'
import { usePermissions } from '@/src/hooks/usePermissions'
import { useDebounce } from '@/src/hooks/useDebounce'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

// Interface for Announcement data
interface Announcement {
  _id: string
  title: string
  announcement: string
  sourceCodes: string[]
  startTime: string
  endTime: string
  status: string
  isExpire: boolean
  expireDate: string
  tenantId: {
    _id: string
    name: string
    username: string
  }
  byTenantId: {
    _id: string
    name: string
    username: string
  }
  createdBy: {
    _id: string
    name: string
    username: string
  }
  createdAt: string
  updatedAt: string
  code: string
  isActive: boolean
  id: string
}

interface AnnouncementsResponse {
  success: boolean
  message: string
  data: {
    data: Announcement[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

interface Source {
  id: string
  code: string
  name: string
}

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'inactive':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const formatDate = (dateString: string | undefined, userTimezone?: string) => {
  if (!dateString) {
    return 'N/A'
  }
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone:
        userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  } catch {
    return 'Invalid Date'
  }
}

// Date range calculation utilities
const getDateRange = (range: string) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (range) {
    case 'Today':
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      }

    case 'Yesterday':
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return {
        startDate: yesterday.toISOString().split('T')[0],
        endDate: yesterday.toISOString().split('T')[0],
      }

    case 'This Week Sun':
      const thisWeekSun = new Date(today)
      thisWeekSun.setDate(today.getDate() - today.getDay())
      return {
        startDate: thisWeekSun.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      }

    case 'This Week Mon':
      const thisWeekMon = new Date(today)
      thisWeekMon.setDate(
        today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1)
      )
      return {
        startDate: thisWeekMon.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      }

    case 'Last 7 Days':
      const last7Days = new Date(today)
      last7Days.setDate(today.getDate() - 7)
      return {
        startDate: last7Days.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      }

    case 'Last Week Sun':
      const lastWeekSun = new Date(today)
      lastWeekSun.setDate(today.getDate() - today.getDay() - 7)
      const lastWeekSunEnd = new Date(today)
      lastWeekSunEnd.setDate(today.getDate() - today.getDay() - 1)
      return {
        startDate: lastWeekSun.toISOString().split('T')[0],
        endDate: lastWeekSunEnd.toISOString().split('T')[0],
      }

    case 'Last Week Mon':
      const lastWeekMon = new Date(today)
      const lastWeekMonStart = today.getDay() === 0 ? 6 : today.getDay() - 1
      lastWeekMon.setDate(today.getDate() - lastWeekMonStart - 7)
      const lastWeekMonEnd = new Date(today)
      lastWeekMonEnd.setDate(today.getDate() - lastWeekMonStart - 1)
      return {
        startDate: lastWeekMon.toISOString().split('T')[0],
        endDate: lastWeekMonEnd.toISOString().split('T')[0],
      }

    case 'Last Business Week':
      const lastBusinessWeek = new Date(today)
      const daysToMonday = today.getDay() === 0 ? 6 : today.getDay() - 1
      lastBusinessWeek.setDate(today.getDate() - daysToMonday - 7)
      const lastBusinessWeekEnd = new Date(today)
      lastBusinessWeekEnd.setDate(today.getDate() - daysToMonday - 1)
      return {
        startDate: lastBusinessWeek.toISOString().split('T')[0],
        endDate: lastBusinessWeekEnd.toISOString().split('T')[0],
      }

    case 'Last 14 Days':
      const last14Days = new Date(today)
      last14Days.setDate(today.getDate() - 14)
      return {
        startDate: last14Days.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      }

    case 'This Month':
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      return {
        startDate: thisMonth.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      }

    case 'Last 30 Days':
      const last30Days = new Date(today)
      last30Days.setDate(today.getDate() - 30)
      return {
        startDate: last30Days.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      }

    case 'Last Month':
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
      return {
        startDate: lastMonth.toISOString().split('T')[0],
        endDate: lastMonthEnd.toISOString().split('T')[0],
      }

    default:
      return null
  }
}

export default function KnowledgeHubAnnouncementsPage() {
  const router = useRouter()
  const { checkPermission, getUserType, userData, isSuperAdmin } =
    usePermissions()
  const tenantId = userData?.tenantId

  // State for announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  // State for filters
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sourceCodeFilter, setSourceCodeFilter] = useState<string>('')
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('All')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  // State for sources (for sourceCode filter)
  const [sources, setSources] = useState<Source[]>([])
  const [sourcesLoading, setSourcesLoading] = useState(false)

  // State for delete functionality
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [announcementToDelete, setAnnouncementToDelete] =
    useState<Announcement | null>(null)
  const [deleting, setDeleting] = useState(false)

  // State for view modal
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null)

  // Fetch sources from API
  const fetchSources = useCallback(async () => {
    setSourcesLoading(true)
    try {
      const response = await apiService.get(
        '/v1/sources?page=1&limit=50&sort=-createdAt'
      )
      const sourcesData =
        response.data.success !== undefined ? response.data.data : response.data
      setSources(sourcesData || [])
    } catch (error: any) {
      console.error('Error fetching sources:', error)
      toast.error('Failed to load sources', {
        description:
          'Please try again or contact support if the issue persists.',
      })
    } finally {
      setSourcesLoading(false)
    }
  }, [])

  // Fetch announcements from API
  const fetchAnnouncements = useCallback(async () => {
    if (!tenantId) return

    // Don't fetch if dateRange is Custom but startDate or endDate is not set
    if (dateRangeFilter === 'Custom' && (!customStartDate || !customEndDate)) {
      return
    }

    // Don't fetch if dateRange is Custom but endDate is less than startDate
    if (
      dateRangeFilter === 'Custom' &&
      customStartDate &&
      customEndDate &&
      new Date(customEndDate) < new Date(customStartDate)
    ) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: entriesPerPage.toString(),
      })

      // Add search term if provided
      if (debouncedSearchTerm.trim()) {
        queryParams.append('search', debouncedSearchTerm.trim())
      }

      // Add status filter if provided
      if (statusFilter) {
        queryParams.append('status', statusFilter)
      }

      // Add sourceCode filter if provided
      if (sourceCodeFilter) {
        queryParams.append('sourceCode', sourceCodeFilter)
      }

      // Add date range filter if provided
      if (dateRangeFilter && dateRangeFilter !== 'All') {
        queryParams.append('dateRange', dateRangeFilter)

        if (dateRangeFilter === 'Custom') {
          if (customStartDate) {
            queryParams.append('startDate', customStartDate)
          }
          if (customEndDate) {
            queryParams.append('endDate', customEndDate)
          }
        }
      }

      const response = await apiService.get(
        `/v1/knowledge-hub/announcements?${queryParams.toString()}`
      )
      const responseData: AnnouncementsResponse = response.data

      if (responseData.success) {
        setAnnouncements(responseData.data.data)
        setTotalCount(responseData.data.pagination.total)
        setTotalPages(responseData.data.pagination.pages)
        setPagination(responseData.data.pagination)
        setError(null)
      } else {
        setError(responseData.message || 'Failed to fetch announcements')
        setAnnouncements([])
        setTotalCount(0)
        setTotalPages(0)
        setPagination({
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        })
      }
    } catch (err: any) {
      console.error('Error fetching announcements:', err)
      setError(err.response?.data?.message || 'Failed to fetch announcements')
      setAnnouncements([])
      setTotalCount(0)
      setTotalPages(0)
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [
    tenantId,
    currentPage,
    entriesPerPage,
    debouncedSearchTerm,
    statusFilter,
    sourceCodeFilter,
    dateRangeFilter,
    customStartDate,
    customEndDate,
  ])

  // Fetch announcements on component mount and when dependencies change
  useEffect(() => {
    if (!checkPermission('MOD030', 'view')) {
      router.push('/settings/knowledgeHub/notes')
      return
    }
    if (tenantId) {
      fetchAnnouncements()
    }
  }, [tenantId, currentPage, entriesPerPage, fetchAnnouncements, fetchSources])

  useEffect(() => {
    if (!checkPermission('MOD030', 'view')) {
      router.push('/settings/knowledgeHub/notes')
      return
    }
    if (tenantId) {
      fetchSources()
    }
  }, [tenantId])

  // Reset pagination when search term changes
  useEffect(() => {
    if (tenantId) {
      setCurrentPage(1)
      setPagination(prev => ({
        ...prev,
        page: 1,
      }))
    }
  }, [debouncedSearchTerm, tenantId])

  // Reset pagination when filters change
  useEffect(() => {
    if (tenantId) {
      setCurrentPage(1)
      setPagination(prev => ({
        ...prev,
        page: 1,
      }))
    }
  }, [
    statusFilter,
    sourceCodeFilter,
    dateRangeFilter,
    customStartDate,
    customEndDate,
    tenantId,
  ])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setPagination(prev => ({
      ...prev,
      page,
    }))
  }

  const handleEntriesChange = (value: string) => {
    const newLimit = parseInt(value)
    setEntriesPerPage(newLimit)
    setCurrentPage(1)
    setPagination(prev => ({
      ...prev,
      page: 1,
      limit: newLimit,
    }))
  }

  const handleDeleteAnnouncement = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!announcementToDelete || !tenantId) return

    try {
      setDeleting(true)
      await apiService.delete(
        `/v1/knowledge-hub/announcements/${announcementToDelete._id}`
      )

      // Refresh the list
      await fetchAnnouncements()

      // Show success toast
      toast.success('Announcement deleted successfully!', {
        description: 'The announcement has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setAnnouncementToDelete(null)
    } catch (err: any) {
      console.error('Error deleting announcement:', err)
      toast.error('Failed to delete announcement', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the announcement.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setAnnouncementToDelete(null)
  }

  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setViewModalOpen(false)
    setSelectedAnnouncement(null)
  }

  // Filter handlers
  const clearAllFilters = () => {
    setStatusFilter('')
    setSourceCodeFilter('')
    setSearchTerm('')
    setDateRangeFilter('All')
    setCustomStartDate('')
    setCustomEndDate('')
  }

  return (
    <>
      <Head>
        <title>Announcements - WePro</title>
        <meta name="description" content="Manage knowledge hub announcements" />
      </Head>
      <div className="space-y-6">
        {/* Main Tab Navigation */}
        <SettingsNavigation />

        {/* Sub Tab Navigation */}
        <KnowledgeHubSubNavigation />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Announcements
            </h1>
          </div>
          <Button
            onClick={() =>
              router.push('/settings/knowledgeHub/announcements/create')
            }
            className="wepro-button-gradient text-white"
            disabled={!tenantId}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Announcement
          </Button>
        </div>

        {/* Content Area */}
        <Card>
          <CardContent className="pt-6">
            {!tenantId ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Tenant ID Required
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Unable to load announcements. Please ensure you are logged in
                  with a valid tenant account.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 mx-auto"
                >
                  <div className="h-4 w-4 rotate-45 border-2 border-current border-t-transparent border-r-transparent" />
                  Refresh Page
                </Button>
              </div>
            ) : (
              <>
                {/* Filters and Search in Single Row */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  {/* Filters Section */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    {/* Status Filter */}
                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-medium">Status</Label>
                      <Select
                        value={statusFilter || 'all'}
                        onValueChange={value =>
                          setStatusFilter(value === 'all' ? '' : value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Source Code Filter */}
                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-medium">Source Code</Label>
                      <Select
                        value={sourceCodeFilter || 'all'}
                        onValueChange={value =>
                          setSourceCodeFilter(value === 'all' ? '' : value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Sources" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sources</SelectItem>
                          {sources.map(source => (
                            <SelectItem key={source.id} value={source.code}>
                              {source.code} - {source.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-medium">Date Range</Label>
                      <Select
                        value={dateRangeFilter}
                        onValueChange={setDateRangeFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                          <SelectItem value="Today">Today</SelectItem>
                          <SelectItem value="Yesterday">Yesterday</SelectItem>
                          <SelectItem value="This Week Sun">
                            This Week Sun
                          </SelectItem>
                          <SelectItem value="This Week Mon">
                            This Week Mon
                          </SelectItem>
                          <SelectItem value="Last 7 Days">
                            Last 7 Days
                          </SelectItem>
                          <SelectItem value="Last Week Sun">
                            Last Week Sun
                          </SelectItem>
                          <SelectItem value="Last Week Mon">
                            Last Week Mon
                          </SelectItem>
                          <SelectItem value="Last Business Week">
                            Last Business Week
                          </SelectItem>
                          <SelectItem value="Last 14 Days">
                            Last 14 Days
                          </SelectItem>
                          <SelectItem value="This Month">This Month</SelectItem>
                          <SelectItem value="Last 30 Days">
                            Last 30 Days
                          </SelectItem>
                          <SelectItem value="Last Month">Last Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Custom Date Range Picker - Only show when Custom is selected */}
                    {dateRangeFilter === 'Custom' && (
                      <>
                        <div className="space-y-2 flex-1">
                          <Label className="text-sm font-medium">
                            Start Date
                          </Label>
                          <Input
                            type="date"
                            value={customStartDate}
                            onChange={e => setCustomStartDate(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2 flex-1">
                          <Label className="text-sm font-medium">
                            End Date
                          </Label>
                          <Input
                            type="date"
                            value={customEndDate}
                            onChange={e => setCustomEndDate(e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </>
                    )}

                    {/* Search Bar */}
                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-medium">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          placeholder="Search announcements..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-medium">&nbsp;</Label>
                      <div className="space-y-2 flex justify-end">
                        <Button
                          variant="outline"
                          onClick={clearAllFilters}
                          disabled={
                            !statusFilter &&
                            !sourceCodeFilter &&
                            !searchTerm &&
                            dateRangeFilter === 'All' &&
                            !customStartDate &&
                            !customEndDate
                          }
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

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
                      value={pagination.limit.toString()}
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

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-auto">Title</TableHead>
                        <TableHead className="w-24">Code</TableHead>
                        <TableHead className="w-32">Time Range</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead className="w-32">Created By</TableHead>
                        <TableHead className="w-32">Created At</TableHead>
                        <TableHead className="w-20 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
                              Loading announcements...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-red-500"
                          >
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : announcements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No announcements found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        announcements.map(announcement => (
                          <TableRow key={announcement._id}>
                            <TableCell className="font-medium w-auto">
                              <div>
                                <div className="font-semibold">
                                  {announcement.title}
                                </div>
                                {announcement.announcement && (
                                  <div className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                    {announcement.announcement.replace(
                                      /<[^>]*>/g,
                                      ''
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="w-24">
                              <div className="truncate">
                                <Badge variant="outline" className="font-mono">
                                  {announcement.code}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="w-32">
                              <div className="truncate">
                                <div className="text-sm">
                                  {announcement.startTime} -{' '}
                                  {announcement.endTime}
                                </div>
                                {announcement.isExpire &&
                                  announcement.expireDate && (
                                    <div className="text-xs text-neutral-500">
                                      Expires:{' '}
                                      {formatDate(
                                        announcement.expireDate,
                                        userData?.timezoneId?.value
                                      )}
                                    </div>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell className="w-24">
                              <div className="truncate">
                                <Badge
                                  className={getStatusBadgeColor(
                                    announcement.status
                                  )}
                                >
                                  {announcement.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="w-32">
                              <div className="truncate">
                                {announcement.createdBy?.name || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="w-32">
                              <div className="truncate">
                                {formatDate(
                                  announcement.createdAt,
                                  userData?.timezoneId?.value
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="w-20 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() =>
                                      handleViewAnnouncement(announcement)
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                  {checkPermission('MOD030', 'edit') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() =>
                                        router.push(
                                          `/settings/knowledgeHub/announcements/create?id=${announcement._id}`
                                        )
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Announcement
                                    </DropdownMenuItem>
                                  )}
                                  {checkPermission('MOD030', 'delete') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600"
                                      onClick={() =>
                                        handleDeleteAnnouncement(announcement)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Announcement
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{' '}
                    of {pagination.total} entries
                  </div>

                  {/* Pagination buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
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
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1
                          } else if (pagination.page >= pagination.pages - 2) {
                            pageNum = pagination.pages - 4 + i
                          } else {
                            pageNum = pagination.page - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                pagination.page === pageNum
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
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{announcementToDelete?.title}</strong>? This action cannot
              be undone and will permanently remove the announcement from the
              system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600 mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Announcement Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b border-neutral-200 dark:border-neutral-700">
            <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
              Announcement Details
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pb-6">
            <div>
              {/* Announcement Header Information Card */}
              <Card className="border-neutral-200 dark:border-neutral-700 mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {selectedAnnouncement?.title}
                    </CardTitle>
                    {/* Status and Code */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={`${getStatusBadgeColor(selectedAnnouncement?.status || '')} px-2 py-1 text-xs font-medium`}
                      >
                        {selectedAnnouncement?.status}
                      </Badge>
                      <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs border">
                        {selectedAnnouncement?.code}
                      </span>
                    </div>
                  </div>
                  {/* Time and Expiry Info */}
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                    <div>
                      <span className="font-medium">Time Range:</span>{' '}
                      {selectedAnnouncement?.startTime} -{' '}
                      {selectedAnnouncement?.endTime}
                    </div>
                    {selectedAnnouncement?.isExpire &&
                      selectedAnnouncement?.expireDate && (
                        <div>
                          <span className="font-medium">Expires:</span>{' '}
                          {formatDate(
                            selectedAnnouncement.expireDate,
                            userData?.timezoneId?.value
                          )}
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Announcement Content */}
              <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                Announcement Content
              </CardTitle>
              {selectedAnnouncement?.announcement ? (
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <ReactQuill
                      value={selectedAnnouncement.announcement}
                      readOnly={true}
                      theme="snow"
                      modules={{
                        toolbar: false,
                      }}
                      className="bg-transparent [&_.ql-editor]:p-0 [&_.ql-editor]:text-neutral-800 dark:[&_.ql-editor]:text-neutral-200 [&_.ql-editor]:text-base [&_.ql-editor]:leading-relaxed [&_.ql-container]:border-0 [&_.ql-container.ql-snow]:border-0 [&_.ql-toolbar]:hidden"
                      style={{ border: 'none' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="text-neutral-400 dark:text-neutral-500 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400 italic text-lg">
                    No announcement content available
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
