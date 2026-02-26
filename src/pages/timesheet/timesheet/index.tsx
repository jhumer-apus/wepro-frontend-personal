import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent } from '@/src/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Textarea } from '@/src/components/ui/textarea'
import { Users, Clock, Search, MoreVertical, Edit, Loader2 } from 'lucide-react'
import React, { useState, useEffect, useRef, useCallback } from 'react'
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
import { Check, ChevronsUpDown } from 'lucide-react'
import { apiService } from '@/src/services/api'
import { useAppSelector } from '@/src/store/hooks'
import { TableLoading } from '@/src/components/ui/loading'
import {
  Timesheet,
  TimesheetApiResponse,
  AdminTimesheetApiResponse,
  RegularTimesheetApiResponse,
  EditHistoryEntry,
} from '@/src/constants/interface/timesheet'
import { usePermissions } from '@/src/hooks/usePermissions'
import { useDebounce } from '@/src/hooks/useDebounce'

export default function TimesheetPage() {
  const router = useRouter()
  const { data: userData } = useAppSelector(state => state.user)
  const { checkPermission, getUserType } = usePermissions()

  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(
    null
  )
  const [editFormData, setEditFormData] = useState({
    clockInAt: '',
    clockOutAt: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // User filter states
  const [filterUserId, setFilterUserId] = useState<string>('all')
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')

  // Debounced values for search fields
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const debouncedUserSearchTerm = useDebounce(userSearchTerm, 300)

  // Ref to track if this is the initial load
  const isInitialLoad = useRef(true)
  // Ref to track the previous search term to avoid unnecessary API calls
  const prevSearchTerm = useRef(searchTerm)
  // Ref to track the previous user search term to avoid unnecessary API calls
  const prevUserSearchTerm = useRef(userSearchTerm)

  // Fetch users from API
  const fetchUsers = useCallback(async (searchTerm: string = '') => {
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

      console.log('API URL:', `/v3/users?${params}`)
      const response = await apiService.get(`/v3/users?${params}`)
      console.log('API Response:', response.data)

      if (response.data.success) {
        setUsers(response.data.data)
        console.log('Users set:', response.data.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  // Fetch timesheets from API
  const fetchTimesheets = useCallback(
    async (page: number, limit: number) => {
      try {
        setLoading(true)
        setError(null)

        if (!userData?.tenantId) {
          setError('Tenant ID not found. Please log in again.')
          setLoading(false)
          return
        }

        let url = `/v3/timesheets?page=${page}&limit=${limit}`
        const isAdminView = checkPermission('MOD016', 'view_all_timesheets')
        if (isAdminView) {
          url = `/v3/admin/timesheets?page=${page}&limit=${limit}`
        }

        // Add search parameter if search term exists
        if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
          url += `&search=${encodeURIComponent(debouncedSearchTerm.trim())}`
        }

        // Add userId parameter if selected
        if (filterUserId && filterUserId !== 'all') {
          url += `&userId=${encodeURIComponent(filterUserId)}`
        }

        let response: any
        if (isAdminView) {
          response = await apiService.get<AdminTimesheetApiResponse>(url)
        } else {
          response = await apiService.get<RegularTimesheetApiResponse>(url)
        }
        const data = response.data

        if (data.success) {
          if (isAdminView) {
            // Admin endpoint response structure
            const adminData = data as AdminTimesheetApiResponse
            setTimesheets(adminData.data)
            setTotalCount(adminData.pagination.total)
            setTotalPages(adminData.pagination.pages)
          } else {
            // Regular endpoint response structure
            const regularData = data as RegularTimesheetApiResponse
            setTimesheets(regularData.data.timesheets)
            setTotalCount(regularData.data.pagination.total)
            setTotalPages(regularData.data.pagination.pages)
          }
        } else {
          setError(data.message || 'Failed to fetch timesheets')
        }
      } catch (err: any) {
        console.error('Error fetching timesheets:', err)
        setError(
          err.response?.data?.message ||
            'Failed to fetch timesheets. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    },
    [userData?.tenantId, debouncedSearchTerm, filterUserId, checkPermission]
  )

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers('')
  }, [fetchUsers])

  // Debounced search effect for users
  useEffect(() => {
    if (userDropdownOpen) {
      console.log('Fetching users with search term:', debouncedUserSearchTerm)
      fetchUsers(debouncedUserSearchTerm)
    }
  }, [debouncedUserSearchTerm, userDropdownOpen, fetchUsers])

  // Single useEffect to handle all data fetching scenarios
  useEffect(() => {
    // Don't fetch if no tenant ID
    if (!userData?.tenantId) return

    // Initial load - fetch once
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      fetchTimesheets(currentPage, entriesPerPage)
      return
    }

    // Handle search term changes with debouncing
    if (prevSearchTerm.current !== debouncedSearchTerm) {
      prevSearchTerm.current = debouncedSearchTerm

      // Reset to first page when searching
      if (debouncedSearchTerm !== '') {
        setCurrentPage(1)
        fetchTimesheets(1, entriesPerPage)
      } else {
        // If search is cleared, fetch current page
        fetchTimesheets(currentPage, entriesPerPage)
      }
      return
    }

    // Handle page, entries per page, or filterUserId changes
    fetchTimesheets(currentPage, entriesPerPage)
  }, [
    userData?.tenantId,
    currentPage,
    entriesPerPage,
    debouncedSearchTerm,
    filterUserId,
    fetchTimesheets,
  ])

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEntriesChange = (value: string) => {
    const newLimit = parseInt(value)
    setEntriesPerPage(newLimit)
    setCurrentPage(1) // Reset to first page when changing entries per page
  }

  // Get selected user name for display
  const getSelectedUserName = () => {
    if (filterUserId === 'all') return 'All Users'
    const user = users.find(u => u._id === filterUserId)
    return user ? `${user.name} (${user.username})` : 'Select user...'
  }

  // Handle dropdown close
  const handleUserDropdownClose = (open: boolean) => {
    setUserDropdownOpen(open)
    if (!open) {
      setUserSearchTerm('')
      // Fetch all users when closing
      fetchUsers('')
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone:
        userData?.timezoneId?.value ||
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  }

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone:
        userData?.timezoneId?.value ||
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  }

  // Format duration
  const formatDuration = (timesheet: Timesheet) => {
    // If clockOut is null and durationMs is 0, show --/--
    if (!timesheet.clockOutAt && timesheet.durationMs === 0) {
      return '--/--'
    }

    if (timesheet.durationMs === 0) return '0h 0m'

    const hours = Math.floor(timesheet.durationMs / (1000 * 60 * 60))
    const minutes = Math.floor(
      (timesheet.durationMs % (1000 * 60 * 60)) / (1000 * 60)
    )

    return `${hours}h ${minutes}m`
  }

  // Get status badge
  const getStatusBadge = (timesheet: Timesheet) => {
    if (timesheet.clockOutAt) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Completed
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Active
        </Badge>
      )
    }
  }

  // Check if user can edit timesheets
  const canEditTimesheet =
    checkPermission('MOD016', 'edit_any_timesheet') ||
    checkPermission('MOD009', 'edit_timesheet')

  // Convert UTC date to user's timezone for datetime-local input
  const convertToLocalDateTime = (utcDateString: string) => {
    const date = new Date(utcDateString)
    const userTimezone =
      userData?.timezoneId?.value ||
      Intl.DateTimeFormat().resolvedOptions().timeZone

    // Format the date in the user's timezone for datetime-local input
    const year = date.toLocaleDateString('en-CA', {
      year: 'numeric',
      timeZone: userTimezone,
    })
    const month = date.toLocaleDateString('en-CA', {
      month: '2-digit',
      timeZone: userTimezone,
    })
    const day = date.toLocaleDateString('en-CA', {
      day: '2-digit',
      timeZone: userTimezone,
    })
    const hours = date.toLocaleTimeString('en-CA', {
      hour: '2-digit',
      hour12: false,
      timeZone: userTimezone,
    })
    const minutes = date.toLocaleTimeString('en-CA', {
      minute: '2-digit',
      hour12: false,
      timeZone: userTimezone,
    })

    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Convert local datetime to UTC for API
  const convertToUTC = (localDateTimeString: string) => {
    if (!localDateTimeString) return null
    const userTimezone =
      userData?.timezoneId?.value ||
      Intl.DateTimeFormat().resolvedOptions().timeZone

    // Create a date object from the local datetime string
    const localDate = new Date(localDateTimeString)

    // Get the timezone offset for the user's timezone
    const utcTime = localDate.getTime()
    const localTime = new Date(
      localDate.toLocaleString('en-US', { timeZone: userTimezone })
    ).getTime()
    const timezoneOffset = utcTime - localTime

    // Convert to UTC by adjusting for the timezone offset
    const utcDate = new Date(utcTime + timezoneOffset)
    return utcDate.toISOString()
  }

  // Format edit history date
  const formatEditHistoryDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone:
        userData?.timezoneId?.value ||
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  }

  // Format edit history date and time
  const formatEditHistoryDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone:
        userData?.timezoneId?.value ||
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  }

  // Format edit history time
  const formatEditHistoryTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone:
        userData?.timezoneId?.value ||
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  }

  // Format duration for edit history
  const formatEditHistoryDuration = (durationMs: number) => {
    if (durationMs === 0) return '0h 0m'
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  // Get change description for edit history
  const getChangeDescription = (field: string, change: any) => {
    switch (field) {
      case 'clockInAt':
        return `Clock In: ${change.old ? formatEditHistoryTime(change.old) : 'None'} → ${change.new ? formatEditHistoryTime(change.new) : 'None'}`
      case 'clockOutAt':
        return `Clock Out: ${change.old ? formatEditHistoryTime(change.old) : 'None'} → ${change.new ? formatEditHistoryTime(change.new) : 'None'}`
      case 'notes':
        return `Notes: "${change.old || 'None'}" → "${change.new || 'None'}"`
      case 'durationMs':
        return `Duration: ${formatEditHistoryDuration(change.old)} → ${formatEditHistoryDuration(change.new)}`
      case 'flags':
        return null // Hide flags from edit history
      default:
        return `${field}: ${JSON.stringify(change.old)} → ${JSON.stringify(change.new)}`
    }
  }

  // Handle opening edit modal
  const handleEditTimesheet = (timesheet: Timesheet) => {
    setSelectedTimesheet(timesheet)
    setEditFormData({
      clockInAt: convertToLocalDateTime(timesheet.clockInAt),
      clockOutAt: timesheet.clockOutAt
        ? convertToLocalDateTime(timesheet.clockOutAt)
        : '',
      notes: timesheet.notes || '',
    })
    setIsEditModalOpen(true)
  }

  // Handle closing edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedTimesheet(null)
    setEditFormData({
      clockInAt: '',
      clockOutAt: '',
      notes: '',
    })
  }

  // Handle form input changes
  const handleFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle saving timesheet changes
  const handleSaveTimesheet = async () => {
    if (!selectedTimesheet) return

    try {
      setSubmitting(true)
      const updateData: any = {
        clockInAt: convertToUTC(editFormData.clockInAt),
        notes: editFormData.notes,
        flags: {
          autoClockedOut: false,
        },
      }

      // Only include clockOutAt if it has a value
      if (editFormData.clockOutAt && editFormData.clockOutAt.trim() !== '') {
        updateData.clockOutAt = convertToUTC(editFormData.clockOutAt)
      }
      // console.log(updateData, 'updateData'); return;
      let url = `/v3/timesheets/${selectedTimesheet._id}`
      const isAdminView = checkPermission('MOD016', 'view_all_timesheets')
      if (isAdminView) {
        url = `/v3/admin/timesheets/${selectedTimesheet._id}`
      }
      await apiService.patch(url, updateData)

      // Refresh the timesheet list
      fetchTimesheets(currentPage, entriesPerPage)
      handleCloseEditModal()
    } catch (error) {
      console.error('Error updating timesheet:', error)
      setError('Failed to update timesheet. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Timesheet - WePro</title>
        <meta name="description" content="Manage WePro timesheet entries" />
      </Head>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Timesheet
            </h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
          <Button
            variant="ghost"
            onClick={() => router.push('/timesheet/activeUsers')}
            className="flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <Users className="w-4 h-4 mr-2" />
            Active Users
          </Button>
          <Button
            variant="default"
            onClick={() => router.push('/timesheet/timesheet')}
            className="flex-1 flex items-center justify-center text-white"
          >
            <Clock className="w-4 h-4 mr-2" />
            Timesheet
          </Button>
        </div>

        {/* Filters and Search Component */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* User Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by User</Label>
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
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onValueChange={setUserSearchTerm}
                      />
                      <CommandList>
                        {loadingUsers ? (
                          <CommandEmpty>Loading users...</CommandEmpty>
                        ) : users.length === 0 ? (
                          <CommandEmpty>
                            {debouncedUserSearchTerm
                              ? 'No users found matching your search.'
                              : 'No users found.'}
                          </CommandEmpty>
                        ) : (
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => {
                                setFilterUserId('all')
                                setUserDropdownOpen(false)
                                setCurrentPage(1) // Reset to first page when filtering
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
                            {users
                              .filter(user => {
                                if (!debouncedUserSearchTerm) return true
                                const searchLower =
                                  debouncedUserSearchTerm.toLowerCase()
                                return (
                                  user.name
                                    ?.toLowerCase()
                                    .includes(searchLower) ||
                                  user.username
                                    ?.toLowerCase()
                                    .includes(searchLower) ||
                                  user.email
                                    ?.toLowerCase()
                                    .includes(searchLower)
                                )
                              })
                              .map(user => (
                                <CommandItem
                                  key={user._id}
                                  value={user._id}
                                  onSelect={() => {
                                    setFilterUserId(user._id)
                                    setUserDropdownOpen(false)
                                    setCurrentPage(1) // Reset to first page when filtering
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

              {/* Search Bar */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search notes or source..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timesheet List */}
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

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Notes</TableHead>
                    {canEditTimesheet && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableLoading
                      message="Loading timesheets..."
                      colSpan={canEditTimesheet ? 8 : 7}
                    />
                  ) : timesheets.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={canEditTimesheet ? 8 : 7}
                        className="text-center py-8"
                      >
                        <span className="text-neutral-500">
                          No timesheets found
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    timesheets.map(timesheet => (
                      <TableRow key={timesheet._id}>
                        <TableCell className="font-medium">
                          {timesheet.userId.name}
                        </TableCell>
                        <TableCell>{getStatusBadge(timesheet)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {formatDate(timesheet.clockInAt)}
                            </div>
                            <div className="text-neutral-600 dark:text-neutral-400">
                              {formatTime(timesheet.clockInAt)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {timesheet.clockOutAt ? (
                            <div className="text-sm">
                              <div className="font-medium">
                                {formatDate(timesheet.clockOutAt)}
                              </div>
                              <div className="text-neutral-600 dark:text-neutral-400">
                                {formatTime(timesheet.clockOutAt)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {formatDuration(timesheet)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {timesheet.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xs truncate block">
                            {timesheet.notes || '-'}
                          </span>
                        </TableCell>
                        {canEditTimesheet && (
                          <TableCell className="text-right">
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
                                  onClick={() => handleEditTimesheet(timesheet)}
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Timesheet
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
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
                {timesheets.length > 0
                  ? (currentPage - 1) * entriesPerPage + 1
                  : 0}{' '}
                to {Math.min(currentPage * entriesPerPage, totalCount)} of{' '}
                {totalCount} entries
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0 text-white"
                      disabled={loading}
                    >
                      {page}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
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
                <span className="text-neutral-500">Loading timesheets...</span>
              </div>
            ) : timesheets.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-neutral-500">No timesheets found</span>
              </div>
            ) : (
              timesheets.map(timesheet => (
                <Card key={timesheet._id} className="relative border border-neutral-200 dark:border-neutral-700">
                  <CardContent className="pt-4 pb-4">
                    <div className="space-y-3">
                      {/* Employee */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Employee
                        </div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {timesheet.userId.name}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Status
                        </div>
                        <div>{getStatusBadge(timesheet)}</div>
                      </div>

                      {/* Clock In */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Clock In
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            {formatDate(timesheet.clockInAt)}
                          </div>
                          <div className="text-neutral-600 dark:text-neutral-400">
                            {formatTime(timesheet.clockInAt)}
                          </div>
                        </div>
                      </div>

                      {/* Clock Out */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Clock Out
                        </div>
                        {timesheet.clockOutAt ? (
                          <div className="text-sm">
                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                              {formatDate(timesheet.clockOutAt)}
                            </div>
                            <div className="text-neutral-600 dark:text-neutral-400">
                              {formatTime(timesheet.clockOutAt)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </div>

                      {/* Duration */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Duration
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {formatDuration(timesheet)}
                        </div>
                      </div>

                      {/* Source */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Source
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {timesheet.source}
                        </Badge>
                      </div>

                      {/* Notes */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Notes
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {timesheet.notes || '-'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  {/* Action Button - Outside Card */}
                  {canEditTimesheet && (
                    <div className="absolute top-4 right-4">
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
                            onClick={() => handleEditTimesheet(timesheet)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit Timesheet
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Showing entries info */}
          <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
            Showing{' '}
            {timesheets.length > 0
              ? (currentPage - 1) * entriesPerPage + 1
              : 0}{' '}
            to {Math.min(currentPage * entriesPerPage, totalCount)} of{' '}
            {totalCount} entries
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8 h-8 p-0 text-white"
                  disabled={loading}
                >
                  {page}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Edit Timesheet Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent
            className={
              'max-h-[90vh] overflow-y-auto' +
              (selectedTimesheet?.editHistory &&
              selectedTimesheet.editHistory.length > 0
                ? ' sm:max-w-[1200px]'
                : '')
            }
          >
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                Edit Timesheet
              </DialogTitle>
              <DialogDescription className="text-base text-neutral-600 dark:text-neutral-400 mt-2">
                Update the timesheet details for{' '}
                {selectedTimesheet?.userId?.name}
              </DialogDescription>
            </DialogHeader>

            <div
              className={
                'grid grid-cols-1 gap-6' +
                (selectedTimesheet?.editHistory &&
                selectedTimesheet.editHistory.length > 0
                  ? ' lg:grid-cols-2'
                  : '')
              }
            >
              {/* Edit Form */}
              <div className="space-y-6">
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    handleSaveTimesheet()
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <Label
                      htmlFor="clockInAt"
                      className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Clock In Time *
                    </Label>
                    <Input
                      id="clockInAt"
                      type="datetime-local"
                      value={editFormData.clockInAt}
                      onChange={e =>
                        handleFormChange('clockInAt', e.target.value)
                      }
                      required
                      className="h-12 text-base"
                    />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Select the date and time when the employee clocked in
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="clockOutAt"
                      className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Clock Out Time
                    </Label>
                    <Input
                      id="clockOutAt"
                      type="datetime-local"
                      value={editFormData.clockOutAt}
                      onChange={e =>
                        handleFormChange('clockOutAt', e.target.value)
                      }
                      className="h-12 text-base"
                    />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Select the date and time when the employee clocked out
                      (leave empty if still active)
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="notes"
                      className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={editFormData.notes}
                      onChange={e => handleFormChange('notes', e.target.value)}
                      className="min-h-[100px] text-base"
                      placeholder="Add any additional notes or comments about this timesheet entry..."
                    />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Optional notes or comments about this timesheet entry
                    </p>
                  </div>
                  {!(
                    selectedTimesheet?.editHistory &&
                    selectedTimesheet.editHistory.length > 0
                  ) && (
                    <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCloseEditModal}
                          disabled={submitting}
                          className="h-11 px-6"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="wepro-button-gradient text-white h-11 px-6"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            'Update Timesheet'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Edit History Table */}
              {selectedTimesheet?.editHistory &&
                selectedTimesheet.editHistory.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        Edit History
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Track of all changes made to this timesheet
                      </p>
                    </div>

                    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                      <div className="max-h-[400px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Date</TableHead>
                              <TableHead className="text-xs">Field</TableHead>
                              <TableHead className="text-xs">Before</TableHead>
                              <TableHead className="text-xs">After</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedTimesheet.editHistory
                              .sort(
                                (a, b) =>
                                  new Date(b.at).getTime() -
                                  new Date(a.at).getTime()
                              )
                              .map((entry, index) => (
                                <React.Fragment key={entry._id}>
                                  {Object.entries(entry.changes)
                                    .filter(([field]) => field !== 'flags')
                                    .map(([field, change], changeIndex) => (
                                      <TableRow key={`${entry._id}-${field}`}>
                                        {changeIndex === 0 && (
                                          <TableCell
                                            className="text-xs py-2 align-top"
                                            rowSpan={
                                              Object.entries(
                                                entry.changes
                                              ).filter(
                                                ([field]) => field !== 'flags'
                                              ).length
                                            }
                                          >
                                            <div className="space-y-1">
                                              <div className="font-medium">
                                                {formatEditHistoryDateTime(
                                                  entry.at
                                                )}
                                              </div>
                                              <div className="text-neutral-500 dark:text-neutral-400">
                                                by {entry.by}
                                              </div>
                                            </div>
                                          </TableCell>
                                        )}
                                        <TableCell className="text-xs py-2 font-medium">
                                          {field === 'clockInAt'
                                            ? 'Clock In'
                                            : field === 'clockOutAt'
                                              ? 'Clock Out'
                                              : field === 'notes'
                                                ? 'Notes'
                                                : field === 'durationMs'
                                                  ? 'Duration'
                                                  : field}
                                        </TableCell>
                                        <TableCell className="text-xs py-2">
                                          {field === 'clockInAt' ||
                                          field === 'clockOutAt'
                                            ? change.old
                                              ? formatEditHistoryDateTime(
                                                  change.old
                                                )
                                              : 'None'
                                            : field === 'notes'
                                              ? change.old || 'None'
                                              : field === 'durationMs'
                                                ? formatEditHistoryDuration(
                                                    change.old
                                                  )
                                                : JSON.stringify(change.old)}
                                        </TableCell>
                                        <TableCell className="text-xs py-2">
                                          {field === 'clockInAt' ||
                                          field === 'clockOutAt'
                                            ? change.new
                                              ? formatEditHistoryDateTime(
                                                  change.new
                                                )
                                              : 'None'
                                            : field === 'notes'
                                              ? change.new || 'None'
                                              : field === 'durationMs'
                                                ? formatEditHistoryDuration(
                                                    change.new
                                                  )
                                                : JSON.stringify(change.new)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </React.Fragment>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    <div className="pt-6">
                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCloseEditModal}
                          disabled={submitting}
                          className="h-11 px-6"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="wepro-button-gradient text-white h-11 px-6"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            'Update Timesheet'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
