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
import { Users, Clock, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { apiService } from '@/src/services/api'
import { useAppSelector } from '@/src/store/hooks'
import {
  ActiveUser,
  ActiveUsersApiResponse,
} from '@/src/constants/interface/timesheet'
import { usePermissions } from '@/src/hooks/usePermissions'
import { useDebounce } from '@/src/hooks/useDebounce'

export default function ActiveUsersPage() {
  const router = useRouter()
  const { data: userData } = useAppSelector(state => state.user)
  const { checkPermission, getUserType } = usePermissions()

  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<ActiveUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500) // 500ms delay
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  // Fetch active users from API
  const fetchActiveUsers = async (searchQuery?: string) => {
    try {
      setLoading(true)
      setError(null)

      if (!userData?.tenantId) {
        setError('Tenant ID not found. Please log in again.')
        setLoading(false)
        return
      }

      let url = `/v1/timesheets/active`
      if (checkPermission('MOD016', 'view_all_timesheets')) {
        url = `/v1/admin/timesheets/active`
      }

      // Add search parameter if provided
      if (searchQuery && searchQuery.trim() !== '') {
        const separator = url.includes('?') ? '&' : '?'
        url += `${separator}search=${encodeURIComponent(searchQuery.trim())}`
      }

      const response = await apiService.get<ActiveUsersApiResponse>(url)
      const data = response.data

      if (data.success) {
        if (checkPermission('MOD016', 'view_all_timesheets')) {
          // For admin users, the response structure might be different
          // Check if data.data.data exists (admin structure) or use regular structure
          const users = (data as any).data?.data
            ? Object.values((data as any).data.data).map((val: any) => val[0])
            : data.data.users
          setActiveUsers(users)
          setFilteredUsers(users)
        } else {
          setActiveUsers(data.data.users)
          setFilteredUsers(data.data.users)
        }
        setTotalCount(data.data.totalActive)
      } else {
        setError(data.message || 'Failed to fetch active users')
      }
    } catch (err: any) {
      console.error('Error fetching active users:', err)
      setError(
        err.response?.data?.message ||
          'Failed to fetch active users. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Search users via API with debounced search term
  useEffect(() => {
    if (userData?.tenantId) {
      fetchActiveUsers(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, userData?.tenantId])

  // Get paginated users
  const getPaginatedUsers = () => {
    const startIndex = (currentPage - 1) * entriesPerPage
    const endIndex = startIndex + entriesPerPage
    return filteredUsers.slice(startIndex, endIndex)
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEntriesChange = (value: string) => {
    const newLimit = parseInt(value)
    setEntriesPerPage(newLimit)
    setCurrentPage(1) // Reset to first page when changing entries per page
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Format duration
  const formatDuration = (durationMs: number) => {
    if (durationMs === 0) return '0h 0m'

    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  // Get status badge
  const getStatusBadge = (user: ActiveUser) => {
    if (user.status === 'IN') {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Active
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          Inactive
        </Badge>
      )
    }
  }

  // Get current paginated users
  const currentUsers = getPaginatedUsers()
  const totalPages = Math.ceil(totalCount / entriesPerPage)

  return (
    <>
      <Head>
        <title>Active Users - Timesheet - WePro</title>
        <meta name="description" content="Manage WePro active users" />
      </Head>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Active Users
            </h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
          <Button
            variant="default"
            onClick={() => router.push('/timesheet/activeUsers')}
            className="flex-1 flex items-center justify-center text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            Active Users
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/timesheet/timesheet')}
            className="flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <Clock className="w-4 h-4 mr-2" />
            Timesheet
          </Button>
        </div>

        {/* Search Component */}
        <Card>
          <CardContent className="pt-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Search
                </span>
              </div>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search active users..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Users List */}
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
                    <TableHead>Duration</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <span className="text-neutral-500">
                          Loading active users...
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : currentUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <span className="text-neutral-500">
                          No active users found
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentUsers.map(user => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">
                          {user.userId.name}
                        </TableCell>
                        <TableCell>{getStatusBadge(user)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {formatDate(user.activeTimesheetId.clockInAt)}
                            </div>
                            <div className="text-neutral-600 dark:text-neutral-400">
                              {formatTime(user.activeTimesheetId.clockInAt)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {formatDuration(user.durationSinceClockedIn)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {user.activeTimesheetId.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xs truncate block">
                            {user.activeTimesheetId.notes || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {user.activeTimesheetId.ip}
                          </span>
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
                {currentUsers.length > 0
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
                      className="w-8 h-8 p-0"
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
                <span className="text-neutral-500">Loading active users...</span>
              </div>
            ) : currentUsers.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-neutral-500">No active users found</span>
              </div>
            ) : (
              currentUsers.map(user => (
                <Card key={user._id} className="border border-neutral-200 dark:border-neutral-700">
                  <CardContent className="pt-4 pb-4">
                    <div className="space-y-3">
                      {/* Employee */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Employee
                        </div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {user.userId.name}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Status
                        </div>
                        <div>{getStatusBadge(user)}</div>
                      </div>

                      {/* Clock In */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Clock In
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            {formatDate(user.activeTimesheetId.clockInAt)}
                          </div>
                          <div className="text-neutral-600 dark:text-neutral-400">
                            {formatTime(user.activeTimesheetId.clockInAt)}
                          </div>
                        </div>
                      </div>

                      {/* Duration */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Duration
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {formatDuration(user.durationSinceClockedIn)}
                        </div>
                      </div>

                      {/* Source */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Source
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {user.activeTimesheetId.source}
                        </Badge>
                      </div>

                      {/* Notes */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Notes
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {user.activeTimesheetId.notes || '-'}
                        </div>
                      </div>

                      {/* IP Address */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          IP Address
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {user.activeTimesheetId.ip}
                        </div>
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
            {currentUsers.length > 0
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
                  className="w-8 h-8 p-0"
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
      </div>
    </>
  )
}
