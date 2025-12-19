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
  Users,
  Shield,
  Plus,
  MoreVertical,
  Edit,
  Eye,
  Search,
  Trash2,
} from 'lucide-react'
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
import { User, UsersApiResponse } from '@/src/constants/interface/users'
import { useAppSelector } from '@/src/store/hooks'
import { toast } from 'sonner'
import { TableLoading, ButtonLoading } from '@/src/components/ui/loading'
import { usePermissions } from '@/src/hooks/usePermissions'
import { Role, RoleManagementResponse } from '@/src/constants/interface/role'

export default function TeamMembersPage() {
  const router = useRouter()
  const { data: userData } = useAppSelector(state => state.user)
  const { checkPermission, getUserType } = usePermissions()

  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roles, setRoles] = useState<Role[]>([])
  const [isRolesLoading, setIsRolesLoading] = useState(false)

  // Fetch users from API
  const fetchUsers = async (
    page: number,
    limit: number,
    roleId?: string,
    search?: string,
    status?: string
  ) => {
    try {
      setLoading(true)
      setError(null)

      if (!userData?.tenantId) {
        setError('Tenant ID not found. Please log in again.')
        setLoading(false)
        return
      }

      let url = `/v1/users?page=${page}&limit=${limit}&type=P5`

      if (roleId && roleId !== 'all') {
        url += `&roleId=${roleId}`
      }

      if (status && status !== 'all') {
        url += `&status=${status}`
      }

      if (search && search.trim() !== '') {
        url += `&search=${encodeURIComponent(search.trim())}`
      }

      const response = await apiService.get<UsersApiResponse>(url)
      const data = response.data

      setTeamMembers(data.data)
      setTotalCount(data.count)
      setTotalPages(data.pagination.pages)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to fetch users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      setIsRolesLoading(true)
      if (!userData?.tenantId) {
        setError('Tenant ID not found. Please log in again.')
        return
      }
      const response = await apiService.get<RoleManagementResponse>(
        `/v1/role-management?tenantId=${userData.tenantId}`
      )
      // Filter to only show featured roles
      const featuredRoles = response.data.data.filter(
        (role: Role) => role.isFeatured === true
      )
      setRoles(featuredRoles)
    } catch (err) {
      console.error('Error fetching roles:', err)
      setError('Failed to fetch roles. Please try again.')
    } finally {
      setIsRolesLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (!isRolesLoading && userData?.tenantId) {
      fetchRoles()
    }
  }, [userData?.tenantId])

  // Fetch when page, entries per page, or filter changes
  useEffect(() => {
    if (!loading && userData?.tenantId) {
      fetchUsers(
        currentPage,
        entriesPerPage,
        activeFilter,
        searchTerm,
        statusFilter
      )
    }
  }, [
    currentPage,
    entriesPerPage,
    activeFilter,
    statusFilter,
    userData?.tenantId,
  ])

  // Debounced search - trigger API call with search parameter
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userData?.tenantId) {
        setCurrentPage(1) // Reset to first page when searching
        fetchUsers(1, entriesPerPage, activeFilter, searchTerm, statusFilter)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [
    searchTerm,
    userData?.tenantId,
    entriesPerPage,
    activeFilter,
    statusFilter,
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

  // Delete handlers
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete || !userData?.tenantId) return

    try {
      setDeleting(true)
      await apiService.delete(`/v1/users/${userToDelete._id}`)

      // Refresh the current page data
      await fetchUsers(
        currentPage,
        entriesPerPage,
        activeFilter,
        searchTerm,
        statusFilter
      )

      // Show success toast
      toast.success('Team member deleted successfully!', {
        description: 'The team member has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (err: any) {
      console.error('Error deleting user:', err)
      // Show error toast
      toast.error('Failed to delete team member', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the team member.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Get status badge styling
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'Suspended':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'Deleted':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  // Check permission to access this page
  if (
    !checkPermission('MOD003', 'view') &&
    !checkPermission('MOD006', 'view')
  ) {
    // If MOD003 view permission is false but MOD002 view permission is true, redirect to roles page
    if (
      checkPermission('MOD002', 'view') ||
      checkPermission('MOD007', 'view')
    ) {
      router.push('/team/roles')
      return null
    }

    // Otherwise show access denied
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You don't have permission to view this page.
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Team Members - Admin Team - WePro</title>
        <meta name="description" content="Manage WePro team members" />
      </Head>
      <div className="space-y-6">
        {/* Tab Navigation */}
        {(checkPermission('MOD002', 'view') &&
          checkPermission('MOD003', 'view')) ||
        (checkPermission('MOD007', 'view') &&
          checkPermission('MOD006', 'view')) ? (
          <div className="flex space-x-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
            <Button
              variant="default"
              onClick={() => router.push('/team/teamMembers')}
              className="flex-1 flex items-center justify-center text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Team Members
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/team/roles')}
              className="flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Roles
            </Button>
          </div>
        ) : null}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {(checkPermission('MOD002', 'view') &&
                checkPermission('MOD003', 'view')) ||
              (checkPermission('MOD007', 'view') &&
                checkPermission('MOD006', 'view'))
                ? getUserType() === 'P1'
                  ? 'Admin Team'
                  : 'Team'
                : 'Team Members'}
            </h1>
          </div>
          {(checkPermission('MOD003', 'create') ||
            checkPermission('MOD006', 'create')) && (
            <div className="flex items-center space-x-3">
              <Button
                className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => router.push('/team/teamMembers/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Team Member
              </Button>
            </div>
          )}
        </div>

        {/* Filter Component */}
        <Card>
          <CardContent className="pt-6">
            {/* Search and Status Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Search */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Search
                  </span>
                </div>
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search team members..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Status
                  </span>
                </div>
                <div className="w-full">
                  <Select
                    value={statusFilter}
                    onValueChange={value => {
                      setStatusFilter(value)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Deleted">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Filter by Role
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className="flex items-center gap-2 px-3 py-2 h-auto"
                  onClick={() => {
                    setActiveFilter('all')
                    setSearchTerm('')
                    setCurrentPage(1)
                  }}
                >
                  <Users className="h-4 w-4" />
                  <span>All Members</span>
                </Button>

                {roles.map(role => (
                  <Button
                    key={role._id}
                    variant={activeFilter === role._id ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center gap-2 px-3 py-2 h-auto"
                    onClick={() => {
                      setActiveFilter(role._id)
                      setCurrentPage(1)
                    }}
                  >
                    <span>{role.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members List */}
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

            {/* Desktop Table View */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Timezone</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableLoading message="Loading users..." colSpan={7} />
                  ) : teamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <span className="text-neutral-500">No users found</span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamMembers.map(member => (
                      <TableRow key={member._id}>
                        <TableCell className="font-medium">
                          {member.name}
                        </TableCell>
                        <TableCell>{member.username}</TableCell>
                        <TableCell>
                          {member.roleId ? (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {member.roleId.name}
                            </Badge>
                          ) : (
                            <span className="text-neutral-400">No role</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {member.timezoneId.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {formatDate(member.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeStyle(member.status)}>
                            {member.status}
                          </Badge>
                        </TableCell>
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
                                onClick={() =>
                                  router.push(
                                    `/team/teamMembers/${member._id}/view`
                                  )
                                }
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {(checkPermission('MOD003', 'edit') ||
                                checkPermission('MOD006', 'edit')) && (
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() =>
                                    router.push(
                                      `/team/teamMembers/create?id=${member._id}`
                                    )
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Member
                                </DropdownMenuItem>
                              )}
                              {(checkPermission('MOD003', 'delete') ||
                                checkPermission('MOD006', 'delete')) && (
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteClick(member)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
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
                Showing{' '}
                {teamMembers.length > 0
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
                <span className="text-neutral-500">Loading users...</span>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-neutral-500">No users found</span>
              </div>
            ) : (
              teamMembers.map(member => (
                <Card key={member._id} className="relative border border-neutral-200 dark:border-neutral-700">
                  <CardContent className="pt-4 pb-4">
                    <div className="space-y-3">
                      {/* Name */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Name
                        </div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {member.name}
                        </div>
                      </div>

                      {/* Username */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Username
                        </div>
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {member.username}
                        </div>
                      </div>

                      {/* Role */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Role
                        </div>
                        <div>
                          {member.roleId ? (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {member.roleId.name}
                            </Badge>
                          ) : (
                            <span className="text-sm text-neutral-400">No role</span>
                          )}
                        </div>
                      </div>

                      {/* Timezone */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Timezone
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {member.timezoneId.name}
                        </div>
                      </div>

                      {/* Created */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Created
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {formatDate(member.createdAt)}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Status
                        </div>
                        <div>
                          <Badge className={getStatusBadgeStyle(member.status)}>
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  {/* Action Button - Outside Card */}
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
                          onClick={() =>
                            router.push(
                              `/team/teamMembers/${member._id}/view`
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {(checkPermission('MOD003', 'edit') ||
                          checkPermission('MOD006', 'edit')) && (
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            onClick={() =>
                              router.push(
                                `/team/teamMembers/create?id=${member._id}`
                              )
                            }
                          >
                            <Edit className="h-4 w-4" />
                            Edit Member
                          </DropdownMenuItem>
                        )}
                        {(checkPermission('MOD003', 'delete') ||
                          checkPermission('MOD006', 'delete')) && (
                          <DropdownMenuItem
                            className="flex items-center gap-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteClick(member)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Showing entries info */}
          <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
            Showing{' '}
            {teamMembers.length > 0
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{' '}
                <strong>{userToDelete?.name}</strong>? This action cannot be
                undone and will permanently remove the team member from the
                system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={handleDeleteCancel}
                disabled={deleting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <>
                    <ButtonLoading message="Deleting..." />
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
    </>
  )
}
